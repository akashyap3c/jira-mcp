import { z } from 'zod';
import { listFields, extractJiraError } from '../jira-client.js';

export function registerListFields(server) {
  server.tool(
    'list_fields',
    'List all Jira fields (system and custom). Use custom field ids (e.g. customfield_10016) in search_issues for story points and other custom data.',
    {},
    async () => {
      try {
        const fields = await listFields();
        if (!fields?.length) {
          return { content: [{ type: 'text', text: 'No fields returned.' }] };
        }
        const lines = ['| Id | Name | Custom | Type |', '|----|------|--------|------|'];
        for (const f of fields) {
          const id = f.id || '–';
          const name = (f.name || '–').replace(/\|/g, '\\|');
          const custom = f.custom ? 'yes' : 'no';
          const st = f.schema?.type || '–';
          lines.push(`| ${id} | ${name} | ${custom} | ${st} |`);
        }
        return { content: [{ type: 'text', text: `${fields.length} fields:\n\n` + lines.join('\n') }] };
      } catch (err) {
        return {
          content: [{ type: 'text', text: `Error listing fields: ${extractJiraError(err)}` }],
          isError: true,
        };
      }
    }
  );
}
