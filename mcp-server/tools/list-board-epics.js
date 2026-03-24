import { z } from 'zod';
import { listBoardEpics, extractJiraError } from '../jira-client.js';

export function registerListBoardEpics(server) {
  server.tool(
    'list_board_epics',
    'List epics on a Jira Software board',
    {
      boardId: z.number().int().positive().describe('Board ID'),
      startAt: z.number().int().min(0).default(0).describe('Pagination offset'),
      maxResults: z.number().int().min(1).max(100).default(50).describe('Max results'),
    },
    async ({ boardId, startAt, maxResults }) => {
      try {
        const data = await listBoardEpics(boardId, startAt, maxResults);
        const values = data.values || [];
        if (values.length === 0) {
          return { content: [{ type: 'text', text: `No epics on board ${boardId}.` }] };
        }
        const lines = ['| ID | Key | Name | Summary | Done |', '|----|-----|------|---------|------|'];
        for (const e of values) {
          const key = e.key ?? e.issueKey ?? '–';
          lines.push(
            `| ${e.id} | ${key} | ${(e.name || '–').replace(/\|/g, '\\|')} | ${(e.summary || '–').replace(/\|/g, '\\|')} | ${e.done ? 'yes' : 'no'} |`
          );
        }
        const total = data.total ?? values.length;
        const text = `Epics on board ${boardId} (${total} total, showing ${values.length}):\n\n` + lines.join('\n');
        return { content: [{ type: 'text', text }] };
      } catch (err) {
        return {
          content: [{ type: 'text', text: `Error listing epics: ${extractJiraError(err)}` }],
          isError: true,
        };
      }
    }
  );
}
