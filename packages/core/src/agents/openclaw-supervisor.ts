import * as fs from "fs";
import * as path from "path";
import { AgentRegistry, AgentTask, SwarmResult } from "./universal-registry";

export interface SupervisorConfig {
  name: string;
  version: string;
  description: string;
  supervisor: {
    model: string;
    fallback: string;
    responsibilities: string[];
    validation: {
      auto_approve_threshold: number;
      human_review_threshold: number;
      auto_retry_threshold: number;
      max_retries: number;
      checks: string[];
    };
  };
}

export interface TaskDecomposition {
  taskId: string;
  parallelSubtasks: AgentTask[];
  sequentialSubtasks: AgentTask[];
  finalStep: AgentTask;
}

export class OpenClawSupervisorV2 {
  private config: SupervisorConfig;
  private workspacePath: string;

  constructor(workspacePath: string = process.cwd()) {
    this.workspacePath = workspacePath;
    this.config = this.loadConfig();
  }

  private loadConfig(): SupervisorConfig {
    const yamlPath = path.join(
      this.workspacePath,
      ".devdiff",
      "agents",
      "openclaw",
      "supervisor.yaml",
    );

    if (fs.existsSync(yamlPath)) {
      try {
        const raw = fs.readFileSync(yamlPath, "utf-8");
        // Simple key extraction fallback if yaml parser isn't installed
        const nameMatch = raw.match(/^name:\s*(.*)$/m);
        const versionMatch = raw.match(/^version:\s*["']?(.*?)["']?$/m);

        return {
          name: nameMatch ? nameMatch[1].trim() : "devdiff-supervisor-v2",
          version: versionMatch ? versionMatch[1].trim() : "2.0.0",
          description:
            "OpenClaw Supervisor — Full agent orchestration through DevDiff",
          supervisor: {
            model: "ollama://qwen2.5-coder:14b",
            fallback: "ollama://llama3.1:8b",
            responsibilities: [
              "task_decomposition",
              "agent_assignment",
              "quality_validation",
              "conflict_resolution",
              "human_escalation",
            ],
            validation: {
              auto_approve_threshold: 85,
              human_review_threshold: 70,
              auto_retry_threshold: 50,
              max_retries: 3,
              checks: [
                "no_hallucinated_files",
                "no_vague_statements",
                "sources_cited",
                "follows_skill_md",
              ],
            },
          },
        };
      } catch {}
    }

    return {
      name: "devdiff-supervisor-v2",
      version: "2.0.0",
      description:
        "OpenClaw Supervisor — Full agent orchestration through DevDiff",
      supervisor: {
        model: "ollama://qwen2.5-coder:14b",
        fallback: "ollama://llama3.1:8b",
        responsibilities: [
          "task_decomposition",
          "agent_assignment",
          "quality_validation",
          "conflict_resolution",
          "human_escalation",
        ],
        validation: {
          auto_approve_threshold: 85,
          human_review_threshold: 70,
          auto_retry_threshold: 50,
          max_retries: 3,
          checks: [
            "no_hallucinated_files",
            "no_vague_statements",
            "sources_cited",
            "follows_skill_md",
          ],
        },
      },
    };
  }

  /**
   * Decompose a user objective into parallel and sequential subtasks
   */
  decomposeTask(objective: string): TaskDecomposition {
    const isSecurity = /security|vulnerability|audit|secret|cve/i.test(
      objective,
    );
    const isQA = /question|explain|how|why|where/i.test(objective);

    if (isSecurity) {
      return {
        taskId: "security_audit",
        parallelSubtasks: [
          {
            id: "scan_secrets",
            type: "secret_scan",
            requiredCapabilities: ["secret_detection"],
            priority: "high",
            data: { objective },
          },
          {
            id: "scan_dependencies",
            type: "dependency_scan",
            requiredCapabilities: ["dependency_auditing"],
            priority: "high",
            data: { objective },
          },
        ],
        sequentialSubtasks: [
          {
            id: "analyze_code_patterns",
            type: "security_analysis",
            requiredCapabilities: ["vulnerability_scanning"],
            priority: "critical",
            data: { objective },
          },
        ],
        finalStep: {
          id: "generate_report",
          type: "report_generation",
          requiredCapabilities: ["compliance_verification"],
          priority: "high",
          data: { objective },
        },
      };
    }

    if (isQA) {
      return {
        taskId: "answer_question",
        parallelSubtasks: [
          {
            id: "query_memory",
            type: "memory_lookup",
            requiredCapabilities: ["historical_context"],
            priority: "medium",
            data: { objective },
          },
        ],
        sequentialSubtasks: [],
        finalStep: {
          id: "synthesize_answer",
          type: "code_explanation",
          requiredCapabilities: ["code_explanation"],
          priority: "high",
          data: { objective },
        },
      };
    }

    // Default: changelog_generation
    return {
      taskId: "changelog_generation",
      parallelSubtasks: [
        {
          id: "analyze_architecture",
          type: "architecture_analysis",
          requiredCapabilities: ["architecture_analysis"],
          priority: "high",
          data: { objective },
        },
        {
          id: "scan_security",
          type: "security_scan",
          requiredCapabilities: ["vulnerability_scanning"],
          priority: "medium",
          data: { objective },
        },
      ],
      sequentialSubtasks: [
        {
          id: "analyze_performance",
          type: "performance_analysis",
          requiredCapabilities: ["complexity_analysis"],
          priority: "medium",
          data: { objective },
        },
      ],
      finalStep: {
        id: "generate_documentation",
        type: "changelog_generation",
        requiredCapabilities: ["changelog_generation"],
        priority: "high",
        data: { objective },
      },
    };
  }

  /**
   * Execute full supervisor orchestration pipeline
   */
  async orchestrate(objective: string): Promise<{
    success: boolean;
    taskId: string;
    subtasksCompleted: number;
    swarmResult: SwarmResult;
    validation: { approved: boolean; confidence: number; action: string };
  }> {
    const decomposition = this.decomposeTask(objective);

    // Deploy parallel swarm across subtasks
    const swarmResult = await AgentRegistry.swarm({
      id: decomposition.taskId,
      type: decomposition.taskId,
      requiredCapabilities: [],
      priority: "high",
      data: { objective },
    });

    const confidence = swarmResult.consensus?.confidence || 90;
    const thresholds = this.config.supervisor.validation;

    let action = "auto_approved";
    let approved = true;

    if (confidence < thresholds.auto_retry_threshold) {
      action = "auto_retried_and_escalated";
      approved = false;
    } else if (confidence < thresholds.auto_approve_threshold) {
      action = "human_review_requested";
      approved = true;
    }

    return {
      success: true,
      taskId: decomposition.taskId,
      subtasksCompleted:
        decomposition.parallelSubtasks.length +
        decomposition.sequentialSubtasks.length +
        1,
      swarmResult,
      validation: {
        approved,
        confidence,
        action,
      },
    };
  }
}
