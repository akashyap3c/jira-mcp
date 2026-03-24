import { z } from 'zod';
import { jiraPlatformRequest, extractJiraError } from '../jira-client.js';

const maxChars = () => Number(process.env.JIRA_MCP_MAX_RESPONSE_CHARS || 500000);

function serializeCapped(data) {
  const s = JSON.stringify(data, null, 2);
  const cap = maxChars();
  if (s.length <= cap) return s;
  return `${s.slice(0, cap)}\n\n...[truncated at ${cap} chars; set JIRA_MCP_MAX_RESPONSE_CHARS to raise limit]`;
}

export function registerJiraPlatformRequest(server) {
  server.tool(
    'jira_platform_request',
    'Low-level call to Jira REST API under /rest/api/3. Path must start with / (e.g. /field, /issue/PROJ-1). When JIRA_MCP_HTTP_READ_ONLY=true, only GET/HEAD are allowed.',
    {
      method: z.enum(['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'PATCH']).describe('HTTP method'),
      path: z.string().describe('Path relative to /rest/api/3, e.g. /field or /issue/KEY'),
      query: z.record(z.string(), z.any()).optional().describe('Optional query parameters as key-value object'),
      jsonBody: z.any().optional().describe('JSON body for POST/PUT/PATCH'),
    },
    async ({ method, path, query, jsonBody }) => {
      try {
        const data = await jiraPlatformRequest(method, path, query, jsonBody);
        if (method === 'HEAD' || data === undefined || data === '') {
          return { content: [{ type: 'text', text: `OK (${method} ${path})` }] };
        }
        return { content: [{ type: 'text', text: serializeCapped(data) }] };
      } catch (err) {
        return {
          content: [{ type: 'text', text: `jira_platform_request failed: ${extractJiraError(err)}` }],
          isError: true,
        };
      }
    }
  );
}
