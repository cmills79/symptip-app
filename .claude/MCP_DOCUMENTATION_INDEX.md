# MCP Documentation Index

Complete documentation for Model Context Protocol (MCP) servers configured in SymptIQ.

## Documentation Files

### 📘 [MCP Usage Guide](../docs/MCP_USAGE_GUIDE.md)
**Comprehensive guide with detailed explanations**
- When to use each MCP server
- Benefits for SymptIQ development
- Integration patterns
- Troubleshooting
- Best practices

**Use this when:** You need detailed understanding of MCP capabilities and use cases.

---

### ⚡ [MCP Selection Rules](./mcp-selection-rules.md)
**Decision tree and rules for choosing the right MCP server**
- Quick decision flowchart
- Task-based selection matrix
- SymptIQ-specific patterns
- Quality gates and checklists

**Use this when:** You need to decide which MCP server to use for a specific task.

---

### 🎯 [MCP Cheat Sheet](./mcp-cheatsheet.md)
**Ultra-quick reference for immediate decisions**
- One-line summaries
- Quick decision table
- Essential rules
- Workflow templates

**Use this when:** You need instant guidance on which MCP to use RIGHT NOW.

---

### 🔧 [MCP Configuration Reference](./mcp-configuration-reference.md)
**Technical setup, configuration, and troubleshooting**
- Server configurations
- Prerequisites and setup
- Troubleshooting commands
- Security considerations
- Maintenance schedule

**Use this when:** You need to troubleshoot MCP issues or understand technical setup.

---

## Quick Start

### I'm new to MCP servers
1. Start with: [MCP Cheat Sheet](./mcp-cheatsheet.md)
2. Then read: [MCP Usage Guide](../docs/MCP_USAGE_GUIDE.md)
3. Keep handy: [MCP Selection Rules](./mcp-selection-rules.md)

### I need to make a quick decision
→ [MCP Cheat Sheet](./mcp-cheatsheet.md)

### I have a complex task and need guidance
→ [MCP Selection Rules](./mcp-selection-rules.md)

### Something isn't working
→ [MCP Configuration Reference](./mcp-configuration-reference.md)

### I want to understand the full picture
→ [MCP Usage Guide](../docs/MCP_USAGE_GUIDE.md)

---

## MCP Servers Overview

| Server | Primary Use | Frequency | Learn More |
|--------|-------------|-----------|------------|
| **filesystem** | File operations | Daily | [Usage Guide](../docs/MCP_USAGE_GUIDE.md#1-filesystem-mcp-server) |
| **git** | Version control | Daily | [Usage Guide](../docs/MCP_USAGE_GUIDE.md#2-git-mcp-server) |
| **playwright** | Testing | Daily | [Usage Guide](../docs/MCP_USAGE_GUIDE.md#3-playwright-mcp-server) |
| **memory** | Knowledge storage | Ongoing | [Usage Guide](../docs/MCP_USAGE_GUIDE.md#4-memory-mcp-server) |
| **fetch** | Web research | As-needed | [Usage Guide](../docs/MCP_USAGE_GUIDE.md#5-fetch-mcp-server) |
| **sequential-thinking** | Complex reasoning | As-needed | [Usage Guide](../docs/MCP_USAGE_GUIDE.md#6-sequential-thinking-mcp-server) |

---

## Essential Rules (From Cheat Sheet)

### 1. User-Facing Feature? → PLAYWRIGHT
Every UI change, feature, or user workflow MUST be tested with Playwright.

### 2. Saving Work? → GIT
Before switching tasks or completing features, always commit with Git.

### 3. Complex Issue? → SEQUENTIAL-THINKING
Multi-step problems, architecture decisions, or deep debugging require sequential-thinking.

---

## Common Workflows

### New Feature Development
```
1. sequential-thinking → Plan architecture
2. fetch → Research best practices (if needed)
3. filesystem → Implement code
4. playwright → Write and run tests
5. memory → Store important decisions
6. git → Commit and create PR
```
📖 Details: [MCP Usage Guide - Pattern 1](../docs/MCP_USAGE_GUIDE.md#pattern-1-new-feature-development)

### Bug Investigation
```
1. git → Check when bug was introduced
2. sequential-thinking → Analyze root cause
3. fetch → Research solutions (if needed)
4. filesystem → Implement fix
5. playwright → Verify with tests
6. git → Commit fix
```
📖 Details: [MCP Usage Guide - Pattern 2](../docs/MCP_USAGE_GUIDE.md#pattern-2-bug-investigation)

### Code Refactoring
```
1. git → Check current state
2. sequential-thinking → Plan approach
3. filesystem → Execute changes
4. playwright → Ensure tests pass
5. git → Commit refactor
```
📖 Details: [MCP Usage Guide - Pattern 3](../docs/MCP_USAGE_GUIDE.md#pattern-3-refactoring)

---

## SymptIQ-Specific Patterns

### Photo Capture Features
```
sequential-thinking → Plan camera API integration
filesystem → Implement components
playwright → Test camera workflows
git → Commit changes
memory → Store camera compatibility notes
```
📖 Details: [Selection Rules - Camera Access](./mcp-selection-rules.md#camera-access-implementation)

### Timelapse Video Generation
```
fetch → Research video processing libraries
sequential-thinking → Design video pipeline
filesystem → Implement video service
playwright → Test video playback
git → Commit implementation
```
📖 Details: [Selection Rules - Timelapse Video](./mcp-selection-rules.md#timelapse-video-generation)

### Security & Firestore Rules
```
sequential-thinking → Analyze security model
fetch → Firebase security documentation
filesystem → Update firestore.rules
playwright → Test auth and permissions
memory → Document security decisions
git → Commit rules changes
```
📖 Details: [Selection Rules - Security](./mcp-selection-rules.md#firestore-rules-updates)

---

## Troubleshooting Quick Links

### Filesystem Issues
→ [Configuration Reference - Filesystem](./mcp-configuration-reference.md#1-filesystem-server)

### Git Issues
→ [Configuration Reference - Git](./mcp-configuration-reference.md#2-git-server)

### Playwright Issues
→ [Configuration Reference - Playwright](./mcp-configuration-reference.md#3-playwright-server)

### Memory Issues
→ [Configuration Reference - Memory](./mcp-configuration-reference.md#4-memory-server)

### Fetch Issues
→ [Configuration Reference - Fetch](./mcp-configuration-reference.md#5-fetch-server)

### Sequential-Thinking Issues
→ [Configuration Reference - Sequential-Thinking](./mcp-configuration-reference.md#6-sequential-thinking-server)

---

## Setup and Installation

### Initial Setup Checklist
→ [Configuration Reference - Complete Setup](./mcp-configuration-reference.md#complete-setup-checklist)

### Prerequisites
- Node.js v18+
- Python 3.8+
- Git
- uv (Python): `pip install uv`
- Playwright browsers: `npx playwright install`

### Quick Setup Commands
```bash
# Install Python uv
pip install uv

# Install Playwright browsers
npx playwright install

# Verify git
git --version

# Verify Node.js
node --version
```

📖 Full setup: [Configuration Reference](./mcp-configuration-reference.md)

---

## Best Practices Summary

### Testing (Playwright)
✅ Test every user-facing feature
✅ Write tests before marking features complete
✅ Test accessibility with WCAG standards
✅ Test camera/video features across browsers

### Version Control (Git)
✅ Commit frequently with clear messages
✅ Create feature branches
✅ Write comprehensive PR descriptions
✅ Review changes before pushing

### File Operations (Filesystem)
✅ Keep project structure organized
✅ Use proper component hierarchy
✅ Maintain clean service layer
✅ Document architectural decisions

### Research (Fetch)
✅ Check latest documentation
✅ Verify breaking changes
✅ Research best practices
✅ Look up browser compatibility

### Complex Problems (Sequential-Thinking)
✅ Use for multi-step problems
✅ Plan architecture thoroughly
✅ Debug systematically
✅ Evaluate trade-offs

### Knowledge Management (Memory)
✅ Store important decisions
✅ Track architectural patterns
✅ Remember browser compatibility notes
✅ Document security considerations

---

## Performance Tips

| MCP Server | Performance Tip |
|------------|-----------------|
| filesystem | Keep file operations scoped |
| git | Batch commits logically |
| playwright | Run tests in headless mode, use parallel workers |
| memory | Store only essential context |
| fetch | Cache documentation lookups mentally |
| sequential-thinking | Use only for genuinely complex problems |

📖 Full details: [Configuration Reference - Performance](./mcp-configuration-reference.md#performance-optimization)

---

## Security Checklist

- [ ] Never commit sensitive files (use .gitignore)
- [ ] Review file operations that touch .env or secrets
- [ ] Use test credentials only in Playwright tests
- [ ] Review commits before pushing to remote
- [ ] Don't store secrets in Memory server
- [ ] Only fetch from trusted sources
- [ ] Test security rules with Playwright after changes

📖 Full security guide: [Configuration Reference - Security](./mcp-configuration-reference.md#security-considerations)

---

## Documentation Hierarchy

```
📁 .claude/
├── 📄 MCP_DOCUMENTATION_INDEX.md (you are here - master index)
├── 📄 mcp-cheatsheet.md (quick reference)
├── 📄 mcp-selection-rules.md (decision rules)
└── 📄 mcp-configuration-reference.md (technical reference)

📁 docs/
└── 📄 MCP_USAGE_GUIDE.md (comprehensive guide)
```

---

## Maintenance

### Daily
- Use filesystem, git, playwright as needed
- Commit work regularly

### Weekly
- Review memory storage
- Clean test reports
- Check for package updates

### Monthly
- Update MCP servers
- Update Playwright browsers
- Review git history
- Update dependencies

📖 Full schedule: [Configuration Reference - Maintenance](./mcp-configuration-reference.md#maintenance-schedule)

---

## Support and Resources

### Internal Documentation
- [MCP Usage Guide](../docs/MCP_USAGE_GUIDE.md) - Comprehensive guide
- [MCP Selection Rules](./mcp-selection-rules.md) - Decision framework
- [MCP Cheat Sheet](./mcp-cheatsheet.md) - Quick reference
- [MCP Configuration](./mcp-configuration-reference.md) - Technical details

### External Resources
- **Playwright:** https://playwright.dev
- **Next.js:** https://nextjs.org/docs
- **Firebase:** https://firebase.google.com/docs
- **Git:** https://git-scm.com/doc

### Configuration File
- **Location:** `C:\Users\Clay\source\repos\symptiq\.mcp.json`

---

## Decision Framework

Not sure which document to use? Follow this decision tree:

```
What do you need?
│
├─ I need to pick an MCP server RIGHT NOW
│  └─ Use: MCP Cheat Sheet
│
├─ I need to understand WHEN to use each MCP
│  └─ Use: MCP Selection Rules
│
├─ I need DETAILED information about capabilities
│  └─ Use: MCP Usage Guide
│
├─ I need to TROUBLESHOOT or CONFIGURE
│  └─ Use: MCP Configuration Reference
│
└─ I need an OVERVIEW of everything
   └─ Use: This index (MCP_DOCUMENTATION_INDEX.md)
```

---

## Summary

You now have complete documentation for all 6 MCP servers configured in SymptIQ:

1. **filesystem** - File operations (daily use)
2. **git** - Version control (daily use)
3. **playwright** - Testing (daily use)
4. **memory** - Knowledge storage (ongoing)
5. **fetch** - Web research (as-needed)
6. **sequential-thinking** - Complex reasoning (as-needed)

Start with the [Cheat Sheet](./mcp-cheatsheet.md) for quick decisions, refer to [Selection Rules](./mcp-selection-rules.md) for guidance, dive into the [Usage Guide](../docs/MCP_USAGE_GUIDE.md) for details, and use the [Configuration Reference](./mcp-configuration-reference.md) for troubleshooting.

**Golden Rule:** When in doubt, check the Cheat Sheet first!

---

*Last Updated: 2025-10-16*
*Project: SymptIQ*
*Location: C:\Users\Clay\source\repos\symptiq*
