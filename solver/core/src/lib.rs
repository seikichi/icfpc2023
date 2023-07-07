mod input;

use glam::Vec2;

type Instrument = i32;

#[derive(Clone, Copy, Debug)]
struct Room {
    size: Vec2,
    stage_pos: Vec2,
    stage_size: Vec2,
}

#[derive(Clone, Copy, Debug)]
struct Musican {
    instrument: Instrument,
}

#[derive(Clone, Debug)]
struct Attendee {
    pos: Vec2,
    tastes: Vec<f32>,
}

#[derive(Clone, Debug)]
struct Solution {
    placements: Vec<Vec2>,
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
