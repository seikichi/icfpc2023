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
            let method_r = rng.gen::<u32>() % 10;
            let new_score = match method_r {
                0..=3 => {
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
                4..=10 => {
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
