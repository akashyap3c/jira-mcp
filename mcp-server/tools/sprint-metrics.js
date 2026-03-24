import { z } from 'zod';
import { getSprintIssues, extractJiraError } from '../jira-client.js';

function numStoryPoints(fields, fieldId) {
  if (!fieldId || !fields) return null;
  const v = fields[fieldId];
  if (v == null) return 0;
  if (typeof v === 'number') return v;
  if (typeof v === 'string') {
    const n = parseFloat(v);
    return Number.isNaN(n) ? 0 : n;
  }
  return 0;
}

export function registerSprintMetrics(server) {
  server.tool(
    'sprint_metrics',
    'Derived PM metrics for a sprint: issue counts by status category, optional story points sum (pass custom field id from list_fields). Paginates sprint issues up to maxIssues.',
    {
      sprintId: z.number().int().positive().describe('Sprint ID'),
      storyPointsFieldId: z
        .string()
        .optional()
        .describe('Custom field id for story points, e.g. customfield_10016'),
      maxIssues: z.number().int().min(1).max(2000).default(500).describe('Max issues to load from sprint'),
      pageSize: z.number().int().min(1).max(100).default(100).describe('Page size per API call'),
    },
    async ({ sprintId, storyPointsFieldId, maxIssues, pageSize }) => {
      try {
        const fields = ['summary', 'status', 'issuetype'];
        if (storyPointsFieldId) fields.push(storyPointsFieldId);

        const issues = [];
        let startAt = 0;
        while (issues.length < maxIssues) {
          const take = Math.min(pageSize, maxIssues - issues.length);
          const data = await getSprintIssues(sprintId, fields, startAt, take);
          const batch = data.issues || [];
          issues.push(...batch);
          if (batch.length < take) break;
          startAt += batch.length;
        }

        const byCategory = { done: 0, indeterminate: 0, new: 0, other: 0 };
        let pointsTotal = 0;
        let pointsDone = 0;
        let pointsNotDone = 0;

        for (const issue of issues) {
          const f = issue.fields || {};
          const cat = f.status?.statusCategory?.key;
          if (cat === 'done' || cat === 'new' || cat === 'indeterminate') {
            byCategory[cat] += 1;
          } else {
            byCategory.other += 1;
          }

          if (storyPointsFieldId) {
            const p = numStoryPoints(f, storyPointsFieldId);
            pointsTotal += p;
            if (cat === 'done') pointsDone += p;
            else pointsNotDone += p;
          }
        }

        const lines = [
          `**Sprint ${sprintId}** — ${issues.length} issues loaded`,
          '',
          '| Status category | Count |',
          '|-----------------|-------|',
          `| done | ${byCategory.done} |`,
          `| indeterminate (in progress) | ${byCategory.indeterminate} |`,
          `| new (todo) | ${byCategory.new} |`,
          `| other | ${byCategory.other} |`,
        ];
        if (storyPointsFieldId) {
          lines.push(
            '',
            `**Story points (${storyPointsFieldId})**`,
            `| Metric | Points |`,
            `|--------|--------|`,
            `| Total | ${pointsTotal} |`,
            `| Done category | ${pointsDone} |`,
            `| Not done | ${pointsNotDone} |`
          );
        }

        return { content: [{ type: 'text', text: lines.join('\n') }] };
      } catch (err) {
        return {
          content: [{ type: 'text', text: `Error computing sprint metrics: ${extractJiraError(err)}` }],
          isError: true,
        };
      }
    }
  );
}
