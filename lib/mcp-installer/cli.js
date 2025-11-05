#!/usr/bin/env node

/**
 * MCP Installer - CLI Interface
 * Command-line interface for registering MCP servers
 */

import {
  registerToClient,
  registerToAllClients,
  unregisterFromClient,
  unregisterFromAllClients,
  listRegistrations,
  verifyRegistration,
  detectClients,
  CLIENTS,
} from "./index.js";

const COMMANDS = {
  REGISTER: "register",
  UNREGISTER: "unregister",
  LIST: "list",
  VERIFY: "verify",
  DETECT: "detect",
  HELP: "help",
};

// Color codes for terminal output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m",
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

function printUsage() {
  console.log(`
${colorize("MCP Installer", "cyan")} - Register MCP servers with AI clients

${colorize("USAGE:", "yellow")}
  npx -p @fabriqa.ai/youtube-transcript-mcp ytmcp [command] [options]

${colorize("COMMANDS:", "yellow")}
  ${colorize("register", "green")}     Register the MCP server
    --to <client>    Register to specific client (${Object.values(CLIENTS).join(", ")})
    --all            Register to all installed clients

  ${colorize("unregister", "red")}   Unregister the MCP server
    --from <client>  Unregister from specific client
    --all            Unregister from all clients

  ${colorize("list", "blue")}         List registration status for all clients

  ${colorize("verify", "blue")}       Verify registration for a specific client
    --client <name>  Client to verify

  ${colorize("detect", "cyan")}       Detect installed MCP clients

  ${colorize("help", "gray")}         Show this help message

${colorize("EXAMPLES:", "yellow")}
  # Register to Claude Code
  npx -p @fabriqa.ai/youtube-transcript-mcp ytmcp register --to claude-code

  # Register to all installed clients
  npx -p @fabriqa.ai/youtube-transcript-mcp ytmcp register --all

  # List all registrations
  npx -p @fabriqa.ai/youtube-transcript-mcp ytmcp list

  # Detect installed clients
  npx -p @fabriqa.ai/youtube-transcript-mcp ytmcp detect

  # Unregister from Cursor
  npx -p @fabriqa.ai/youtube-transcript-mcp ytmcp unregister --from cursor
  `);
}

async function handleRegister(args) {
  const toIndex = args.indexOf("--to");
  const allIndex = args.indexOf("--all");

  if (allIndex !== -1) {
    console.log(colorize("Registering to all installed clients...", "cyan"));
    const results = await registerToAllClients();

    for (const result of results) {
      if (result.success) {
        console.log(colorize("✓", "green"), result.message);
        if (result.restartRequired) {
          console.log(
            colorize("  ⚠ Restart required for changes to take effect", "yellow")
          );
        }
      } else {
        console.log(colorize("✗", "red"), result.message);
      }
    }
  } else if (toIndex !== -1 && args[toIndex + 1]) {
    const clientId = args[toIndex + 1];
    console.log(
      colorize(`Registering to ${clientId}...`, "cyan")
    );
    const result = await registerToClient(clientId);

    if (result.success) {
      console.log(colorize("✓", "green"), result.message);
      if (result.restartRequired) {
        console.log(
          colorize("⚠ Restart required for changes to take effect", "yellow")
        );
      }
      if (result.configPath) {
        console.log(colorize(`Config: ${result.configPath}`, "gray"));
      }
    } else {
      console.log(colorize("✗", "red"), result.message);
      process.exit(1);
    }
  } else {
    console.log(
      colorize("Error: Please specify --to <client> or --all", "red")
    );
    console.log(
      `Available clients: ${Object.values(CLIENTS).join(", ")}`
    );
    process.exit(1);
  }
}

async function handleUnregister(args) {
  const fromIndex = args.indexOf("--from");
  const allIndex = args.indexOf("--all");

  if (allIndex !== -1) {
    console.log(colorize("Unregistering from all clients...", "cyan"));
    const results = await unregisterFromAllClients();

    for (const result of results) {
      if (result.success) {
        console.log(colorize("✓", "green"), result.message);
      } else {
        console.log(colorize("✗", "red"), result.message);
      }
    }
  } else if (fromIndex !== -1 && args[fromIndex + 1]) {
    const clientId = args[fromIndex + 1];
    console.log(
      colorize(`Unregistering from ${clientId}...`, "cyan")
    );
    const result = await unregisterFromClient(clientId);

    if (result.success) {
      console.log(colorize("✓", "green"), result.message);
    } else {
      console.log(colorize("✗", "red"), result.message);
      process.exit(1);
    }
  } else {
    console.log(
      colorize("Error: Please specify --from <client> or --all", "red")
    );
    console.log(
      `Available clients: ${Object.values(CLIENTS).join(", ")}`
    );
    process.exit(1);
  }
}

async function handleList() {
  console.log(colorize("MCP Client Registration Status", "cyan"));
  console.log();

  const statuses = await listRegistrations();

  for (const status of statuses) {
    const installedMark = status.installed
      ? colorize("●", "green")
      : colorize("○", "gray");
    const registeredMark = status.registered
      ? colorize("✓", "green")
      : colorize("✗", "gray");

    console.log(
      `${installedMark} ${status.name.padEnd(30)} ${registeredMark} ${status.registered ? "Registered" : "Not registered"}`
    );

    if (status.installed && status.configPath) {
      console.log(colorize(`   ${status.configPath}`, "gray"));
    }
  }

  console.log();
  console.log(colorize("Legend:", "gray"));
  console.log(
    colorize("●", "green"),
    "Client installed  ",
    colorize("○", "gray"),
    "Client not found"
  );
  console.log(
    colorize("✓", "green"),
    "Server registered",
    colorize("✗", "gray"),
    "Server not registered"
  );
}

async function handleVerify(args) {
  const clientIndex = args.indexOf("--client");

  if (clientIndex !== -1 && args[clientIndex + 1]) {
    const clientId = args[clientIndex + 1];
    console.log(
      colorize(`Verifying registration for ${clientId}...`, "cyan")
    );

    const result = await verifyRegistration(clientId);

    if (result.valid) {
      console.log(colorize("✓", "green"), result.message);
      if (result.config) {
        console.log(colorize("Configuration:", "gray"));
        console.log(JSON.stringify(result.config, null, 2));
      }
    } else {
      console.log(colorize("✗", "red"), result.message);
      process.exit(1);
    }
  } else {
    console.log(colorize("Error: Please specify --client <name>", "red"));
    console.log(
      `Available clients: ${Object.values(CLIENTS).join(", ")}`
    );
    process.exit(1);
  }
}

async function handleDetect() {
  console.log(colorize("Detecting MCP clients...", "cyan"));
  console.log();

  const clients = await detectClients();
  const installed = clients.filter((c) => c.installed);

  console.log(
    colorize(`Found ${installed.length} installed client(s):`, "green")
  );
  console.log();

  for (const client of clients) {
    const mark = client.installed
      ? colorize("✓", "green")
      : colorize("✗", "gray");
    console.log(`${mark} ${client.name.padEnd(30)}`);

    if (client.installed) {
      console.log(colorize(`   ${client.configPath}`, "gray"));
    } else if (client.reason) {
      console.log(colorize(`   ${client.reason}`, "gray"));
    }
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === COMMANDS.HELP) {
    printUsage();
    return;
  }

  const command = args[0];

  try {
    switch (command) {
      case COMMANDS.REGISTER:
        await handleRegister(args.slice(1));
        break;
      case COMMANDS.UNREGISTER:
        await handleUnregister(args.slice(1));
        break;
      case COMMANDS.LIST:
        await handleList();
        break;
      case COMMANDS.VERIFY:
        await handleVerify(args.slice(1));
        break;
      case COMMANDS.DETECT:
        await handleDetect();
        break;
      default:
        console.log(colorize(`Unknown command: ${command}`, "red"));
        printUsage();
        process.exit(1);
    }
  } catch (error) {
    console.error(colorize("Error:", "red"), error.message);
    process.exit(1);
  }
}

main();
