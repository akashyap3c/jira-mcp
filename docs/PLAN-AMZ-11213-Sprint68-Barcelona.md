# Plan: Epic AMZ-11213 work in AMZ Sprint 68 – Barcelona

## Context

| Item | Value |
|------|--------|
| **Epic** | [AMZ-11213](https://cedcommerceinc.atlassian.net/browse/AMZ-11213) — *Develop In-App Notification System & Feedback/Survey Form Integration* |
| **Sprint** | AMZ Sprint 68 – Barcelona (Jira sprint id `5327`) |
| **Scope** | Issues under epic AMZ-11213 that were in this sprint and assigned to Ashish Kumar Kashyap |
| **Data pulled** | Jira REST API `timetracking` (original estimate & time spent), March 2026 |

## Objectives (from epic)

- In-app notification system (bell, activity, read/unread, real-time updates).
- Announcements (CRUD, categories, engagement, forms, WebSockets).
- Admin tooling for announcements and analytics.

## Task table (with time)

Original estimate and time logged come from Jira **Time tracking** on each issue. Where no original estimate exists in Jira, the cell shows **—**.

| Key | Summary | Status | Type | Original estimate | Time logged |
|-----|---------|--------|------|-------------------|-------------|
| [AMZ-11285](https://cedcommerceinc.atlassian.net/browse/AMZ-11285) | Bell Icon & Badge in Header + Activity Page Tabs Structure | Done | Dev-Task | 3h | 3.02h |
| [AMZ-11286](https://cedcommerceinc.atlassian.net/browse/AMZ-11286) | System Notifications Enhancement & Mark as Read | Done | Dev-Task | 3h | 3.02h |
| [AMZ-11287](https://cedcommerceinc.atlassian.net/browse/AMZ-11287) | Backend: Badge Count Calculation API | Done | Dev-Task | 3h | 3.02h |
| [AMZ-11288](https://cedcommerceinc.atlassian.net/browse/AMZ-11288) | Backend: Notification Mark-as-Read APIs Enhancement | Done | Dev-Task | 1h | 1.02h |
| [AMZ-11289](https://cedcommerceinc.atlassian.net/browse/AMZ-11289) | Frontend: Announcements Core Infrastructure & Basic Rendering | Done | Dev-Task | 5h | 10.17h |
| [AMZ-11290](https://cedcommerceinc.atlassian.net/browse/AMZ-11290) | Backend: Announcement CRUD APIs & Visibility Scoping | Done | Dev-Task | 0h* | 0.17h |
| [AMZ-11291](https://cedcommerceinc.atlassian.net/browse/AMZ-11291) | Frontend: Announcement Categories - Product & Feature + System & Platform | Done | Dev-Task | 4h | 5.17h |
| [AMZ-11292](https://cedcommerceinc.atlassian.net/browse/AMZ-11292) | Backend: Announcement Engagement Tracking APIs | Done | Dev-Task | 3h | 3h |
| [AMZ-11293](https://cedcommerceinc.atlassian.net/browse/AMZ-11293) | Frontend: Engagement Announcements with Form Builder | Done | Dev-Task | 6h | 11.17h |
| [AMZ-11295](https://cedcommerceinc.atlassian.net/browse/AMZ-11295) | Backend: Form Schema Management & Form Submission APIs | Done | Dev-Task | 4h | 4h |
| [AMZ-11296](https://cedcommerceinc.atlassian.net/browse/AMZ-11296) | Frontend: Business & Marketing + Critical/Compliance Announcements | Done | Dev-Task | 5h | 5h |
| [AMZ-11297](https://cedcommerceinc.atlassian.net/browse/AMZ-11297) | Backend: Announcement Acknowledgment APIs & Delivery Tracking | Done | Dev-Task | 5h | 5h |
| [AMZ-11298](https://cedcommerceinc.atlassian.net/browse/AMZ-11298) | Frontend: WebSocket Integration & Real-time Updates | Done | Dev-Task | 4h | 4h |
| [AMZ-11299](https://cedcommerceinc.atlassian.net/browse/AMZ-11299) | Backend: WebSocket Event Broadcasting for Announcements | Done | Dev-Task | 4h | 4h |
| [AMZ-11623](https://cedcommerceinc.atlassian.net/browse/AMZ-11623) | Backend: Admin visibility and announcement_type validation | Done | Dev-Task | 2h | 2h |
| [AMZ-11624](https://cedcommerceinc.atlassian.net/browse/AMZ-11624) | Backend: Admin announcement forms (schema and save) | Done | Dev-Task | 3h | 3h |
| [AMZ-11627](https://cedcommerceinc.atlassian.net/browse/AMZ-11627) | Backend: Bell count and list sync | Done | Dev-Task | — | 0h |
| [AMZ-11630](https://cedcommerceinc.atlassian.net/browse/AMZ-11630) | Frontend: Admin announcement list and lifecycle actions | Done | Dev-Task | 4h | 4h |
| [AMZ-11631](https://cedcommerceinc.atlassian.net/browse/AMZ-11631) | Frontend: Admin create/update announcement form | Done | Dev-Task | 5h | 5h |
| [AMZ-11632](https://cedcommerceinc.atlassian.net/browse/AMZ-11632) | Frontend: Admin announcement form builder (survey/feedback) | Done | Dev-Task | 4h | 4h |
| [AMZ-11633](https://cedcommerceinc.atlassian.net/browse/AMZ-11633) | Frontend: Admin announcement view and analytics | Done | Dev-Task | — | 0h |

\*Jira stores **0h** as the original estimate for AMZ-11290; work was still logged.

## Rollups

| Metric | Value |
|--------|--------|
| **Issues** | 21 |
| **Sum of original estimates** (issues with a non-empty estimate in Jira) | **68h** |
| **Sum of time logged** (all issues) | **≈79.76h** |
| **Issues without original estimate in Jira** | AMZ-11627, AMZ-11633 |

## Follow-ups

1. In Jira, set **original estimate** on AMZ-11627 and AMZ-11633 (or confirm work was folded into other issues) so planning reports stay accurate.
2. Revisit **AMZ-11290** if `0h` estimate was unintentional.
3. Optional JQL to reproduce this slice:

   ```jql
   "Epic Link" = AMZ-11213 AND assignee = currentUser() AND sprint = 5327 ORDER BY key
   ```

## Revision

| Date | Note |
|------|------|
| 2026-03-24 | Initial plan doc; estimates from Jira `timetracking` API. |
