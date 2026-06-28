---
name: security-audit
version: 2.1.0
author: DevDiff Community
description: Automated security audit on every change
difficulty: intermediate
estimated_tokens_per_run: 2500
triggers:
  - git_push
  - pull_request
  - scheduled
tags:
  - security
  - compliance
  - audit
inputs:
  severity_threshold:
    type: string
    default: medium
    enum: [low, medium, high, critical]
  scan_dependencies:
    type: boolean
    default: true
  scan_secrets:
    type: boolean
    default: true
  scan_patterns:
    type: boolean
    default: true
pipeline:
  - step: diff_parser
  - step: secret_scanner
    config:
      custom_patterns: .devdiff/secret-patterns.txt
  - step: dependency_auditor
    config:
      check_cves: true
      check_licenses: true
  - step: code_pattern_scanner
    config:
      patterns:
        - eval_injection
        - sql_injection
        - xss
        - path_traversal
        - hardcoded_credentials
  - step: ai_analyzer
    config:
      persona: compliance
      prompt: |
        Analyze the following code changes for security implications.
        Categorize each finding as: CRITICAL, HIGH, MEDIUM, LOW.
        For each finding, provide:
        1. Description
        2. CWE reference if applicable
        3. Suggested fix
        4. CVSS score estimate
outputs:
  - type: json
    path: .devdiff/audit/security-{{ timestamp }}.json
  - type: markdown
    path: SECURITY_AUDIT.md
  - type: slack
    filter: "findings.critical > 0 || findings.high > 0"
    webhook: ${{ SECURITY_SLACK_WEBHOOK }}
  - type: jira
    create_ticket: true
    project: SEC
    issuetype: Bug
    filter: "finding.severity == 'critical'"
---

# Security Audit Skill

Runs automated secret checks, vulnerability scanning, dependency audits, and compliance assessments on all repository modifications.
