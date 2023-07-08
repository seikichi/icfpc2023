use glam::Vec2;

use crate::{input, Solution};
use core::geo::*;
use rand::seq::SliceRandom;
use rand::thread_rng;

use super::HeadAI;

pub struct GridGreedAI {}

impl HeadAI for GridGreedAI {
    fn solve(&mut self, input: &input::Input) -> Solution {
        let mut rng = thread_rng();
        let mut best_score = -1 << 60;
        let mut best_placements = vec![];
        let musicians: &Vec<core::Musican> = &input.musicians;
        let attendees = &input.attendees;
        for iter in 0..4 {
            let mut candidates = vec![];
            // グリッド状における位置の列挙
            let l = input.room.stage_pos.x;
            let r = l + input.room.stage_size.x;
            let t = input.room.stage_pos.y;
            let b = t + input.room.stage_size.y;
            let sx = [l, l, r, r][iter];
            let sy = [t, b, t, b][iter];
            let dx = [10.0, 10.0, -10.0, -10.0][iter];
            let dy = [10.0, -10.0, 10.0, -10.0][iter];
            for i in 0..10000 {
                let y = sy + dy * ((i + 1) as f32);
                if y < t + 10.0 || b - 10.0 < y {
                    break;
                }
                for j in 0..10000 {
                    let x = sx + dx * ((j + 1) as f32);
                    if x < l + 10.0 || r - 10.0 < x {
                        break;
                    }
                    candidates.push(Vec2 { x, y });
                }
            }
            let sampling_num = candidates.len().min(10000.max(musicians.len() * 10));
            candidates.shuffle(&mut rng);
            candidates.resize(sampling_num, Vec2::ZERO);
            // 各musiciansについて、candidatesのoclussionを無視したスコアを計算
            let mut rough_scores = vec![];
            for i in 0..candidates.len() {
                let mut musicians_scores = vec![0; musicians.len()];
                for j in 0..attendees.len() {
                    let mut hit = false;
                    let mut tangent = false;
                    for pillar in input.pillars.iter() {
                        let intersection = core::geo::segment_circle_intersection(
                            candidates[i],
                            attendees[j].pos,
                            pillar.radius,
                            pillar.center,
                        );
                        match intersection {
                            Intersection::None => {}
                            Intersection::Hit => {
                                hit = true;
                                break;
                            }
                            Intersection::Tagent => {
                                tangent = true;
                            }
                        }
                    }
                    if hit {
                        continue;
                    }
                    let diff = attendees[j].pos - candidates[i];
                    let squared_distance = diff.dot(diff);
                    let s = 1_000_000.0 / squared_distance;
                    for k in 0..musicians.len() {
                        let taste = attendees[j].tastes[musicians[k].instrument as usize];
                        if taste > 0.0 && tangent {
                            continue;
                        }
                        musicians_scores[k] += (taste * s).ceil() as i64;
                    }
                }
                for k in 0..musicians.len() {
                    rough_scores.push((musicians_scores[k], k, i));
                }
            }
            rough_scores.sort();
            rough_scores.reverse();
            let mut sum_score = 0;
            // 点数の高いほうからcandidatesを貪欲に使ってmusiciansを埋めていく
            let mut musicians_used = vec![false; musicians.len()];
            let mut candidates_used = vec![false; candidates.len()];
            let mut placements: Vec<Vec2> = vec![Vec2::ZERO; musicians.len()];
            for &(s, k, i) in rough_scores.iter() {
                if musicians_used[k] || candidates_used[i] {
                    continue;
                }
                sum_score += s;
                musicians_used[k] = true;
                candidates_used[i] = true;
                placements[k] = candidates[i];
            }
            if sum_score > best_score {
                best_placements = placements;
                best_score = sum_score;
            }
        }
        Solution {
            placements: best_placements,
        }
    }
}
