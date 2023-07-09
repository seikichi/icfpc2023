import json
import optuna
import subprocess

def objective(trial):
    temperature = trial.suggest_float("temperature", 100, 10000, log=True)
    return run(temperature)


def run(temperature):
    output = subprocess.check_output([
        "..\\..\\solver\\target\\release\\cli",
        "-a",
        "Grid,Annealing",
        "--annealing-initial-temperature",
        f"{temperature}",
        "-i",
        "..\\..\\solver\\problems\\42.json",
         "-o",
         "tmp",
         "-Q",
         "--annealing-seconds",
         "30",
    ])
    return json.loads(output)['score']

study = optuna.create_study(direction="maximize")
study.optimize(objective, n_trials=20)

best_params = study.best_params
found_temperature = best_params["temperature"]
print(found_temperature)


