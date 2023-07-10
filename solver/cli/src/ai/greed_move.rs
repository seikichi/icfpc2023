use glam::Vec2;

use crate::ai::ChainedAI;
use crate::input::Input;
use crate::score;
use crate::Solution;

pub struct GreedMoveAI {
    pub initial_move_distance: f32,
    pub iteration_num: usize,
}

impl ChainedAI for GreedMoveAI {
    // 各musiciansを上下左右に動かして点数が増えるなら採用するAI
    fn solve(&mut self, input: &Input, initial_solution: &Solution) -> Solution {
        let stage_pos = input.room.stage_pos;
        let stage_size = input.room.stage_size;
        let mut move_d = self.initial_move_distance;
        let mut solution = initial_solution.clone();
        let mut score_calc = score::DifferentialCalculator::new(input, &solution);
        let mut prev_score = score::calculate(input, &solution).unwrap();
        for _iter in 0..self.iteration_num {
            for k in 0..solution.placements.len() {
                // println!("{} {} {}", _iter, k, prev_score);
                for dir in 0..4 {
                    let old_solution = solution.clone();
                    let old_score_calc = score_calc.clone();
                    let dx = [1.0, 0.0, -1.0, 0.0][dir];
                    let dy = [0.0, 1.0, 0.0, -1.0][dir];
                    let mut p = solution.placements[k] + Vec2::new(dx, dy) * move_d;
                    p.x = p.x.max(stage_pos.x + 10.0);
                    p.y = p.y.max(stage_pos.y + 10.0);
                    p.x = p.x.min(stage_pos.x + stage_size.x - 10.0);
                    p.y = p.y.min(stage_pos.y + stage_size.y - 10.0);
                    let v = p - solution.placements[k];
                    if v == Vec2::ZERO {
                        continue;
                    }
                    // let new_score = score_calc.move_one(input, &mut solution, k, p);
                    // if new_score > prev_score && validate_solution(input, &solution).is_ok() {
                    let mut ok = false;
                    if let Some(new_score) = multi_move(input, &mut solution, &mut score_calc, k, v)
                    {
                        if new_score > prev_score
                            && score::validate_solution(input, &solution).is_ok()
                        {
                            prev_score = new_score;
                            ok = true;
                        }
                    }
                    if !ok {
                        solution = old_solution;
                        score_calc = old_score_calc;
                    }
                }
            }
            move_d *= 0.5;
        }
        return solution;
    }
}

// musician を動かした後にぶつかったmusiciansも同じ方向に動かす
fn multi_move(
    input: &Input,
    solution: &mut Solution,
    score_calc: &mut score::DifferentialCalculator,
    target: usize,
    vect: Vec2,
) -> Option<i64> {
    let stage_pos1 = input.room.stage_pos;
    let stage_size = input.room.stage_size;
    let stage_pos2 = stage_pos1 + stage_size;
    let mut stack = vec![target];
    let mut visited = vec![false; solution.placements.len()];
    visited[target] = true;
    // let mut cnt = 0;
    while let Some(from) = stack.pop() {
        // cnt += 1;
        let p1 = solution.placements[from] + vect;
        let valid_x = stage_pos1.x + 10.0 <= p1.x && p1.x <= stage_pos2.x - 10.0;
        let valid_y = stage_pos1.y + 10.0 <= p1.y && p1.y <= stage_pos2.y - 10.0;
        if !valid_x || !valid_y {
            return None;
        }
        for to in 0..solution.placements.len() {
            let p2 = solution.placements[to];
            if from == to || visited[to] || p1.distance_squared(p2) > 100.0 {
                continue;
            }
            stack.push(to);
            visited[to] = true;
        }
    }
    let mut score = 0;
    for k in 0..solution.placements.len() {
        if !visited[k] {
            continue;
        }
        let p = solution.placements[k] + vect;
        score = score_calc.move_one(input, solution, k, p);
    }
    // println!("move count!: {}", cnt);
    return Some(score);
}
