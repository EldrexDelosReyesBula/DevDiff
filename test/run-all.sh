#!/bin/bash
# test/run-all.sh
# Runs the entire DevDiff E2E verification matrix

cd "$(dirname "$0")/.."
bash test/e2e/13-release-gate.sh
