# Jira MCP Server

**Author:** Ashish Kumar Kashyap ([@akashyap3c](https://github.com/akashyap3c))

A [Model Context Protocol](https://modelcontextprotocol.io/) (MCP) server for Atlassian Jira Cloud. Manage projects, issues, sprints, boards, worklogs, comments, and workflow transitions from Cursor, Claude Code, or any MCP-compatible client.

---

## Prerequisites

- **Node.js** 18+
- **Jira Cloud** account (e.g. `https://yourorg.atlassian.net`)
- **Atlassian API token** — [Create one](https://id.atlassian.com/manage-profile/security/api-tokens)

---

## Quick Start

### 1. Clone and install

```bash
git clone git@github.com:akashyap3c/jira-mcp.git
cd jira-mcp
npm install
```

### 2. Configure environment

Copy the example env file and set your Jira credentials:

```bash
cp .env.example .env
```

Edit `.env`:

```
JIRA_BASE_URL=https://your-domain.atlassian.net
JIRA_EMAIL=your-email@example.com
JIRA_API_TOKEN=your-api-token-here
```

### 3. Run the server

```bash
npm start
```

You should see: `JIRA MCP server running on stdio`

---

## Cursor setup

Add the Jira MCP server in Cursor:

1. Open **Cursor Settings** → **MCP** (or edit `~/.cursor/mcp.json`).
2. Add a server entry (replace the path with your actual path):

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

Restart Cursor (or reload MCP) so it picks up the server.

Optional: add `JIRA_MCP_HTTP_READ_ONLY=true` or `JIRA_MCP_MAX_RESPONSE_CHARS` to the same `env` block if you use the generic REST tools (see [docs/API-REFERENCE.md](docs/API-REFERENCE.md)).

---

## Remote / Hosted Setup (use from any machine)

Instead of running the server locally, you can deploy it once and connect from any laptop or desktop.

### 1. Deploy to Railway (recommended)

1. Push your repo to GitHub
2. Go to [railway.app](https://railway.app), create a new project → **Deploy from GitHub repo**
3. Add these environment variables in the Railway dashboard:
   ```
   JIRA_BASE_URL=https://your-domain.atlassian.net
   JIRA_EMAIL=your-email@example.com
   JIRA_API_TOKEN=your-api-token-here
   PORT=3000
   ```
4. Railway will auto-detect the `Dockerfile` and deploy. You'll get a URL like `https://jira-mcp-production-xxxx.up.railway.app`

### 2. Connect from Claude Code

Add to `~/.claude/settings.json` (works on any machine):

```json
{
  "mcpServers": {
    "jira": {
      "type": "streamable-http",
      "url": "https://your-app.up.railway.app/mcp"
    }
  }
}
```

### 3. Connect from Cursor

Add to `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "jira": {
      "type": "streamable-http",
      "url": "https://your-app.up.railway.app/mcp"
    }
  }
}
```

### Alternative platforms

The included `Dockerfile` works on any platform:

- **Render**: New Web Service → connect GitHub repo → it auto-detects the Dockerfile
- **Fly.io**: `fly launch` from the repo directory
- **Any VPS**: `docker build -t jira-mcp . && docker run -p 3000:3000 --env-file .env jira-mcp`

### Local HTTP mode (for testing)

```bash
npm run start:http
# Server runs on http://localhost:3000/mcp
```

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
