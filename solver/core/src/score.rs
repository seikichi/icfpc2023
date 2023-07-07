use super::*;

pub fn calculate(input: &input::Input, solution: &Solution) -> i64 {
    match validate_solution(input, solution) {
        Ok(()) => {}
        Err(e) => {
            eprintln!("ERROR: {e}");
            return i64::MIN / 4;
        }
    }

    let musicians = &input.musicians;
    let mut score: i64 = 0;
    for k in 0..musicians.len() {
        let score_k = calculate_score_of_a_musician(input, solution, k);
        score += score_k.iter().sum::<i64>();
    }
    score
}

// k番目の musician に関するスコアを返す。
// 戻り値は配列であり、i番目の値はi番目の客からkが得るスコアである。
fn calculate_score_of_a_musician(input: &input::Input, solution: &Solution, k: usize) -> Vec<i64> {
    let attendees = &input.attendees;
    let musicians = &input.musicians;

    let mut scores = vec![0; attendees.len()];
    for i in 0..attendees.len() {
        let intersection = is_occluded(solution, attendees[i].pos, k);
        if intersection == Intersection::Hit {
            continue;
        }
        let taste = attendees[i].tastes[musicians[k].instrument as usize];
        // 接している場合はスコアが小さくなる方向に丸める
        if intersection == Intersection::Tagent {
            if taste > 0.0 {
                continue;
            }
        }

        let diff = attendees[i].pos - solution.placements[k];
        let squared_distance = diff.dot(diff);
        let s = (1_000_000.0 * taste / squared_distance).ceil() as i64;
        scores[i] = s;
    }
    scores
}

pub fn validate_solution(input: &input::Input, solution: &Solution) -> anyhow::Result<()> {
    let stage_pos1 = input.room.stage_pos;
    let stage_size = input.room.stage_size;
    let stage_pos2 = stage_pos1 + stage_size;

    let musicians = &input.musicians;
    let placements = &solution.placements;

    // musician の人数と plaments 内の座標の数が一致していることを確かめる
    if musicians.len() != placements.len() {
        anyhow::bail!(
            "invalid placement: invalid number of placements: n_musicians={}, n_placements={}",
            musicians.len(),
            placements.len()
        );
    }

    // すべての musician がステージ内に入っていることを確かめる
    for k in 0..musicians.len() {
        let p = placements[k];
        let valid_x = stage_pos1.x + 10.0 <= p.x && p.x <= stage_pos2.x - 10.0;
        let valid_y = stage_pos1.y + 10.0 <= p.y && p.y <= stage_pos2.y - 10.0;
        if !valid_x || !valid_y {
            anyhow::bail!("invalid placement: musician is out of stage: k={k}")
        }
    }

    // すべての musician のペアが 10 以上離れていることを確かめる
    for k1 in 0..musicians.len() {
        for k2 in (k1 + 1)..musicians.len() {
            let p1 = placements[k1];
            let p2 = placements[k2];
            let diff = p1 - p2;
            let squared_distance = diff.dot(diff);
            if squared_distance < 10.0 * 10.0 {
                anyhow::bail!("invalid placement: musicians are too close: k1={k1}, k2={k2}")
            }
        }
    }

    Ok(())
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
enum Intersection {
    None,
    Tagent,
    Hit,
}

// p1 と placements[k] を結ぶ線分が遮蔽されているかどうかを返す。
// Hit: 遮蔽されている
// None: 遮蔽されていない
// Tangent: 接している
fn is_occluded(solution: &Solution, p1: Vec2, k: usize) -> Intersection {
    let placements = &solution.placements;
    let p2 = placements[k];
    let mut tangent = false;
    for k_ in 0..placements.len() {
        if k == k_ {
            continue;
        }
        let intersection = line_circle_intersection(p1, p2, 5.0, placements[k_]);
        match intersection {
            Intersection::Hit => return Intersection::Hit,
            Intersection::None => {}
            Intersection::Tagent => {
                tangent = true;
            }
        }
    }
    if tangent {
        Intersection::Tagent
    } else {
        Intersection::None
    }
}

fn line_circle_intersection(mut p1: Vec2, mut p2: Vec2, r: f32, center: Vec2) -> Intersection {
    p1 -= center;
    p2 -= center;

    let dx = p2.x - p1.x;
    let dy = p2.y - p1.y;
    let dr_sq = dx * dx + dy * dy;
    let cross = p1.x * p2.y - p2.x * p1.y;
    let det = r * r * dr_sq - cross * cross;
    if det < -1e-8 {
        return Intersection::None;
    }
    if det > 1e-8 {
        return Intersection::Hit;
    }
    return Intersection::Tagent;
}

#[test]
fn test_line_circle_intersection() {
    // hit
    {
        let p1 = Vec2::new(-2.0, 0.0);
        let p2 = Vec2::new(2.0, 0.0);
        let r = 1.0;
        let center = Vec2::new(0.0, 0.0);
        assert_eq!(
            line_circle_intersection(p1, p2, r, center),
            Intersection::Hit
        );
    }
    // tangent
    {
        let p1 = Vec2::new(-2.0, 1.0);
        let p2 = Vec2::new(2.0, 1.0);
        let r = 1.0;
        let center = Vec2::new(0.0, 0.0);
        assert_eq!(
            line_circle_intersection(p1, p2, r, center),
            Intersection::Tagent
        );
    }
    // none
    {
        let p1 = Vec2::new(-2.0, 2.0);
        let p2 = Vec2::new(2.0, 2.0);
        let r = 1.0;
        let center = Vec2::new(0.0, 0.0);
        assert_eq!(
            line_circle_intersection(p1, p2, r, center),
            Intersection::None
        );
    }
}
