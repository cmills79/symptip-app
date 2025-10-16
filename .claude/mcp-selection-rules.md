# MCP Server Selection Rules

Quick reference guide for selecting the appropriate MCP server for development tasks in SymptIQ.

## Decision Tree

```
Task Category → Primary MCP Server → When to Use

TESTING
├─ E2E Tests → playwright → Always for user-facing features
├─ Test Fixtures → filesystem → Managing test data files
└─ Accessibility → playwright → WCAG compliance validation

DEVELOPMENT
├─ New Feature → filesystem + sequential-thinking → Planning + Implementation
├─ File Operations → filesystem → Reading/writing project files
├─ Code Refactor → filesystem → Modifying existing code
└─ Component Creation → filesystem → New React components

VERSION CONTROL
├─ Commits → git → Always when saving work
├─ PRs → git → Feature completion
├─ Branch Management → git → Feature isolation
└─ History Review → git → Understanding changes

RESEARCH
├─ Documentation → fetch → Latest API docs, best practices
├─ Package Info → fetch → npm packages, libraries
├─ Framework Updates → fetch → Next.js, React updates
└─ Solutions → fetch → Stack Overflow, GitHub issues

ARCHITECTURE
├─ Complex Planning → sequential-thinking → Multi-step features
├─ Debugging Hard Issues → sequential-thinking → Systematic analysis
├─ Design Decisions → sequential-thinking + memory → Trade-off evaluation
└─ Performance → sequential-thinking → Optimization strategies

KNOWLEDGE MANAGEMENT
├─ Store Decisions → memory → Why choices were made
├─ Track Issues → memory → Known bugs/workarounds
├─ Patterns → memory → Reusable code patterns
└─ Project Context → memory → Architectural knowledge
```

## ALWAYS Use These MCP Servers

### ALWAYS use Playwright when:
- [ ] Implementing photo capture features
- [ ] Working on camera/video functionality
- [ ] Modifying authentication flows
- [ ] Changing photo gallery features
- [ ] Updating timelapse generation
- [ ] Adding new user-facing features
- [ ] Making accessibility improvements

### ALWAYS use Git when:
- [ ] Completing a feature
- [ ] Making significant changes
- [ ] Before switching tasks
- [ ] After fixing bugs
- [ ] Ready for code review

### ALWAYS use Filesystem when:
- [ ] Reading project files
- [ ] Creating new components
- [ ] Modifying existing code
- [ ] Managing project structure
- [ ] Working with test files

## Context-Specific Rules

### Photo Capture Features
**Required MCP servers:**
1. Sequential-thinking → Plan camera API integration
2. Filesystem → Implement components
3. Playwright → Test camera workflows
4. Git → Commit changes
5. Memory → Store camera compatibility notes

### Timelapse Video Generation
**Required MCP servers:**
1. Fetch → Research video processing libraries
2. Sequential-thinking → Design video generation pipeline
3. Filesystem → Implement video service
4. Playwright → Test video playback
5. Git → Commit implementation

### Authentication & Security
**Required MCP servers:**
1. Sequential-thinking → Analyze security implications
2. Fetch → Check Firebase security best practices
3. Filesystem → Update Firestore rules
4. Playwright → Test protected routes
5. Git → Commit security changes

### Bug Fixes
**Required MCP servers:**
1. Git → Review when bug introduced
2. Sequential-thinking → Analyze root cause
3. Fetch → Research solutions (if needed)
4. Filesystem → Implement fix
5. Playwright → Verify fix with tests
6. Git → Commit fix

### Performance Optimization
**Required MCP servers:**
1. Sequential-thinking → Identify bottlenecks
2. Fetch → Research optimization techniques
3. Filesystem → Apply optimizations
4. Playwright → Measure improvements
5. Memory → Store performance notes

## Priority Matrix

| Task Type | Must Use | Should Use | Optional |
|-----------|----------|------------|----------|
| New Component | Filesystem | Git, Playwright | Sequential-thinking |
| Feature Planning | Sequential-thinking | Memory | Fetch |
| Bug Fix | Filesystem | Git, Sequential-thinking | Fetch |
| Testing | Playwright | Filesystem | - |
| Refactoring | Filesystem | Git, Playwright | Sequential-thinking |
| Documentation | Filesystem | Fetch | Memory |
| Research | Fetch | Sequential-thinking | Memory |
| Security | Sequential-thinking | Fetch, Filesystem | Memory |

## Red Flags: Wrong MCP Selection

❌ **DON'T use Fetch for:**
- Reading local project files → Use Filesystem
- Checking git history → Use Git
- Complex reasoning → Use Sequential-thinking

❌ **DON'T use Filesystem for:**
- Running tests → Use Playwright
- Committing code → Use Git
- Web research → Use Fetch

❌ **DON'T use Git for:**
- Reading file contents → Use Filesystem
- Running tests → Use Playwright

❌ **DON'T use Playwright for:**
- File operations → Use Filesystem
- Version control → Use Git

## Quality Gates

### Before Marking Feature Complete:
- [ ] Playwright tests written and passing
- [ ] Git commit with clear message
- [ ] Memory updated with key decisions
- [ ] Documentation updated (Filesystem)

### Before Implementing Complex Feature:
- [ ] Sequential-thinking used for planning
- [ ] Fetch used to research best practices
- [ ] Memory checked for similar patterns
- [ ] Git branch created

### Before Committing Security Changes:
- [ ] Sequential-thinking analysis completed
- [ ] Fetch used to verify best practices
- [ ] Playwright security tests added
- [ ] Memory updated with security notes

## SymptIQ-Specific Patterns

### Camera Access Implementation
```
1. Fetch → Check browser camera API compatibility
2. Sequential-thinking → Plan permission handling
3. Filesystem → Implement camera component
4. Playwright → Test camera capture workflow
5. Memory → Store browser compatibility notes
6. Git → Commit camera feature
```

### Photo Storage Changes
```
1. Sequential-thinking → Analyze storage implications
2. Fetch → Firebase Storage best practices
3. Filesystem → Update storage service
4. Playwright → Test upload/download
5. Git → Commit storage changes
```

### UI Component Updates
```
1. Filesystem → Modify component files
2. Playwright → Test accessibility
3. Playwright → Test user interactions
4. Git → Commit component changes
```

### Firestore Rules Updates
```
1. Sequential-thinking → Analyze security model
2. Fetch → Firebase security documentation
3. Filesystem → Update firestore.rules
4. Playwright → Test auth and permissions
5. Memory → Document security decisions
6. Git → Commit rules changes
```

## Emergency Debugging Protocol

When stuck on a complex issue:

1. **Sequential-thinking** → Break down the problem systematically
2. **Git** → Check when issue was introduced
3. **Filesystem** → Read relevant code thoroughly
4. **Fetch** → Research similar issues and solutions
5. **Playwright** → Create minimal reproduction test
6. **Memory** → Check if similar issue solved before

## Quick Decision Flowchart

```
Is it a user-facing feature change?
├─ YES → Must use Playwright
└─ NO → Continue

Is it complex/multi-step?
├─ YES → Use Sequential-thinking first
└─ NO → Continue

Does it need external information?
├─ YES → Use Fetch
└─ NO → Continue

Does it modify files?
├─ YES → Use Filesystem
└─ NO → Continue

Is it ready to save?
├─ YES → Use Git
└─ NO → Continue

Should future sessions know this?
├─ YES → Use Memory
└─ NO → Done
```

## Performance Tips

- **Filesystem**: Use for quick file reads/writes
- **Playwright**: Run tests in headless mode for speed
- **Git**: Batch commits logically, don't over-commit
- **Fetch**: Cache documentation lookups mentally
- **Sequential-thinking**: Use for genuinely complex problems only
- **Memory**: Store only important, reusable context

## Summary

**Most Used in SymptIQ Development:**
1. Filesystem (daily - all file operations)
2. Playwright (daily - testing features)
3. Git (daily - version control)
4. Sequential-thinking (as needed - complex tasks)
5. Fetch (as needed - research)
6. Memory (ongoing - context persistence)

**Golden Rule:**
When in doubt about which MCP to use, ask: "What is the primary action?" and choose accordingly.
