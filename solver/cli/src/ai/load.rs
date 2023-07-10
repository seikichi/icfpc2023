use crate::{input, Solution};

use super::HeadAI;

pub struct LoadAI {
    pub path: String,
}

impl HeadAI for LoadAI {
    fn solve(&mut self, _input: &input::Input) -> Solution {
        let solution = core::output::load_from_file(&self.path).unwrap();
        solution
    }
}
