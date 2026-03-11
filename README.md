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

---

## Project structure

```
jira-mcp/
├── mcp-server/
│   ├── index.js           # Entry point (stdio transport)
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
│       └── move-to-backlog.js
├── .env.example
├── package.json
└── README.md
```

---

## License

MIT
