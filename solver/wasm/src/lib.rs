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
pub fn calculate(input: &str, solution: &str) -> i64 {
    utils::set_panic_hook();

    let input = core::input::load_from_str(input).unwrap();
    let solution = core::output::load_from_str(solution).unwrap();

    core::score::calculate(&input, &solution).unwrap()
}

#[wasm_bindgen]
pub fn greet(name: &str) {
    alert(&format!("Hello, {}!", name));
}
