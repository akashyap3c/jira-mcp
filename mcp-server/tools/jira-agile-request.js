import { z } from 'zod';
import { jiraAgileRequest, extractJiraError } from '../jira-client.js';

const maxChars = () => Number(process.env.JIRA_MCP_MAX_RESPONSE_CHARS || 500000);

function serializeCapped(data) {
  const s = JSON.stringify(data, null, 2);
  const cap = maxChars();
  if (s.length <= cap) return s;
  return `${s.slice(0, cap)}\n\n...[truncated at ${cap} chars; set JIRA_MCP_MAX_RESPONSE_CHARS to raise limit]`;
}

export function registerJiraAgileRequest(server) {
  server.tool(
    'jira_agile_request',
    'Low-level call to Jira Software Agile REST API under /rest/agile/1.0. Path must start with / (e.g. /board/1/reports). When JIRA_MCP_HTTP_READ_ONLY=true, only GET/HEAD are allowed.',
    {
      method: z.enum(['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'PATCH']).describe('HTTP method'),
      path: z.string().describe('Path relative to /rest/agile/1.0, e.g. /board/23/sprint'),
      query: z.record(z.string(), z.any()).optional().describe('Optional query parameters'),
      jsonBody: z.any().optional().describe('JSON body for POST/PUT/PATCH'),
    },
    async ({ method, path, query, jsonBody }) => {
      try {
        const data = await jiraAgileRequest(method, path, query, jsonBody);
        if (method === 'HEAD' || data === undefined || data === '') {
          return { content: [{ type: 'text', text: `OK (${method} ${path})` }] };
        }
        return { content: [{ type: 'text', text: serializeCapped(data) }] };
      } catch (err) {
        return {
          content: [{ type: 'text', text: `jira_agile_request failed: ${extractJiraError(err)}` }],
          isError: true,
        };
      }
    }
  );
}
