#!/bin/bash

set -eux

# move to
pushd ../wasm

# NOTE: should we specify --target option? (default: bundler)
echo "Installing Rustup..."
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
source "$HOME/.cargo/env"

echo "Installing wasm-pack..."
curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh -s -- -y

echo "Build WASM"
/vercel/.cargo/bin/wasm-pack build --release

popd

# The following command is default install command...
npm install
