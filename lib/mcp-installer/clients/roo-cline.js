/**
 * MCP Installer - Roo-Cline Client
 * Client implementation for Roo-Cline VSCode extension
 */

import { BaseClient } from "./base.js";
import { CLIENTS } from "../constants.js";

export class RooClineClient extends BaseClient {
  constructor(serverName, serverConfig) {
    super(CLIENTS.ROO_CLINE, serverName, serverConfig);
  }

  requiresRestart() {
    return false; // Roo-Cline may hot-reload configs
  }
}
