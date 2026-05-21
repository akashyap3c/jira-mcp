# Plan: Group post — AI for faster delivery & broader thinking (Sprint 68)

Use this doc to **plan** what you say in a team/community post. Numbers are from Jira (Sprint **AMZ Sprint 68 – Barcelona**, id `5327`, `cedcommerceinc.atlassian.net`) for issues **assigned to you** in that sprint, pulled **2026-03-24** via `GET /rest/api/3/search/jql`.

**Scope of timing:** All **original estimate** and **logged time** totals, the type breakdown, and the detailed table **exclude issues of type Bug** (defect work). You still closed **9** Bug tickets in the sprint; they are not counted in the hours below.

---

## 1. Facts you can cite (from Jira)

| Metric | Value |
|--------|--------|
| Sprint | [AMZ Sprint 68 – Barcelona](https://cedcommerceinc.atlassian.net) (18 Feb – 11 Mar 2026, closed) |
| Your issues in sprint (all **Done**) | **55** (of which **9** are **Bug** — excluded from timing) |
| Issues **included** in timing below | **46** (Dev-Task, Enhancement, Non Dev-Task) |
| Sum of **original estimates** (excl. Bug) | **~121.9 h** |
| Sum of **time logged** (excl. Bug) | **~141.1 h** |
| Included issues with **no** original estimate in Jira | **5** |
| Your stated sprint **dev capacity** (your input) | **70 h** |

**Comparison to 70 h** (non-Bug work only)

- Original estimates total ≈ **174%** of 70 h (~1.74×).
- Time logged total ≈ **202%** of 70 h (~2.02×).

**By issue type (same scope — Bug excluded)**

| Type | Count | Σ original est. | Σ logged |
|------|------:|----------------:|---------:|
| Dev-Task | 41 | ~115.4 h | ~125.7 h |
| Enhancement | 3 | ~3.0 h | ~11.3 h |
| Non Dev-Task | 2 | ~3.5 h | ~4.0 h |

**Themes in the sprint (for storytelling)**

- Large slice of work sits under notifications / announcements / admin (epic **[AMZ-11213](https://cedcommerceinc.atlassian.net/browse/AMZ-11213)** — in-app notification system & surveys).
- Plus free-plan UX, Buybox, templates, filters, and enhancements (see full table below).

---

## 2. How to talk about this honestly

**Strong claims**

- You can say Jira shows **46** non-Bug items **done** in that sprint with **~122 h** of **original estimates** on those tickets (Bugs excluded from timing), while you plan **70 h** of dev capacity — i.e. **the ticket-level plan sum is well above a single 70 h bucket** (after double-count caveats below). You can separately mention **9** Bug tickets closed if useful.

**Avoid over-claiming**

- **Summing original estimates** across many tickets is **not** the same as “I worked 122 sequential hours” or “AI saved X hours.” Some work overlaps, estimates are wrong, and **5** non-Bug tickets had **no** original estimate.
- **Time logged (~141 h, non-Bug)** is work recorded on those tickets; it can include refinement, review, and context switching — still not “one person’s single-threaded 141 h week.”
- **AI’s role** is best described as **your** experience (drafting, refactoring, debugging, tests, docs, exploration) unless you measured AI-specific time.

**Recommended framing**

- *“AI didn’t replace thinking — it widened what I could tackle in one sprint and shortened loops on implementation and quality.”*
- Pair numbers with humility: estimates are imperfect; the point is **throughput and breadth**, not a precise efficiency ratio.

---

## 3. Post structure (before you write copy)

1. **Hook** — One line: e.g. sprint reflection + AI as a **multiplier**, not autopilot.
2. **Context** — Team, product area (e.g. Shopify ↔ Amazon), sprint name/dates optional.
3. **Evidence** — **55** issues closed (**46** non-Bug in the timing roll-up); **~122 h** original estimates on non-Bug tickets vs **70 h** planned dev capacity; optional **~141 h** logged (non-Bug) for transparency; mention **9** Bugs closed if you want full sprint picture.
4. **Broader thinking** — Examples: epic-sized notification system, cross-cutting free-plan rules, WebSocket/admin flows — things easy to under-scope without tooling.
5. **How you use AI** — 3–5 bullets (e.g. break tickets into AC, codegen + review, edge cases, refactors, JQL/planning).
6. **Close** — Team credit, QA/PM/Design, “still learning,” invite discussion.

---

## 4. Draft copy (edit in your voice)

### Short (Slack / internal)

> Closed **55** tickets in **Sprint 68** (AMZ), including **9** bugs. For **feature / enhancement / other non-bug** work only, Jira original estimates add up to **~122 h**; I plan **~70 h** dev capacity per sprint — so the **scoped dev work on the board was much larger than one capacity bucket**, and I still got it **Done**.  
> AI tools mainly helped me **move faster on implementation**, catch **edge cases**, and **think across a bigger surface** (notifications, admin, free-plan UX, APIs) without dropping quality. Estimates aren’t perfect, but the pattern is clear: **wider scope, shorter feedback loops**.  
> Huge thanks to everyone who reviewed, tested, and clarified requirements.

### Longer (LinkedIn-style — trim as needed)

> **Sprint retrospective, with a nod to how I actually work now**  
>  
> In **AMZ Sprint 68 – Barcelona** I closed **55** Jira items assigned to me (**9** were bugs — I’m **not** folding bug hours into this story). On the **46** non-bug tickets, **original estimates** sum to about **122 hours** — while I treat **~70 hours** as my realistic **development capacity** in a sprint.  
>  
> I’m not presenting that as “I worked 122 linear hours.” Estimates are noisy, **5** of those tickets had no estimate, and some work is parallel/context-switched. But directionally: **the batch of dev work I finished was larger than what I’d normally budget in raw hours**, and **time logged** on those same non-bug tickets is about **141 hours**, which matches the intensity I felt on the ground.  
>  
> Where **AI** helped wasn’t magic — it was **speed and breadth**: turning acceptance criteria into a plan faster, iterating on UI/API code, exploring failure modes, and keeping a big thread (in-app notifications, announcements, admin tooling, free-plan restrictions) coherent.  
>  
> The lesson for me: **AI amplifies execution and thinking**, it doesn’t replace ownership, review, or alignment with the team.  
>  
> Curious how others are measuring “AI lift” without fooling themselves — how do you keep claims honest?

---

## 5. Optional JQL (screenshot for the post)

All issues in the sprint:

```jql
assignee = currentUser() AND sprint = 5327 ORDER BY key
```

Same scope as the timing table (exclude **Bug**):

```jql
assignee = currentUser() AND sprint = 5327 AND issuetype != Bug ORDER BY key
```

---

## 6. Full table — Sprint 68 issues (Bug type **excluded**), estimates & logged time

Values from Jira **Time tracking** (`originalEstimateSeconds`, `timeSpentSeconds`). **—** = no original estimate in Jira.

| Key | Summary | Type | Status | Original est. | Logged |
|-----|---------|------|--------|---------------|--------|
| AMZ-10887 | Frontend work regarding amazon lookup(Multi Offer listing Frontend) | Dev-Task | Done | 6.00h | 6.17h |
| AMZ-10935 | Dynamic error and reason - the embedded app has more detailed error handling for proper re… | Dev-Task | Done | 9.00h | 5.02h |
| AMZ-11060 | Frontend - Those products which are not importing those should be reflected on the app to … | Dev-Task | Done | 5.00h | 6.67h |
| AMZ-11070 | Instant data delete enable for all seller | Dev-Task | Done | 0.17h | 0.33h |
| AMZ-11187 | Enhancement for Filter available. | Enhancement | Done | 3.00h | 2.17h |
| AMZ-11212 | Frontend - Provide bulk switching option custom barcode to shopify barcode switching | Dev-Task | Done | 2.50h | 3.17h |
| AMZ-11274 | Buyshipping- scope update for reverse shipment sync (frontend + backend) | Dev-Task | Done | 5.00h | 4.17h |
| AMZ-11275 | Changed uploaded status to Submitted | Dev-Task | Done | 0.25h | 2.02h |
| AMZ-11285 | Bell Icon & Badge in Header + Activity Page Tabs Structure | Dev-Task | Done | 3.00h | 3.02h |
| AMZ-11286 | System Notifications Enhancement & Mark as Read | Dev-Task | Done | 3.00h | 3.02h |
| AMZ-11287 | Backend: Badge Count Calculation API | Dev-Task | Done | 3.00h | 3.02h |
| AMZ-11288 | Backend: Notification Mark-as-Read APIs Enhancement | Dev-Task | Done | 1.00h | 1.02h |
| AMZ-11289 | Frontend: Announcements Core Infrastructure & Basic Rendering | Dev-Task | Done | 5.00h | 10.17h |
| AMZ-11290 | Backend: Announcement CRUD APIs & Visibility Scoping | Dev-Task | Done | 0.00h | 0.17h |
| AMZ-11291 | Frontend: Announcement Categories - Product & Feature + System & Platform | Dev-Task | Done | 4.00h | 5.17h |
| AMZ-11292 | Backend: Announcement Engagement Tracking APIs | Dev-Task | Done | 3.00h | 3.00h |
| AMZ-11293 | Frontend: Engagement Announcements with Form Builder | Dev-Task | Done | 6.00h | 11.17h |
| AMZ-11295 | Backend: Form Schema Management & Form Submission APIs | Dev-Task | Done | 4.00h | 4.00h |
| AMZ-11296 | Frontend: Business & Marketing + Critical/Compliance Announcements | Dev-Task | Done | 5.00h | 5.00h |
| AMZ-11297 | Backend: Announcement Acknowledgment APIs & Delivery Tracking | Dev-Task | Done | 5.00h | 5.00h |
| AMZ-11298 | Frontend: WebSocket Integration & Real-time Updates | Dev-Task | Done | 4.00h | 4.00h |
| AMZ-11299 | Backend: WebSocket Event Broadcasting for Announcements | Dev-Task | Done | 4.00h | 4.00h |
| AMZ-11300 | Automatic Blog Update on Server (Cron Setup) | Dev-Task | Done | 3.00h | 2.00h |
| AMZ-11301 | Optimise Template product assigning process | Dev-Task | Done | 4.00h | 4.02h |
| AMZ-11322 | More Filter & Search Bar – Issues and Corrected Use Cases need to handle  | Enhancement | Done | — | 4.00h |
| AMZ-11401 | Integrate API to mark an account as primary to prevent auto-disconnection | Dev-Task | Done | 1.00h | 0.02h |
| AMZ-11402 | Show tooltip (as per Figma) near Add Account button for Free Plan users with 1 connected a… | Dev-Task | Done | 1.00h | 0.60h |
| AMZ-11403 | Show banner on Settings page when Free Plan credits are fully used (1/1) | Dev-Task | Done | 1.00h | 0.02h |
| AMZ-11404 | Show banner on Settings and Overview pages when account connection limit is exceeded, incl… | Dev-Task | Done | 1.00h | 2.52h |
| AMZ-11405 | Restrict Manual Sync, Product Fetch, and CSV Import/Export for Free Plan users with toolti… | Dev-Task | Done | 2.00h | 1.52h |
| AMZ-11406 | Disable Bulk Operations in Listings grid for Free Plan users, show tooltip, and block sele… | Dev-Task | Done | 1.50h | 1.02h |
| AMZ-11425 | Time update is affecting multiple accounts instead of the selected account | Enhancement | Done | — | 5.17h |
| AMZ-11427 | Permanent Fixing - We need to show updates at timings for the setting for example - in map… | Dev-Task | Done | 1.00h | 1.17h |
| AMZ-11458 | Code Review | Non Dev-Task | Done | 3.00h | 3.00h |
| AMZ-11495 | Implement the changes made in Buybox APIs | Dev-Task | Done | 2.50h | 2.67h |
| AMZ-11511 | Can we make these section sticky when scrolling down | Dev-Task | Done | 0.50h | 0.75h |
| AMZ-11512 | Discussion on "If any seller enable or disable any warehouse then should we display any me… | Non Dev-Task | Done | 0.50h | 1.00h |
| AMZ-11521 | Restrict Plan downgrade and show reason for that | Dev-Task | Done | 1.00h | 1.02h |
| AMZ-11581 | Updates on Pricing plan | Dev-Task | Done | — | 1.17h |
| AMZ-11623 | Backend: Admin visibility and announcement_type validation | Dev-Task | Done | 2.00h | 2.00h |
| AMZ-11624 | Backend: Admin announcement forms (schema and save) | Dev-Task | Done | 3.00h | 3.00h |
| AMZ-11627 | Backend: Bell count and list sync | Dev-Task | Done | — | 0h |
| AMZ-11630 | Frontend: Admin announcement list and lifecycle actions | Dev-Task | Done | 4.00h | 4.00h |
| AMZ-11631 | Frontend: Admin create/update announcement form | Dev-Task | Done | 5.00h | 5.00h |
| AMZ-11632 | Frontend: Admin announcement form builder (survey/feedback) | Dev-Task | Done | 4.00h | 4.00h |
| AMZ-11633 | Frontend: Admin announcement view and analytics | Dev-Task | Done | — | 0h |

---

## 7. Checklist before you hit “Post”

- [ ] Remove or anonymize anything your group policy would not want public.
- [ ] Decide if you name the company/product or keep it generic.
- [ ] Attach a **Jira screenshot** or filter link if allowed.
- [ ] Thank reviewers / QA / PM if posting externally.
- [ ] Tone-check: confident but not “AI did my job.”

---

*Generated as a planning aid; refresh numbers from Jira if you post later.*
