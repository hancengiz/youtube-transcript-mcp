/**
 * MCP Installer - Main Entry Point
 * High-level API for registering MCP servers with various clients
 */

import { ClaudeCodeClient } from "./clients/claude-code.js";
import { ClaudeDesktopClient } from "./clients/claude-desktop.js";
import { CursorClient } from "./clients/cursor.js";
import { ClineClient } from "./clients/cline.js";
import { RooClineClient } from "./clients/roo-cline.js";
import { ContinueClient } from "./clients/continue.js";
import {
  detectAllClients,
  getInstalledClients,
  hasAnyClientInstalled,
} from "./utils/detect.js";
import { CLIENTS, DEFAULT_SERVER_CONFIG, SERVER_NAME } from "./constants.js";

/**
 * Get client instance by ID
 * @param {string} clientId - Client identifier
 * @param {string} serverName - MCP server name
 * @param {Object} serverConfig - Server configuration
 * @returns {BaseClient} Client instance
 */
function getClientInstance(clientId, serverName, serverConfig) {
  switch (clientId) {
    case CLIENTS.CLAUDE_CODE:
      return new ClaudeCodeClient(serverName, serverConfig);
    case CLIENTS.CLAUDE_DESKTOP:
      return new ClaudeDesktopClient(serverName, serverConfig);
    case CLIENTS.CURSOR:
      return new CursorClient(serverName, serverConfig);
    case CLIENTS.CLINE:
      return new ClineClient(serverName, serverConfig);
    case CLIENTS.ROO_CLINE:
      return new RooClineClient(serverName, serverConfig);
    case CLIENTS.CONTINUE:
      return new ContinueClient(serverName, serverConfig);
    default:
      throw new Error(`Unknown client: ${clientId}`);
  }
}

/**
 * Register MCP server with a specific client
 * @param {string} clientId - Client identifier
 * @param {Object} options - Registration options
 * @returns {Promise<Object>} Registration result
 */
export async function registerToClient(
  clientId,
  options = {}
) {
  const serverName = options.serverName || SERVER_NAME;
  const serverConfig = options.serverConfig || DEFAULT_SERVER_CONFIG;

  const client = getClientInstance(clientId, serverName, serverConfig);
  await client.init();
  return await client.register();
}

/**
 * Register MCP server with all installed clients
 * @param {Object} options - Registration options
 * @returns {Promise<Array>} Array of registration results
 */
export async function registerToAllClients(options = {}) {
  const installedClients = await getInstalledClients();

  if (installedClients.length === 0) {
    return [
      {
        success: false,
        message: "No MCP clients detected on this system",
      },
    ];
  }

  const results = await Promise.all(
    installedClients.map((client) => registerToClient(client.id, options))
  );

  return results;
}

/**
 * Unregister MCP server from a specific client
 * @param {string} clientId - Client identifier
 * @param {Object} options - Unregistration options
 * @returns {Promise<Object>} Unregistration result
 */
export async function unregisterFromClient(
  clientId,
  options = {}
) {
  const serverName = options.serverName || SERVER_NAME;
  const serverConfig = options.serverConfig || DEFAULT_SERVER_CONFIG;

  const client = getClientInstance(clientId, serverName, serverConfig);
  await client.init();
  return await client.unregister();
}

/**
 * Unregister MCP server from all clients
 * @param {Object} options - Unregistration options
 * @returns {Promise<Array>} Array of unregistration results
 */
export async function unregisterFromAllClients(options = {}) {
  const allClientIds = Object.values(CLIENTS);

  const results = await Promise.all(
    allClientIds.map((clientId) => unregisterFromClient(clientId, options))
  );

  return results.filter((result) => !result.notRegistered);
}

/**
 * List registration status for all clients
 * @param {Object} options - Options
 * @returns {Promise<Array>} Array of client statuses
 */
export async function listRegistrations(options = {}) {
  const serverName = options.serverName || SERVER_NAME;
  const serverConfig = options.serverConfig || DEFAULT_SERVER_CONFIG;

  const allClients = await detectAllClients();

  const statuses = await Promise.all(
    allClients.map(async (detection) => {
      const client = getClientInstance(
        detection.id,
        serverName,
        serverConfig
      );
      await client.init();

      const isRegistered = detection.installed
        ? await client.isRegistered()
        : false;

      return {
        id: detection.id,
        name: detection.name,
        installed: detection.installed,
        registered: isRegistered,
        configPath: detection.configPath,
      };
    })
  );

  return statuses;
}

/**
 * Verify registration for a specific client
 * @param {string} clientId - Client identifier
 * @param {Object} options - Verification options
 * @returns {Promise<Object>} Verification result
 */
export async function verifyRegistration(clientId, options = {}) {
  const serverName = options.serverName || SERVER_NAME;
  const serverConfig = options.serverConfig || DEFAULT_SERVER_CONFIG;

  const client = getClientInstance(clientId, serverName, serverConfig);
  await client.init();
  return await client.verify();
}

/**
 * Detect all MCP clients on the system
 * @returns {Promise<Array>} Array of detected clients
 */
export async function detectClients() {
  return await detectAllClients();
}

// Export constants and utilities
export { CLIENTS, getInstalledClients, hasAnyClientInstalled };
