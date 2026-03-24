import 'dotenv/config';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

import { registerListProjects } from './tools/list-projects.js';
import { registerGetIssue } from './tools/get-issue.js';
import { registerGetTransitions } from './tools/get-transitions.js';
import { registerSearchIssues } from './tools/search-issues.js';
import { registerGetComments } from './tools/get-comments.js';
import { registerAssignIssue } from './tools/assign-issue.js';
import { registerAddComment } from './tools/add-comment.js';
import { registerTransitionIssue } from './tools/transition-issue.js';
import { registerCreateIssue } from './tools/create-issue.js';
import { registerUpdateIssue } from './tools/update-issue.js';
import { registerListSprints } from './tools/list-sprints.js';
import { registerGetSprintIssues } from './tools/get-sprint-issues.js';
import { registerMoveToSprint } from './tools/move-to-sprint.js';
import { registerGetAllSprints } from './tools/get-all-sprints.js';
import { registerLogWork } from './tools/log-work.js';
import { registerGetWorklogs } from './tools/get-worklogs.js';
import { registerLinkIssues } from './tools/link-issues.js';
import { registerGetLinkTypes } from './tools/get-link-types.js';
import { registerSearchUsers } from './tools/search-users.js';
import { registerDeleteIssue } from './tools/delete-issue.js';
import { registerMoveToBacklog } from './tools/move-to-backlog.js';
import { registerListBoards } from './tools/list-boards.js';
import { registerGetSprint } from './tools/get-sprint.js';
import { registerGetBoardBacklog } from './tools/get-board-backlog.js';
import { registerGetBoardIssues } from './tools/get-board-issues.js';
import { registerListBoardReports } from './tools/list-board-reports.js';
import { registerAggregateWorklogs } from './tools/aggregate-worklogs.js';
import { registerListBoardEpics } from './tools/list-board-epics.js';
import { registerGetEpicIssues } from './tools/get-epic-issues.js';
import { registerGetIssuesWithoutEpic } from './tools/get-issues-without-epic.js';
import { registerListFields } from './tools/list-fields.js';
import { registerListFilters } from './tools/list-filters.js';
import { registerGetFilter } from './tools/get-filter.js';
import { registerSprintMetrics } from './tools/sprint-metrics.js';
import { registerJiraPlatformRequest } from './tools/jira-platform-request.js';
import { registerJiraAgileRequest } from './tools/jira-agile-request.js';

const server = new McpServer({
  name: 'jira',
  version: '1.0.0',
  description: 'JIRA MCP Server — interact with Atlassian JIRA from Claude Code',
});

// Register all tools
registerListProjects(server);
registerGetIssue(server);
registerGetTransitions(server);
registerSearchIssues(server);
registerGetComments(server);
registerAssignIssue(server);
registerAddComment(server);
registerTransitionIssue(server);
registerCreateIssue(server);
registerUpdateIssue(server);
registerListSprints(server);
registerGetSprintIssues(server);
registerMoveToSprint(server);
registerGetAllSprints(server);
registerLogWork(server);
registerGetWorklogs(server);
registerLinkIssues(server);
registerGetLinkTypes(server);
registerSearchUsers(server);
registerDeleteIssue(server);
registerMoveToBacklog(server);
registerListBoards(server);
registerGetSprint(server);
registerGetBoardBacklog(server);
registerGetBoardIssues(server);
registerListBoardReports(server);
registerAggregateWorklogs(server);
registerListBoardEpics(server);
registerGetEpicIssues(server);
registerGetIssuesWithoutEpic(server);
registerListFields(server);
registerListFilters(server);
registerGetFilter(server);
registerSprintMetrics(server);
registerJiraPlatformRequest(server);
registerJiraAgileRequest(server);

// Start server on stdio
const transport = new StdioServerTransport();
await server.connect(transport);
console.error('JIRA MCP server running on stdio');
