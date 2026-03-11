import { z } from 'zod';
import { moveToBacklog, extractJiraError } from '../jira-client.js';

export function registerMoveToBacklog(server) {
  server.tool(
    'move_to_backlog',
    'Move one or more issues out of their sprint back to the backlog',
    {
      issueKeys: z
        .array(z.string())
        .min(1)
        .describe('Issue keys to move to backlog, e.g. ["PROJ-1", "PROJ-2"]'),
    },
    async ({ issueKeys }) => {
      try {
        await moveToBacklog(issueKeys);
        return {
          content: [
            {
              type: 'text',
              text: `Moved ${issueKeys.length} issue(s) to backlog: ${issueKeys.join(', ')}`,
            },
          ],
        };
      } catch (err) {
        return {
          content: [{ type: 'text', text: `Error moving issues to backlog: ${extractJiraError(err)}` }],
          isError: true,
        };
      }
    }
  );
}
