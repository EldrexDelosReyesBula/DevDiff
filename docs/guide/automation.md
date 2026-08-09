# Workflow Automation & 24/7 Scheduling

DevDiff includes a 24/7 **Background Scheduler** (`BackgroundScheduler`) that executes automated standup digests, security audits, and project context refreshes on custom cron intervals.

---

## 📅 Built-In Default Schedules

- **Morning Standup Digest**: `0 8 * * 1-5` (Every weekday at 8:00 AM)
- **Weekly Security Audit**: `0 9 * * 1` (Every Monday at 9:00 AM)
- **Project Context Refresh**: `0 2 * * *` (Daily at 2:00 AM when system is idle)

---

## 🚀 Schedule CLI Commands

```bash
# List all active background operation schedules
devdiff schedule list

# Enable a specific background schedule
devdiff schedule enable --id morning-standup

# Disable a specific background schedule
devdiff schedule disable --id morning-standup
```

---

## 🛡️ Intelligent Constraints

Background schedules automatically respect hardware constraints:

- **Idle System Awareness**: Long tasks pause when active user interaction is detected.
- **Battery Guard**: Suppresses background cron jobs when discharging on battery.
- **Thermal Safety**: Suppresses tasks when CPU thermals reach `hot` or `critical` levels.
