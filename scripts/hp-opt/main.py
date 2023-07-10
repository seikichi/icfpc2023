import json
import optuna
import subprocess
import os.path as op
import shutil
import sys

# main.py ${problem_id} ${output_dir}

problem_id = int(sys.argv[len(sys.argv) - 2])
outdir = sys.argv[len(sys.argv) - 1]

def objective(trial):
    p = trial.suggest_int("p", 50, 5000000, log=True)
    temperature = trial.suggest_float("temperature", 10, 10000, log=True)

    swap = trial.suggest_int("swap", 0, 10)
    move = trial.suggest_int("move", 0, 10)
    multi = trial.suggest_int("multi", 0, 10)

    output = subprocess.check_output([
        op.join("..", "..", "solver", "target", "release", "cli"),
        "-a",
        "RingSide,Annealing",
        "--annealing-initial-temperature",
        f"{temperature}",
        "-i",
        op.join("..", "..", "solver", "problems", f"{problem_id}.json"),
         "-o",
         outdir,
         "-Q",
         "--annealing-seconds",
         "60",
         "--annealing-swap-ratio",
         f"{swap}",
         "--annealing-move-ratio",
         f"{move}",
         "--annealing-multi-move-ratio",
         f"{multi}",
         "-p",
         f"{p}"
    ])

    score = json.loads(output)['score']
    shutil.copyfile(op.join(outdir, f"{problem_id}.json"), op.join(outdir, f"sol-{problem_id}-{score}.json"))

    return score

study = optuna.create_study(direction="maximize",
                            study_name=f"solver-{problem_id}",
                            storage=f"sqlite:///study-{problem_id}.db",
                            load_if_exists=True)

study.optimize(objective, n_trials=600)

best_params = study.best_params
found_temperature = best_params["temperature"]
found_swap = best_params["swap"]
found_move = best_params["move"]
found_multi = best_params["multi"]
found_p = best_params["p"]
print(found_temperature, found_swap, found_move, found_multi, found_p)


