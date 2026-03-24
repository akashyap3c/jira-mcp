import { z } from 'zod';
import { getBoardBacklog, getClient, extractJiraError } from '../jira-client.js';
import { formatIssueTable } from '../formatters.js';

export function registerGetBoardBacklog(server) {
  server.tool(
    'get_board_backlog',
    'Get issues on a board backlog (ranked; includes agile fields like sprint and epic). Optional JQL narrows results.',
    {
      boardId: z.number().int().positive().describe('Board ID'),
      jql: z.string().optional().describe('Optional JQL filter applied to backlog issues'),
      startAt: z.number().int().min(0).default(0).describe('Pagination offset'),
      maxResults: z.number().int().min(1).max(100).default(50).describe('Max results'),
      fields: z
        .array(z.string())
        .optional()
        .describe('Issue fields to return (default: summary, status, assignee, issuetype, priority)'),
    },
    async ({ boardId, jql, startAt, maxResults, fields }) => {
      try {
        const fieldList = fields || ['summary', 'status', 'assignee', 'issuetype', 'priority'];
        const data = await getBoardBacklog(boardId, startAt, maxResults, jql, fieldList);
        const issues = data.issues || [];
        const total = data.total ?? issues.length;
        const { baseURL } = getClient();
        const text =
          `Board ${boardId} backlog: ${total} issues (showing ${issues.length})\n\n` +
          formatIssueTable(issues, baseURL);
        return { content: [{ type: 'text', text }] };
      } catch (err) {
        return {
          content: [{ type: 'text', text: `Error fetching backlog for board ${boardId}: ${extractJiraError(err)}` }],
          isError: true,
        };
      }
    }
  );
}
