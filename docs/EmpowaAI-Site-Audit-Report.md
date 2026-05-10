**EMPOWAI**

**Site Audit Report**

*Authenticated experience review --- empowa-ai.co.za*

**Prepared**

May 2026

**Scope**

Public site, authentication flow, dashboard, Digital Twin, Interview Coach, Opportunities, mobile + desktop responsive layouts.

**Total issues**

**10** (1 Critical, 4 High, 3 Medium, 2 Low)

**Executive Summary**

This report documents issues found during a hands-on audit of the EmpowaAI authenticated experience. The audit covered desktop and mobile breakpoints, the sign-in flow, the main dashboard, the Digital Twin, Interview Coach, and the Opportunities listing.

Overall, the product communicates a strong vision but several blocking issues prevent users from getting full value. The most pressing items are an authentication regression that logs users out of deep links, AI output that renders raw markdown, and a desktop header overlap that obscures branding.

**Severity legend**

- **Critical** --- blocks core flows; must fix immediately.

- **High** --- visible quality issue affecting most users.

- **Medium** --- degrades experience; fix in the next sprint.

- **Low** --- polish; schedule alongside related work.

**Issue Summary**

  -----------------------------------------------------------------------------------------------------------------
  **\#**   **Issue**                                                **Severity**   **Area**
  -------- -------------------------------------------------------- -------------- --------------------------------
  1        Deep links to dashboard routes log users out             **Critical**   Authentication & Routing

  2        AI chat output renders raw markdown                      **High**       Interview Coach & Digital Twin

  3        Header overlap on desktop (≥1366px)                      **High**       Layout / Navigation

  4        Dashboard claims 7,564 opportunities --- page shows 0    **High**       Data Consistency

  5        New users see hardcoded mock profile data                **High**       Onboarding / State

  6        Interview Coach ignores user CV / Digital Twin context   **Medium**     AI Personalisation

  7        Redundant mobile navigation                              **Medium**     Mobile UX

  8        Internal pages lack noindex and proper titles            **Medium**     SEO / Metadata

  9        Inconsistent brand naming (EmpowaAI vs EmpowaAI)          **Low**        Branding

  10       Floating support widget overlaps bottom nav on mobile    **Low**        Mobile UX
  -----------------------------------------------------------------------------------------------------------------

**Detailed Findings**

+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| **ISSUE #1 Deep links to dashboard routes log users out**                                                                                                                                         |
+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| **Severity: Critical Area:** Authentication & Routing                                                                                                                                             |
+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| **Description**                                                                                                                                                                                   |
|                                                                                                                                                                                                   |
| Navigating directly to authenticated routes like /dashboard/digital-twin or /dashboard/interview redirects to the homepage and clears the session. Users cannot bookmark or share internal pages. |
|                                                                                                                                                                                                   |
| **User Impact**                                                                                                                                                                                   |
|                                                                                                                                                                                                   |
| Breaks deep-linking, prevents bookmarking, and creates confusion for returning users who expect to land on the page they last visited.                                                            |
|                                                                                                                                                                                                   |
| **Recommended Fix**                                                                                                                                                                               |
|                                                                                                                                                                                                   |
| Update the route guard to: (1) preserve the requested URL in state, (2) redirect unauthenticated users to /sign-in instead of /, and (3) restore the original destination after successful login. |
+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+

+--------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| **ISSUE #2 AI chat output renders raw markdown**                                                                                                                   |
+--------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| **Severity: High Area:** Interview Coach & Digital Twin                                                                                                            |
+--------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| **Description**                                                                                                                                                    |
|                                                                                                                                                                    |
| AI responses display literal asterisks (e.g. \*\*Key Skills\*\*) instead of rendered bold text. Bullet lists, headings, and code spans are also not parsed.        |
|                                                                                                                                                                    |
| **User Impact**                                                                                                                                                    |
|                                                                                                                                                                    |
| Output looks unprofessional and is harder to scan. Undermines the perceived quality of the AI features.                                                            |
|                                                                                                                                                                    |
| **Recommended Fix**                                                                                                                                                |
|                                                                                                                                                                    |
| Wrap chat message bodies in react-markdown with remark-gfm. Apply Tailwind prose classes for typography and ensure code blocks, lists, and links render correctly. |
+--------------------------------------------------------------------------------------------------------------------------------------------------------------------+

+------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| **ISSUE #3 Header overlap on desktop (≥1366px)**                                                                                                                                   |
+------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| **Severity: High Area:** Layout / Navigation                                                                                                                                       |
+------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| **Description**                                                                                                                                                                    |
|                                                                                                                                                                                    |
| The \'Back to Dashboard\' breadcrumb and active nav pills overlap the EmpowaAI logo and brand name in the top-left corner, making both unreadable.                                  |
|                                                                                                                                                                                    |
| **User Impact**                                                                                                                                                                    |
|                                                                                                                                                                                    |
| Branding is illegible and primary navigation is hard to click. Looks broken on the most common desktop breakpoint.                                                                 |
|                                                                                                                                                                                    |
| **Recommended Fix**                                                                                                                                                                |
|                                                                                                                                                                                    |
| Increase the left padding of the header container, give the logo a fixed min-width, and move the breadcrumb into the page body or below the top nav rather than inside the header. |
+------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+

+----------------------------------------------------------------------------------------------------------------------------------------------------------+
| **ISSUE #4 Dashboard claims 7,564 opportunities --- page shows 0**                                                                                       |
+----------------------------------------------------------------------------------------------------------------------------------------------------------+
| **Severity: High Area:** Data Consistency                                                                                                                |
+----------------------------------------------------------------------------------------------------------------------------------------------------------+
| **Description**                                                                                                                                          |
|                                                                                                                                                          |
| The dashboard hero card advertises \'7,564 live opportunities\' while /dashboard/opportunities renders an empty state with no results.                   |
|                                                                                                                                                          |
| **User Impact**                                                                                                                                          |
|                                                                                                                                                          |
| Erodes trust. Users feel misled when the headline number does not match the actual content.                                                              |
|                                                                                                                                                          |
| **Recommended Fix**                                                                                                                                      |
|                                                                                                                                                          |
| Drive both surfaces from the same query. If the count is aspirational, replace it with the real count or remove it until the data pipeline is populated. |
+----------------------------------------------------------------------------------------------------------------------------------------------------------+

+--------------------------------------------------------------------------------------------------------------------------------+
| **ISSUE #5 New users see hardcoded mock profile data**                                                                         |
+--------------------------------------------------------------------------------------------------------------------------------+
| **Severity: High Area:** Onboarding / State                                                                                    |
+--------------------------------------------------------------------------------------------------------------------------------+
| **Description**                                                                                                                |
|                                                                                                                                |
| Fresh accounts display placeholder content such as \'TimberCity Stikland\' instead of an empty state or onboarding prompt.     |
|                                                                                                                                |
| **User Impact**                                                                                                                |
|                                                                                                                                |
| Confuses new users and makes the product feel like a demo rather than a personalised tool.                                     |
|                                                                                                                                |
| **Recommended Fix**                                                                                                            |
|                                                                                                                                |
| Replace mock fixtures with real user data. When no data exists, render an empty state with a clear CTA to complete onboarding. |
+--------------------------------------------------------------------------------------------------------------------------------+

+----------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| **ISSUE #6 Interview Coach ignores user CV / Digital Twin context**                                                                                                  |
+----------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| **Severity: Medium Area:** AI Personalisation                                                                                                                        |
+----------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| **Description**                                                                                                                                                      |
|                                                                                                                                                                      |
| Even when the dashboard reports an \'Active\' Digital Twin, the Interview Coach generates generic responses that do not reference the user\'s CV, role, or industry. |
|                                                                                                                                                                      |
| **User Impact**                                                                                                                                                      |
|                                                                                                                                                                      |
| Defeats the value proposition of a personalised coach. Users get advice indistinguishable from a generic chatbot.                                                    |
|                                                                                                                                                                      |
| **Recommended Fix**                                                                                                                                                  |
|                                                                                                                                                                      |
| Inject the user\'s twin profile (skills, experience, target role) into the system prompt of the Interview Coach edge function. Verify with a logged sample prompt.   |
+----------------------------------------------------------------------------------------------------------------------------------------------------------------------+

+----------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| **ISSUE #7 Redundant mobile navigation**                                                                                                                                   |
+----------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| **Severity: Medium Area:** Mobile UX                                                                                                                                       |
+----------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| **Description**                                                                                                                                                            |
|                                                                                                                                                                            |
| Mobile view shows both a bottom tab bar and a hamburger menu in the top-right, with overlapping destinations.                                                              |
|                                                                                                                                                                            |
| **User Impact**                                                                                                                                                            |
|                                                                                                                                                                            |
| Adds cognitive load and wastes screen real estate. Users are unsure which navigation to trust.                                                                             |
|                                                                                                                                                                            |
| **Recommended Fix**                                                                                                                                                        |
|                                                                                                                                                                            |
| Pick one primary nav for mobile. Recommended: keep the bottom tab bar for top-level destinations and remove the hamburger, or move secondary actions into a profile sheet. |
+----------------------------------------------------------------------------------------------------------------------------------------------------------------------------+

+----------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| **ISSUE #8 Internal pages lack noindex and proper titles**                                                                                                                 |
+----------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| **Severity: Medium Area:** SEO / Metadata                                                                                                                                  |
+----------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| **Description**                                                                                                                                                            |
|                                                                                                                                                                            |
| Authenticated dashboard pages reuse the marketing site\'s \<title\> and meta description, and are not marked noindex.                                                      |
|                                                                                                                                                                            |
| **User Impact**                                                                                                                                                            |
|                                                                                                                                                                            |
| Search engines may index private routes; analytics and shared links show generic titles.                                                                                   |
|                                                                                                                                                                            |
| **Recommended Fix**                                                                                                                                                        |
|                                                                                                                                                                            |
| Add a route-aware \<Helmet\> (or document head update) that sets a unique title per page and applies \<meta name=\"robots\" content=\"noindex\"\> on /dashboard/\* routes. |
+----------------------------------------------------------------------------------------------------------------------------------------------------------------------------+

+------------------------------------------------------------------------------------------------------------------------------------------------------+
| **ISSUE #9 Inconsistent brand naming (EmpowaAI vs EmpowaAI)**                                                                                         |
+------------------------------------------------------------------------------------------------------------------------------------------------------+
| **Severity: Low Area:** Branding                                                                                                                     |
+------------------------------------------------------------------------------------------------------------------------------------------------------+
| **Description**                                                                                                                                      |
|                                                                                                                                                      |
| The brand is spelled \'EmpowaAI\' in some places and \'EmpowaAI\' in others across the site.                                                          |
|                                                                                                                                                      |
| **User Impact**                                                                                                                                      |
|                                                                                                                                                      |
| Reduces perceived polish and hurts brand recall.                                                                                                     |
|                                                                                                                                                      |
| **Recommended Fix**                                                                                                                                  |
|                                                                                                                                                      |
| Pick the canonical spelling (recommend \'EmpowaAI\'), then do a project-wide find/replace and update logo alt text, page titles, and email templates. |
+------------------------------------------------------------------------------------------------------------------------------------------------------+

+------------------------------------------------------------------------------------------------------------------------------------+
| **ISSUE #10 Floating support widget overlaps bottom nav on mobile**                                                                |
+------------------------------------------------------------------------------------------------------------------------------------+
| **Severity: Low Area:** Mobile UX                                                                                                  |
+------------------------------------------------------------------------------------------------------------------------------------+
| **Description**                                                                                                                    |
|                                                                                                                                    |
| The orange floating chat bubble sits on top of the mobile bottom tab bar, partially blocking the rightmost tab.                    |
|                                                                                                                                    |
| **User Impact**                                                                                                                    |
|                                                                                                                                    |
| Users cannot reliably tap the obscured tab.                                                                                        |
|                                                                                                                                    |
| **Recommended Fix**                                                                                                                |
|                                                                                                                                    |
| Offset the widget by the bottom nav height on small breakpoints, or hide it on mobile and surface support inside the profile menu. |
+------------------------------------------------------------------------------------------------------------------------------------+

**Recommended Fix Order**

Tackle the items in this order to maximise impact while minimising risk:

**Sprint 1 --- Unblock**

- Fix deep-link auth redirect (Issue #1)

- Render markdown in AI chat (Issue #2)

- Resolve desktop header overlap (Issue #3)

**Sprint 2 --- Trust & personalisation**

- Sync opportunity counts with real data (Issue #4)

- Replace mock profile data with empty states (Issue #5)

- Inject Digital Twin context into Interview Coach (Issue #6)

**Sprint 3 --- Polish**

- Consolidate mobile navigation (Issue #7)

- Add per-route titles and noindex (Issue #8)

- Standardise brand spelling (Issue #9)

- Reposition floating support widget on mobile (Issue #10)

**Notes & Methodology**

The audit was conducted using the test account nene171408@gmail.com on the live site empowa-ai.co.za. Tested viewports: 1920×1080, 1366×768, 390×844. All issues were reproduced at least twice.
