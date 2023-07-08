use std::f32::consts::PI;
use std::time::{Duration, Instant};
use std::usize;

use crate::ai::ChainedAI;
use crate::input::Input;
use crate::score;
use crate::Solution;
use glam::Vec2;
use log::info;
use rand::prelude::*;

pub struct AnnealingAI {
    pub time_limit: Duration,
}

impl ChainedAI for AnnealingAI {
    fn solve(&mut self, input: &Input, initial_solution: &Solution) -> Solution {
        let musicians = &input.musicians;

        let mut solution = initial_solution.clone();
        let mut rng = SmallRng::from_entropy();
        let mut current_score = score::calculate(input, &solution).unwrap();
        let start_at = Instant::now();

        let mut best_solution = solution.clone();
        let mut best_score = current_score;

        let initial_temperature = 100.0;
        let mut temperature = initial_temperature;

        let mut iter = 0;
        loop {
            // check time limit
            iter += 1;
            if iter % 5 == 0 {
                let elapsed = Instant::now() - start_at;
                if elapsed >= self.time_limit {
                    info!("iter = {}", iter);
                    return best_solution;
                }

                // tweak temperature
                let progress = elapsed.as_secs_f64() / self.time_limit.as_secs_f64();
                temperature = initial_temperature * (1.0 - progress) * (-progress).exp2();
            }

            // 後でロールバックできるように解を保存しておく
            // TODO: もっと効率よく保持できるかも
            let old_solution = solution.clone();

            // move to neighbor
            let n_methods = 2;
            let method = rng.gen::<u32>() % n_methods;
            match method {
                0 => {
                    // 0. swap する
                    let mut k1 = rng.gen::<usize>() % musicians.len();
                    let mut k2 = rng.gen::<usize>() % musicians.len();
                    while k1 == k2 {
                        k1 = rng.gen::<usize>() % musicians.len();
                        k2 = rng.gen::<usize>() % musicians.len();
                    }
                    solution.placements.swap(k1, k2);
                }
                1 => {
                    // 1. 適当な musician を少し動かす
                    const MAX_DELTA: f32 = 10.0;
                    let k = rng.gen::<usize>() % musicians.len();
                    let delta = rng.gen::<f32>() * MAX_DELTA;
                    let angle = rng.gen::<f32>() * 2.0 * PI;
                    let v = delta * Vec2::new(angle.cos(), angle.sin());
                    solution.placements[k] += v;
                }
                _ => {
                    panic!("no such method: {method}")
                }
            }

            let new_score = score::calculate(input, &solution);
            info!("new_score = {:?}", new_score);

            // 新しい解を受理するか決める
            let accept = {
                match new_score {
                    None => false, // 解が不正な場合は受理しない
                    Some(new_score) => {
                        // スコアが改善するなら必ず受理する
                        if new_score > current_score {
                            true
                        } else {
                            // そうでない場合はある確率で受理する
                            // new_score <= current_score
                            let delta = current_score - new_score;
                            let accept_prob = (-delta as f64 / temperature).exp();
                            rng.gen::<f64>() < accept_prob
                        }
                    }
                }
            };
            if accept {
                // accept candidate
                current_score = new_score.unwrap();
            } else {
                // reject candidate
                solution = old_solution;
            }

            if current_score > best_score {
                best_score = current_score;
                best_solution = solution.clone();
            }
        }
    }
}
