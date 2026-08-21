#!/bin/bash
# test/phase6-stress-vibe.sh

echo "╔══════════════════════════════════════════════╗"
echo "║   PHASE 6: Vibe Coding Stress Test           ║"
echo "║   Simulating: AI generates 1000+ files        ║"
echo "╚══════════════════════════════════════════════╝"
echo ""

TEST_DIR="/tmp/devdiff-stress-$(date +%s)"
mkdir -p "$TEST_DIR"
cd "$TEST_DIR"
FAIL=0

git init && git config user.email "stress@test.dev" && git config user.name "Stress"
devdiff init --yes

echo "📋 Phase 6A: 100 files × 10 commits = 1000 files"
echo ""

START_TOTAL=$(date +%s)

for batch in {1..10}; do
    BATCH_START=$(date +%s)
    echo "   Batch $batch/10: Creating 100 files..."
    
    for file in {1..100}; do
        cat > "batch${batch}_file${file}.ts" <<'TEMPLATE'
// Vibe Coding Simulation — Batch BATCH_NUM, File FILE_NUM
import { z } from 'zod'

export const schema_BATCH_FILE = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  metadata: z.record(z.unknown()).optional(),
  features: z.array(z.string()).default([]),
  enabled: z.boolean().default(true),
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
})

export type Config_BATCH_FILE = z.infer<typeof schema_BATCH_FILE>

export class Service_BATCH_FILE {
  private config: Config_BATCH_FILE
  
  constructor(config: Partial<Config_BATCH_FILE> = {}) {
    this.config = schema_BATCH_FILE.parse({
      id: crypto.randomUUID(),
      name: `service-${Date.now()}`,
      features: ['auto', 'generated'],
      version: '1.0.0',
      ...config,
    })
  }
  
  async initialize(): Promise<void> {
    console.log(`[Service_BATCH_FILE] Initializing...`)
  }
  
  async execute<T>(input: T): Promise<{ data: T; meta: Config_BATCH_FILE }> {
    return { data: input, meta: this.config }
  }
  
  async dispose(): Promise<void> {
    console.log(`[Service_BATCH_FILE] Disposed`)
  }
}

export default Service_BATCH_FILE
TEMPLATE
        sed -i "s/BATCH_NUM/$batch/g" "batch${batch}_file${file}.ts"
        sed -i "s/FILE_NUM/$file/g" "batch${batch}_file${file}.ts"
        sed -i "s/BATCH_FILE/batch${batch}_${file}/g" "batch${batch}_file${file}.ts"
    done
    
    git add .
    git commit -m "vibe: batch $batch — 100 auto-generated services" --quiet
    
    BATCH_ELAPSED=$(($(date +%s) - BATCH_START))
    echo "   ✅ Batch $batch done in ${BATCH_ELAPSED}s"
done

TOTAL_CREATION=$(($(date +%s) - START_TOTAL))
echo ""
echo "   ✅ 1000 files created in ${TOTAL_CREATION}s"
echo ""

echo "📋 Phase 6B: Full repository analysis"
echo "   Analyzing 1000 files, 10 commits..."
START_ANALYSIS=$(date +%s)

OUTPUT=$(devdiff generate --since "HEAD~10..HEAD" --dry-run 2>&1)
ANALYSIS_TIME=$(($(date +%s) - START_ANALYSIS))

FILES_FOUND=$(echo "$OUTPUT" | grep -c "batch" || echo 0)
echo "   ✅ Analysis complete in ${ANALYSIS_TIME}s"
echo "   Files detected: ~${FILES_FOUND}"

if [ $ANALYSIS_TIME -lt 60 ]; then
    echo "   ✅ Performance: Under 60 seconds"
else
    echo "   ⚠️ Performance: ${ANALYSIS_TIME}s (target: <60s)"
fi

echo ""
echo "📋 Phase 6C: Memory usage check"
MEM_END=$(ps -o rss= -p $$ 2>/dev/null | awk '{print $1}')
if [ -n "$MEM_END" ]; then
    MEM_MB=$((MEM_END / 1024))
    echo "   Current process memory: ${MEM_MB}MB"
    if [ $MEM_MB -lt 2048 ]; then
        echo "   ✅ Memory: Under 2GB"
    else
        echo "   ⚠️ Memory: ${MEM_MB}MB (target: <2GB)"
    fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "   Vibe Coding Stress Test Complete"
echo "   • Files created: 1000"
echo "   • Creation time: ${TOTAL_CREATION}s"
echo "   • Analysis time: ${ANALYSIS_TIME}s"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

rm -rf "$TEST_DIR"
