#!/bin/bash
# test/stress/vibe-coding-blast.sh

echo "=== Vibe Coding Stress Test ==="
echo "Simulating: AI generates 1000 files in rapid succession"

TEST_DIR="/tmp/devdiff-stress-$(date +%s)"
mkdir -p "$TEST_DIR"
cd "$TEST_DIR"

git init
git config user.email "stress@test.dev"
git config user.name "Stress Test"

# Initialize DevDiff
devdiff init --yes

echo ""
echo "📝 Phase 1: Creating 100 files with 10 commits each (1000 total changes)"
echo ""

START_TIME=$(date +%s)

for commit in {1..10}; do
    echo "  Commit batch $commit/10..."
    
    # Create 100 files per commit
    for file in {1..100}; do
        cat > "file_${commit}_${file}.ts" <<EOF
// Auto-generated file - Vibe Coding Simulation
// Batch: $commit | File: $file | Timestamp: $(date +%s%N)

export interface Config${commit}_${file} {
    id: string
    name: string
    timestamp: number
    metadata: Record<string, unknown>
    dependencies: string[]
    features: {
        enabled: boolean
        version: string
        flags: number
    }
}

export function createConfig${commit}_${file}(overrides?: Partial<Config${commit}_${file}>): Config${commit}_${file} {
    return {
        id: crypto.randomUUID(),
        name: "config-${commit}-${file}",
        timestamp: Date.now(),
        metadata: {},
        dependencies: [],
        features: {
            enabled: true,
            version: "1.0.${commit}",
            flags: ${RANDOM}
        },
        ...overrides
    }
}

export class Service${commit}_${file} {
    private config: Config${commit}_${file}
    
    constructor(config?: Partial<Config${commit}_${file}>) {
        this.config = createConfig${commit}_${file}(config)
    }
    
    async initialize(): Promise<void> {
        console.log(\`Initializing Service${commit}_${file}...\\` )
        await new Promise(resolve => setTimeout(resolve, 1))
    }
    
    async execute(input: unknown): Promise<unknown> {
        return { result: input, config: this.config }
    }
}

export default Service${commit}_${file}
EOF
    done
    
    git add .
    git commit -m "vibe: batch $commit — 100 AI-generated config files"
    
    ELAPSED=$(($(date +%s) - START_TIME))
    echo "  ✅ Batch $commit done | Elapsed: ${ELAPSED}s"
done

echo ""
echo "📊 Phase 1 Complete:"
echo "   Total files created: 1000"
echo "   Total commits: 10"
echo "   Total time: $(($(date +%s) - START_TIME))s"

echo ""
echo "🔍 Phase 2: DevDiff analysis of all changes..."
ANALYSIS_START=$(date +%s)

devdiff analyze --since "HEAD~10..HEAD" --persona developer --format json --output /tmp/devdiff-stress-result.json

ANALYSIS_TIME=$(($(date +%s) - ANALYSIS_START))
TOTAL_TIME=$(($(date +%s) - START_TIME))

echo ""
echo "📊 Final Results:"
echo "   Files analyzed: $(cat /tmp/devdiff-stress-result.json | jq '.stats.files_changed')"
echo "   Lines changed: $(cat /tmp/devdiff-stress-result.json | jq '.stats.total_changes')"
echo "   Analysis time: ${ANALYSIS_TIME}s"
echo "   Total test time: ${TOTAL_TIME}s"

# Verify
if [ $ANALYSIS_TIME -lt 60 ]; then
    echo "   ✅ Performance: Analysis completed in under 60 seconds"
else
    echo "   ⚠️ Performance: Analysis took over 60 seconds"
fi

# Check no data loss
LOSSLESS=$(cat /tmp/devdiff-stress-result.json | jq '.stats.data_loss_events')
if [ "$LOSSLESS" == "0" ]; then
    echo "   ✅ Data Integrity: Zero data loss events"
else
    echo "   ❌ Data Integrity: $LOSSLESS data loss events detected"
fi

# Cleanup
rm -rf "$TEST_DIR" /tmp/devdiff-stress-result.json
