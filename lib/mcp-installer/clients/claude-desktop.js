/**
 * MCP Installer - Claude Desktop Client
 * Client implementation for Claude Desktop application
 */

import { BaseClient } from "./base.js";
import { CLIENTS } from "../constants.js";

export class ClaudeDesktopClient extends BaseClient {
  constructor(serverName, serverConfig) {
    super(CLIENTS.CLAUDE_DESKTOP, serverName, serverConfig);
  }

  requiresRestart() {
    return true; // Claude Desktop needs restart after config changes
  }
}
