use std::{io, path::Path};

use super::*;

#[derive(Clone, Debug)]
pub struct Input {
    pub room: Room,
    pub musicians: Vec<Musican>,
    pub attendees: Vec<Attendee>,
    pub pillars: Vec<Pillar>,
    pub version: u8,
}

#[derive(Clone, Debug, serde::Deserialize)]
pub struct RawInput {
    room_width: f32,
    room_height: f32,
    stage_width: f32,
    stage_height: f32,
    stage_bottom_left: Vec<f32>,
    musicians: Vec<i32>,
    attendees: Vec<RawAttendee>,
    pillars: Vec<RawPillars>,
}

#[derive(Clone, Debug, serde::Deserialize)]
pub struct RawAttendee {
    x: f32,
    y: f32,
    tastes: Vec<f32>,
}

#[derive(Clone, Debug, serde::Deserialize)]
pub struct RawPillars {
    center: Vec2,
    radius: f32,
}

pub fn load_from_file<P: AsRef<Path>>(path: P, problem_number: i32) -> io::Result<Input> {
    let s = std::fs::read_to_string(path)?;
    load_from_str(&s, problem_number)
}

pub fn load_from_str(s: &str, problem_number: i32) -> io::Result<Input> {
    let version = if problem_number <= 55 { 1 } else { 2 };
    let input: RawInput = serde_json::from_str(s)?;
    let room = Room {
        size: Vec2::new(input.room_width, input.room_height),
        stage_pos: Vec2::new(input.stage_bottom_left[0], input.stage_bottom_left[1]),
        stage_size: Vec2::new(input.stage_width, input.stage_height),
    };
    let musicians = input
        .musicians
        .iter()
        .map(|&i| Musican { instrument: i })
        .collect();
    let attendees = input
        .attendees
        .iter()
        .map(|a| Attendee {
            pos: Vec2::new(a.x, a.y),
            tastes: a.tastes.clone(),
        })
        .collect();
    let pillars = input
        .pillars
        .iter()
        .map(|p| Pillar {
            center: p.center,
            radius: p.radius,
        })
        .collect();
    Ok(Input {
        room,
        musicians,
        attendees,
        pillars,
        version,
    })
}
