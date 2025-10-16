# MCP Fetch Server Setup

The Fetch MCP server provides an HTTP/Web scraper tool that converts pages to markdown, making it ideal for pulling Wikipedia, Semantic Scholar, PubMed, or other REST responses into the Symptiq research agents.

## Recommended Invocation

Instead of installing the package globally (which can downgrade shared dependencies such as `httpx`), run the server ad‑hoc with `uvx`:

```bash
uvx mcp-server-fetch
```

This spins up the server in an isolated virtual environment so that the rest of the workspace keeps the newer `httpx` release required by Firebase and Gemini SDKs.

## Alternative Runners

- **Docker**: `docker run -i --rm mcp/fetch`
- **Python module**: `python -m mcp_server_fetch` (only if you accept the `httpx<0.28` constraint)

## Configuration Examples

Add the server to your MCP client (e.g., Claude desktop, VS Code MCP extension) with one of the configs below.

### Claude Desktop / claude.json

```json
{
  "mcpServers": {
    "fetch": {
      "command": "uvx",
      "args": ["mcp-server-fetch"]
    }
  }
}
```

### VS Code `.vscode/mcp.json`

```json
{
  "mcp": {
    "servers": {
      "fetch": {
        "command": "uvx",
        "args": ["mcp-server-fetch"]
      }
    }
  }
}
```

## Optional Flags

- `--ignore-robots-txt`: disable robots.txt checks for agent-initiated fetches.
- `--user-agent=SymptiqResearchBot/1.0`: set a custom UA string.
- `--proxy-url=http://user:pass@proxy:8080`: route through an HTTP proxy.
- `--max-length=<chars>` / `--start-index=<offset>`: control chunking when the agent reads large pages.

If needed, chain additional command-line options via the `args` array in the client configuration.

## Security & Rate Limits

- The fetch server can reach internal IPs; run it only with networks you trust.
- Respect upstream rate limits and terms of service—configure backoff in the calling agent if you automate frequent fetches.

