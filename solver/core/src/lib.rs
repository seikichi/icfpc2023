mod ai;
mod input;
mod output;
mod score;

use crate::ai::{ChainedAI, HeadAI};

use anyhow::bail;
use glam::Vec2;
use log::info;
use std::{fs, path::PathBuf, time::Duration};
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

#[derive(Clone, Debug, serde::Serialize, serde::Deserialize)]
pub struct Solution {
    pub placements: Vec<Vec2>,
}

#[derive(Clone, Debug, serde::Serialize, serde::Deserialize)]
pub struct RawPlacement {
    x: f32,
    y: f32,
}

#[derive(Clone, Debug, serde::Serialize, serde::Deserialize)]
pub struct RawSolution {
    placements: Vec<RawPlacement>,
}

#[derive(Debug, StructOpt)]
#[structopt(name = "solver", about = "A solver of ICFPC 2023 problems")]
struct Opt {
    // Original: https://github.com/seikichi/icfpc2022/blob/master/solver/core/src/lib.rs
    #[structopt(
        short = "a",
        long = "ai",
        help = "comma separated list of AIs, e.g. 'Cross,Refine'"
    )]
    ai: String,

    #[structopt(short = "i", long = "input", parse(from_os_str))]
    input_path: PathBuf,

    #[structopt(short = "o", long = "output-dir", parse(from_os_str))]
    output_dir: PathBuf,

    #[structopt(short = "q", help = "disable debug log")]
    quiet: bool,

    #[structopt(long = "annealing-seconds", default_value = "10")]
    annealing_seconds: u64,
}

fn parse_ai_string(
    ai_str: &str,
    opt: &Opt,
) -> anyhow::Result<(Box<dyn HeadAI>, Vec<Box<dyn ChainedAI>>)> {
    let parts = ai_str.split(',').collect::<Vec<_>>();
    let head_ai: Box<dyn ai::HeadAI> = match parts[0] {
        "Grid" => Box::new(ai::GridAI {}),
        x => bail!("'{x}' is not a HeadAI"),
    };
    let mut chained_ais = vec![];
    for name in &parts[1..] {
        let chained_ai: Box<dyn ai::ChainedAI> = match *name {
            "Annealing" => Box::new(ai::AnnealingAI {
                time_limit: Duration::from_secs(opt.annealing_seconds),
            }),
            x => bail!("'{x}' is not a ChainedAI"),
        };
        chained_ais.push(chained_ai);
    }
    Ok((head_ai, chained_ais))
}

#[derive(Clone, Debug)]
pub struct Output {}

pub fn run() -> anyhow::Result<Output> {
    let opt = Opt::from_args();

    // init logger
    let loglevel = if opt.quiet { "info" } else { "debug" };
    env_logger::Builder::from_env(env_logger::Env::default().default_filter_or(loglevel)).init();

    let (mut head_ai, _chained_ais) = parse_ai_string(&opt.ai, &opt)?;

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

    let solution = head_ai.solve(&input);
    let raw_solution = RawSolution {
        placements: solution
            .placements
            .iter()
            .map(|p| RawPlacement { x: p.x, y: p.y })
            .collect(),
    };

    let output_filename = opt.output_dir.join(problem_id.clone() + ".json");
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
