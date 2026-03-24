import { z } from 'zod';
import { getBoardIssues, getClient, extractJiraError } from '../jira-client.js';
import { formatIssueTable } from '../formatters.js';

export function registerGetBoardIssues(server) {
  server.tool(
    'get_board_issues',
    'Get issues for a board (board-scoped listing). Optional JQL filters the board issues.',
    {
      boardId: z.number().int().positive().describe('Board ID'),
      jql: z.string().optional().describe('Optional JQL filter'),
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
        const data = await getBoardIssues(boardId, startAt, maxResults, jql, fieldList);
        const issues = data.issues || [];
        const total = data.total ?? issues.length;
        const { baseURL } = getClient();
        const text =
          `Board ${boardId} issues: ${total} (showing ${issues.length})\n\n` +
          formatIssueTable(issues, baseURL);
        return { content: [{ type: 'text', text }] };
      } catch (err) {
        return {
          content: [{ type: 'text', text: `Error fetching board issues: ${extractJiraError(err)}` }],
          isError: true,
        };
      }
    }
  );
}
