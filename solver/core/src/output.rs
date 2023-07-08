use super::*;
use std::{io, path::Path};

#[allow(dead_code)]
pub fn load_from_file<P: AsRef<Path>>(path: P) -> io::Result<Solution> {
    let s = std::fs::read_to_string(path)?;
    load_from_str(&s)
}

#[allow(dead_code)]
pub fn load_from_str(s: &str) -> io::Result<Solution> {
    let solution: Solution = serde_json::from_str(s)?;
    Ok(solution)
}
