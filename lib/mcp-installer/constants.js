/**
 * MCP Installer - Constants
 * Central location for all configuration paths, client names, and constants
 */

import { homedir, platform } from "os";
import { join } from "path";

// Supported MCP clients
export const CLIENTS = {
  CLAUDE_CODE: "claude-code",
  CLAUDE_DESKTOP: "claude-desktop",
  CURSOR: "cursor",
  CLINE: "cline",
  ROO_CLINE: "roo-cline",
  CONTINUE: "continue",
};

// Client display names
export const CLIENT_NAMES = {
  [CLIENTS.CLAUDE_CODE]: "Claude Code",
  [CLIENTS.CLAUDE_DESKTOP]: "Claude Desktop",
  [CLIENTS.CURSOR]: "Cursor IDE",
  [CLIENTS.CLINE]: "Cline (VSCode Extension)",
  [CLIENTS.ROO_CLINE]: "Roo-Cline",
  [CLIENTS.CONTINUE]: "Continue.dev",
};

// Config file paths for each client
export const getConfigPaths = () => {
  const home = homedir();
  const os = platform();

  const paths = {
    [CLIENTS.CLAUDE_CODE]: join(home, ".claude.json"),
    [CLIENTS.CLAUDE_DESKTOP]:
      os === "darwin"
        ? join(
            home,
            "Library",
            "Application Support",
            "Claude",
            "claude_desktop_config.json"
          )
        : os === "win32"
          ? join(home, "AppData", "Roaming", "Claude", "claude_desktop_config.json")
          : join(home, ".config", "Claude", "claude_desktop_config.json"),
    [CLIENTS.CURSOR]:
      os === "darwin"
        ? join(home, "Library", "Application Support", "Cursor", "User", "mcp.json")
        : os === "win32"
          ? join(home, "AppData", "Roaming", "Cursor", "User", "mcp.json")
          : join(home, ".config", "Cursor", "User", "mcp.json"),
    [CLIENTS.CLINE]:
      os === "darwin"
        ? join(home, "Library", "Application Support", "Code", "User", "globalStorage", "saoudrizwan.claude-dev", "settings", "cline_mcp_settings.json")
        : os === "win32"
          ? join(home, "AppData", "Roaming", "Code", "User", "globalStorage", "saoudrizwan.claude-dev", "settings", "cline_mcp_settings.json")
          : join(home, ".config", "Code", "User", "globalStorage", "saoudrizwan.claude-dev", "settings", "cline_mcp_settings.json"),
    [CLIENTS.ROO_CLINE]:
      os === "darwin"
        ? join(home, "Library", "Application Support", "Code", "User", "globalStorage", "rooveterinaryinc.roo-cline", "settings", "cline_mcp_settings.json")
        : os === "win32"
          ? join(home, "AppData", "Roaming", "Code", "User", "globalStorage", "rooveterinaryinc.roo-cline", "settings", "cline_mcp_settings.json")
          : join(home, ".config", "Code", "User", "globalStorage", "rooveterinaryinc.roo-cline", "settings", "cline_mcp_settings.json"),
    [CLIENTS.CONTINUE]:
      os === "darwin"
        ? join(home, ".continue", "config.json")
        : os === "win32"
          ? join(home, ".continue", "config.json")
          : join(home, ".continue", "config.json"),
  };

  return paths;
};

// Default MCP server configuration structure
export const DEFAULT_SERVER_CONFIG = {
  command: "npx",
  args: ["@fabriqa.ai/youtube-transcript-mcp"],
};

// Server name used in configurations
export const SERVER_NAME = "youtube-transcript";
