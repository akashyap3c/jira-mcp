import { z } from 'zod';
import { listBoards, extractJiraError } from '../jira-client.js';

export function registerListBoards(server) {
  server.tool(
    'list_boards',
    'List JIRA boards. Use board ID with get_all_sprints and move_to_sprint.',
    {
      projectKeyOrId: z.string().optional().describe('Filter by project key or ID'),
      name: z.string().optional().describe('Filter by board name'),
      startAt: z.number().int().min(0).default(0).describe('Pagination offset'),
      maxResults: z.number().int().min(1).max(100).default(50).describe('Max results'),
    },
    async ({ projectKeyOrId, name, startAt, maxResults }) => {
      try {
        const data = await listBoards(projectKeyOrId, name, startAt, maxResults);
        const values = data.values || [];
        if (values.length === 0) {
          return { content: [{ type: 'text', text: 'No boards found.' }] };
        }
        const lines = ['| ID | Name | Type |', '|----|------|------|'];
        for (const b of values) {
          lines.push(`| ${b.id} | ${b.name || '–'} | ${b.type || '–'} |`);
        }
        const total = data.total ?? values.length;
        const text = `Boards (${total} total, showing ${values.length}):\n\n` + lines.join('\n');
        return { content: [{ type: 'text', text }] };
      } catch (err) {
        return {
          content: [{ type: 'text', text: `Error listing boards: ${extractJiraError(err)}` }],
          isError: true,
        };
      }
    }
  );
}
