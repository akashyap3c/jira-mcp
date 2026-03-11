import { z } from 'zod';
import { deleteIssue, extractJiraError } from '../jira-client.js';

export function registerDeleteIssue(server) {
  server.tool(
    'delete_issue',
    'Permanently delete a JIRA issue. Optionally delete its subtasks.',
    {
      issueKey: z.string().describe('Issue key to delete, e.g. PROJ-123'),
      deleteSubtasks: z.boolean().default(false).describe('If true, delete subtasks first'),
    },
    async ({ issueKey, deleteSubtasks }) => {
      try {
        await deleteIssue(issueKey, deleteSubtasks);
        return {
          content: [
            {
              type: 'text',
              text: `${issueKey} has been permanently deleted${deleteSubtasks ? ' (including subtasks)' : ''}.`,
            },
          ],
        };
      } catch (err) {
        return {
          content: [{ type: 'text', text: `Error deleting ${issueKey}: ${extractJiraError(err)}` }],
          isError: true,
        };
      }
    }
  );
}
