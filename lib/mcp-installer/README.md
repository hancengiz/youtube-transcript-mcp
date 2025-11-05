# MCP Auto-Installer Library

A universal installation library for Model Context Protocol (MCP) servers. This library automatically detects and registers MCP servers with popular AI coding clients.

## Overview

The MCP Auto-Installer provides a simple, unified way to register MCP servers across multiple AI clients without manual configuration file editing. It handles client detection, configuration file management, and provides a user-friendly CLI.

## Supported Clients

- **Claude Code** - Anthropic's official CLI tool
- **Claude Desktop** - Desktop application for Claude
- **Cursor** - AI-first code editor
- **Cline** - VSCode extension (formerly Claude Dev)
- **Roo-Cline** - Fork of Cline for VSCode
- **Continue.dev** - Open-source AI coding assistant

## Features

- ✅ Automatic client detection across macOS, Windows, and Linux
- ✅ One-command registration to all installed clients
- ✅ Support for registering to specific clients
- ✅ Configuration verification and validation
- ✅ Clean uninstallation support
- ✅ Colorful, user-friendly CLI
- ✅ Zero external dependencies (only Node.js built-ins)
- ✅ Cross-platform support (macOS, Windows, Linux)

## Architecture

```
lib/mcp-installer/
├── index.js              # High-level API
├── cli.js                # CLI interface
├── constants.js          # Client definitions and paths
├── clients/              # Client-specific implementations
│   ├── base.js          # Base client class
│   ├── claude-code.js
│   ├── claude-desktop.js
│   ├── cursor.js
│   ├── cline.js
│   ├── roo-cline.js
│   └── continue.js
└── utils/
    ├── config.js        # Config file operations
    └── detect.js        # Client detection logic
```

## Usage

### As a CLI Tool

```bash
# Register to all installed clients
npx -p your-mcp-package ytmcp register --all

# Register to specific client
npx -p your-mcp-package ytmcp register --to claude-code

# List registration status
npx -p your-mcp-package ytmcp list

# Detect installed clients
npx -p your-mcp-package ytmcp detect

# Verify configuration
npx -p your-mcp-package ytmcp verify --client claude-code

# Unregister from client
npx -p your-mcp-package ytmcp unregister --from claude-code
```

**Note:** The `-p` flag tells npx which package to install, and `ytmcp` is the bin command name (short for "YouTube Transcript MCP"). You can customize this bin name in your package.json to match your project.

### As a JavaScript Library

```javascript
import {
  registerToClient,
  registerToAllClients,
  unregisterFromClient,
  listRegistrations,
  detectClients,
  CLIENTS,
} from "./lib/mcp-installer/index.js";

// Register to Claude Code
await registerToClient(CLIENTS.CLAUDE_CODE);

// Register to all installed clients
await registerToAllClients();

// Detect all clients
const clients = await detectClients();

// List registration status
const statuses = await listRegistrations();

// Unregister from a client
await unregisterFromClient(CLIENTS.CURSOR);
```

## Extracting as a Standalone Package

To extract this as a separate npm package (e.g., `@mcp/installer` or `mcp-auto-installer`):

### 1. Package Structure

Create a new repository with this structure:

```
mcp-auto-installer/
├── package.json
├── README.md
├── LICENSE
├── bin/
│   └── mcp-installer.js    # CLI entry point
├── src/
│   ├── index.js            # Main exports
│   ├── cli.js
│   ├── constants.js
│   ├── clients/
│   │   ├── base.js
│   │   └── [client files]
│   └── utils/
│       ├── config.js
│       └── detect.js
└── test/
    └── [test files]
```

### 2. Package.json Configuration

```json
{
  "name": "mcp-auto-installer",
  "version": "1.0.0",
  "description": "Universal installer for Model Context Protocol servers",
  "type": "module",
  "main": "src/index.js",
  "bin": {
    "mcp-installer": "./bin/mcp-installer.js"
  },
  "keywords": [
    "mcp",
    "model-context-protocol",
    "claude",
    "cursor",
    "ai",
    "installer",
    "cli"
  ],
  "license": "MIT"
}
```

### 3. Using in Your MCP Server

After publishing as a standalone package:

```javascript
// In your MCP server's package.json
{
  "dependencies": {
    "mcp-auto-installer": "^1.0.0"
  },
  "bin": {
    "your-server-register": "./register.js"
  }
}

// In register.js
#!/usr/bin/env node
import { createInstaller } from "mcp-auto-installer";

const installer = createInstaller({
  serverName: "your-server-name",
  serverConfig: {
    command: "npx",
    args: ["your-package-name"]
  }
});

installer.run(process.argv.slice(2));
```

## Design Decisions

### 1. Base Client Pattern

All client implementations extend `BaseClient`, which provides:
- Common registration/unregistration logic
- Configuration file I/O
- Validation and verification
- Error handling

This makes adding new clients trivial - just extend the base class and specify the client ID.

### 2. Cross-Platform Path Resolution

The library uses Node.js `os` and `path` modules to determine correct config file locations for each platform:

```javascript
os === "darwin"
  ? join(home, "Library", "Application Support", "Claude", "config.json")
  : os === "win32"
    ? join(home, "AppData", "Roaming", "Claude", "config.json")
    : join(home, ".config", "Claude", "config.json")
```

### 3. Zero External Dependencies

The library uses only Node.js built-in modules:
- `fs/promises` for file operations
- `os` for platform detection
- `path` for cross-platform paths

This minimizes security risks and installation complexity.

### 4. Graceful Degradation

The library handles missing clients gracefully:
- Detection doesn't fail if a client isn't installed
- Registration operations clearly report what succeeded/failed
- Error messages are helpful and actionable

## API Reference

### High-Level Functions

#### `registerToClient(clientId, options)`

Register MCP server with a specific client.

```javascript
await registerToClient(CLIENTS.CLAUDE_CODE, {
  serverName: "my-server",
  serverConfig: {
    command: "npx",
    args: ["my-package"]
  }
});
```

#### `registerToAllClients(options)`

Register to all detected clients.

```javascript
const results = await registerToAllClients({
  serverName: "my-server",
  serverConfig: { /* ... */ }
});
```

#### `unregisterFromClient(clientId, options)`

Unregister from a specific client.

#### `listRegistrations(options)`

Get registration status for all clients.

#### `detectClients()`

Detect all installed MCP clients.

### Constants

```javascript
import { CLIENTS } from "./constants.js";

CLIENTS.CLAUDE_CODE      // "claude-code"
CLIENTS.CLAUDE_DESKTOP   // "claude-desktop"
CLIENTS.CURSOR           // "cursor"
CLIENTS.CLINE            // "cline"
CLIENTS.ROO_CLINE        // "roo-cline"
CLIENTS.CONTINUE         // "continue"
```

## Naming Suggestions

For a standalone package, consider these names:

### Good Options:
- `mcp-auto-installer` - Clear and descriptive
- `mcp-register` - Short and action-oriented
- `@mcp/installer` - Scoped package (requires @mcp org)
- `mcp-config-manager` - Configuration-focused
- `universal-mcp-installer` - Emphasizes cross-client support

### Reserved on npm (as of 2025):
- `mcp` - Taken
- `mcp-installer` - Check availability

### Recommended:
**`mcp-auto-installer`** - Available, clear, and searchable

## Future Enhancements

Potential features for future versions:

1. **Auto-update Detection** - Notify users when MCP server has updates
2. **Configuration Migration** - Migrate configs when clients update
3. **Batch Operations** - Register multiple MCP servers at once
4. **Plugin System** - Allow custom client implementations
5. **Configuration Validation** - Deeper validation of MCP server configs
6. **Interactive Mode** - Wizard-style installation
7. **GitHub Copilot Support** - When MCP support is added
8. **Cloud IDE Support** - Gitpod, CodeSandbox, etc.

## Contributing

When adding a new client:

1. Create a new file in `clients/` extending `BaseClient`
2. Add client constant to `constants.js`
3. Add config path logic to `getConfigPaths()` in `constants.js`
4. Add client name to `CLIENT_NAMES` in `constants.js`
5. Update `getClientInstance()` switch in `index.js`
6. Import the new client class in `index.js`
7. Test on all supported platforms

## License

MIT

## Credits

Created for the YouTube Transcript MCP Server by [Cengiz Han](https://cengizhan.com)

Designed to be extracted as a universal MCP installer library.
