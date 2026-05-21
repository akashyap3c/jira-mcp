# Jira MCP Server

**Author:** Ashish Kumar Kashyap ([@akashyap3c](https://github.com/akashyap3c))

A [Model Context Protocol](https://modelcontextprotocol.io/) (MCP) server for Atlassian Jira Cloud. Manage projects, issues, sprints, boards, worklogs, comments, and workflow transitions from Cursor, Claude Code, or any MCP-compatible client.

---

## Two ways to use this server

1. **Use the hosted instance** (recommended) — point your MCP client at `https://mcp-jira-server.onrender.com/mcp` with your own Jira credentials passed as headers. No install required. See below.
2. **Self-host** — clone the repo and run locally (stdio for one user) or deploy your own HTTP instance (Render, Fly, Docker, …). See [Self-host](#self-host-run-your-own).

## Prerequisites

- **Jira Cloud** account (e.g. `https://yourorg.atlassian.net`)
- **Atlassian API token** — [create one](https://id.atlassian.com/manage-profile/security/api-tokens)
- For self-host only: **Node.js** 18+

---

## Use the hosted server (recommended)

A hosted instance is live at **`https://mcp-jira-server.onrender.com/mcp`**. You don't need to clone, install, or deploy anything — just point your MCP client at it with your own Jira credentials passed as request headers. Each user authenticates as themselves; no credentials are stored server-side.

### Claude Code

**Option A — CLI** (writes the config for you):

```bash
claude mcp add --transport http --scope user jira-remote https://mcp-jira-server.onrender.com/mcp \
  --header "X-Jira-Base-Url: https://YOUR-DOMAIN.atlassian.net" \
  --header "X-Jira-Email: you@example.com" \
  --header "X-Jira-Token: YOUR_JIRA_API_TOKEN"
```

**Option B — JSON** (drop into `~/.claude.json` under `mcpServers`, or a project-local `.mcp.json`):

```json
{
  "mcpServers": {
    "jira-remote": {
      "type": "http",
      "url": "https://mcp-jira-server.onrender.com/mcp",
      "headers": {
        "X-Jira-Base-Url": "https://YOUR-DOMAIN.atlassian.net",
        "X-Jira-Email": "you@example.com",
        "X-Jira-Token": "YOUR_JIRA_API_TOKEN"
      }
    }
  }
}
```

Verify with `claude mcp list` — you should see `jira-remote: ... (HTTP) - ✓ Connected`.

### Claude Desktop

Same JSON shape in `claude_desktop_config.json` (under `mcpServers`).

### Cursor

Add to `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "jira-remote": {
      "type": "streamable-http",
      "url": "https://mcp-jira-server.onrender.com/mcp",
      "headers": {
        "X-Jira-Base-Url": "https://YOUR-DOMAIN.atlassian.net",
        "X-Jira-Email": "you@example.com",
        "X-Jira-Token": "YOUR_JIRA_API_TOKEN"
      }
    }
  }
}
```

### Supported headers

| Header | Required | Purpose |
|---|---|---|
| `X-Jira-Base-Url` | yes | Your Jira Cloud base URL, e.g. `https://yourorg.atlassian.net` |
| `X-Jira-Email` | yes | The Atlassian account email |
| `X-Jira-Token` | yes | An Atlassian API token — [create one](https://id.atlassian.com/manage-profile/security/api-tokens) |
| `X-Jira-Read-Only` | no | `true` to refuse non-GET/HEAD calls in `jira_platform_request` / `jira_agile_request` |

### Health check

```bash
curl https://mcp-jira-server.onrender.com/health
# {"status":"ok","server":"jira-mcp"}
```

> The hosted server runs on Render's free plan, which sleeps after inactivity. The first request after sleep takes ~10–30 seconds to wake; subsequent calls are fast. For a production setup, self-host using the section below.

---

## Self-host (run your own)

If you'd rather not depend on the hosted instance — for production, compliance, or a private network — run the server yourself.

### Clone and install

```bash
git clone git@github.com:akashyap3c/jira-mcp.git
cd jira-mcp
npm install
```

### Local stdio (single user, no network)

Best for solo use from one machine. The MCP client spawns the server as a subprocess and passes creds via `env`. No HTTP server runs.

Add to your MCP client config (replace the path with your absolute path):

```json
{
  "mcpServers": {
    "jira": {
      "command": "node",
      "args": ["/absolute/path/to/jira-mcp/mcp-server/index.js"],
      "env": {
        "JIRA_BASE_URL": "https://your-domain.atlassian.net",
        "JIRA_EMAIL": "your-email@example.com",
        "JIRA_API_TOKEN": "your-api-token"
      }
    }
  }
}
```

For stdio you can also test it standalone:

```bash
npm run mcp           # alias for: node mcp-server/index.js
# JIRA MCP server running on stdio
```

### Local HTTP (multi-user, on your own host)

Run the HTTP server and have clients connect with per-user headers (same shape as the hosted instructions, just swap the URL).

```bash
npm start             # alias for: node mcp-server/http.js
# JIRA MCP server (HTTP) listening on port 3000
```

Clients then point at `http://localhost:3000/mcp` (or your own hostname/port) and pass `X-Jira-Base-Url` / `X-Jira-Email` / `X-Jira-Token` headers per request.

(Optional) For a stdio or shared-identity setup, copy `.env.example` to `.env` and set `JIRA_BASE_URL`, `JIRA_EMAIL`, `JIRA_API_TOKEN`. These are used only as a fallback when no `X-Jira-*` headers are present on a request.

### Deploy to Render (or any platform)

This repo's `render.yaml` provisions a Web Service that runs `npm start` (HTTP transport) with a `/health` probe. To deploy your own copy:

1. Fork or push this repo to GitHub.
2. Render dashboard → **New Web Service** → connect your GitHub repo → Render reads `render.yaml`.
3. **No env vars required** if you want users to authenticate per-request via headers. The hosted instance runs this way.
4. (Optional) Set `JIRA_BASE_URL`, `JIRA_EMAIL`, `JIRA_API_TOKEN` env vars only if you want a fallback shared identity when headers are missing.

The included `Dockerfile` also works on:

- **Fly.io**: `fly launch` from the repo directory
- **Railway**: connect the GitHub repo → it auto-detects the Dockerfile
- **Any VPS**: `docker build -t jira-mcp . && docker run -p 3000:3000 jira-mcp`

---

## API reference (PM / full REST surface)

- **[docs/API-REFERENCE.md](docs/API-REFERENCE.md)** — links to official Swagger, optional env vars, and how curated tools map to PM workflows.
- **`jira_platform_request`** / **`jira_agile_request`** — call any documented Platform or Agile endpoint (with path safety and optional read-only mode).

---

## Available tools

| Tool | Description |
|------|-------------|
| `list_projects` | List accessible Jira projects |
| `get_issue` | Get issue details by key |
| `search_issues` | Search issues using JQL |
| `create_issue` | Create a new issue (summary, description, priority, labels, original estimate, etc.) |
| `update_issue` | Update issue fields (summary, description, priority, labels, original estimate) |
| `delete_issue` | Permanently delete an issue (optional: delete subtasks) |
| `assign_issue` | Assign or unassign an issue (by accountId) |
| `get_transitions` | List available workflow transitions for an issue |
| `transition_issue` | Move an issue through a workflow (by transition ID) |
| `add_comment` | Add a comment to an issue |
| `get_comments` | List comments on an issue |
| `log_work` | Log time spent on an issue (worklog) |
| `get_worklogs` | List worklogs on an issue |
| `get_link_types` | List available issue link types (Blocks, Relates to, etc.) |
| `link_issues` | Link two issues with a relationship type |
| `search_users` | Search users by name/email (returns accountId for assign_issue) |
| `list_boards` | List Jira boards (ID, name, type) |
| `list_sprints` | List sprints for a board (paginated) |
| `get_all_sprints` | Get all sprints for a board with ID and name (auto-paginated) |
| `get_sprint_issues` | Get issues in a sprint |
| `move_to_sprint` | Move issues into a sprint (by sprintId or sprintName + boardId) |
| `move_to_backlog` | Move issues from a sprint back to the backlog |
| `get_sprint` | Sprint metadata by ID (dates, state, goal) |
| `get_board_backlog` | Board backlog issues (optional JQL) |
| `get_board_issues` | Board-scoped issues (optional JQL) |
| `list_board_reports` | Report types available for a board |
| `aggregate_worklogs` | Sum time logged by user across issues from JQL (capped) |
| `list_board_epics` | Epics on a board |
| `get_epic_issues` | Issues for an epic on a board |
| `get_issues_without_epic` | Board issues not under any epic |
| `list_fields` | All fields (find story points custom field ids) |
| `list_filters` | Search saved filters |
| `get_filter` | Get filter details and JQL by ID |
| `sprint_metrics` | Derived counts / story points by status category for a sprint |
| `jira_platform_request` | Low-level `GET/POST/...` under `/rest/api/3` |
| `jira_agile_request` | Low-level `GET/POST/...` under `/rest/agile/1.0` |

---

## Project structure

```
jira-mcp/
├── Dockerfile
├── mcp-server/
│   ├── index.js           # Entry point (stdio transport, local)
│   ├── http.js            # Entry point (HTTP transport, remote)
│   ├── jira-client.js     # Jira REST API (v3 + Agile 1.0)
│   ├── formatters.js      # ADF/plain text, markdown tables
│   └── tools/             # MCP tool handlers
│       ├── list-projects.js
│       ├── get-issue.js
│       ├── search-issues.js
│       ├── create-issue.js
│       ├── update-issue.js
│       ├── delete-issue.js
│       ├── assign-issue.js
│       ├── get-transitions.js
│       ├── transition-issue.js
│       ├── add-comment.js
│       ├── get-comments.js
│       ├── log-work.js
│       ├── get-worklogs.js
│       ├── get-link-types.js
│       ├── link-issues.js
│       ├── search-users.js
│       ├── list-boards.js
│       ├── list-sprints.js
│       ├── get-all-sprints.js
│       ├── get-sprint-issues.js
│       ├── move-to-sprint.js
│       ├── move-to-backlog.js
│       ├── get-sprint.js
│       ├── get-board-backlog.js
│       ├── get-board-issues.js
│       ├── list-board-reports.js
│       ├── aggregate-worklogs.js
│       ├── list-board-epics.js
│       ├── get-epic-issues.js
│       ├── get-issues-without-epic.js
│       ├── list-fields.js
│       ├── list-filters.js
│       ├── get-filter.js
│       ├── sprint-metrics.js
│       ├── jira-platform-request.js
│       └── jira-agile-request.js
├── docs/
│   └── API-REFERENCE.md
├── .env.example
├── package.json
└── README.md
```

---

## License

MIT
