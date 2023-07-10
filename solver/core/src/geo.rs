use glam::{IVec2, Vec2};

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

// a を左下の点、size をサイズとする矩形と点 p の間の距離を返す。
// p は矩形の外部になければならない。
pub fn distance_to_rectangle(a: Vec2, size: Vec2, p: Vec2) -> f32 {
    let contains_x = a.x <= p.x && p.x <= a.x + size.x;
    let contains_y = a.y <= p.y && p.y <= a.y + size.y;
    if contains_x && contains_y {
        panic!("p must be out size of rectangle");
    }
    if contains_x {
        let d1 = (p.y - a.y).abs();
        let d2 = (p.y - (a.y + size.y)).abs();
        return d1.min(d2);
    }
    if contains_y {
        let d1 = (p.x - a.x).abs();
        let d2 = (p.x - (a.x + size.x)).abs();
        return d1.min(d2);
    }
    let d1 = p.distance(a);
    let d2 = p.distance(a + Vec2::new(size.x, 0.0));
    let d3 = p.distance(a + Vec2::new(0.0, size.y));
    let d4 = p.distance(a + Vec2::new(size.x, size.y));
    d1.min(d2).min(d3).min(d4)
}

#[test]
fn test_distance_to_rectangle() {
    let a = Vec2::new(1.0, 0.0);
    let size = Vec2::new(1.0, 2.0);
    assert_eq!(
        distance_to_rectangle(a, size, Vec2::new(0.5, 2.5)),
        f32::sqrt(2.0) / 2.0
    );
    assert_eq!(distance_to_rectangle(a, size, Vec2::new(1.5, 3.0)), 1.0);
    assert_eq!(
        distance_to_rectangle(a, size, Vec2::new(3.0, 3.0)),
        f32::sqrt(2.0)
    );
    assert_eq!(distance_to_rectangle(a, size, Vec2::new(0.0, 0.5)), 1.0);
    assert_eq!(distance_to_rectangle(a, size, Vec2::new(3.0, 1.0)), 1.0);
    assert_eq!(
        distance_to_rectangle(a, size, Vec2::new(0.0, -1.0)),
        f32::sqrt(2.0)
    );
    assert_eq!(distance_to_rectangle(a, size, Vec2::new(1.5, -1.0)), 1.0);
    assert_eq!(
        distance_to_rectangle(a, size, Vec2::new(3.0, -1.0)),
        f32::sqrt(2.0)
    );
}

pub fn distance_to_rectangle_inner(a: Vec2, size: Vec2, p: Vec2) -> f32 {
    let b = a + size;
    let d1 = (p.x - a.x).abs();
    let d2 = (p.y - a.y).abs();
    let d3 = (p.x - b.x).abs();
    let d4 = (p.y - b.y).abs();
    d1.min(d2).min(d3).min(d4)
}

// cf. https://en.wikipedia.org/wiki/Xiaolin_Wu%27s_line_algorithm
#[allow(dead_code)]
fn draw_line(mut p0: Vec2, mut p1: Vec2, plot: impl Fn(IVec2)) {
    let steep = (p1.y - p0.y).abs() > (p1.x - p0.x).abs();
    if steep {
        std::mem::swap(&mut p0.x, &mut p0.y);
        std::mem::swap(&mut p1.x, &mut p1.y);
    }
    if p0.x > p1.x {
        std::mem::swap(&mut p0, &mut p1);
    }

    let d = p1 - p0;
    let gradient = if d.x.abs() < 1e-5 { 1.0 } else { d.y / d.x };

    // handle first endpoint
    let xend = p0.x.round();
    let yend = p0.y + gradient * (xend - p0.x);
    let xpxl1 = xend as i32;
    let ypxl1 = yend.floor() as i32;
    if steep {
        plot(IVec2::new(ypxl1, xpxl1));
        plot(IVec2::new(ypxl1 + 1, xpxl1));
    } else {
        plot(IVec2::new(xpxl1, ypxl1));
        plot(IVec2::new(xpxl1, ypxl1 + 1));
    }
    let mut intery = yend + gradient; // first y-intersection for the main loop

    // handle second endpoint
    let xend = p1.x.round();
    let yend = p1.y + gradient * (xend - p1.x);
    let xpxl2 = xend as i32;
    let ypxl2 = yend.floor() as i32;
    if steep {
        plot(IVec2::new(ypxl2, xpxl2));
        plot(IVec2::new(ypxl2 + 1, xpxl2));
    } else {
        plot(IVec2::new(xpxl2, ypxl2));
        plot(IVec2::new(xpxl2, ypxl2 + 1));
    }

    // main loop
    if steep {
        for x in (xpxl1 + 1)..=(xpxl2 - 1) {
            let i = intery.floor() as i32;
            plot(IVec2::new(i, x));
            plot(IVec2::new(i + 1, x));
            intery += gradient;
        }
    } else {
        for x in (xpxl1 + 1)..=(xpxl2 - 1) {
            let i = intery.floor() as i32;
            plot(IVec2::new(x, i));
            plot(IVec2::new(x, i + 1));
            intery += gradient;
        }
    }
}

// 点(a, b)から原点を中心とする半径rの円に接線を引いたときの接点を求める。
// 点(a, b) は円の内部(円周を含む)に存在してはならない。
fn circle_tangent_points_simple(a: f32, b: f32, r: f32) -> (Vec2, Vec2) {
    let a2 = a * a;
    let b2 = b * b;
    let r2 = r * r;
    let c2 = a2 + b2;
    if c2 <= r2 {
        panic!("(a, b) must be outside of circle: a={a}, b={b}, r={r}");
    }

    if b.abs() < 1e-5 {
        let x = r2 / a;
        let y = r * (1.0 - r2 / a2).sqrt();
        return (Vec2::new(x, y), Vec2::new(x, -y));
    }

    let d = (b2 * r2 * (c2 - r2)).sqrt();
    let x1 = (a * r2 - d) / c2;
    let x2 = (a * r2 + d) / c2;
    let y1 = (b2 * r2 + a * d) / (b * c2);
    let y2 = (b2 * r2 - a * d) / (b * c2);
    (Vec2::new(x1, y1), Vec2::new(x2, y2))
}

// p から center を中心とする半径rの円に接線を引いたときの接点を求める。
// p は円の内部(円周を含む)に存在してはならない。
// 戻り値となる２つの接点 t1, t2 は、p--t1--t2 が counter clockwise となるように返す。
pub fn circle_tangent_points(center: Vec2, r: f32, mut p: Vec2) -> (Vec2, Vec2) {
    p -= center;
    let (mut t1, mut t2) = circle_tangent_points_simple(p.x, p.y, r);
    p += center;
    t1 += center;
    t2 += center;
    if ccw(p, t1, t2) < 0 {
        std::mem::swap(&mut t1, &mut t2);
    }
    (t1, t2)
}

#[test]
fn test_circle_tangent_points() {
    assert_eq!(
        circle_tangent_points(Vec2::ZERO, 2.0, Vec2::new(2.0, 4.0)),
        (Vec2::new(-6.0 / 5.0, 8.0 / 5.0), Vec2::new(2.0, 0.0))
    );
}

pub fn cross(a: Vec2, b: Vec2) -> f32 {
    a.x * b.y - a.y * b.x
}

pub fn ccw(a: Vec2, mut b: Vec2, mut c: Vec2) -> i32 {
    b -= a;
    c -= a;
    let x = cross(b, c);
    if x > 1e-5 {
        return 1; // counter clockwise
    }
    if x < -1e-5 {
        return -1; // clockwise
    }
    if b.dot(c) < 0.0 {
        return 2; // c--a--b on line
    }
    if b.dot(b) < c.dot(c) {
        return -2; // a--b--c on line
    }
    0
}

// 半直線 a--b と a--c によって囲まれたコーン状の領域に点xが存在するかどうかを返す。
// a--b--c は counter clockwise でなければならない。
pub fn in_cone(a: Vec2, b: Vec2, c: Vec2, x: Vec2) -> Intersection {
    #[cfg(debug_assertions)]
    assert_eq!(ccw(a, b, c), 1);

    let ccw1 = ccw(a, b, x);
    if ccw1 == -2 {
        return Intersection::Tagent;
    }
    if ccw1 != 1 {
        return Intersection::None;
    }
    let ccw2 = ccw(a, c, x);
    if ccw2 == -2 {
        return Intersection::Tagent;
    }
    if ccw2 != -1 {
        return Intersection::None;
    }
    Intersection::Hit
}

#[test]
fn test_in_cone() {
    let v = |x, y| Vec2::new(x, y);
    let a = v(0.0, 0.0);
    let b = v(1.0, 0.0);
    let c = v(1.0, 1.0);
    assert_eq!(in_cone(a, b, c, v(1.0, 0.5)), Intersection::Hit);
    assert_eq!(in_cone(a, b, c, v(2.0, 1.5)), Intersection::Hit);
    assert_eq!(in_cone(a, b, c, v(1.0, 1.5)), Intersection::None);
    assert_eq!(in_cone(a, b, c, v(1.0, -0.1)), Intersection::None);
    assert_eq!(in_cone(a, b, c, v(-1.0, -0.5)), Intersection::None);
    assert_eq!(in_cone(a, b, c, v(-1.0, 1.0)), Intersection::None);
    assert_eq!(in_cone(a, b, c, v(1.0, -1.0)), Intersection::None);
    assert_eq!(in_cone(a, b, c, v(2.0, 0.0)), Intersection::Tagent);
    assert_eq!(in_cone(a, b, c, v(2.0, 2.0)), Intersection::Tagent);
    assert_eq!(in_cone(a, b, c, v(0.0, 0.0)), Intersection::None);
}

#[test]
fn test_in_cone2() {
    let v = |x, y| Vec2::new(x, y);
    let a = v(60.0, 10.0);
    let b = v(40.0, 20.0);
    let c = v(40.0, 0.0);
    assert_eq!(ccw(a, b, c), 1);
    assert_eq!(ccw(a, b, v(10.0, 10.0)), 1);
    assert_eq!(in_cone(a, b, c, v(10.0, 10.0)), Intersection::Hit);
}
