mod grid;
mod grid_greed;

pub use grid::*;
pub use grid_greed::*;

use crate::input;
use crate::Solution;

pub trait HeadAI {
    fn solve(&mut self, input: &input::Input) -> Solution;
}

pub trait ChainedAI {
    fn solve(&mut self, input: &input::Input, solution: &Solution) -> Solution;
}
