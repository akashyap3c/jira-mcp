import { z } from 'zod';
import { getEpicIssues, getClient, extractJiraError } from '../jira-client.js';
import { formatIssueTable } from '../formatters.js';

export function registerGetEpicIssues(server) {
  server.tool(
    'get_epic_issues',
    'Get issues linked to an epic on a board',
    {
      boardId: z.number().int().positive().describe('Board ID'),
      epicId: z.number().int().positive().describe('Epic ID (from list_board_epics)'),
      startAt: z.number().int().min(0).default(0).describe('Pagination offset'),
      maxResults: z.number().int().min(1).max(100).default(50).describe('Max results'),
      fields: z
        .array(z.string())
        .optional()
        .describe('Issue fields (default: summary, status, assignee, issuetype, priority)'),
    },
    async ({ boardId, epicId, startAt, maxResults, fields }) => {
      try {
        const fieldList = fields || ['summary', 'status', 'assignee', 'issuetype', 'priority'];
        const data = await getEpicIssues(boardId, epicId, startAt, maxResults, fieldList);
        const issues = data.issues || [];
        const total = data.total ?? issues.length;
        const { baseURL } = getClient();
        const text =
          `Epic ${epicId} on board ${boardId}: ${total} issues (showing ${issues.length})\n\n` +
          formatIssueTable(issues, baseURL);
        return { content: [{ type: 'text', text }] };
      } catch (err) {
        return {
          content: [{ type: 'text', text: `Error fetching epic issues: ${extractJiraError(err)}` }],
          isError: true,
        };
      }
    }
  );
}
