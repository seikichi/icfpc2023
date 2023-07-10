use super::*;
use std::{fs, io, path::Path};

#[derive(Clone, Debug, serde::Serialize, serde::Deserialize)]
pub struct RawPlacement {
    x: f64,
    y: f64,
}

#[derive(Clone, Debug, serde::Serialize, serde::Deserialize)]
pub struct RawSolution {
    placements: Vec<RawPlacement>,
    volumes: Option<Vec<f32>>,
}

#[allow(dead_code)]
pub fn load_from_file<P: AsRef<Path>>(path: P) -> io::Result<Solution> {
    let s = std::fs::read_to_string(path)?;
    load_from_str(&s)
}

#[allow(dead_code)]
pub fn load_from_str(s: &str) -> io::Result<Solution> {
    let raw_solution: RawSolution = serde_json::from_str(s)?;
    let solution = Solution {
        placements: raw_solution
            .placements
            .iter()
            .map(|p| Vec2::new(p.x as f32, p.y as f32))
            .collect(),
    };
    Ok(solution)
}

pub fn save_to_file<P: AsRef<Path>>(
    path: P,
    solution: &Solution,
    volumes: &Vec<f32>,
) -> io::Result<()> {
    let raw_solution = RawSolution {
        placements: solution
            .placements
            .iter()
            .map(|p| RawPlacement {
                x: p.x as f64,
                y: p.y as f64,
            })
            .collect(),
        volumes: Some(volumes.clone()),
    };

    let output_json = serde_json::to_string(&raw_solution)?;
    fs::write(path, output_json)?;
    Ok(())
}
