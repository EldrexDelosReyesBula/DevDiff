export interface RequestedPermission {
  name: string;
  icon: string;
  detail: string;
  warning?: string;
}

export interface PermissionReview {
  permissions: RequestedPermission[];
  undeclared: string[];
}

export class PermissionReviewer {
  static review(
    declaredPermissions: string[],
    sourceCode: string,
  ): PermissionReview {
    const permissions: RequestedPermission[] = [];
    const undeclared: string[] = [];

    const permissionMap: Record<string, RequestedPermission> = {
      network: {
        name: "Network Access",
        icon: "🌐",
        detail: "Allows plugin to make HTTP/HTTPS or WebSocket connections",
      },
      filesystem: {
        name: "File System Access",
        icon: "📁",
        detail: "Allows plugin to read/write workspace or external files",
      },
      shell: {
        name: "Shell Execution",
        icon: "⚡",
        detail: "Allows plugin to execute terminal/shell commands",
        warning: "Shell execution can run arbitrary commands on system",
      },
    };

    for (const perm of declaredPermissions) {
      if (permissionMap[perm]) {
        permissions.push(permissionMap[perm]);
      } else {
        permissions.push({
          name: perm,
          icon: "🔒",
          detail: `Custom declared permission: ${perm}`,
        });
      }
    }

    // Detect actual usage in code
    const hasNetwork = /fetch|axios|http|https|WebSocket|XMLHttpRequest/.test(
      sourceCode,
    );
    const hasShell = /child_process|exec|spawn/.test(sourceCode);
    const hasFileSystem = /fs\.|readFileSync|writeFileSync|promises/.test(
      sourceCode,
    );

    if (hasNetwork && !declaredPermissions.includes("network")) {
      undeclared.push("Network calls detected without 'network' permission");
    }
    if (hasShell && !declaredPermissions.includes("shell")) {
      undeclared.push("Shell execution detected without 'shell' permission");
    }
    if (hasFileSystem && !declaredPermissions.includes("filesystem")) {
      undeclared.push(
        "File system calls detected without 'filesystem' permission",
      );
    }

    return {
      permissions,
      undeclared,
    };
  }
}
