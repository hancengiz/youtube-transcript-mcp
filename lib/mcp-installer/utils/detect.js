/**
 * MCP Installer - Client Detection
 * Detects which MCP clients are installed on the system
 */

import { fileExists } from "./config.js";
import { CLIENTS, getConfigPaths, CLIENT_NAMES } from "../constants.js";
import { dirname } from "path";

/**
 * Detect if a specific MCP client is installed
 * @param {string} clientId - Client identifier from CLIENTS constant
 * @returns {Promise<Object>} Detection result with status and path
 */
export async function detectClient(clientId) {
  const configPaths = getConfigPaths();
  const configPath = configPaths[clientId];

  if (!configPath) {
    return {
      id: clientId,
      name: CLIENT_NAMES[clientId] || clientId,
      installed: false,
      reason: "Unknown client",
    };
  }

  // Check if config directory exists (not just the file)
  const configDir = dirname(configPath);
  const dirExists = await fileExists(configDir);

  if (!dirExists) {
    return {
      id: clientId,
      name: CLIENT_NAMES[clientId],
      installed: false,
      configPath,
      reason: "Client directory not found",
    };
  }

  // Client is installed if its config directory exists
  return {
    id: clientId,
    name: CLIENT_NAMES[clientId],
    installed: true,
    configPath,
  };
}

/**
 * Detect all installed MCP clients
 * @returns {Promise<Array>} Array of detection results
 */
export async function detectAllClients() {
  const clientIds = Object.values(CLIENTS);
  const results = await Promise.all(clientIds.map((id) => detectClient(id)));

  return results;
}

/**
 * Get list of installed clients
 * @returns {Promise<Array>} Array of installed client objects
 */
export async function getInstalledClients() {
  const allClients = await detectAllClients();
  return allClients.filter((client) => client.installed);
}

/**
 * Check if any MCP clients are installed
 * @returns {Promise<boolean>} True if at least one client is installed
 */
export async function hasAnyClientInstalled() {
  const installed = await getInstalledClients();
  return installed.length > 0;
}
