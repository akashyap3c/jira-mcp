import { z } from 'zod';
import { logWork, extractJiraError } from '../jira-client.js';

export function registerLogWork(server) {
  server.tool(
    'log_work',
    'Log time spent on a JIRA issue (worklog)',
    {
      issueKey: z.string().describe('Issue key, e.g. PROJ-123'),
      timeSpentSeconds: z.number().int().positive().describe('Time spent in seconds (e.g. 3600 = 1 hour)'),
      comment: z.string().optional().describe('Optional worklog comment'),
      started: z.string().optional().describe('Optional ISO 8601 date when work was done, e.g. 2025-03-10T09:00:00.000+0000'),
    },
    async ({ issueKey, timeSpentSeconds, comment, started }) => {
      try {
        await logWork(issueKey, timeSpentSeconds, comment, started);
        const hours = (timeSpentSeconds / 3600).toFixed(2);
        return {
          content: [
            {
              type: 'text',
              text: `Logged ${timeSpentSeconds}s (${hours}h) on ${issueKey}${comment ? ': ' + comment : ''}.`,
            },
          ],
        };
      } catch (err) {
        return {
          content: [{ type: 'text', text: `Error logging work on ${issueKey}: ${extractJiraError(err)}` }],
          isError: true,
        };
      }
    }
  );
}
