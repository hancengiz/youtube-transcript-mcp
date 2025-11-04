/**
 * MCP Installer - Configuration Utilities
 * Handles reading, writing, and validating configuration files
 */

import { readFile, writeFile, mkdir, access } from "fs/promises";
import { dirname } from "path";
import { constants } from "fs";

/**
 * Read a JSON configuration file
 * @param {string} filePath - Path to the config file
 * @returns {Promise<Object>} Parsed configuration object
 */
export async function readConfig(filePath) {
  try {
    const data = await readFile(filePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    if (error.code === "ENOENT") {
      // File doesn't exist, return empty config
      return {};
    }
    throw new Error(`Failed to read config from ${filePath}: ${error.message}`);
  }
}

/**
 * Write a JSON configuration file
 * @param {string} filePath - Path to the config file
 * @param {Object} config - Configuration object to write
 * @returns {Promise<void>}
 */
export async function writeConfig(filePath, config) {
  try {
    // Ensure directory exists
    const dir = dirname(filePath);
    await mkdir(dir, { recursive: true });

    // Write config with pretty formatting
    await writeFile(filePath, JSON.stringify(config, null, 2), "utf8");
  } catch (error) {
    throw new Error(`Failed to write config to ${filePath}: ${error.message}`);
  }
}

/**
 * Check if a file exists
 * @param {string} filePath - Path to check
 * @returns {Promise<boolean>} True if file exists
 */
export async function fileExists(filePath) {
  try {
    await access(filePath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * Safely merge MCP server configurations
 * @param {Object} config - Existing configuration
 * @param {string} serverName - Name of the MCP server
 * @param {Object} serverConfig - Server configuration to add
 * @returns {Object} Updated configuration
 */
export function addServerToConfig(config, serverName, serverConfig) {
  // Ensure mcpServers object exists
  if (!config.mcpServers) {
    config.mcpServers = {};
  }

  // Add or update the server
  config.mcpServers[serverName] = serverConfig;

  return config;
}

/**
 * Remove MCP server from configuration
 * @param {Object} config - Existing configuration
 * @param {string} serverName - Name of the MCP server to remove
 * @returns {Object} Updated configuration
 */
export function removeServerFromConfig(config, serverName) {
  if (config.mcpServers && config.mcpServers[serverName]) {
    delete config.mcpServers[serverName];
  }

  return config;
}

/**
 * Check if a server is registered in the configuration
 * @param {Object} config - Configuration object
 * @param {string} serverName - Name of the MCP server
 * @returns {boolean} True if server is registered
 */
export function isServerRegistered(config, serverName) {
  return !!(config.mcpServers && config.mcpServers[serverName]);
}
