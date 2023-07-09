use crate::ai::ChainedAI;
use crate::input::Input;
use crate::score;
use crate::Solution;
use glam::Vec2;
use log::info;
use rand::prelude::*;
use std::f32::consts::PI;
use std::time::{Duration, Instant};

pub struct AnnealingAI {
    pub time_limit: Duration,
}

impl ChainedAI for AnnealingAI {
    fn solve(&mut self, input: &Input, initial_solution: &Solution) -> Solution {
        let stage_pos = input.room.stage_pos;
        let stage_size = input.room.stage_size;
        let musicians = &input.musicians;

        let mut solution = initial_solution.clone();
        let mut rng = SmallRng::from_entropy();
        let mut current_score = score::calculate(input, &solution).unwrap();
        let start_at = Instant::now();

        let mut score_calc = score::DifferentialCalculator::new(input, &solution);

        let mut best_solution = solution.clone();
        let mut best_score = current_score;

        let initial_temperature = 100.0;
        let mut temperature = initial_temperature;

        let mut valid_solution_count = 0;
        let mut invalid_solution_count = 0;
        let mut accept_count = 0;
        let mut reject_count = 0;

        let mut iter = 0;
        loop {
            // check time limit
            iter += 1;
            if iter % 5 == 0 {
                let elapsed = Instant::now() - start_at;
                if elapsed >= self.time_limit {
                    // print stats
                    info!("iter = {}", iter);
                    info!(
                        "#valid_move   = {} ({:.2} %)",
                        valid_solution_count,
                        100.0 * valid_solution_count as f64
                            / (valid_solution_count + invalid_solution_count) as f64
                    );
                    info!(
                        "#invalid_move = {} ({:.2} %)",
                        invalid_solution_count,
                        100.0 * invalid_solution_count as f64
                            / (valid_solution_count + invalid_solution_count) as f64
                    );
                    info!(
                        "#accept = {} ({:.2} %)",
                        accept_count,
                        100.0 * accept_count as f64 / (accept_count + reject_count) as f64
                    );
                    info!(
                        "#reject = {} ({:.2} %)",
                        reject_count,
                        100.0 * reject_count as f64 / (accept_count + reject_count) as f64
                    );
                    // done!
                    return best_solution;
                }

                // tweak temperature
                let progress = elapsed.as_secs_f64() / self.time_limit.as_secs_f64();
                temperature = initial_temperature * (1.0 - progress) * (-progress).exp2();
            }

            // 後でロールバックできるように解を保存しておく
            // TODO: もっと効率よく保持できるかも
            let old_solution = solution.clone();
            let old_score_calc = score_calc.clone();

            // move to neighbor
            // let n_methods = 2;
            let method_r = rng.gen::<u32>() % 100;
            let new_score = match method_r {
                0..=30 => {
                    // 0. swap する
                    let mut k1 = rng.gen::<usize>() % musicians.len();
                    let mut k2 = rng.gen::<usize>() % musicians.len();
                    while k1 == k2 {
                        k1 = rng.gen::<usize>() % musicians.len();
                        k2 = rng.gen::<usize>() % musicians.len();
                    }
                    if musicians[k1].instrument == musicians[k2].instrument {
                        continue;
                    }
                    let new_score = score_calc.swap(input, &mut solution, k1, k2);
                    new_score
                }
                31..=95 => {
                    // 1. 適当な musician を少し動かす
                    // 動かす範囲は温度によって徐々に狭める
                    let max_delta: f32 = stage_size.x.max(stage_size.y)
                        * 0.1
                        * (temperature / initial_temperature) as f32;
                    let k = rng.gen::<usize>() % musicians.len();
                    let delta = rng.gen::<f32>() * max_delta;
                    let angle = rng.gen::<f32>() * 2.0 * PI;
                    let v = delta * Vec2::new(angle.cos(), angle.sin());
                    let mut p = solution.placements[k] + v;
                    p.x = p.x.max(stage_pos.x + 10.0);
                    p.y = p.y.max(stage_pos.y + 10.0);
                    p.x = p.x.min(stage_pos.x + stage_size.x - 10.0);
                    p.y = p.y.min(stage_pos.y + stage_size.y - 10.0);
                    let new_score = score_calc.move_one(input, &mut solution, k, p);
                    new_score
                }
                96..=100 => {
                    let max_delta: f32 = stage_size.x.max(stage_size.y)
                        * 0.1
                        * (temperature / initial_temperature) as f32;
                    let k = rng.gen::<usize>() % musicians.len();
                    let delta = rng.gen::<f32>() * max_delta;
                    // 4方向のみ
                    let dir = rng.gen::<usize>() % 4;
                    let dx = [delta, 0.0, -delta, 0.0][dir];
                    let dy = [0.0, delta, 0.0, -delta][dir];
                    let v = delta * Vec2::new(dx, dy);
                    let new_score;
                    if let Some(next_solution) = multi_move(input, &solution, k, v) {
                        solution = next_solution;
                        score_calc = score::DifferentialCalculator::new(input, &solution);
                        new_score = score::calculate(input, &solution).unwrap_or(-1 * (1 << 50));
                        // println!("valid move!: {} {:?} ", k, v);
                        // println!("score: {} -> {}", current_score, new_score);
                    } else {
                        // println!("invalid move!: {} {:?} ", k, v);
                        solution.placements = vec![];
                        new_score = -1 * (1 << 50);
                    }
                    new_score
                }
                _ => {
                    panic!("no such method: {method_r}")
                }
            };

            let is_valid_solution = score::validate_solution(input, &solution).is_ok();
            if is_valid_solution {
                valid_solution_count += 1;
            } else {
                invalid_solution_count += 1;
            }

            if iter % 100 == 0 {
                if is_valid_solution {
                    info!("new_score = {}", new_score);
                } else {
                    info!("new_score = n/a");
                }
            }

            // 新しい解を受理するか決める
            let accept = {
                // 解が不正な場合は受理しない
                if !is_valid_solution {
                    false
                }
                // スコアが改善するなら必ず受理する
                else if new_score > current_score {
                    true
                }
                // そうでない場合はある確率で受理する
                else {
                    // new_score <= current_score
                    let delta = current_score - new_score;
                    let accept_prob = (-delta as f64 / temperature).exp();
                    rng.gen::<f64>() < accept_prob
                }
            };
            if accept {
                // accept candidate
                current_score = new_score;
                accept_count += 1;
            } else {
                // reject candidate
                solution = old_solution;
                score_calc = old_score_calc;
                reject_count += 1;
            }

            if current_score > best_score {
                best_score = current_score;
                best_solution = solution.clone();
            }
        }
    }
}

// musician を動かした後にぶつかったmusiciansも同じ方向に動かす
fn multi_move(
    input: &Input,
    current_solution: &Solution,
    target: usize,
    vect: Vec2,
) -> Option<Solution> {
    let stage_pos1 = input.room.stage_pos;
    let stage_size = input.room.stage_size;
    let stage_pos2 = stage_pos1 + stage_size;
    let mut solution = current_solution.clone();
    let mut stack = vec![target];
    let mut visited = vec![false; solution.placements.len()];
    visited[target] = true;
    let mut cnt = 0;
    while let Some(from) = stack.pop() {
        cnt += 1;
        solution.placements[from] += vect;
        let p1 = solution.placements[from];
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
    if cnt <= 3 {
        // 余り動かしてない場合は無視
        return None;
    }
    // println!("move count!: {}", cnt);
    return Some(solution);
}
