/**
 * MCP Installer - Claude Code Client
 * Client implementation for Claude Code CLI
 */

import { BaseClient } from "./base.js";
import { CLIENTS } from "../constants.js";

export class ClaudeCodeClient extends BaseClient {
  constructor(serverName, serverConfig) {
    super(CLIENTS.CLAUDE_CODE, serverName, serverConfig);
  }

  requiresRestart() {
    return true; // Claude Code needs restart after config changes
  }
}
