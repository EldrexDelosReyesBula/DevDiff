# 24/7 Continuous Automation Guide

DevDiff can be configured as a background daemon or system service to watch repositories and run intelligence pipelines continuously.

## Continuous Changelog Pipeline

To setup a continuous changelog builder that checks for changes every 15 minutes, create a configuration file at `.devdiff/automations/continuous-changelog.yaml`:

```yaml
name: Continuous Changelog
schedule: "*/15 * * * *" # Every 15 minutes
watcher: git
trigger: on_commit

pipeline:
  - step: detect_changes
    config:
      watch_branches: [main, develop, "feature/*"]
      min_changes: 1

  - step: batch_changes
    config:
      window: 15m
      min_batch_size: 1
      max_batch_size: 50

  - step: analyze
    config:
      ai:
        routing: auto
      security:
        redact_secrets: true

  - step: generate_outputs
    config:
      formats:
        - type: markdown
          output: CHANGELOG.md
          mode: append
```

## Running as a systemd Service

For Linux servers, save the following service file to `/etc/systemd/system/devdiff-gateway.service`:

```ini
[Unit]
Description=DevDiff Gateway - AI Code Intelligence
Documentation=https://docs.deviff.dev
After=network.target

[Service]
Type=simple
User=devdiff
Group=devdiff
WorkingDirectory=/opt/devdiff
ExecStart=/usr/bin/devdiff-gateway daemon --config /etc/devdiff/daemon.config.ts
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```
