import { z } from 'zod';
import { searchIssues, getWorklogs, extractJiraError } from '../jira-client.js';

function buildJql(baseJql, dateFrom, dateTo) {
  let jql = baseJql.trim();
  const clauses = [];
  if (dateFrom) clauses.push(`worklogDate >= "${dateFrom}"`);
  if (dateTo) clauses.push(`worklogDate <= "${dateTo}"`);
  if (clauses.length) jql = `(${jql}) AND ${clauses.join(' AND ')}`;
  return jql;
}

function parseWorklogDate(iso) {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  return Number.isNaN(t) ? null : t;
}

function inDateRange(iso, fromMs, toMs) {
  if (fromMs == null && toMs == null) return true;
  const t = parseWorklogDate(iso);
  if (t == null) return false;
  if (fromMs != null && t < fromMs) return false;
  if (toMs != null && t > toMs) return false;
  return true;
}

async function fetchAllWorklogsForIssue(issueKey, pageSize = 100) {
  const all = [];
  let startAt = 0;
  for (let guard = 0; guard < 500; guard += 1) {
    const data = await getWorklogs(issueKey, startAt, pageSize);
    const ws = data.worklogs || [];
    all.push(...ws);
    const total = data.total ?? all.length;
    if (all.length >= total || ws.length === 0) break;
    startAt += pageSize;
  }
  return all;
}

export function registerAggregateWorklogs(server) {
  server.tool(
    'aggregate_worklogs',
    'Aggregate time logged across issues from a JQL query. Fetches worklogs per issue (can be slow / rate-limited). Use worklogDate in JQL or dateFrom/dateTo. Optional filter by author accountId.',
    {
      jql: z.string().describe('Base JQL (e.g. project = PROJ). Combined with worklogDate if dateFrom/dateTo set.'),
      dateFrom: z.string().optional().describe('Optional start date yyyy-MM-dd (adds worklogDate >=)'),
      dateTo: z.string().optional().describe('Optional end date yyyy-MM-dd (adds worklogDate <=)'),
      accountId: z.string().optional().describe('If set, only count worklogs by this author accountId'),
      maxIssues: z.number().int().min(1).max(500).default(100).describe('Max issues to scan (caps API load)'),
      issuesPerPage: z.number().int().min(1).max(100).default(50).describe('Search page size'),
    },
    async ({ jql, dateFrom, dateTo, accountId, maxIssues, issuesPerPage }) => {
      try {
        const fullJql = buildJql(jql, dateFrom, dateTo);
        const keys = [];
        let startAt = 0;
        while (keys.length < maxIssues) {
          const page = Math.min(issuesPerPage, maxIssues - keys.length);
          const data = await searchIssues(fullJql, ['key'], page, startAt);
          const issues = data.issues || [];
          for (const i of issues) {
            if (i.key) keys.push(i.key);
            if (keys.length >= maxIssues) break;
          }
          if (issues.length < page) break;
          startAt += issues.length;
          if (issues.length === 0) break;
        }

        const fromMs = dateFrom ? new Date(`${dateFrom}T00:00:00.000Z`).getTime() : null;
        const toMs = dateTo ? new Date(`${dateTo}T23:59:59.999Z`).getTime() : null;

        const byUser = new Map();
        let totalSeconds = 0;
        let worklogCount = 0;
        let issuesWithLogs = 0;

        for (const key of keys) {
          const worklogs = await fetchAllWorklogsForIssue(key);
          let hit = false;
          for (const w of worklogs) {
            if (accountId && w.author?.accountId !== accountId) continue;
            if (!inDateRange(w.started, fromMs, toMs)) continue;
            const sec = w.timeSpentSeconds || 0;
            const aid = w.author?.accountId || 'unknown';
            const name = w.author?.displayName || aid;
            if (!byUser.has(aid)) {
              byUser.set(aid, { displayName: name, seconds: 0, count: 0 });
            }
            const row = byUser.get(aid);
            row.seconds += sec;
            row.count += 1;
            totalSeconds += sec;
            worklogCount += 1;
            hit = true;
          }
          if (hit) issuesWithLogs += 1;
        }

        const lines = [
          `**Worklog aggregate** (${keys.length} issues scanned, ${worklogCount} worklogs, ${issuesWithLogs} issues with matching logs)`,
          `Total time: **${totalSeconds}s** (${(totalSeconds / 3600).toFixed(2)}h)`,
          '',
          '| User | Seconds | Hours | Worklogs |',
          '|------|---------|-------|----------|',
        ];
        for (const [, v] of byUser) {
          lines.push(
            `| ${v.displayName.replace(/\|/g, '\\|')} | ${v.seconds} | ${(v.seconds / 3600).toFixed(2)} | ${v.count} |`
          );
        }
        if (byUser.size === 0) lines.push('| (none) | – | – | – |');

        return { content: [{ type: 'text', text: lines.join('\n') }] };
      } catch (err) {
        return {
          content: [{ type: 'text', text: `Error aggregating worklogs: ${extractJiraError(err)}` }],
          isError: true,
        };
      }
    }
  );
}
