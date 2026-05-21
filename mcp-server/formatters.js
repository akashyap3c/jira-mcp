/**
 * Recursively extract plain text from an Atlassian Document Format (ADF) node.
 */
export function adfToPlainText(node) {
  if (!node) return '';
  if (typeof node === 'string') return node;
  if (node.type === 'text') return node.text || '';
  if (Array.isArray(node.content)) {
    const parts = node.content.map((child) => adfToPlainText(child));
    // Add newlines between block-level nodes
    if (['doc', 'bulletList', 'orderedList', 'blockquote', 'table'].includes(node.type)) {
      return parts.join('\n');
    }
    if (node.type === 'paragraph' || node.type === 'heading') {
      return parts.join('') + '\n';
    }
    if (node.type === 'listItem') {
      return '• ' + parts.join('');
    }
    if (node.type === 'tableRow') {
      return parts.join(' | ');
    }
    if (node.type === 'tableCell' || node.type === 'tableHeader') {
      return parts.join('');
    }
    return parts.join('');
  }
  return '';
}

/**
 * Wrap plain text in a minimal ADF document structure.
 */
export function plainTextToAdf(text) {
  const paragraphs = text.split('\n').map((line) => ({
    type: 'paragraph',
    content: line
      ? [{ type: 'text', text: line }]
      : [],
  }));
  return {
    type: 'doc',
    version: 1,
    content: paragraphs,
  };
}

/**
 * Build an ADF document from plain text plus a list of attachments.
 * Attachments are rendered as a trailing paragraph of hyperlinked filenames.
 * Jira's REST v3 comment endpoint rejects ADF `media` nodes that reference
 * attachment IDs (it expects media-services UUIDs), so we don't embed inline.
 * Each attachment may provide { id, filename, contentUrl, alt }.
 */
export function buildCommentAdf(text, attachments = []) {
  const content = [];
  if (text && text.length > 0) {
    for (const line of text.split('\n')) {
      content.push({
        type: 'paragraph',
        content: line ? [{ type: 'text', text: line }] : [],
      });
    }
  }
  if (attachments.length > 0) {
    const inlines = [{ type: 'text', text: 'Attached: ' }];
    attachments.forEach((att, i) => {
      const label = att.alt || att.filename || `attachment-${att.id}`;
      const linkNode = { type: 'text', text: label };
      if (att.contentUrl) {
        linkNode.marks = [{ type: 'link', attrs: { href: att.contentUrl } }];
      }
      inlines.push(linkNode);
      if (i < attachments.length - 1) {
        inlines.push({ type: 'text', text: ', ' });
      }
    });
    content.push({ type: 'paragraph', content: inlines });
  }
  if (content.length === 0) {
    content.push({ type: 'paragraph', content: [] });
  }
  return { type: 'doc', version: 1, content };
}

/**
 * Format a single issue into a Markdown detail view.
 */
export function formatIssueDetail(issue, baseURL) {
  const f = issue.fields || {};
  const lines = [];

  lines.push(`## [${issue.key}](${baseURL}/browse/${issue.key}): ${f.summary || '(no summary)'}`);
  lines.push('');
  lines.push(`| Field | Value |`);
  lines.push(`|-------|-------|`);
  lines.push(`| **Status** | ${f.status?.name || '–'} |`);
  lines.push(`| **Type** | ${f.issuetype?.name || '–'} |`);
  lines.push(`| **Priority** | ${f.priority?.name || '–'} |`);
  lines.push(`| **Assignee** | ${f.assignee?.displayName || 'Unassigned'} |`);
  lines.push(`| **Reporter** | ${f.reporter?.displayName || '–'} |`);
  lines.push(`| **Labels** | ${(f.labels || []).join(', ') || '–'} |`);
  lines.push(`| **Sprint** | ${f.sprint?.name || '–'} |`);
  lines.push(`| **Created** | ${f.created || '–'} |`);
  lines.push(`| **Updated** | ${f.updated || '–'} |`);

  if (f.description) {
    lines.push('');
    lines.push('### Description');
    lines.push('');
    lines.push(adfToPlainText(f.description).trim());
  }

  return lines.join('\n');
}

/**
 * Format a list of issues into a Markdown table.
 */
export function formatIssueTable(issues, baseURL) {
  if (!issues || issues.length === 0) return 'No issues found.';

  const lines = [];
  lines.push('| Key | Summary | Status | Assignee | Type |');
  lines.push('|-----|---------|--------|----------|------|');

  for (const issue of issues) {
    const f = issue.fields || {};
    const key = `[${issue.key}](${baseURL}/browse/${issue.key})`;
    const summary = (f.summary || '').replace(/\|/g, '\\|');
    const status = f.status?.name || '–';
    const assignee = f.assignee?.displayName || 'Unassigned';
    const type = f.issuetype?.name || '–';
    lines.push(`| ${key} | ${summary} | ${status} | ${assignee} | ${type} |`);
  }

  return lines.join('\n');
}

/**
 * Format comments into readable Markdown.
 */
export function formatComments(comments) {
  if (!comments || comments.length === 0) return 'No comments.';

  return comments
    .map((c) => {
      const author = c.author?.displayName || 'Unknown';
      const created = c.created || '';
      const body = adfToPlainText(c.body).trim();
      return `**${author}** — ${created}\n\n${body}`;
    })
    .join('\n\n---\n\n');
}

/**
 * Format transitions list into Markdown.
 */
export function formatTransitions(transitions) {
  if (!transitions || transitions.length === 0) return 'No available transitions.';

  const lines = [];
  lines.push('| ID | Name | To Status |');
  lines.push('|----|------|-----------|');
  for (const t of transitions) {
    lines.push(`| ${t.id} | ${t.name} | ${t.to?.name || '–'} |`);
  }
  return lines.join('\n');
}

/**
 * Format projects list into Markdown.
 */
export function formatProjects(projects) {
  if (!projects || projects.length === 0) return 'No projects found.';

  const lines = [];
  lines.push('| Key | Name | Type | Lead |');
  lines.push('|-----|------|------|------|');
  for (const p of projects) {
    const lead = p.lead?.displayName || '–';
    const type = p.projectTypeKey || '–';
    lines.push(`| ${p.key} | ${p.name} | ${type} | ${lead} |`);
  }
  return lines.join('\n');
}

/**
 * Format sprints into Markdown.
 */
export function formatSprints(sprints) {
  if (!sprints || sprints.length === 0) return 'No sprints found.';

  const lines = [];
  lines.push('| ID | Name | State | Start | End |');
  lines.push('|----|------|-------|-------|-----|');
  for (const s of sprints) {
    const start = s.startDate?.split('T')[0] || '–';
    const end = s.endDate?.split('T')[0] || '–';
    lines.push(`| ${s.id} | ${s.name} | ${s.state} | ${start} | ${end} |`);
  }
  return lines.join('\n');
}
