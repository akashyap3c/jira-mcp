import { z } from 'zod';
import { searchFilters, extractJiraError } from '../jira-client.js';

export function registerListFilters(server) {
  server.tool(
    'list_filters',
    'Search saved Jira filters (by partial name). Use get_filter with a filter id to read JQL.',
    {
      filterName: z.string().optional().describe('Case-insensitive partial match on filter name'),
      accountId: z.string().optional().describe('Only filters visible to / owned by this account'),
      startAt: z.number().int().min(0).default(0).describe('Pagination offset'),
      maxResults: z.number().int().min(1).max(100).default(50).describe('Max results'),
    },
    async ({ filterName, accountId, startAt, maxResults }) => {
      try {
        const data = await searchFilters(filterName, accountId, maxResults, startAt);
        const items = data.values || [];
        if (items.length === 0) {
          return { content: [{ type: 'text', text: 'No filters found.' }] };
        }
        const lines = ['| Id | Name | Owner | Favourite |', '|----|------|-------|-----------|'];
        for (const f of items) {
          const name = (f.name || '–').replace(/\|/g, '\\|');
          const owner = (f.owner?.displayName || f.owner?.accountId || '–').replace(/\|/g, '\\|');
          lines.push(`| ${f.id} | ${name} | ${owner} | ${f.favourite ? 'yes' : 'no'} |`);
        }
        const total = data.total ?? items.length;
        const text = `Filters (${total} total, showing ${items.length}):\n\n` + lines.join('\n');
        return { content: [{ type: 'text', text }] };
      } catch (err) {
        return {
          content: [{ type: 'text', text: `Error searching filters: ${extractJiraError(err)}` }],
          isError: true,
        };
      }
    }
  );
}
