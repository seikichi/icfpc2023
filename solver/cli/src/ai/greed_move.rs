use core::score::validate_solution;

use glam::Vec2;

use crate::ai::ChainedAI;
use crate::input::Input;
use crate::score;
use crate::Solution;

pub struct GreedMoveAI {}

impl ChainedAI for GreedMoveAI {
    // 各musiciansを上下左右に動かして点数が増えるなら採用するAI
    fn solve(&mut self, input: &Input, initial_solution: &Solution) -> Solution {
        let stage_pos = input.room.stage_pos;
        let stage_size = input.room.stage_size;
        let mut move_d = 4.0;
        let mut solution = initial_solution.clone();
        let mut score_calc = score::DifferentialCalculator::new(input, &solution);
        let mut prev_score = score::calculate(input, &solution).unwrap();
        for _iter in 0..5 {
            for k in 0..solution.placements.len() {
                for dir in 0..4 {
                    let old_score_calc = score_calc.clone();
                    let dx = [1.0, 0.0, -1.0, 0.0][dir];
                    let dy = [0.0, 1.0, 0.0, -1.0][dir];
                    let prev_pos = solution.placements[k];
                    let mut p = solution.placements[k] + Vec2::new(dx, dy) * move_d;
                    p.x = p.x.max(stage_pos.x + 10.0);
                    p.y = p.y.max(stage_pos.y + 10.0);
                    p.x = p.x.min(stage_pos.x + stage_size.x - 10.0);
                    p.y = p.y.min(stage_pos.y + stage_size.y - 10.0);
                    let new_score = score_calc.move_one(input, &mut solution, k, p);
                    if new_score > prev_score && validate_solution(input, &solution).is_ok() {
                        prev_score = new_score;
                    } else {
                        solution.placements[k] = prev_pos;
                        score_calc = old_score_calc;
                    }
                }
            }
            move_d *= 0.5;
        }
        return solution;
    }
}
