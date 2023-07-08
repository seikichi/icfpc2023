mod annealing;
mod grid;

pub use annealing::*;
pub use grid::*;

use crate::input;
use crate::Solution;

pub trait HeadAI {
    fn solve(&mut self, input: &input::Input) -> Solution;
}

pub trait ChainedAI {
    fn solve(&mut self, input: &input::Input, solution: &Solution) -> Solution;
}
