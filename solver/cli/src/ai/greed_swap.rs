use log::info;

use crate::ai::ChainedAI;
use crate::input::Input;
use crate::score;
use crate::Solution;

pub struct GreedSwapAI {
    pub iteration_num: usize,
}

impl ChainedAI for GreedSwapAI {
    fn solve(&mut self, input: &Input, initial_solution: &Solution) -> Solution {
        let musicians = &input.musicians;
        let mut solution = initial_solution.clone();
        let mut score_calc = score::DifferentialCalculator::new(input, &solution);
        let mut current_score = score::calculate(input, &solution).unwrap();
        for _iter in 0..self.iteration_num {
            for k1 in 0..musicians.len() {
                for k2 in (k1 + 1)..musicians.len() {
                    let new_score = score_calc.swap(input, &mut solution, k1, k2);
                    if new_score <= current_score {
                        // rollback
                        score_calc.swap_without_scoring(&mut solution, k1, k2);
                    } else {
                        info!("new_score = {}", new_score);
                        current_score = new_score;
                    }
                }
            }
        }
        return solution;
    }
}
