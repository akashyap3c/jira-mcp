import { z } from 'zod';
import { moveToSprint, getSprintIdByName, extractJiraError } from '../jira-client.js';

export function registerMoveToSprint(server) {
  server.tool(
    'move_to_sprint',
    'Move one or more issues into a sprint. Accepts either a numeric sprintId OR a sprintName (e.g. "AMZ Sprint 69"). When using sprintName, boardId is required to look up the sprint.',
    {
      issueKeys: z
        .array(z.string())
        .min(1)
        .describe('Issue keys to move, e.g. ["PROJ-1", "PROJ-2"]'),
      sprintId: z
        .number()
        .int()
        .positive()
        .optional()
        .describe('Numeric sprint ID. Use this OR sprintName.'),
      sprintName: z
        .string()
        .optional()
        .describe('Sprint name, e.g. "AMZ Sprint 69". Use this OR sprintId. Requires boardId.'),
      boardId: z
        .number()
        .int()
        .positive()
        .optional()
        .describe('Board ID — required when resolving a sprint by name.'),
    },
    async ({ issueKeys, sprintId, sprintName, boardId }) => {
      try {
        let resolvedId = sprintId;

        if (!resolvedId) {
          if (!sprintName) {
            return {
              content: [{ type: 'text', text: 'Provide either sprintId or sprintName.' }],
              isError: true,
            };
          }
          if (!boardId) {
            return {
              content: [{ type: 'text', text: 'boardId is required when using sprintName.' }],
              isError: true,
            };
          }

          resolvedId = await getSprintIdByName(boardId, sprintName);

          if (!resolvedId) {
            return {
              content: [
                {
                  type: 'text',
                  text: `Sprint "${sprintName}" not found on board ${boardId}. Use list_sprints to see available sprints.`,
                },
              ],
              isError: true,
            };
          }
        }

        await moveToSprint(resolvedId, issueKeys);

        const label = sprintName ? `"${sprintName}" (ID: ${resolvedId})` : `sprint ${resolvedId}`;
        return {
          content: [
            {
              type: 'text',
              text: `Moved ${issueKeys.length} issue(s) to ${label}: ${issueKeys.join(', ')}`,
            },
          ],
        };
      } catch (err) {
        return {
          content: [
            {
              type: 'text',
              text: `Error moving issues to sprint: ${extractJiraError(err)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
