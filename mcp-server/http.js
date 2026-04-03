import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import express from 'express';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';

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

function createServer() {
  const server = new McpServer({
    name: 'jira',
    version: '1.0.0',
    description: 'JIRA MCP Server — interact with Atlassian JIRA from Claude Code',
  });

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

  return server;
}

const app = express();
app.use(express.json());

// Store active transports by session ID
const transports = {};

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', server: 'jira-mcp' });
});

// MCP POST endpoint
app.post('/mcp', async (req, res) => {
  const sessionId = req.headers['mcp-session-id'];

  try {
    let transport;

    if (sessionId && transports[sessionId]) {
      transport = transports[sessionId];
    } else if (!sessionId && isInitializeRequest(req.body)) {
      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        onsessioninitialized: (id) => {
          transports[id] = transport;
        },
      });

      transport.onclose = () => {
        const sid = transport.sessionId;
        if (sid && transports[sid]) {
          delete transports[sid];
        }
      };

      const server = createServer();
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
      return;
    } else {
      res.status(400).json({
        jsonrpc: '2.0',
        error: { code: -32000, message: 'Bad Request: No valid session ID' },
        id: null,
      });
      return;
    }

    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error('Error handling MCP request:', error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: '2.0',
        error: { code: -32603, message: 'Internal server error' },
        id: null,
      });
    }
  }
});

// MCP GET endpoint (SSE stream)
app.get('/mcp', async (req, res) => {
  const sessionId = req.headers['mcp-session-id'];
  if (!sessionId || !transports[sessionId]) {
    res.status(400).send('Invalid or missing session ID');
    return;
  }
  await transports[sessionId].handleRequest(req, res);
});

// MCP DELETE endpoint (session termination)
app.delete('/mcp', async (req, res) => {
  const sessionId = req.headers['mcp-session-id'];
  if (!sessionId || !transports[sessionId]) {
    res.status(400).send('Invalid or missing session ID');
    return;
  }
  await transports[sessionId].handleRequest(req, res);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`JIRA MCP server (HTTP) listening on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down...');
  for (const sessionId in transports) {
    try {
      await transports[sessionId].close();
    } catch (_) {}
  }
  process.exit(0);
});
