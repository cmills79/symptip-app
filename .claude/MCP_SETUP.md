# MCP Servers Setup Guide

This document provides information about the Model Context Protocol (MCP) servers configured for the SymptIQ project.

## Installed MCP Servers

The following MCP servers have been configured in `.mcp.json`:

### 1. Filesystem Server
- **Package**: `@modelcontextprotocol/server-filesystem`
- **Purpose**: Secure file operations with configurable access controls
- **Status**: Configured for project directory
- **Use Cases**: Managing photo uploads, reading/writing files

### 2. Git Server
- **Package**: `mcp-server-git` (Python-based, uses uvx)
- **Purpose**: Read, search, and manipulate Git repositories
- **Status**: Configured for project repository
- **Use Cases**: Version control operations, commit history, branch management

### 3. Playwright Server
- **Package**: `@playwright/mcp`
- **Purpose**: Browser automation and E2E testing
- **Status**: Configured
- **Use Cases**: Enhanced E2E test development, browser debugging

### 4. Memory Server
- **Package**: `@modelcontextprotocol/server-memory`
- **Purpose**: Knowledge graph-based persistent memory
- **Status**: Configured
- **Use Cases**: Maintaining context across development sessions

### 5. Fetch Server
- **Package**: `mcp-server-fetch` (Python-based, uses uvx)
- **Purpose**: Web content fetching and conversion for efficient LLM usage
- **Status**: Configured
- **Use Cases**: Fetching documentation, API data, web scraping

### 6. Sequential Thinking Server
- **Package**: `@modelcontextprotocol/server-sequential-thinking`
- **Purpose**: Dynamic problem-solving through thought sequences
- **Status**: Configured
- **Use Cases**: Complex debugging, architectural decisions

## Prerequisites

All required dependencies have been installed:

- **Node.js packages**: Installed globally via npm
- **Python packages**: Will be auto-installed via uvx when needed
- **uvx**: Already installed (version 0.8.16)

## Configuration File

The `.mcp.json` file in the project root contains all server configurations. This file tells Claude Code which MCP servers are available and how to run them.

## Next Steps (User Action Required)

To activate these MCP servers in Claude Code, you need to:

1. **Restart Claude Code** to load the new `.mcp.json` configuration
2. **Verify servers are loaded**: The MCP servers should now be available in your Claude Code session
3. **Test connectivity**: Try using server features (e.g., ask Claude to read files, check git status, etc.)

## Troubleshooting

### If servers don't load:
- Ensure `.mcp.json` is in the project root
- Check Claude Code logs for any error messages
- Verify npm packages are installed: `npm list -g | grep modelcontextprotocol`
- Verify uvx is working: `uvx --version`

### If specific servers fail:
- **Git/Fetch servers**: Ensure Python is installed and uvx can access Python packages
- **Playwright**: May need additional browser binaries: `npx playwright install`
- **Filesystem**: Check directory permissions

## Additional MCP Servers to Consider

If you need additional functionality, consider these MCP servers:

- **@modelcontextprotocol/server-github**: GitHub API integration (deprecated, see github/github-mcp-server)
- **Supabase MCP**: If using Supabase for database/storage
- **E2B Server**: Secure code execution sandboxes
- **Chrome DevTools MCP**: For advanced browser debugging

## Documentation

- [Official MCP Documentation](https://modelcontextprotocol.io/)
- [Claude Code MCP Guide](https://docs.claude.com/en/docs/claude-code/mcp.md)
- [MCP Servers Repository](https://github.com/modelcontextprotocol/servers)

## Configuration Details

The `.mcp.json` configuration uses:
- **npx** for Node.js-based servers (with `-y` flag for auto-installation)
- **uvx** for Python-based servers (auto-installs packages on first use)
- **Absolute paths** for project directory references

All servers are configured at the **project scope**, meaning they're available specifically for this SymptIQ project.
