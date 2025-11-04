/**
 * MCP Installer - Cline Client
 * Client implementation for Cline VSCode extension
 */

import { BaseClient } from "./base.js";
import { CLIENTS } from "../constants.js";

export class ClineClient extends BaseClient {
  constructor(serverName, serverConfig) {
    super(CLIENTS.CLINE, serverName, serverConfig);
  }

  requiresRestart() {
    return false; // Cline may hot-reload configs
  }
}
