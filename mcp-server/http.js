import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import express from 'express';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';
import { runWithCredentials } from './jira-client.js';

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

// Store active transports and their credentials by session ID
const sessions = {};

/**
 * Extract Jira credentials from request headers.
 * Each user passes their own creds — the server stores nothing.
 *
 * Headers (case-insensitive):
 *   JIRA_BASE_URL:  https://yourorg.atlassian.net
 *   JIRA_EMAIL:     user@example.com
 *   JIRA_API_TOKEN: ATATT3x...
 */
function extractCredentials(req) {
  const baseUrl = req.headers['jira_base_url'];
  const email = req.headers['jira_email'];
  const token = req.headers['jira_api_token'];
  if (baseUrl && email && token) {
    return { baseUrl, email, token };
  }
  return null;
}

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', server: 'jira-mcp' });
});

// MCP POST endpoint
app.post('/mcp', async (req, res) => {
  const sessionId = req.headers['mcp-session-id'];

  try {
    let transport;
    let creds;

    if (sessionId && sessions[sessionId]) {
      transport = sessions[sessionId].transport;
      creds = sessions[sessionId].creds;
    } else if (!sessionId && isInitializeRequest(req.body)) {
      // New session — credentials required on first request
      creds = extractCredentials(req);
      if (!creds) {
        res.status(400).json({
          jsonrpc: '2.0',
          error: {
            code: -32000,
            message:
              'Missing Jira credentials. Set headers: JIRA_BASE_URL, JIRA_EMAIL, JIRA_API_TOKEN',
          },
          id: null,
        });
        return;
      }

      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        onsessioninitialized: (id) => {
          sessions[id] = { transport, creds };
        },
      });

      transport.onclose = () => {
        const sid = transport.sessionId;
        if (sid && sessions[sid]) {
          delete sessions[sid];
        }
      };

      const server = createServer();
      await server.connect(transport);

      // Run with the user's credentials so tool handlers can access Jira
      await runWithCredentials(creds, () =>
        transport.handleRequest(req, res, req.body),
      );
      return;
    } else {
      res.status(400).json({
        jsonrpc: '2.0',
        error: { code: -32000, message: 'Bad Request: No valid session ID' },
        id: null,
      });
      return;
    }

    await runWithCredentials(creds, () =>
      transport.handleRequest(req, res, req.body),
    );
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
  if (!sessionId || !sessions[sessionId]) {
    res.status(400).send('Invalid or missing session ID');
    return;
  }
  const { transport, creds } = sessions[sessionId];
  await runWithCredentials(creds, () => transport.handleRequest(req, res));
});

// MCP DELETE endpoint (session termination)
app.delete('/mcp', async (req, res) => {
  const sessionId = req.headers['mcp-session-id'];
  if (!sessionId || !sessions[sessionId]) {
    res.status(400).send('Invalid or missing session ID');
    return;
  }
  await sessions[sessionId].transport.handleRequest(req, res);
});

// Catch-all: return JSON 404 for unknown routes (prevents HTML responses that break MCP clients)
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`JIRA MCP server (HTTP) listening on port ${PORT}`);
  console.log('Each user provides their own Jira credentials via headers.');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down...');
  for (const sessionId in sessions) {
    try {
      await sessions[sessionId].transport.close();
    } catch (_) {}
  }
  process.exit(0);
});
