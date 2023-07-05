#!/bin/bash

set -eux

# move to
pushd ../wasm

# NOTE: should we specify --target option? (default: bundler)
amazon-linux-extras install rust1
rustup target add wasm32-unknown-unknown
cargo install wasm-pack
/vercel/.cargo/bin/wasm-pack build --release
popd

# The following command is default install command...
npm install
