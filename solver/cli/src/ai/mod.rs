mod annealing;
mod greed_move;
mod grid;
mod grid_greed;
mod random_put;

pub use annealing::*;
pub use greed_move::*;
pub use grid::*;
pub use grid_greed::*;
pub use random_put::*;

use crate::input;
use crate::Solution;

pub trait HeadAI {
    fn solve(&mut self, input: &input::Input) -> Solution;
}

pub trait ChainedAI {
    fn solve(&mut self, input: &input::Input, solution: &Solution) -> Solution;
}
