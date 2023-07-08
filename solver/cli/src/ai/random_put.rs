use glam::Vec2;

use crate::{input, Solution};
use rand::{thread_rng, Rng};

use super::HeadAI;

pub struct RandomPutAI {}

impl HeadAI for RandomPutAI {
    fn solve(&mut self, input: &input::Input) -> Solution {
        let left = input.room.stage_pos.x + 10.0;
        let right = input.room.stage_pos.x + input.room.stage_size.x - 10.0;
        let top = input.room.stage_pos.y + 10.0;
        let bottom = input.room.stage_pos.y + input.room.stage_size.y - 10.0;
        let mut rng = thread_rng();
        let mut placements: Vec<Vec2> = vec![];
        let mut iter = 0;
        while placements.len() < input.musicians.len() {
            iter += 1;
            if iter > input.musicians.len() * 100 {
                break;
            }
            let x = rng.gen_range(left..=right);
            let y = rng.gen_range(top..=bottom);
            let pos = Vec2::new(x, y);
            let mut ng = false;
            for &p in placements.iter() {
                let diff = pos - p;
                let squared_distance = diff.dot(diff);
                if squared_distance <= 100.0 {
                    ng = true;
                    break;
                }
            }
            if !ng {
                placements.push(pos);
            }
        }
        Solution { placements }
    }
}
