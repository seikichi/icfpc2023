use glam::Vec2;

use crate::{input, Solution};
use core::geo::*;
use std::collections::{HashSet, VecDeque};

use super::HeadAI;

pub struct RingSideAI {}

impl HeadAI for RingSideAI {
    fn solve(&mut self, input: &input::Input) -> Solution {
        let l = input.room.stage_pos.x + 10.0;
        let r = input.room.stage_pos.x + input.room.stage_size.x - 10.0;
        let t = input.room.stage_pos.y + 10.0;
        let b = input.room.stage_pos.y + input.room.stage_size.y - 10.0;
        let musicians: &Vec<core::Musican> = &input.musicians;
        let attendees = &input.attendees;
        let mut importance = vec![(0, 0); attendees.len()];
        for i in 0..attendees.len() {
            importance[i].0 = core::prune::attendee_importance(&attendees[i], &input.room) as i32;
            importance[i].1 = i;
        }
        importance.sort();
        importance.reverse();

        let target_len = importance.len().min(10);
        let mut candidates = vec![
            Vec2::new(l, t),
            Vec2::new(l, b),
            Vec2::new(r, t),
            Vec2::new(r, b),
        ];
        // 重要度が高い客に一番近い場所を列挙する
        let mut visited = HashSet::new();
        visited.insert((l as i32, t as i32));
        visited.insert((l as i32, b as i32));
        visited.insert((r as i32, t as i32));
        visited.insert((r as i32, b as i32));
        for i in 0..target_len {
            let index = importance[i].1;
            let pos = attendees[index].pos;

            let contains_x = l <= pos.x && pos.x <= r;
            let contains_y = t <= pos.y && pos.y <= b;
            let target_pos = if contains_x {
                if pos.y < t {
                    Vec2::new(pos.x, t)
                } else {
                    Vec2::new(pos.x, b)
                }
            } else if contains_y {
                if pos.x < l {
                    Vec2::new(l, pos.y)
                } else {
                    Vec2::new(r, pos.y)
                }
            } else {
                continue;
            };
            if visited.contains(&(target_pos.x as i32, target_pos.y as i32)) {
                continue;
            }
            visited.insert((target_pos.x as i32, target_pos.y as i32));
            candidates.push(target_pos);
        }
        let mut que = VecDeque::new();
        for &pos in candidates.iter() {
            que.push_back(pos);
        }
        while let Some(pos) = que.pop_front() {
            if candidates.len() >= 10000 && candidates.len() >= musicians.len() * 10 {
                break;
            }
            for dir in 0..4 {
                let dx = [10.0, 0.0, -10.0, 0.0][dir];
                let dy = [0.0, 10.0, 0.0, -10.0][dir];
                let npos = pos + Vec2::new(dx, dy);
                if npos.x < l
                    || r < npos.x
                    || npos.y < t
                    || b < npos.y
                    || visited.contains(&(npos.x as i32, npos.y as i32))
                {
                    continue;
                }
                visited.insert((npos.x as i32, npos.y as i32));
                candidates.push(npos);
                que.push_back(npos);
            }
        }

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
        // 点数の高いほうからcandidatesを貪欲に使ってmusiciansを埋めていく
        let mut musicians_used = vec![false; musicians.len()];
        let mut candidates_used = vec![false; candidates.len()];
        let mut placements: Vec<Vec2> = vec![Vec2::ZERO; musicians.len()];
        for &(_s, k, i) in rough_scores.iter() {
            if musicians_used[k] || candidates_used[i] {
                continue;
            }
            let mut ng = false;
            for k_ in 0..musicians.len() {
                if !musicians_used[k_] {
                    continue;
                }
                if candidates[i].distance_squared(placements[k_]) < 100.0 {
                    ng = true;
                    break;
                }
            }
            if ng {
                continue;
            }
            musicians_used[k] = true;
            candidates_used[i] = true;
            placements[k] = candidates[i];
        }
        Solution { placements }
    }
}
