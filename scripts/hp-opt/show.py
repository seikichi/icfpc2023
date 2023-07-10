import json
import optuna
import subprocess
import os.path as op
import shutil

# show.py ${problem_id}
problem_id = int(sys.argv[len(sys.argv) - 1])

study = optuna.load_study(
    study_name=f"solver-{problem_id}",
    storage=f"sqlite:///study-{problem_id}.db"
)

best_params = study.best_params
found_temperature = best_params["temperature"]
found_swap = best_params["swap"]
found_move = best_params["move"]
found_multi = best_params["multi"]
found_p = best_params["p"]
print(found_temperature, found_swap, found_move, found_multi, found_p)


