/**
 * MCP Installer - Base Client
 * Abstract base class for MCP client implementations
 */

import {
  readConfig,
  writeConfig,
  addServerToConfig,
  removeServerFromConfig,
  isServerRegistered,
} from "../utils/config.js";
import { detectClient } from "../utils/detect.js";

export class BaseClient {
  /**
   * @param {string} clientId - Client identifier
   * @param {string} serverName - Name of the MCP server
   * @param {Object} serverConfig - Server configuration
   */
  constructor(clientId, serverName, serverConfig) {
    this.clientId = clientId;
    this.serverName = serverName;
    this.serverConfig = serverConfig;
    this.configPath = null;
  }

  /**
   * Initialize the client by detecting installation
   * @returns {Promise<boolean>} True if client is installed
   */
  async init() {
    const detection = await detectClient(this.clientId);
    this.detection = detection;
    this.configPath = detection.configPath;
    return detection.installed;
  }

  /**
   * Register the MCP server with this client
   * @returns {Promise<Object>} Registration result
   */
  async register() {
    if (!this.detection.installed) {
      return {
        success: false,
        message: `${this.detection.name} is not installed`,
        reason: this.detection.reason,
      };
    }

    try {
      // Read existing config
      const config = await readConfig(this.configPath);

      // Check if already registered
      if (isServerRegistered(config, this.serverName)) {
        return {
          success: true,
          message: `${this.serverName} is already registered with ${this.detection.name}`,
          alreadyRegistered: true,
        };
      }

      // Add server to config
      const updatedConfig = addServerToConfig(
        config,
        this.serverName,
        this.serverConfig
      );

      // Write updated config
      await writeConfig(this.configPath, updatedConfig);

      return {
        success: true,
        message: `Successfully registered ${this.serverName} with ${this.detection.name}`,
        configPath: this.configPath,
        restartRequired: this.requiresRestart(),
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to register with ${this.detection.name}: ${error.message}`,
        error: error.message,
      };
    }
  }

  /**
   * Unregister the MCP server from this client
   * @returns {Promise<Object>} Unregistration result
   */
  async unregister() {
    if (!this.detection.installed) {
      return {
        success: false,
        message: `${this.detection.name} is not installed`,
      };
    }

    try {
      // Read existing config
      const config = await readConfig(this.configPath);

      // Check if registered
      if (!isServerRegistered(config, this.serverName)) {
        return {
          success: true,
          message: `${this.serverName} is not registered with ${this.detection.name}`,
          notRegistered: true,
        };
      }

      // Remove server from config
      const updatedConfig = removeServerFromConfig(config, this.serverName);

      // Write updated config
      await writeConfig(this.configPath, updatedConfig);

      return {
        success: true,
        message: `Successfully unregistered ${this.serverName} from ${this.detection.name}`,
        configPath: this.configPath,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to unregister from ${this.detection.name}: ${error.message}`,
        error: error.message,
      };
    }
  }

  /**
   * Check if the server is registered
   * @returns {Promise<boolean>} True if registered
   */
  async isRegistered() {
    if (!this.detection.installed) {
      return false;
    }

    try {
      const config = await readConfig(this.configPath);
      return isServerRegistered(config, this.serverName);
    } catch {
      return false;
    }
  }

  /**
   * Verify the registration is valid
   * @returns {Promise<Object>} Verification result
   */
  async verify() {
    if (!this.detection.installed) {
      return {
        valid: false,
        message: `${this.detection.name} is not installed`,
      };
    }

    try {
      const config = await readConfig(this.configPath);

      if (!isServerRegistered(config, this.serverName)) {
        return {
          valid: false,
          message: `${this.serverName} is not registered`,
        };
      }

      const serverConfig = config.mcpServers[this.serverName];

      // Basic validation
      if (!serverConfig.command) {
        return {
          valid: false,
          message: "Missing 'command' in server configuration",
        };
      }

      return {
        valid: true,
        message: `Configuration is valid`,
        config: serverConfig,
      };
    } catch (error) {
      return {
        valid: false,
        message: `Verification failed: ${error.message}`,
      };
    }
  }

  /**
   * Check if client requires restart after registration
   * Override in subclasses if needed
   * @returns {boolean}
   */
  requiresRestart() {
    return true;
  }
}
