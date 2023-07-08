use glam::Vec2;

use crate::{input, Attendee, Solution};
use rand::seq::SliceRandom;
use rand::thread_rng;

use super::HeadAI;

pub struct GridGreedAI {}

impl HeadAI for GridGreedAI {
    fn solve(&mut self, input: &input::Input) -> Solution {
        let mut rng = thread_rng();
        let musicians = &input.musicians;
        let attendees = &input.attendees;
        let mut candidates = vec![];
        // グリッド状における位置の列挙
        for i in 0..10000 {
            let y = input.room.stage_pos.y + 10.0 * ((i + 1) as f32);
            if y > input.room.stage_pos.y + input.room.stage_size.y - 10.0 {
                break;
            }
            for j in 0..10000 {
                let x = input.room.stage_pos.x + 10.0 * ((j + 1) as f32);
                if x > input.room.stage_pos.x + input.room.stage_size.x - 10.0 {
                    break;
                }
                candidates.push(Vec2 { x, y });
            }
        }
        let sampling_num = candidates.len().min(1000.max(musicians.len() * 10));
        candidates.shuffle(&mut rng);
        candidates.resize(sampling_num, Vec2::ZERO);
        println!("{}", candidates.len());
        // 各musiciansについて、candidatesのoclussionを無視したスコアを計算
        let mut rough_scores = vec![];
        for i in 0..candidates.len() {
            let mut musicians_scores = vec![0; musicians.len()];
            for j in 0..attendees.len() {
                let diff = attendees[j].pos - candidates[i];
                let squared_distance = diff.dot(diff);
                let s = (1_000_000.0 / squared_distance);
                for k in 0..musicians.len() {
                    let taste = attendees[j].tastes[musicians[k].instrument as usize];
                    musicians_scores[k] += (taste * s).ceil() as i64;
                }
            }
            for k in 0..musicians.len() {
                rough_scores.push((musicians_scores[k], k, i));
            }
        }
        rough_scores.sort();
        rough_scores.reverse();
        // 点数の高いほうからcandidatesを貪欲に使ってmusiciansを埋めていく
        let mut musicians_used = vec![false; musicians.len()];
        let mut candidates_used = vec![false; candidates.len()];
        let mut placements: Vec<Vec2> = vec![Vec2::ZERO; musicians.len()];
        for &(_s, k, i) in rough_scores.iter() {
            if musicians_used[k] || candidates_used[i] {
                continue;
            }
            musicians_used[k] = true;
            candidates_used[i] = true;
            placements[k] = candidates[i];
        }
        Solution { placements }
    }
}

// k番目の musician に関するoclussion は無視したスコアを返す。
// 戻り値は配列であり、i番目の値はi番目の客からkが得るスコアである。
fn calculate_rough_score_of_a_musician(input: &input::Input, pos: Vec2, k: usize) -> i64 {
    let attendees = &input.attendees;
    let musicians = &input.musicians;

    let mut score = 0;
    for i in 0..attendees.len() {
        let taste = attendees[i].tastes[musicians[k].instrument as usize];
        let diff = attendees[i].pos - pos;
        let squared_distance = diff.dot(diff);
        let s = (1_000_000.0 * taste / squared_distance).ceil() as i64;
        score += s;
    }
    score
}
