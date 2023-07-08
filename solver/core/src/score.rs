use crate::input::Input;

use super::*;

// スコアを計算する。
// solution が不正である場合、None を返す。
pub fn calculate(input: &input::Input, solution: &Solution) -> Option<i64> {
    match validate_solution(input, solution) {
        Ok(()) => {}
        Err(_) => {
            return None;
        }
    }

    let musicians = &input.musicians;
    let mut score: i64 = 0;
    for k in 0..musicians.len() {
        let score_k = calculate_score_of_a_musician(input, solution, k);
        score += score_k.iter().sum::<i64>();
    }
    Some(score.max(0))
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
fn test_calculate() {
    let input_path = "../../solver/problems/42.json";
    let input = input::load_from_file(input_path.clone()).unwrap();
    let solution_path = "../../solver/test_data/42.json";
    let solution = output::load_from_file(solution_path.clone()).unwrap();
    let score = calculate(&input, &solution).unwrap();
    // assert!(score == 6736676);
}

#[test]
fn test_differential_calculator() {
    let input_path = "../../solver/problems/42.json";
    let input = input::load_from_file(input_path.clone()).unwrap();
    let solution_path = "../../solver/test_data/42.json";

    let current_solution = output::load_from_file(solution_path.clone()).unwrap();
    let current_score = calculate(&input, &current_solution).unwrap();
    // assert!(current_score == 6736676);

    let mut dc = DifferentialCalculator::new(&input, &current_solution);

    // 0番目の musician を今と同じ場所に移動させる
    let pos0 = current_solution.placements[0];
    let next_score = dc.move_one(&input, &current_solution, 0, pos0);

    // スコアは変化しないはず
    assert_eq!(current_score, next_score);
}

#[test]
fn test_differential_calculator2() {
    let room = Room {
        size: Vec2::new(100.0, 100.0),
        stage_pos: Vec2::new(30.0, 0.0),
        stage_size: Vec2::new(70.0, 100.0),
    };
    let attendees = vec![
        Attendee {
            pos: Vec2::new(10.0, 10.0),
            tastes: vec![10.0, 1.0],
        },
        Attendee {
            pos: Vec2::new(10.0, 30.0),
            tastes: vec![20.0, 2.0],
        },
    ];
    let musicians = vec![Musican { instrument: 0 }, Musican { instrument: 1 }];
    let input = Input {
        room,
        attendees,
        musicians,
    };
    let mut current_solution = Solution {
        placements: vec![Vec2::new(40.0, 10.0), Vec2::new(60.0, 10.0)],
    };
    let mut dc = DifferentialCalculator::new(&input, &current_solution);
    // println!("{:?}", dc.n_occlusion);
    // assert!(dc.n_occlusion[0][0] == 0);
    // assert!(dc.n_occlusion[0][1] == 0);
    // assert!(dc.n_occlusion[1][0] == 1);
    // assert!(dc.n_occlusion[1][1] == 0);
    assert!(dc.n_tangent[0][0] == 0);
    assert!(dc.n_tangent[0][1] == 0);
    assert!(dc.n_tangent[1][0] == 0);
    assert!(dc.n_tangent[1][1] == 0);

    let score2 = dc.move_one(&input, &current_solution, 0, Vec2::new(40.0, 30.0));
    current_solution.placements[0] = Vec2::new(40.0, 30.0);
    // assert!(dc.n_occlusion[0][0] == 0);
    // assert!(dc.n_occlusion[0][1] == 0);
    // assert!(dc.n_occlusion[1][0] == 0);
    // assert!(dc.n_occlusion[1][1] == 0);
    assert!(dc.n_tangent[0][0] == 0);
    assert!(dc.n_tangent[0][1] == 0);
    assert!(dc.n_tangent[1][0] == 0);
    assert!(dc.n_tangent[1][1] == 0);
    let score1 = calculate(&input, &current_solution).unwrap();
    assert!(score1 == score2);

    let score2 = dc.move_one(&input, &current_solution, 1, Vec2::new(60.0, 30.0));
    current_solution.placements[1] = Vec2::new(60.0, 30.0);
    // assert!(dc.n_occlusion[0][0] == 0);
    // assert!(dc.n_occlusion[0][1] == 0);
    // assert!(dc.n_occlusion[1][0] == 0);
    // assert!(dc.n_occlusion[1][1] == 1);
    assert!(dc.n_tangent[0][0] == 0);
    assert!(dc.n_tangent[0][1] == 0);
    assert!(dc.n_tangent[1][0] == 0);
    assert!(dc.n_tangent[1][1] == 0);
    let score1 = calculate(&input, &current_solution).unwrap();
    assert!(score1 == score2);

    let score2 = dc.move_one(&input, &current_solution, 0, Vec2::new(40.0, 25.0));
    current_solution.placements[0] = Vec2::new(40.0, 25.0);
    // assert!(dc.n_occlusion[0][0] == 0);
    // assert!(dc.n_occlusion[0][1] == 0);
    // assert!(dc.n_occlusion[1][0] == 1);
    // assert!(dc.n_occlusion[1][1] == 0);
    assert!(dc.n_tangent[0][0] == 0);
    assert!(dc.n_tangent[0][1] == 0);
    assert!(dc.n_tangent[1][0] == 0);
    assert!(dc.n_tangent[1][1] == 1);
    let score1 = calculate(&input, &current_solution).unwrap();
    assert!(score1 == score2);
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

// スコアを差分計算するための struct
struct DifferentialCalculator {
    // n_occlusion[k][i]: k番目の musician と i番目の客の間が何人の musician によって遮蔽されているか
    n_occlusion: Vec<Vec<u32>>,

    // n_tangent[k][i]: k番目の musician と i番目の客を結ぶ線分が何人の musician の当たり判定に接するか
    n_tangent: Vec<Vec<u32>>,
}

impl DifferentialCalculator {
    // O(M^2 A)
    fn new(input: &Input, solution: &Solution) -> Self {
        let n_attendees = input.attendees.len();
        let n_musicians = input.musicians.len();
        let mut dc = Self {
            n_occlusion: vec![vec![0; n_attendees]; n_musicians],
            n_tangent: vec![vec![0; n_attendees]; n_musicians],
        };
        dc.initialize(input, solution);
        dc
    }

    // 内部状態を solution と対応するように初期化する。
    // O(M^2 A)
    fn initialize(&mut self, input: &Input, solution: &Solution) {
        let musician = &input.musicians;
        let attendees = &input.attendees;
        let placements = &solution.placements;

        // n_occlusion と n_tangent を埋める
        for k in 0..musician.len() {
            let p2 = placements[k];
            for i in 0..attendees.len() {
                let p1 = attendees[i].pos;
                for k_ in 0..musician.len() {
                    if k == k_ {
                        continue;
                    }
                    let intersection = line_circle_intersection(p1, p2, 5.0, placements[k_]);
                    match intersection {
                        Intersection::Hit => {
                            self.n_occlusion[k][i] += 1;
                        }
                        Intersection::Tagent => {
                            self.n_tangent[k][i] += 1;
                        }
                        Intersection::None => {}
                    }
                }
            }
        }
    }

    // k番目の musician を new_k_pos に移動したあとのスコアを返す。
    // このスコアは負の値を取りうる。
    // 副作用として、内部状態が移動後の状態に更新される。
    // O(MA)
    pub fn move_one(
        &mut self,
        input: &Input,
        current_solution: &Solution,
        k: usize,
        new_k_pos: Vec2,
    ) -> i64 {
        self.update_internal_state(input, current_solution, k, new_k_pos);
        self.calculate_score(input, current_solution, k, new_k_pos)
    }

    // 内部状態を k を new_k_pos に移動したあとの状態に更新する。
    // O(MA)
    fn update_internal_state(
        &mut self,
        input: &Input,
        current_solution: &Solution,
        k: usize,
        new_k_pos: Vec2,
    ) {
        let musician = &input.musicians;
        let attendees = &input.attendees;

        // 現在の k によって遮蔽されているペアの遮蔽カウントを1減らす
        let current_k_pos = current_solution.placements[k];
        for k_ in 0..musician.len() {
            if k == k_ {
                continue;
            }
            let p1 = current_solution.placements[k_];
            for i in 0..attendees.len() {
                let p2 = attendees[i].pos;
                let intersection = line_circle_intersection(p1, p2, 5.0, current_k_pos);
                match intersection {
                    Intersection::Hit => {
                        self.n_occlusion[k_][i] -= 1;
                    }
                    Intersection::Tagent => {
                        self.n_tangent[k_][i] -= 1;
                    }
                    Intersection::None => {}
                }
            }
        }

        // 新しい k によって遮蔽されるペアの遮蔽カウントを1増やす
        for k_ in 0..musician.len() {
            if k == k_ {
                continue;
            }
            let p1 = current_solution.placements[k_];
            for i in 0..attendees.len() {
                let p2 = attendees[i].pos;
                let intersection = line_circle_intersection(p1, p2, 5.0, new_k_pos);
                match intersection {
                    Intersection::Hit => {
                        self.n_occlusion[k_][i] += 1;
                    }
                    Intersection::Tagent => {
                        self.n_tangent[k_][i] += 1;
                    }
                    Intersection::None => {}
                }
            }
        }

        // n_occulusion[k][*] を計算しなおす
        for i in 0..attendees.len() {
            let p2 = attendees[i].pos;
            let mut n_hit = 0;
            let mut n_tangent = 0;
            for k_ in 0..musician.len() {
                if k == k_ {
                    continue;
                }
                let p3 = current_solution.placements[k_];
                let intersection = line_circle_intersection(new_k_pos, p2, 5.0, p3);
                match intersection {
                    Intersection::Hit => {
                        n_hit += 1;
                    }
                    Intersection::Tagent => {
                        n_tangent += 1;
                    }
                    Intersection::None => {}
                }
            }
            self.n_occlusion[k][i] = n_hit;
            self.n_tangent[k][i] = n_tangent;
        }
    }

    // k を new_k_pos に移動したあとのスコアを返す。
    // このスコアは負の値を取りうる。
    // 内部状態が移動後の状態となっていることが前提である。
    // O(MA)
    fn calculate_score(
        &self,
        input: &Input,
        current_solution: &Solution,
        k: usize,
        new_k_pos: Vec2,
    ) -> i64 {
        let musicians = &input.musicians;
        let mut score = 0;
        for k_ in 0..musicians.len() {
            let pos = if k_ == k {
                new_k_pos
            } else {
                current_solution.placements[k_]
            };
            score += self.calculate_score_of_a_musician(input, k_, pos);
        }
        score
    }

    // k番目の musician に関するスコアを返す。
    // このスコアは負の値を取りうる。
    // 内部状態が移動後の状態となっていることが前提である。
    // O(A)
    fn calculate_score_of_a_musician(&self, input: &Input, k: usize, k_pos: Vec2) -> i64 {
        let attendees = &input.attendees;
        let musicians = &input.musicians;

        let mut score = 0;
        for i in 0..attendees.len() {
            if self.n_occlusion[k][i] > 0 {
                // 遮蔽されている
                continue;
            }
            let taste = attendees[i].tastes[musicians[k].instrument as usize];
            if self.n_tangent[k][i] > 0 {
                if taste > 0.0 {
                    continue;
                }
            }

            let diff = attendees[i].pos - k_pos;
            let squared_distance = diff.dot(diff);
            let s = (1_000_000.0 * taste / squared_distance).ceil() as i64;
            score += s;
        }
        score
    }
}
