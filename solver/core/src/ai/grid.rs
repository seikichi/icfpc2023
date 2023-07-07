use glam::Vec2;

use crate::{input, Solution};

use super::HeadAI;

pub struct GridAI {}

impl HeadAI for GridAI {
    fn solve(&mut self, input: &input::Input) -> Solution {
        let mut placements: Vec<Vec2> = vec![];
        let mut x = input.room.stage_pos.x + 10.0;
        let mut y = input.room.stage_pos.y + 10.0;
        for _ in 0..input.musicians.len() {
            placements.push(Vec2 { x, y });
            x += 10.0;
            if x + 10.0 >= input.room.stage_pos.x + input.room.stage_size.x {
                x = input.room.stage_pos.x + 10.0;
                y += 10.0;
            }
        }
        Solution { placements }
    }
}
