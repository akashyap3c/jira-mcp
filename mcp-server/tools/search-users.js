import { z } from 'zod';
import { searchUsers, extractJiraError } from '../jira-client.js';

export function registerSearchUsers(server) {
  server.tool(
    'search_users',
    'Search JIRA users by name or email. Returns accountId (use for assign_issue), displayName, and email.',
    {
      query: z.string().min(1).describe('Search string (name or email)'),
      maxResults: z.number().int().min(1).max(50).default(20).describe('Max results'),
    },
    async ({ query, maxResults }) => {
      try {
        const users = await searchUsers(query, maxResults);
        if (!users || users.length === 0) {
          return { content: [{ type: 'text', text: `No users found for "${query}".` }] };
        }
        const lines = ['| accountId | displayName | email |', '|-----------|-------------|-------|'];
        for (const u of users) {
          const id = u.accountId || '–';
          const name = (u.displayName || '–').replace(/\|/g, '\\|');
          const email = (u.emailAddress || '–').replace(/\|/g, '\\|');
          lines.push(`| ${id} | ${name} | ${email} |`);
        }
        return { content: [{ type: 'text', text: lines.join('\n') }] };
      } catch (err) {
        return {
          content: [{ type: 'text', text: `Error searching users: ${extractJiraError(err)}` }],
          isError: true,
        };
      }
    }
  );
}
