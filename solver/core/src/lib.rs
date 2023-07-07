mod input;
mod score;

use anyhow::bail;
use glam::Vec2;
use log::info;
use std::{fs, path::PathBuf};
use structopt::StructOpt;

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
pub struct Solution {
    pub placements: Vec<Vec2>,
}

#[derive(Debug, StructOpt)]
#[structopt(name = "solver", about = "A solver of ICFPC 2023 problems")]
struct Opt {
    // Original: https://github.com/seikichi/icfpc2022/blob/master/solver/core/src/lib.rs
    #[structopt(short = "i", long = "input", parse(from_os_str))]
    input_path: PathBuf,

    #[structopt(short = "o", long = "output-dir", parse(from_os_str))]
    output_dir: PathBuf,

    #[structopt(short = "q", help = "disable debug log")]
    quiet: bool,
}

#[derive(Clone, Debug)]
pub struct Output {}

#[derive(Clone, Debug, serde::Serialize)]
pub struct RawSolutionPlacement {
    pub x: f32,
    pub y: f32,
}

#[derive(Clone, Debug, serde::Serialize)]
pub struct RawSolution {
    pub placements: Vec<RawSolutionPlacement>,
}

pub fn run() -> anyhow::Result<Output> {
    let opt = Opt::from_args();

    // init logger
    let loglevel = if opt.quiet { "info" } else { "debug" };
    env_logger::Builder::from_env(env_logger::Env::default().default_filter_or(loglevel)).init();

    // let (mut head_ai, chained_ais) = parse_ai_string(&opt.ai, &opt)?;

    if !opt.output_dir.is_dir() {
        bail!("'{}' is not a directory", opt.output_dir.to_string_lossy());
    }

    let problem_id = opt
        .input_path
        .file_stem()
        .expect("--input should be a file name.")
        .to_string_lossy()
        .to_string();

    let input = input::load_from_file(opt.input_path.clone())?;

    // println!("input: {:?}", input);
    // TODO: move the following logic to other files
    // SOLVER START
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

    let solution = Solution { placements };
    // println!("solution: {:?}", solution);
    // SOLVER DONE

    let output_filename = opt.output_dir.join(problem_id.clone() + ".json");
    let raw_solution = RawSolution {
        placements: solution
            .placements
            .iter()
            .map(|v| RawSolutionPlacement { x: v.x, y: v.y })
            .collect(),
    };
    let output_json = serde_json::to_string(&raw_solution)?;
    info!("output JSON to: {}", output_filename.to_string_lossy());
    fs::write(output_filename, output_json)?;

    Ok(Output {})
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
