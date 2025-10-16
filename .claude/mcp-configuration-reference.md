# MCP Server Configuration Reference

Technical reference for SymptIQ's MCP server setup, configuration, and troubleshooting.

## Configuration File Location

**File:** `C:\Users\Clay\source\repos\symptiq\.mcp.json`

## Server Configurations

### 1. Filesystem Server

```json
{
  "filesystem": {
    "command": "npx",
    "args": [
      "-y",
      "@modelcontextprotocol/server-filesystem",
      "C:\\Users\\Clay\\source\\repos\\symptiq"
    ]
  }
}
```

**Package:** `@modelcontextprotocol/server-filesystem`
**Runtime:** Node.js via npx
**Scope:** Limited to project directory
**Permissions:** Read/write access to symptiq directory

**Prerequisites:**
- Node.js installed
- npm available in PATH

**Test Command:**
```bash
npx -y @modelcontextprotocol/server-filesystem "C:\Users\Clay\source\repos\symptiq"
```

**Common Issues:**
- **Path errors:** Ensure backslashes are properly escaped in JSON
- **Permission denied:** Check Windows file permissions
- **npx not found:** Add Node.js to PATH

---

### 2. Git Server

```json
{
  "git": {
    "command": "uvx",
    "args": [
      "mcp-server-git",
      "--repository",
      "C:\\Users\\Clay\\source\\repos\\symptiq"
    ]
  }
}
```

**Package:** `mcp-server-git`
**Runtime:** Python via uvx
**Scope:** Git repository operations
**Permissions:** Git read/write access

**Prerequisites:**
- Python installed
- uv installed: `pip install uv`
- Git installed and in PATH
- Valid git repository

**Test Commands:**
```bash
# Check uv installation
pip install uv

# Test git server
uvx mcp-server-git --repository "C:\Users\Clay\source\repos\symptiq"
```

**Common Issues:**
- **uvx command not found:** Install uv: `pip install uv`
- **Not a git repository:** Initialize with `git init`
- **Git not found:** Add Git to PATH
- **Repository path invalid:** Verify path exists

---

### 3. Playwright Server

```json
{
  "playwright": {
    "command": "npx",
    "args": [
      "-y",
      "@playwright/mcp"
    ]
  }
}
```

**Package:** `@playwright/mcp`
**Runtime:** Node.js via npx
**Scope:** Browser automation and testing
**Permissions:** Browser control

**Prerequisites:**
- Node.js installed
- Playwright browsers installed
- Playwright configuration in project

**Setup Commands:**
```bash
# Install Playwright browsers
npx playwright install

# Install specific browsers
npx playwright install chromium
npx playwright install firefox
npx playwright install webkit

# Verify installation
npx playwright --version
```

**Test Command:**
```bash
npx playwright test --list
```

**Common Issues:**
- **Browsers not installed:** Run `npx playwright install`
- **Tests not found:** Check `playwright.config.ts` exists
- **Port conflicts:** Ensure dev server port is available
- **Timeout errors:** Increase timeout in playwright config

**SymptIQ Playwright Setup:**
- Config: `playwright.config.ts`
- Tests: `tests/e2e/*.spec.ts`
- Fixtures: `tests/fixtures/*`
- Base URL: `http://localhost:3000`

---

### 4. Memory Server

```json
{
  "memory": {
    "command": "npx",
    "args": [
      "-y",
      "@modelcontextprotocol/server-memory"
    ]
  }
}
```

**Package:** `@modelcontextprotocol/server-memory`
**Runtime:** Node.js via npx
**Scope:** Persistent knowledge storage
**Storage:** Local filesystem

**Prerequisites:**
- Node.js installed
- Write access to local storage directory

**Test Command:**
```bash
npx -y @modelcontextprotocol/server-memory
```

**Common Issues:**
- **Storage errors:** Check disk space
- **Permission denied:** Verify write permissions
- **Memory not persisting:** Check storage location

**Storage Location (typical):**
- Windows: `%APPDATA%\Claude\mcp-memory`
- Location varies by MCP implementation

---

### 5. Fetch Server

```json
{
  "fetch": {
    "command": "uvx",
    "args": [
      "mcp-server-fetch"
    ]
  }
}
```

**Package:** `mcp-server-fetch`
**Runtime:** Python via uvx
**Scope:** Web content retrieval
**Permissions:** Internet access

**Prerequisites:**
- Python installed
- uv installed: `pip install uv`
- Internet connectivity

**Test Commands:**
```bash
# Install uv if needed
pip install uv

# Test fetch server
uvx mcp-server-fetch
```

**Common Issues:**
- **uvx not found:** Install uv: `pip install uv`
- **Network errors:** Check internet connection
- **SSL errors:** Verify certificates are up to date
- **Rate limiting:** Some sites may limit requests

---

### 6. Sequential-Thinking Server

```json
{
  "sequential-thinking": {
    "command": "npx",
    "args": [
      "-y",
      "@modelcontextprotocol/server-sequential-thinking"
    ]
  }
}
```

**Package:** `@modelcontextprotocol/server-sequential-thinking`
**Runtime:** Node.js via npx
**Scope:** Enhanced reasoning capabilities
**Permissions:** None specific

**Prerequisites:**
- Node.js installed
- npm available

**Test Command:**
```bash
npx -y @modelcontextprotocol/server-sequential-thinking
```

**Common Issues:**
- **Package not found:** Verify npm registry access
- **Installation fails:** Clear npm cache: `npm cache clean --force`

---

## Complete Setup Checklist

### Initial Setup

```bash
# 1. Verify Node.js
node --version
npm --version

# 2. Verify Python and install uv
python --version
pip install uv

# 3. Verify Git
git --version

# 4. Install Playwright browsers
npx playwright install

# 5. Test all MCP servers
npx -y @modelcontextprotocol/server-filesystem "C:\Users\Clay\source\repos\symptiq"
uvx mcp-server-git --repository "C:\Users\Clay\source\repos\symptiq"
npx -y @playwright/mcp
npx -y @modelcontextprotocol/server-memory
uvx mcp-server-fetch
npx -y @modelcontextprotocol/server-sequential-thinking
```

### Troubleshooting Commands

```bash
# Clear npm cache
npm cache clean --force

# Reinstall Playwright
npx playwright install --force

# Update uv
pip install --upgrade uv

# Check git status
git status

# Verify project paths
cd C:\Users\Clay\source\repos\symptiq
dir
```

---

## Environment Requirements

### System Requirements
- **OS:** Windows 10/11
- **Node.js:** v18+ recommended
- **Python:** 3.8+ recommended
- **Git:** Latest version
- **Disk Space:** 2GB+ for Playwright browsers

### Network Requirements
- Internet access for fetch server
- Access to npm registry
- Access to PyPI (Python Package Index)

### Project Requirements
- Valid git repository
- Playwright configuration
- Package.json present
- Next.js project structure

---

## Performance Optimization

### Filesystem Server
- Keep project size reasonable
- Use .gitignore to exclude node_modules from operations
- Avoid operations on large binary files

### Git Server
- Keep repository history clean
- Use .gitignore properly
- Avoid committing large files

### Playwright Server
- Run tests in headless mode for speed
- Use test sharding for parallel execution
- Keep test fixtures small
- Use `--workers` flag for parallel tests

```bash
# Parallel test execution
npx playwright test --workers 4
```

### Memory Server
- Periodically clean old memories
- Store only important context
- Avoid duplicate information

### Fetch Server
- Cache documentation mentally
- Batch similar requests
- Respect rate limits

### Sequential-Thinking Server
- Use only for complex problems
- Break down problems clearly
- Provide sufficient context

---

## Security Considerations

### Filesystem Server
- ✅ Scoped to project directory only
- ✅ Cannot access parent directories
- ❌ Can read sensitive files within project (be careful with .env)

**Best Practices:**
- Never commit sensitive files
- Use .gitignore for secrets
- Review file operations carefully

### Git Server
- ✅ Operations limited to repository
- ✅ Requires valid git credentials
- ⚠️ Can push to remote (use carefully)

**Best Practices:**
- Review commits before pushing
- Use feature branches
- Never force push to main

### Playwright Server
- ⚠️ Has browser control capabilities
- ⚠️ Can access authentication state
- ✅ Isolated test environment

**Best Practices:**
- Use test credentials only
- Don't store real user data in tests
- Keep test fixtures in separate directory

### Fetch Server
- ⚠️ Makes external network requests
- ⚠️ Could expose request patterns
- ✅ Read-only operations

**Best Practices:**
- Only fetch from trusted sources
- Be aware of rate limiting
- Don't expose sensitive data in requests

### Memory Server
- ✅ Local storage only
- ✅ No network access
- ⚠️ Stored unencrypted

**Best Practices:**
- Don't store secrets or credentials
- Review stored memories periodically
- Clear sensitive context when done

### Sequential-Thinking Server
- ✅ No special permissions
- ✅ Computation only
- ✅ No persistent storage

---

## Monitoring and Logging

### Check MCP Server Status
Most MCP servers run on-demand and don't have persistent processes to monitor.

### Logs Location
- **npm/npx logs:** Check npm-debug.log in project root
- **Playwright logs:** `playwright-report/` directory
- **Git logs:** `git log` command
- **System logs:** Windows Event Viewer

### Debugging MCP Issues

```bash
# Enable verbose npm logging
npm config set loglevel verbose

# Playwright debug mode
PWDEBUG=1 npx playwright test

# Git verbose output
git --verbose <command>
```

---

## Updating MCP Servers

### Update All Servers

```bash
# Update npm packages (filesystem, playwright, memory, sequential-thinking)
npm update -g

# Update uv and Python packages (git, fetch)
pip install --upgrade uv

# Update Playwright browsers
npx playwright install --force
```

### Check for Updates

```bash
# Check npm package versions
npm outdated -g

# Check pip packages
pip list --outdated
```

---

## Backup and Recovery

### Backup MCP Configuration
```bash
# Backup .mcp.json
copy .mcp.json .mcp.json.backup
```

### Restore MCP Configuration
```bash
# Restore from backup
copy .mcp.json.backup .mcp.json
```

### Reset MCP Servers
```bash
# Clear npm cache
npm cache clean --force

# Reinstall Playwright
npx playwright install --force

# Reinstall uv
pip uninstall uv
pip install uv
```

---

## Quick Reference

| Server | Command | Depends On |
|--------|---------|------------|
| filesystem | `npx` | Node.js, npm |
| git | `uvx` | Python, uv, git |
| playwright | `npx` | Node.js, Playwright |
| memory | `npx` | Node.js |
| fetch | `uvx` | Python, uv |
| sequential-thinking | `npx` | Node.js |

## Support Resources

- **MCP Documentation:** Check Claude Code docs
- **Playwright:** https://playwright.dev
- **Next.js:** https://nextjs.org/docs
- **Firebase:** https://firebase.google.com/docs
- **Git:** https://git-scm.com/doc

---

## Maintenance Schedule

### Daily
- ✅ Use filesystem, git, playwright as needed
- ✅ Check for git commit requirements

### Weekly
- ✅ Review memory storage
- ✅ Clean up test reports
- ✅ Check for package updates

### Monthly
- ✅ Update all MCP servers
- ✅ Update Playwright browsers
- ✅ Review and clean git history
- ✅ Update dependencies

### As Needed
- ✅ Reinstall Playwright browsers when issues occur
- ✅ Clear npm cache if packages fail
- ✅ Update uv if fetch/git servers fail
