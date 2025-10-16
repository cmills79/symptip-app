# MCP Server Cheat Sheet

## One-Line Summaries

| MCP Server | Use When | Example |
|------------|----------|---------|
| **filesystem** | Reading/writing project files | "Edit PhotoCapture.tsx" |
| **git** | Version control operations | "Commit these changes" |
| **playwright** | Testing user workflows | "Test photo upload flow" |
| **memory** | Storing project knowledge | "Remember this architecture decision" |
| **fetch** | Getting external docs/info | "Look up Next.js 14 docs" |
| **sequential-thinking** | Complex problem solving | "Debug video processing issue" |

## The 3 Most Important Rules

### 1. User-Facing Feature? → PLAYWRIGHT
Every UI change, feature, or user workflow MUST be tested with Playwright.

### 2. Saving Work? → GIT
Before switching tasks or completing features, always commit with Git.

### 3. Complex Issue? → SEQUENTIAL-THINKING
Multi-step problems, architecture decisions, or deep debugging require sequential-thinking.

## Quick Decision Table

| I need to... | Use This MCP |
|--------------|--------------|
| Read a file | filesystem |
| Write a file | filesystem |
| Test a feature | playwright |
| Commit code | git |
| Create PR | git |
| Check history | git |
| Look up docs | fetch |
| Research library | fetch |
| Debug complex bug | sequential-thinking |
| Plan architecture | sequential-thinking |
| Store decision | memory |
| Recall pattern | memory |

## Test Requirement Triggers

Use **Playwright** immediately when touching:
- ✅ Photo capture components
- ✅ Camera/video features
- ✅ Authentication flows
- ✅ Photo gallery
- ✅ Timelapse generation
- ✅ File uploads
- ✅ Any user-facing UI

## Commit Triggers

Use **Git** immediately when:
- ✅ Feature is complete
- ✅ Bug is fixed
- ✅ Before switching tasks
- ✅ Refactoring is done
- ✅ Tests are passing

## Research Triggers

Use **Fetch** when you need:
- ✅ Latest documentation
- ✅ API reference
- ✅ Library information
- ✅ Best practices
- ✅ Breaking changes info

## Deep Thinking Triggers

Use **Sequential-thinking** for:
- ✅ New feature architecture
- ✅ Performance optimization
- ✅ Security analysis
- ✅ Complex debugging
- ✅ Multi-step planning

## SymptIQ Workflow Templates

### Adding New UI Component
```
filesystem → Edit/create component
playwright → Test component
git → Commit
```

### Fixing Bug
```
git → Check when introduced
sequential-thinking → Analyze (if complex)
filesystem → Fix code
playwright → Verify fix
git → Commit
```

### New Feature
```
sequential-thinking → Plan
fetch → Research (if needed)
filesystem → Implement
playwright → Test
memory → Store decisions
git → Commit + PR
```

### Security Update
```
sequential-thinking → Analyze
fetch → Check best practices
filesystem → Update rules/code
playwright → Test security
git → Commit
```

## Never Forget

🎯 **Every feature needs Playwright tests**
🎯 **Every change needs Git commits**
🎯 **Complex problems need Sequential-thinking**
