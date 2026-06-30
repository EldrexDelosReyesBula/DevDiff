#!/bin/bash
# test/run-all.sh
# Runs the entire DevDiff v1.0.3 pre-release verification matrix

cd "$(dirname "$0")/.."
bash test/phase12-release-gate.sh
