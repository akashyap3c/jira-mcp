import { z } from 'zod';
import { getAllSprints, extractJiraError } from '../jira-client.js';

export function registerGetAllSprints(server) {
  server.tool(
    'get_all_sprints',
    'Get all sprints for a board with their IDs and names. Auto-paginates so you always see every sprint.',
    {
      boardId: z.number().int().positive().describe('Board ID'),
      state: z
        .enum(['active', 'future', 'closed'])
        .optional()
        .describe('Filter by sprint state. Omit to return all sprints.'),
    },
    async ({ boardId, state }) => {
      try {
        const sprints = await getAllSprints(boardId, state);

        if (sprints.length === 0) {
          return {
            content: [{ type: 'text', text: `No sprints found for board ${boardId}.` }],
          };
        }

        const stateLabel = state ? ` (${state})` : '';
        const lines = [
          `All sprints for board ${boardId}${stateLabel} — ${sprints.length} total:\n`,
          '| ID | Name | State | Start | End |',
          '|----|------|-------|-------|-----|',
        ];

        for (const s of sprints) {
          const start = s.startDate?.split('T')[0] ?? '–';
          const end = s.endDate?.split('T')[0] ?? '–';
          lines.push(`| ${s.id} | ${s.name} | ${s.state} | ${start} | ${end} |`);
        }

        return { content: [{ type: 'text', text: lines.join('\n') }] };
      } catch (err) {
        return {
          content: [{ type: 'text', text: `Error fetching sprints: ${extractJiraError(err)}` }],
          isError: true,
        };
      }
    }
  );
}
