extern crate core;

mod ai;

use crate::ai::{ChainedAI, HeadAI};
use core::*;

use anyhow::bail;
use log::info;
use std::{path::PathBuf, time::Duration};
use structopt::StructOpt;

fn main() -> anyhow::Result<()> {
    run()?;
    Ok(())
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

    #[structopt(short = "Q", help = "disable debug and info log")]
    super_quiet: bool,

    #[structopt(short = "p", default_value = "500.0", help = "prune threshold")]
    prune_threshold: f32,

    #[structopt(long = "annealing-seconds", default_value = "10")]
    annealing_seconds: u64,
}

// 標準出力に JSON 形式で出力し、Lambda の JS が DB に書き込む
#[derive(Debug, serde::Serialize)]
struct Output {
    score: i64,
}

fn parse_ai_string(
    ai_str: &str,
    opt: &Opt,
) -> anyhow::Result<(Box<dyn HeadAI>, Vec<Box<dyn ChainedAI>>)> {
    let parts = ai_str.split(',').collect::<Vec<_>>();
    let head_ai: Box<dyn ai::HeadAI> = match parts[0] {
        "Grid" => Box::new(ai::GridAI {}),
        "GridGreed" => Box::new(ai::GridGreedAI {}),
        "RandomPut" => Box::new(ai::RandomPutAI {}),
        x => bail!("'{x}' is not a HeadAI"),
    };
    let mut chained_ais = vec![];
    for name in &parts[1..] {
        let chained_ai: Box<dyn ai::ChainedAI> = match *name {
            "Annealing" => Box::new(ai::AnnealingAI {
                time_limit: Duration::from_secs(opt.annealing_seconds),
            }),
            "GreedMove" => Box::new(ai::GreedMoveAI {}),
            x => bail!("'{x}' is not a ChainedAI"),
        };
        chained_ais.push(chained_ai);
    }
    Ok((head_ai, chained_ais))
}

pub fn run() -> anyhow::Result<()> {
    let opt = Opt::from_args();

    // init logger
    let loglevel = if opt.super_quiet {
        "warn"
    } else if opt.quiet {
        "info"
    } else {
        "debug"
    };
    env_logger::Builder::from_env(env_logger::Env::default().default_filter_or(loglevel)).init();

    let (mut head_ai, chained_ais) = parse_ai_string(&opt.ai, &opt)?;

    if !opt.output_dir.is_dir() {
        bail!("'{}' is not a directory", opt.output_dir.to_string_lossy());
    }

    let problem_id = opt
        .input_path
        .file_stem()
        .expect("--input should be a file name.")
        .to_string_lossy()
        .to_string();

    let problem_number = problem_id.parse::<i32>().unwrap();

    let mut input = input::load_from_file(opt.input_path.clone(), problem_number)?;

    let n_attendees_before_prune = input.attendees.len();
    let pruned_attendees =
        prune::prune_attendees(&input.attendees, &input.room, opt.prune_threshold);
    input.attendees = pruned_attendees;
    info!(
        "attendees are pruned from {} to {}",
        n_attendees_before_prune,
        input.attendees.len()
    );

    let mut solution = head_ai.solve(&input);
    let mut score_history = vec![];
    score_history.push(score::calculate(&input, &solution).unwrap());

    for mut chained_ai in chained_ais {
        solution = chained_ai.solve(&input, &solution);
        score_history.push(score::calculate(&input, &solution).unwrap());
    }

    info!("Score History:");
    for (i, score) in score_history.iter().enumerate() {
        info!("    {i}: {score}")
    }

    let output_filename = opt.output_dir.join(problem_id.clone() + ".json");
    info!("output JSON to: {}", output_filename.to_string_lossy());
    output::save_to_file(output_filename, &solution)?;

    let score = score_history.last().unwrap();
    let output = Output { score: *score };
    println!("{}", serde_json::to_string(&output)?);

    Ok(())
}
