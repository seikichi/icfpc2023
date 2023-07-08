pub mod geo;
pub mod input;
pub mod output;
pub mod score;

use glam::Vec2;

pub type Instrument = i32;

#[derive(Clone, Copy, Debug)]
pub struct Room {
    pub size: Vec2,
    pub stage_pos: Vec2,
    pub stage_size: Vec2,
}

#[derive(Clone, Copy, Debug)]
pub struct Musican {
    pub instrument: Instrument,
}

#[derive(Clone, Debug)]
pub struct Attendee {
    pub pos: Vec2,
    pub tastes: Vec<f32>,
}

#[derive(Clone, Debug)]
pub struct Pillar {
    pub center: Vec2,
    pub radius: f32,
}

#[derive(Clone, Debug, serde::Serialize, serde::Deserialize)]
pub struct Solution {
    pub placements: Vec<Vec2>,
}

// NOTE: 動作確認用
pub fn add(a: u64, b: u64) -> u64 {
    a + b
}

#[cfg(test)]
mod tests {
    use super::*;

    // NOTE: 動作確認用
    #[test]
    fn add_test() {
        assert_eq!(add(40, 2), 42);
    }
}
