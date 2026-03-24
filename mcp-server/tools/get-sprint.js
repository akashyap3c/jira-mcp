import { z } from 'zod';
import { getSprint, extractJiraError } from '../jira-client.js';

export function registerGetSprint(server) {
  server.tool(
    'get_sprint',
    'Get sprint metadata by ID (name, state, goal, start/end dates). Complements get_all_sprints.',
    {
      sprintId: z.number().int().positive().describe('Numeric sprint ID'),
    },
    async ({ sprintId }) => {
      try {
        const s = await getSprint(sprintId);
        const lines = [
          `**Sprint ${s.id}**: ${s.name || '–'}`,
          '',
          `| Field | Value |`,
          `|-------|-------|`,
          `| State | ${s.state || '–'} |`,
          `| Goal | ${s.goal || '–'} |`,
          `| Start | ${s.startDate || '–'} |`,
          `| End | ${s.endDate || '–'} |`,
          `| Complete date | ${s.completeDate || '–'} |`,
        ];
        return { content: [{ type: 'text', text: lines.join('\n') }] };
      } catch (err) {
        return {
          content: [{ type: 'text', text: `Error fetching sprint ${sprintId}: ${extractJiraError(err)}` }],
          isError: true,
        };
      }
    }
  );
}
