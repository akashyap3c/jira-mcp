import { z } from 'zod';
import { getLinkTypes, extractJiraError } from '../jira-client.js';

export function registerGetLinkTypes(server) {
  server.tool(
    'get_link_types',
    'List available JIRA issue link types (e.g. Blocks, Relates to). Use these names in link_issues.',
    {},
    async () => {
      try {
        const types = await getLinkTypes();
        if (types.length === 0) {
          return { content: [{ type: 'text', text: 'No link types found.' }] };
        }
        const lines = ['| Name | Inward | Outward |', '|------|--------|---------|'];
        for (const t of types) {
          const name = t.name || '–';
          const inward = t.inward || '–';
          const outward = t.outward || '–';
          lines.push(`| ${name} | ${inward} | ${outward} |`);
        }
        return { content: [{ type: 'text', text: lines.join('\n') }] };
      } catch (err) {
        return {
          content: [{ type: 'text', text: `Error fetching link types: ${extractJiraError(err)}` }],
          isError: true,
        };
      }
    }
  );
}
