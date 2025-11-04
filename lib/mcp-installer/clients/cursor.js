/**
 * MCP Installer - Cursor Client
 * Client implementation for Cursor IDE
 */

import { BaseClient } from "./base.js";
import { CLIENTS } from "../constants.js";

export class CursorClient extends BaseClient {
  constructor(serverName, serverConfig) {
    super(CLIENTS.CURSOR, serverName, serverConfig);
  }

  requiresRestart() {
    return true; // Cursor needs restart after config changes
  }
}
