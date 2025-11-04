/**
 * MCP Installer - Continue Client
 * Client implementation for Continue.dev
 */

import { BaseClient } from "./base.js";
import { CLIENTS } from "../constants.js";

export class ContinueClient extends BaseClient {
  constructor(serverName, serverConfig) {
    super(CLIENTS.CONTINUE, serverName, serverConfig);
  }

  requiresRestart() {
    return false; // Continue may hot-reload configs
  }
}
