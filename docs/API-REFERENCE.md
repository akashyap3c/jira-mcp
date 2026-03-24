# Jira MCP — API reference

## Official Jira HTTP APIs (authoritative specs)

Use these OpenAPI documents to see **every** path, parameter, and response shape:

- **Jira Cloud Platform REST API v3** (issues, search, fields, filters, worklogs, dashboards, etc.):  
  [Swagger JSON](https://developer.atlassian.com/cloud/jira/platform/swagger-v3.v3.json) — [Docs home](https://developer.atlassian.com/cloud/jira/platform/rest/v3/intro/)

- **Jira Software Cloud REST API** (boards, sprints, backlog, epics, reports):  
  [Swagger JSON](https://dac-static.atlassian.com/cloud/jira/software/swagger.v3.json) — [Board API group](https://developer.atlassian.com/cloud/jira/software/rest/api-group-board/)

This MCP server calls the same bases as the official clients:

- `https://<site>.atlassian.net/rest/api/3`
- `https://<site>.atlassian.net/rest/agile/1.0`

## Optional environment variables

| Variable | Purpose |
|----------|---------|
| `JIRA_MCP_HTTP_READ_ONLY` | If `true`, `jira_platform_request` and `jira_agile_request` only allow `GET` and `HEAD` (safer for read-only dashboards). |
| `JIRA_MCP_MAX_RESPONSE_CHARS` | Max length of JSON text returned by the generic request tools (default `500000`). Larger responses are truncated with a notice. |

## MCP tools vs HTTP APIs

**Curated tools** wrap common operations with fixed parameters and readable markdown output.

**Generic tools** expose the REST surface without adding one MCP tool per endpoint:

- `jira_platform_request` — path under `/rest/api/3` (e.g. `/field`, `/issue/PROJ-1`).
- `jira_agile_request` — path under `/rest/agile/1.0` (e.g. `/board/23/reports`).

Paths must start with `/`, must not contain `..`, and must not be absolute URLs (SSRF protection).

## PM-oriented tool map

| PM need | Suggested tools |
|---------|------------------|
| Sprint list / IDs | `list_sprints`, `get_all_sprints`, `get_sprint` |
| Sprint scope | `get_sprint_issues`, `sprint_metrics` |
| Board context | `list_boards`, `get_board_backlog`, `get_board_issues`, `list_board_reports` |
| Epics | `list_board_epics`, `get_epic_issues`, `get_issues_without_epic` |
| Time logged (aggregated) | `aggregate_worklogs` (optionally narrow with `worklogDate` via JQL or `dateFrom`/`dateTo`) |
| Time per issue | `get_worklogs`, `log_work` |
| Custom columns / story points | `list_fields` then pass field ids in `search_issues` `fields` |
| Saved JQL views | `list_filters`, `get_filter` |
| Anything else in Swagger | `jira_platform_request` or `jira_agile_request` |

## Limits to know

- Jira does not return full **burndown time series** as a single standard REST payload; many “charts” are computed from issues and worklogs over time.
- `search_issues` with `worklog` in `fields` only returns a **capped** number of worklogs per issue; use `get_worklogs` for complete history.
- `aggregate_worklogs` can trigger many API calls; use `maxIssues` and narrow JQL.
