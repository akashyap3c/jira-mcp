import { z } from 'zod';
import { getIssuesWithoutEpic, getClient, extractJiraError } from '../jira-client.js';
import { formatIssueTable } from '../formatters.js';

export function registerGetIssuesWithoutEpic(server) {
  server.tool(
    'get_issues_without_epic',
    'Get board issues that are not assigned to any epic',
    {
      boardId: z.number().int().positive().describe('Board ID'),
      startAt: z.number().int().min(0).default(0).describe('Pagination offset'),
      maxResults: z.number().int().min(1).max(100).default(50).describe('Max results'),
      fields: z
        .array(z.string())
        .optional()
        .describe('Issue fields (default: summary, status, assignee, issuetype, priority)'),
    },
    async ({ boardId, startAt, maxResults, fields }) => {
      try {
        const fieldList = fields || ['summary', 'status', 'assignee', 'issuetype', 'priority'];
        const data = await getIssuesWithoutEpic(boardId, startAt, maxResults, fieldList);
        const issues = data.issues || [];
        const total = data.total ?? issues.length;
        const { baseURL } = getClient();
        const text =
          `Board ${boardId} issues without epic: ${total} (showing ${issues.length})\n\n` +
          formatIssueTable(issues, baseURL);
        return { content: [{ type: 'text', text }] };
      } catch (err) {
        return {
          content: [{ type: 'text', text: `Error fetching issues without epic: ${extractJiraError(err)}` }],
          isError: true,
        };
      }
    }
  );
}
