extern crate core;

mod utils;

use wasm_bindgen::prelude::*;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
extern "C" {
    fn alert(s: &str);
}

#[wasm_bindgen]
pub fn add(a: u32, b: u32) -> u64 {
    core::add(u64::from(a), u64::from(b))
}

#[wasm_bindgen]
// pub fn calculate(input: &str, solution: &str) -> Option<i64> {
pub fn calculate(input: &str, solution: &str, problem_number: i32) -> i64 {
    utils::set_panic_hook();

    let input = core::input::load_from_str(input, problem_number).unwrap();
    let solution = core::output::load_from_str(solution).unwrap();

    core::score::calculate(&input, &solution).unwrap()
}

#[wasm_bindgen]
pub fn calculate_score_of_a_musician(
    input: &str,
    solution: &str,
    problem_number: i32,
    k: usize,
) -> Vec<i64> {
    utils::set_panic_hook();

    let input = core::input::load_from_str(input, problem_number).unwrap();
    let solution = core::output::load_from_str(solution).unwrap();

    core::score::calculate_score_of_a_musician(&input, &solution, k)
}

#[wasm_bindgen]
pub fn attendee_importance(attendee_json: &str, room_json: &str) -> f32 {
    utils::set_panic_hook();

    let attendee = core::input::load_attendee(attendee_json).unwrap();
    let room = core::input::load_room(room_json).unwrap();

    core::prune::attendee_importance(&attendee, &room)
}

#[wasm_bindgen]
pub fn greet(name: &str) {
    alert(&format!("Hello, {}!", name));
}
