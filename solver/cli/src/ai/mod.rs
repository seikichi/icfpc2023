mod annealing;
mod greed_move;
mod greed_swap;
mod grid;
mod grid_greed;
mod load;
mod random_put;
mod ring_side;

pub use annealing::*;
pub use greed_move::*;
pub use greed_swap::*;
pub use grid::*;
pub use grid_greed::*;
pub use load::*;
pub use random_put::*;
pub use ring_side::*;

use crate::input;
use crate::Solution;

pub trait HeadAI {
    fn solve(&mut self, input: &input::Input) -> Solution;
}

pub trait ChainedAI {
    fn solve(&mut self, input: &input::Input, solution: &Solution) -> Solution;
}
