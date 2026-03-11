import axios from 'axios';

function validateEnv() {
  const required = ['JIRA_BASE_URL', 'JIRA_EMAIL', 'JIRA_API_TOKEN'];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}. ` +
        'Set them in .env or pass via MCP server config.'
    );
  }
}

function createClient() {
  validateEnv();

  const baseURL = process.env.JIRA_BASE_URL.replace(/\/+$/, '');
  const auth = {
    username: process.env.JIRA_EMAIL,
    password: process.env.JIRA_API_TOKEN,
  };

  const rest = axios.create({
    baseURL: `${baseURL}/rest/api/3`,
    auth,
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  });

  const agile = axios.create({
    baseURL: `${baseURL}/rest/agile/1.0`,
    auth,
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  });

  return { rest, agile, baseURL };
}

let clientInstance = null;

function getClient() {
  if (!clientInstance) {
    clientInstance = createClient();
  }
  return clientInstance;
}

/** Extract a human-readable error message from a JIRA API error response. */
function extractJiraError(err) {
  if (err.response?.data) {
    const d = err.response.data;
    const parts = [];
    if (d.errorMessages?.length) parts.push(...d.errorMessages);
    if (d.errors && typeof d.errors === 'object') {
      for (const [field, msg] of Object.entries(d.errors)) {
        parts.push(`${field}: ${msg}`);
      }
    }
    if (parts.length) return parts.join('\n');
    if (typeof d === 'string') return d;
  }
  return err.message || String(err);
}

// ── REST API v3 helpers ──

async function getIssue(issueKey, fields) {
  const { rest } = getClient();
  const params = {};
  if (fields) params.fields = fields.join(',');
  const res = await rest.get(`/issue/${issueKey}`, { params });
  return res.data;
}

async function searchIssues(jql, fields, maxResults = 50, startAt = 0) {
  const { rest } = getClient();
  const params = { jql, maxResults };
  if (fields) params.fields = fields.join(',');
  if (startAt) params.startAt = startAt;
  const res = await rest.get('/search/jql', { params });
  return res.data;
}

async function createIssue(fields) {
  const { rest } = getClient();
  const res = await rest.post('/issue', { fields });
  return res.data;
}

async function updateIssue(issueKey, fields) {
  const { rest } = getClient();
  await rest.put(`/issue/${issueKey}`, { fields });
}

async function transitionIssue(issueKey, transitionId) {
  const { rest } = getClient();
  await rest.post(`/issue/${issueKey}/transitions`, {
    transition: { id: transitionId },
  });
}

async function addComment(issueKey, bodyAdf) {
  const { rest } = getClient();
  const res = await rest.post(`/issue/${issueKey}/comment`, { body: bodyAdf });
  return res.data;
}

async function getComments(issueKey, startAt = 0, maxResults = 50) {
  const { rest } = getClient();
  const res = await rest.get(`/issue/${issueKey}/comment`, {
    params: { startAt, maxResults },
  });
  return res.data;
}

async function listProjects(startAt = 0, maxResults = 50) {
  const { rest } = getClient();
  const res = await rest.get('/project/search', {
    params: { startAt, maxResults },
  });
  return res.data;
}

async function getTransitions(issueKey) {
  const { rest } = getClient();
  const res = await rest.get(`/issue/${issueKey}/transitions`);
  return res.data.transitions;
}

async function assignIssue(issueKey, accountId) {
  const { rest } = getClient();
  await rest.put(`/issue/${issueKey}/assignee`, { accountId });
}

async function logWork(issueKey, timeSpentSeconds, comment, started) {
  const { rest } = getClient();
  const body = { timeSpentSeconds };
  if (comment != null) body.comment = typeof comment === 'string' ? { type: 'doc', version: 1, content: [{ type: 'paragraph', content: [{ type: 'text', text: comment }] }] } : comment;
  if (started) body.started = started;
  const res = await rest.post(`/issue/${issueKey}/worklog`, body);
  return res.data;
}

async function getWorklogs(issueKey, startAt = 0, maxResults = 50) {
  const { rest } = getClient();
  const res = await rest.get(`/issue/${issueKey}/worklog`, {
    params: { startAt, maxResults },
  });
  return res.data;
}

async function getLinkTypes() {
  const { rest } = getClient();
  const res = await rest.get('/issueLinkType');
  return res.data.issueLinkTypes || [];
}

async function linkIssues(inwardKey, outwardKey, linkTypeName) {
  const { rest } = getClient();
  await rest.post('/issueLink', {
    type: { name: linkTypeName },
    inwardIssue: { key: inwardKey },
    outwardIssue: { key: outwardKey },
  });
}

async function searchUsers(query, maxResults = 20) {
  const { rest } = getClient();
  const res = await rest.get('/user/search', {
    params: { query, maxResults },
  });
  return res.data;
}

async function deleteIssue(issueKey, deleteSubtasks = false) {
  const { rest } = getClient();
  await rest.delete(`/issue/${issueKey}`, {
    params: { deleteSubtasks: deleteSubtasks ? 'true' : 'false' },
  });
}

// ── Agile API helpers ──

async function listSprints(boardId, state, startAt = 0, maxResults = 50) {
  const { agile } = getClient();
  const params = { startAt, maxResults };
  if (state) params.state = state;
  const res = await agile.get(`/board/${boardId}/sprint`, { params });
  return res.data;
}

async function getSprintIssues(sprintId, fields, startAt = 0, maxResults = 50) {
  const { agile } = getClient();
  const params = { startAt, maxResults };
  if (fields) params.fields = fields.join(',');
  const res = await agile.get(`/sprint/${sprintId}/issue`, { params });
  return res.data;
}

async function moveToSprint(sprintId, issueKeys) {
  const { agile } = getClient();
  await agile.post(`/sprint/${sprintId}/issue`, { issues: issueKeys });
}

/**
 * Resolve a sprint name to its numeric ID by paginating through all sprints
 * on the given board (searches active, future, and closed states).
 * Returns the sprint ID, or null if not found.
 */
/**
 * Fetch every sprint on a board by paginating until isLast is true.
 * Optionally filter by state ('active', 'future', 'closed', or comma-joined combo).
 */
async function getAllSprints(boardId, state) {
  const { agile } = getClient();
  const maxResults = 50;
  let startAt = 0;
  const all = [];

  while (true) {
    const params = { startAt, maxResults };
    if (state) params.state = state;
    const res = await agile.get(`/board/${boardId}/sprint`, { params });
    const values = res.data.values || [];
    all.push(...values);
    if (res.data.isLast || values.length === 0) break;
    startAt += maxResults;
  }
  return all;
}

async function getSprintIdByName(boardId, sprintName) {
  const { agile } = getClient();
  const maxResults = 50;
  let startAt = 0;

  while (true) {
    const res = await agile.get(`/board/${boardId}/sprint`, {
      params: { startAt, maxResults, state: 'active,future,closed' },
    });
    const values = res.data.values || [];
    const match = values.find(
      (s) => s.name.toLowerCase() === sprintName.toLowerCase()
    );
    if (match) return match.id;
    if (res.data.isLast || values.length === 0) break;
    startAt += maxResults;
  }
  return null;
}

async function moveToBacklog(issueKeys) {
  const { agile } = getClient();
  await agile.post('/backlog/issue', { issues: issueKeys });
}

async function listBoards(projectKeyOrId, name, startAt = 0, maxResults = 50) {
  const { agile } = getClient();
  const params = { startAt, maxResults };
  if (projectKeyOrId) params.projectKeyOrId = projectKeyOrId;
  if (name) params.name = name;
  const res = await agile.get('/board', { params });
  return res.data;
}

export {
  getClient,
  extractJiraError,
  getIssue,
  searchIssues,
  createIssue,
  updateIssue,
  transitionIssue,
  addComment,
  getComments,
  listProjects,
  getTransitions,
  assignIssue,
  listSprints,
  getSprintIssues,
  moveToSprint,
  getAllSprints,
  getSprintIdByName,
  logWork,
  getWorklogs,
  getLinkTypes,
  linkIssues,
  searchUsers,
  deleteIssue,
  moveToBacklog,
  listBoards,
};
