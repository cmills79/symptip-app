# MCP Server Usage Guide for SymptIQ Development

This guide provides instructions on when to use each configured MCP (Model Context Protocol) server and the benefits they provide for SymptIQ development.

## Overview

SymptIQ has 6 MCP servers configured to enhance development capabilities:
1. **filesystem** - File system operations
2. **git** - Git repository operations
3. **playwright** - Browser automation and E2E testing
4. **memory** - Persistent knowledge management
5. **fetch** - Web content fetching
6. **sequential-thinking** - Complex reasoning and planning

---

## 1. Filesystem MCP Server

**Configuration:**
```json
"filesystem": {
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-filesystem", "C:\\Users\\Clay\\source\\repos\\symptiq"]
}
```

### When to Use
- Reading, writing, or editing files in the project directory
- Searching for files by pattern or content
- Managing project structure and file organization
- Batch file operations
- Monitoring file changes

### Benefits for SymptIQ
- **Safe file operations**: Controlled access to the project directory
- **Efficient file management**: Manage photo storage, component files, and configuration
- **Code organization**: Maintain clean structure for components, services, and utilities
- **Asset handling**: Manage test fixtures, images, and video files

### Example Use Cases
- Organizing photo capture component files
- Managing test fixture images
- Batch renaming or restructuring components
- Searching for specific code patterns across the codebase
- Managing documentation files

---

## 2. Git MCP Server

**Configuration:**
```json
"git": {
  "command": "uvx",
  "args": ["mcp-server-git", "--repository", "C:\\Users\\Clay\\source\\repos\\symptiq"]
}
```

### When to Use
- Checking repository status and history
- Creating commits with meaningful messages
- Managing branches for feature development
- Reviewing changes before committing
- Analyzing commit history and blame
- Creating and managing pull requests

### Benefits for SymptIQ
- **Version control automation**: Streamlined commit workflows
- **Change tracking**: Monitor modifications to critical components
- **Feature branch management**: Organize work on photo capture, timelapse, and gallery features
- **Code review preparation**: Generate comprehensive PR descriptions
- **History analysis**: Understand evolution of components

### Example Use Cases
- Committing new photo capture features
- Creating PR for timelapse video generation improvements
- Reviewing changes to authentication flows
- Tracking changes to Firestore rules
- Analyzing when specific bugs were introduced

---

## 3. Playwright MCP Server

**Configuration:**
```json
"playwright": {
  "command": "npx",
  "args": ["-y", "@playwright/mcp"]
}
```

### When to Use
- Running E2E tests for user workflows
- Debugging test failures
- Creating new test scenarios
- Testing browser-specific features (camera access, file upload)
- Accessibility testing
- Performance testing

### Benefits for SymptIQ
- **User flow validation**: Test complete photo capture → gallery → timelapse workflows
- **Camera integration testing**: Verify camera permissions and capture functionality
- **Authentication testing**: Ensure proper route protection
- **Accessibility compliance**: Validate WCAG standards
- **Cross-browser testing**: Ensure compatibility

### Example Use Cases
- Testing photo capture workflow with camera access
- Validating file upload functionality
- Testing timelapse video generation
- Verifying photo gallery filtering and search
- Running accessibility tests on all pages
- Testing authentication and protected routes

---

## 4. Memory MCP Server

**Configuration:**
```json
"memory": {
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-memory"]
}
```

### When to Use
- Storing important project context across sessions
- Remembering user preferences and project decisions
- Maintaining knowledge about architecture decisions
- Tracking known issues and their solutions
- Storing frequently used code patterns

### Benefits for SymptIQ
- **Context persistence**: Remember architectural decisions about photo storage, state management
- **Pattern reuse**: Store and recall common component patterns
- **Issue tracking**: Remember known bugs and their workarounds
- **Development velocity**: Avoid re-explaining project context
- **Decision log**: Track why certain implementations were chosen

### Example Use Cases
- Storing the decision to use Firebase/Firestore for backend
- Remembering the photo annotation schema
- Tracking the timelapse video generation algorithm
- Storing accessibility requirements and standards
- Remembering test data patterns and fixtures

---

## 5. Fetch MCP Server

**Configuration:**
```json
"fetch": {
  "command": "uvx",
  "args": ["mcp-server-fetch"]
}
```

### When to Use
- Fetching documentation from external sources
- Retrieving library/package information
- Checking API documentation
- Getting latest framework updates
- Researching best practices and solutions

### Benefits for SymptIQ
- **Up-to-date documentation**: Access latest Next.js, React, Firebase docs
- **Library research**: Investigate new packages for features
- **Best practices**: Research modern React patterns
- **Problem solving**: Look up solutions to specific issues
- **Dependency updates**: Check changelog and breaking changes

### Example Use Cases
- Fetching Next.js 14 app router documentation
- Researching video processing libraries for timelapse
- Looking up Firebase Storage best practices
- Checking Playwright latest API changes
- Researching camera API browser compatibility
- Finding accessibility testing guidelines

---

## 6. Sequential-Thinking MCP Server

**Configuration:**
```json
"sequential-thinking": {
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"]
}
```

### When to Use
- Planning complex feature implementations
- Debugging intricate issues
- Architecting new systems or refactors
- Analyzing multi-step workflows
- Making critical design decisions
- Solving performance problems

### Benefits for SymptIQ
- **Deep analysis**: Thoroughly reason through complex problems
- **Architecture planning**: Design robust solutions for features
- **Bug investigation**: Systematically debug complex issues
- **Performance optimization**: Analyze and improve slow operations
- **Decision making**: Evaluate trade-offs for implementation approaches

### Example Use Cases
- Planning the video capture and timelapse generation architecture
- Debugging camera permission issues across browsers
- Designing the photo annotation and body area selection system
- Optimizing photo storage and retrieval performance
- Architecting the research agent integration
- Planning state management for complex photo capture workflow
- Analyzing security implications of Firestore rules

---

## Priority Usage Matrix

### High Priority MCP Servers for SymptIQ

| Server | Priority | Frequency | Primary Use |
|--------|----------|-----------|-------------|
| Playwright | High | Daily | E2E testing for photo/video features |
| Git | High | Daily | Version control and PRs |
| Filesystem | Medium | Daily | File operations and project organization |
| Fetch | Medium | As-needed | Documentation and research |
| Sequential-thinking | Medium | Complex tasks | Architecture and debugging |
| Memory | Low | Ongoing | Context persistence across sessions |

### Task-Based MCP Selection

| Task Type | Primary MCP | Secondary MCP |
|-----------|-------------|---------------|
| Feature Development | Filesystem | Git |
| Testing | Playwright | Filesystem |
| Debugging | Sequential-thinking | Filesystem |
| Code Review | Git | Filesystem |
| Documentation | Filesystem | Fetch |
| Architecture Planning | Sequential-thinking | Memory |
| Research | Fetch | Sequential-thinking |
| Refactoring | Filesystem | Git |

---

## Best Practices

### 1. Use Playwright for All User-Facing Features
Before marking any photo capture, gallery, or timelapse feature as complete:
- Write E2E test scenarios
- Test accessibility
- Verify cross-browser compatibility
- Test error states

### 2. Use Sequential-Thinking for Complex Problems
When encountering issues like:
- Camera API not working
- Video processing performance
- State management complexity
- Security rule design
Use sequential-thinking to thoroughly analyze before implementing.

### 3. Use Memory for Project Knowledge
Store important context:
- Why certain Firebase rules exist
- How the photo annotation system works
- Known browser compatibility issues
- Performance optimization decisions

### 4. Use Fetch for Up-to-Date Information
Don't assume - verify with fetch:
- Latest API compatibility
- Breaking changes in dependencies
- Best practices for new features
- Security recommendations

### 5. Use Git Systematically
For every feature:
- Create feature branch
- Commit incrementally with clear messages
- Create PR with comprehensive description
- Review changes before pushing

### 6. Use Filesystem Efficiently
Organize code:
- Keep components modular
- Maintain clean service layer
- Organize tests properly
- Keep documentation updated

---

## Integration Patterns

### Pattern 1: New Feature Development
1. **Sequential-thinking**: Plan architecture
2. **Memory**: Store design decisions
3. **Filesystem**: Create/modify files
4. **Playwright**: Write tests
5. **Git**: Commit and create PR

### Pattern 2: Bug Investigation
1. **Sequential-thinking**: Analyze problem
2. **Filesystem**: Read relevant code
3. **Fetch**: Research solutions
4. **Playwright**: Create reproduction test
5. **Filesystem**: Implement fix
6. **Git**: Commit with detailed message

### Pattern 3: Refactoring
1. **Git**: Check current state
2. **Sequential-thinking**: Plan refactor approach
3. **Filesystem**: Execute changes
4. **Playwright**: Ensure tests still pass
5. **Git**: Commit refactor

### Pattern 4: Documentation
1. **Filesystem**: Read code to document
2. **Fetch**: Get latest best practices
3. **Filesystem**: Write documentation
4. **Git**: Commit docs

---

## Troubleshooting MCP Servers

### If Filesystem Server Fails
- Check that path is correct: `C:\Users\Clay\source\repos\symptiq`
- Verify npm is installed and working
- Check file permissions

### If Git Server Fails
- Verify uvx is installed: `pip install uv`
- Check repository is valid git repo
- Ensure git is in PATH

### If Playwright Server Fails
- Install Playwright browsers: `npx playwright install`
- Check that test files exist
- Verify Playwright configuration

### If Memory Server Fails
- Memory is stored locally - check available disk space
- Clear memory if needed: delete local storage

### If Fetch Server Fails
- Check internet connectivity
- Verify uvx installation
- Check if target URL is accessible

### If Sequential-Thinking Server Fails
- Verify npm is working
- Check that package can be installed
- Clear npm cache if needed

---

## Summary

These MCP servers are powerful tools that enhance development workflow for SymptIQ. Use them strategically:

- **Playwright**: Essential for testing photo capture, camera integration, and user workflows
- **Git**: Critical for version control and collaboration
- **Filesystem**: Daily use for file operations and project management
- **Sequential-thinking**: Use for complex architectural decisions and debugging
- **Fetch**: On-demand research and documentation lookup
- **Memory**: Ongoing context persistence across development sessions

By leveraging these tools effectively, you can develop SymptIQ more efficiently, maintain higher code quality, and ship features with confidence.
