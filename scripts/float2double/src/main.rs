use std::io;

#[derive(Clone, Debug, serde::Serialize, serde::Deserialize)]
pub struct RawPlacement32 {
    x: f32,
    y: f32,
}

#[derive(Clone, Debug, serde::Serialize, serde::Deserialize)]
pub struct RawSolution32 {
    placements: Vec<RawPlacement32>,
    volumes: Option<Vec<f32>>,
}


#[derive(Clone, Debug, serde::Serialize, serde::Deserialize)]
pub struct RawPlacement64 {
    x: f64,
    y: f64,
}

#[derive(Clone, Debug, serde::Serialize, serde::Deserialize)]
pub struct RawSolution64 {
    placements: Vec<RawPlacement64>,
    volumes: Option<Vec<f32>>,
}

fn main() -> io::Result<()> {
    let solution32: RawSolution32 = serde_json::from_reader(io::stdin().lock())?;
    let solution64 = RawSolution64 {
        volumes: solution32.volumes,
        placements: solution32
            .placements
            .iter()
            .map(|p| RawPlacement64 { x: p.x as f64, y: p.y as f64 })
            .collect(),
    };
    serde_json::to_writer(io::stdout().lock(), &solution64)?;
    Ok(())
}
