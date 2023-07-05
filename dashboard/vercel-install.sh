#!/bin/bash

# move to
pushd ../wasm

# NOTE: should we specify --target option? (default: bundler)
amazon-linux-extras install rust1
cargo install wasm-pack
wasm-pack build --release
popd

# The following command is default install command...
npm install
