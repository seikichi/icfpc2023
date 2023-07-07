use glam::Vec2;

type Instrument = i32;

struct Room {
    size: Vec2,
    stage_pos: Vec2,
    stage_size: Vec2,
}

struct Musican {
    instrument: Instrument,
}

struct Atenndee {
    pos: Vec2,
    tastes: Vec<Instrument>,
}

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
