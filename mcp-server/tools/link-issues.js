import { z } from 'zod';
import { linkIssues, extractJiraError } from '../jira-client.js';

export function registerLinkIssues(server) {
  server.tool(
    'link_issues',
    'Link two JIRA issues with a relationship type (e.g. Blocks, Relates to). Use get_link_types to see available types.',
    {
      inwardKey: z.string().describe('Inward issue key (e.g. the issue that is "blocked by")'),
      outwardKey: z.string().describe('Outward issue key (e.g. the issue that "blocks")'),
      linkTypeName: z.string().describe('Link type name, e.g. "Blocks", "Relates to", "Duplicates"'),
    },
    async ({ inwardKey, outwardKey, linkTypeName }) => {
      try {
        await linkIssues(inwardKey, outwardKey, linkTypeName);
        return {
          content: [
            {
              type: 'text',
              text: `Linked ${outwardKey} → ${inwardKey} with "${linkTypeName}".`,
            },
          ],
        };
      } catch (err) {
        return {
          content: [{ type: 'text', text: `Error linking issues: ${extractJiraError(err)}` }],
          isError: true,
        };
      }
    }
  );
}
