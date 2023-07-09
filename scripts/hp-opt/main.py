import json
import optuna
import subprocess
import os.path as op

def objective(trial):
    temperature = trial.suggest_float("temperature", 10, 10000, log=True)

    swap = trial.suggest_int("swap", 0, 10)
    move = trial.suggest_int("move", 0, 10)
    multi = trial.suggest_int("multi", 0, 10)

    output = subprocess.check_output([
        op.join("..", "..", "solver", "target", "release", "cli"),
        "-a",
        "RandomPut,Annealing",
        "--annealing-initial-temperature",
        f"{temperature}",
        "-i",
        op.join("..", "..", "solver", "problems", "8.json"),
         "-o",
         "tmp",
         "-Q",
         "--annealing-seconds",
         "60",
         "--annealing-swap-ratio",
         f"{swap}",
         "--annealing-move-ratio",
         f"{move}",
         "--annealing-multi-move-ratio",
         f"{multi}",
    ])
    return json.loads(output)['score']

study = optuna.create_study(direction="maximize")
study.optimize(objective, n_trials=50)

best_params = study.best_params
found_temperature = best_params["temperature"]
found_swap = best_params["swap"]
found_move = best_params["move"]
found_multi = best_params["multi"]
print(found_temperature, found_swap, found_move, found_multi)


