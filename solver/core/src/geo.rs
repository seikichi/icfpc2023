use glam::Vec2;

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Intersection {
    None,
    Tagent,
    Hit,
}

#[allow(dead_code)]
pub fn line_circle_intersection(mut p1: Vec2, mut p2: Vec2, r: f32, center: Vec2) -> Intersection {
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

        // let p1 = Vec2::new(12.0, 1.0);
        // let p2 = Vec2::new(22.0, 1.0);
        // let r = 1.0;
        // let center = Vec2::new(0.0, 0.0);
        // assert_eq!(
        //     line_circle_intersection(p1, p2, r, center),
        //     Intersection::None
        // );

        // let p1 = Vec2::new(12.0, 0.0);
        // let p2 = Vec2::new(22.0, 0.0);
        // let r = 1.0;
        // let center = Vec2::new(0.0, 0.0);
        // assert_eq!(
        //     line_circle_intersection(p1, p2, r, center),
        //     Intersection::None
        // );
    }
}

fn triangle_area(a: Vec2, b: Vec2, c: Vec2) -> f32 {
    let ab = b - a;
    let ac = c - a;
    let cross = ab.x * ac.y - ab.y * ac.x;
    return 0.5 * cross.abs();
}

pub fn segment_circle_intersection(p: Vec2, q: Vec2, r: f32, o: Vec2) -> Intersection {
    // 高速化のために、まず矩形として比較してみる
    let vr = Vec2::new(r + 1e-5, r + 1e-5);
    if !intersects_rectangle(p, q, o - vr, o + vr) {
        return Intersection::None;
    }

    // 円の中心から線分上の点への距離の最大値
    let max_dist = o.distance(p).max(o.distance(q));
    // 円の中心から線分上の点への距離の最小値
    let min_dist = if (p - o).dot(p - q) > 0.0 && (q - o).dot(q - p) > 0.0 {
        // 円から直線に下ろした垂線の足が線分の上にある場合
        2.0 * triangle_area(o, p, q) / p.distance(q)
    } else {
        // そうでない場合
        o.distance(p).min(o.distance(q))
    };
    if (min_dist - r).abs() < 1e-5 && max_dist >= r {
        Intersection::Tagent
    } else if min_dist <= r && max_dist >= r {
        Intersection::Hit
    } else {
        Intersection::None
    }
}

// 一次元の線分 [a1, a2] と [b1, b2] が共通部分を持つとき true を返す。
fn intersects_segment_1d(a1: f32, a2: f32, b1: f32, b2: f32) -> bool {
    let (al, ar) = if a1 < a2 { (a1, a2) } else { (a2, a1) };
    let (bl, br) = if b1 < b2 { (b1, b2) } else { (b2, b1) };
    al <= br && bl <= ar
}

// a1 と a2 を対角線とする矩形と b1 と b2 を対角線とする矩形が共通部分を持つとき true を返す。
fn intersects_rectangle(a1: Vec2, a2: Vec2, b1: Vec2, b2: Vec2) -> bool {
    intersects_segment_1d(a1.x, a2.x, b1.x, b2.x) && intersects_segment_1d(a1.y, a2.y, b1.y, b2.y)
}

#[test]
fn test_intersect_rectangle() {
    assert_eq!(
        intersects_rectangle(
            Vec2::new(0.0, 0.0),
            Vec2::new(1.0, 1.0),
            Vec2::new(0.0, 0.0),
            Vec2::new(1.0, 1.0)
        ),
        true
    );
    assert_eq!(
        intersects_rectangle(
            Vec2::new(0.5, 0.0),
            Vec2::new(1.5, 1.0),
            Vec2::new(0.0, 0.0),
            Vec2::new(1.0, 1.0)
        ),
        true
    );
    assert_eq!(
        intersects_rectangle(
            Vec2::new(2.0, 0.0),
            Vec2::new(1.0, 1.0),
            Vec2::new(0.0, 0.0),
            Vec2::new(1.0, 1.0)
        ),
        true
    );
    assert_eq!(
        intersects_rectangle(
            Vec2::new(2.1, 0.0),
            Vec2::new(1.1, 1.0),
            Vec2::new(0.0, 0.0),
            Vec2::new(1.0, 1.0)
        ),
        false
    );
    assert_eq!(
        intersects_rectangle(
            Vec2::new(0.0, 0.0),
            Vec2::new(1.0, 1.0),
            Vec2::new(0.0, 0.5),
            Vec2::new(1.0, 1.5)
        ),
        true
    );
    assert_eq!(
        intersects_rectangle(
            Vec2::new(0.0, 0.0),
            Vec2::new(1.0, 1.0),
            Vec2::new(0.0, 1.0),
            Vec2::new(1.0, 2.0)
        ),
        true
    );
    assert_eq!(
        intersects_rectangle(
            Vec2::new(0.0, 0.0),
            Vec2::new(1.0, 1.0),
            Vec2::new(0.0, 2.1),
            Vec2::new(1.0, 1.1)
        ),
        false
    );
}
