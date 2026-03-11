import { z } from 'zod';
import { getWorklogs, extractJiraError } from '../jira-client.js';
import { adfToPlainText } from '../formatters.js';

function formatWorklogs(worklogs) {
  if (!worklogs || worklogs.length === 0) return 'No worklogs.';
  return worklogs
    .map((w) => {
      const author = w.author?.displayName || 'Unknown';
      const started = w.started ? new Date(w.started).toLocaleString() : '–';
      const seconds = w.timeSpentSeconds || 0;
      const hours = (seconds / 3600).toFixed(2);
      const comment = w.comment ? adfToPlainText(w.comment).trim() : '';
      return `**${author}** — ${started} — ${seconds}s (${hours}h)${comment ? `\n${comment}` : ''}`;
    })
    .join('\n\n');
}

export function registerGetWorklogs(server) {
  server.tool(
    'get_worklogs',
    'List worklogs (time logged) on a JIRA issue',
    {
      issueKey: z.string().describe('Issue key, e.g. PROJ-123'),
      startAt: z.number().int().min(0).default(0).describe('Pagination offset'),
      maxResults: z.number().int().min(1).max(100).default(50).describe('Max results'),
    },
    async ({ issueKey, startAt, maxResults }) => {
      try {
        const data = await getWorklogs(issueKey, startAt, maxResults);
        const worklogs = data.worklogs || [];
        const total = data.total ?? worklogs.length;
        const text =
          `${total} worklog(s) on ${issueKey} (showing ${worklogs.length})\n\n` +
          formatWorklogs(worklogs);
        return { content: [{ type: 'text', text }] };
      } catch (err) {
        return {
          content: [{ type: 'text', text: `Error fetching worklogs for ${issueKey}: ${extractJiraError(err)}` }],
          isError: true,
        };
      }
    }
  );
}
