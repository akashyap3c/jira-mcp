import { z } from 'zod';
import { getFilter, extractJiraError } from '../jira-client.js';

export function registerGetFilter(server) {
  server.tool(
    'get_filter',
    'Get a saved filter by ID (includes JQL when expand includes jql)',
    {
      filterId: z.string().describe('Filter ID from list_filters'),
    },
    async ({ filterId }) => {
      try {
        const f = await getFilter(filterId, ['jql']);
        const lines = [
          `**Filter ${f.id}**: ${f.name || '–'}`,
          '',
          `| Property | Value |`,
          `|----------|-------|`,
          `| Owner | ${f.owner?.displayName || f.owner?.accountId || '–'} |`,
          `| Favourite | ${f.favourite ? 'yes' : 'no'} |`,
          `| JQL | ${(f.jql || '–').replace(/\|/g, '\\|')} |`,
        ];
        return { content: [{ type: 'text', text: lines.join('\n') }] };
      } catch (err) {
        return {
          content: [{ type: 'text', text: `Error fetching filter: ${extractJiraError(err)}` }],
          isError: true,
        };
      }
    }
  );
}
