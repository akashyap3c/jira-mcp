import { z } from 'zod';
import { listBoardReports, extractJiraError } from '../jira-client.js';

export function registerListBoardReports(server) {
  server.tool(
    'list_board_reports',
    'List report types available for a Jira Software board (e.g. sprint reports). Response shape depends on Jira version.',
    {
      boardId: z.number().int().positive().describe('Board ID'),
    },
    async ({ boardId }) => {
      try {
        const data = await listBoardReports(boardId);
        const text = JSON.stringify(data, null, 2);
        return { content: [{ type: 'text', text: `Reports for board ${boardId}:\n\n${text}` }] };
      } catch (err) {
        return {
          content: [{ type: 'text', text: `Error listing reports for board ${boardId}: ${extractJiraError(err)}` }],
          isError: true,
        };
      }
    }
  );
}
