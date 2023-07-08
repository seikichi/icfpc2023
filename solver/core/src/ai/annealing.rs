use std::time::{Duration, Instant};

use crate::ai::ChainedAI;
use crate::input::Input;
use crate::score;
use crate::Solution;
use glam::IVec2;
use log::debug;
use log::info;
use rand::prelude::*;

pub struct AnnealingAI {
    pub time_limit: Duration,
}

impl ChainedAI for AnnealingAI {
    fn solve(&mut self, input: &Input, initial_solution: &Solution) -> Solution {
        let mut solution = initial_solution.clone();
        let mut rng = SmallRng::from_entropy();
        let mut current_score = score::calculate(input, &solution);
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
            // TODO: solution を適当な近傍に変更する
            panic!("not implemented");

            // TODO: solution が invalid な場合はエラーを返すようにしたほうがいいかも
            let new_score = score::calculate(input, &solution);
            info!("new_score = {new_score}");

            // 新しい解を受理するか決める
            let accept = {
                if new_score > current_score {
                    true
                } else {
                    // new_score <= current_score
                    let delta = current_score - new_score;
                    let accept_prob = (-delta as f64 / temperature).exp();
                    rng.gen::<f64>() < accept_prob
                }
            };
            if accept {
                // accept candidate
                current_score = new_score;
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
