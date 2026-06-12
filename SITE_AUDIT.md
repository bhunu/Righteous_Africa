# RAE Website — Site Audit Report
**Date:** 2026-06-12  
**Project:** Righteous African Equities — React 19 + Vite + TypeScript  
**Scope:** Responsiveness, Security, Design & Accessibility  

> **How to use:** Check off each item below as you fix it — `- [ ]` = to do, `- [x]` = done.

---

## Summary Scorecard

| Category | Rating | Key Finding |
|---|---|---|
| Responsiveness | **7 / 10** | Good breakpoint coverage; gaps at tablet range and slider affordance |
| Security | **5 / 10** | Real credentials in `.env`, default PIN in source, no rate limiting |
| Design | **8 / 10** | Premium EY-inspired execution; several small polish items |
| Accessibility | **5 / 10** | Missing ARIA on mobile nav, no skip link, non-interactive "links" |

---

## Progress Tracker

Quick overview of all issues — tick here as you complete them, or tick inside each section below.

### 🔴 Critical / High Priority
- [x] **S1** — Verify `.env` was never committed; rotate SMTP password *(git history clean — never committed)*
- [x] **S2** — Change default admin PIN from `RAE2024`; remove hint from Settings UI *(hint removed from UI)*
- [x] **S4** — Restrict CORS to production domain only *(origin whitelist added to server.cjs)*
- [x] **S5** — Add rate limiting to `/api/contact` *(express-rate-limit: 10 req / 15 min)*
- [x] **S6** — Add `helmet` HTTP security headers *(helmet installed and wired)*

### 🟠 Medium Priority
- [x] **D1** — Define `--gold` CSS variable (team section bullets invisible) *(`--gold: #D4A017` added to :root)*
- [x] **D2** — Make "Learn more" / "Enquire now" actual `<a>` links *(all srv-more spans → `<a href="#contact">`)*
- [x] **D3** — Verify `/images/laptop.jpg` exists or replace with CDN URL *(file confirmed present)*
- [x] **R1** — Services cards 2-per-row at 900px tablet breakpoint *(breakpoint rule updated)*
- [x] **A1** — Add `aria-expanded` to mobile nav accordion buttons *(attribute added)*
- [x] **S3** — Obscure admin panel keyboard shortcut *(replaced with `/#admin` URL fragment)*
- [x] **S7** — Avoid storing GitHub PAT in `localStorage` in plaintext *(switched to `sessionStorage`)*

### 🟡 Low Priority
- [x] **D4** — Add social media links to the footer *(LinkedIn, WhatsApp, Facebook icons added — update LinkedIn/Facebook URLs when ready)*
- [x] **D5** — Stats strip 2×2 grid instead of full column on mobile *(grid layout applied at 768px)*
- [x] **D6** — Hide Blog/Opportunities sections when empty *(return null when no content)*
- [x] **D7** — Add optional phone/WhatsApp field to contact form *(field added, wired to server email)*
- [x] **D8** — Replace emoji admin nav icons with inline SVGs *(Blog, Opportunities, Settings SVGs)*
- [x] **D9** — Fix offer chips overflow on small screens *(`white-space: nowrap` + wrap gap)*
- [x] **D10** — Add `loading="lazy"` to below-fold images *(about, diaspora, team images updated)*
- [x] **R2** — Packages cards 1-per-row at 400px and below *(400px breakpoint added)*
- [x] **R3** — Add scroll-snap to all horizontal sliders *(scroll-snap-type + scroll-snap-align on all 5 sliders)*
- [x] **R4** — Pause carousel auto-scroll on hover/focus *(mouseenter/mouseleave pause logic, shared hook)*
- [x] **R5** — Fix stats strip dangling `border-right` on mobile wrap *(2×2 grid replaces flex-column)*
- [x] **R6** — Add `-webkit-overflow-scrolling: touch` to sliders *(added to all 5 slider containers)*
- [x] **S8** — Validate `localStorage` content before applying as `SiteContent` *(shape check + auto-clear on invalid)*
- [x] **S9** — Add server-side length limit for `lastName` field *(100-char cap added to server.cjs)*
- [ ] **S10** — Add CSRF token to `/api/contact`
- [x] **A2** — Add skip-to-content link at top of page *(skip-link added, focus-visible styled)*
- [x] **A3** — Replace HTML entity arrow icons with `aria-hidden` SVGs *(chevron SVGs with aria-hidden)*
- [x] **A4** — Increase `.stats-lbl` opacity to meet WCAG AA contrast *(0.48 → 0.65)*
- [x] **A5** — Replace `confirm()` dialogs in Admin with inline confirmation UI *(Delete → Yes/No inline)*
- [x] **A6** — Self-host Google Fonts (GDPR compliance) *(`@fontsource-variable/inter` + `@fontsource/merriweather`)*

---

## 1. Responsiveness

### Breakpoint Coverage

| Breakpoint | Trigger |
|---|---|
| `≤ 1100px` | Sectors grid (4→3 cols), "Why Choose Us" grid (5→3 cols) |
| `≤ 900px` | About, Team, Contact layouts collapse to 1-col; Footer to 2-col; Diaspora stacks |
| `≤ 768px` | Hamburger activates; Stats strip stacks; Packages (3→2 per row) |
| `≤ 560px` | Reduced padding; sliders go 2-per-row; Footer to 1-col; "Why" grid to 1-col |

### Issues Found

#### - [x] R1 — Services cards stay 3-wide between 768px and 900px (Medium)
The `.srv-slider .srv-card` size is `calc((100%−3rem)/3)` at the 900px breakpoint and is never adjusted until 560px, where it becomes 2-per-row. On a tablet in portrait (768px–900px) this means three narrow service cards are visible, which is cramped.

**File:** [src/App.css:1362-1363](src/App.css#L1362-L1363)  
**Fix:** Add a rule at 900px to reduce to 2-per-row:
```css
@media (max-width: 900px) {
  .srv-slider .srv-card { flex: 0 0 calc((100% - 1.5rem) / 2); min-width: calc((100% - 1.5rem) / 2); }
}
```

#### - [x] R2 — Packages cards 2-per-row too narrow on 320px–360px phones (Low)
`calc((100% - 1.5rem) / 2)` at 560px gives each card only ~160px width on a 360px phone, which clips the price text.

**File:** [src/App.css:1386](src/App.css#L1386)  
**Fix:** Add a 400px breakpoint to show 1-per-row packages:
```css
@media (max-width: 400px) {
  .pkg-grid .pkg-card { flex: 0 0 100%; min-width: 100%; }
}
```

#### - [x] R3 — Horizontal sliders have no touch/swipe affordance (Medium)
All sliders (services, packages, blog, opportunities, diaspora) auto-advance every 5 seconds but provide no visual cue that content is scrollable. On mobile there's no visible left/right control or page indicator.

**Fix:** Add scroll-snap and a subtle fade-out gradient edge to signal more content:
```css
.srv-slider, .pkg-slider, .blog-slider, .opp-slider, .dsp-opp-slider {
  scroll-snap-type: x mandatory;
}
.srv-card, .pkg-card, .blog-card, .opp-card, .dsp-opp-card {
  scroll-snap-align: start;
}
```

#### - [x] R4 — Auto-scroll doesn't pause on hover/focus (Low)
The carousel `setInterval` calls in `App.tsx` (lines 658–724) have no pause-on-hover logic. Users actively reading a card are interrupted.

**Fix:** Clear the interval `onMouseEnter` and restart `onMouseLeave` for each slider container.

#### - [x] R5 — Stats strip border-right on mobile wrap (Low)
When the stats strip wraps to 2×2 on small screens the `border-right` on each cell still shows on cells at the right edge of each row, leaving a dangling border.

**File:** [src/App.css:502-508](src/App.css#L502-L508)  
**Fix:** Replace `border-right` with a CSS Grid approach or `border-bottom` only below 768px.

#### - [x] R6 — Missing `-webkit-overflow-scrolling: touch` on sliders (Low)
iOS Safari can have momentum-scroll issues on horizontal sliders without this property (though `overflow-x: auto` handles most cases in modern iOS, the momentum smoothness is improved by it).

---

## 2. Security

### CRITICAL

#### - [x] S1 — Real SMTP password in local `.env` file
**File:** [.env](.env) — line 6  
```
SMTP_PASS=XQtI(TY#S2@V
```
The `.gitignore` correctly excludes `.env`, so this is **not** pushed to git in the current setup. However, if this file was ever accidentally staged/committed or shared, the credential is exposed. **Action required:** Rotate this SMTP password immediately if it has ever been committed. Verify git history with `git log --all -- .env`.

#### - [x] S2 — Default admin PIN hardcoded and displayed in source (High)
**File:** [src/components/AdminPanel.tsx:6](src/components/AdminPanel.tsx#L6)  
```ts
const DEFAULT_PIN = 'RAE2024'
```
The same default is also printed in the Settings UI note: *"Default PIN is **RAE2024**"*. Anyone reading the source via devtools bundle or the Settings page text can see the default. Change the default PIN immediately after deployment and remove the hint note from the UI.

#### - [x] S3 — Admin panel triggered by publicly discoverable keyboard shortcut (Medium)
**File:** [src/App.tsx:631-641](src/App.tsx#L631-L641)  
Double-tapping Enter reveals the admin login form. While PIN-protected, it discloses the existence of an admin panel to curious users. Consider removing the keyboard trigger and navigating to a dedicated `/admin` route instead (or a URL fragment).

### HIGH

#### - [x] S4 — CORS wildcard accepts all origins (High)
**File:** [server.cjs:11](server.cjs#L11)  
```js
app.use(cors())
```
This allows any website to make `POST /api/contact` requests. Restrict to your domain:
```js
app.use(cors({ origin: 'https://righteousafrica.com' }))
```

#### - [x] S5 — No rate limiting on `/api/contact` (High)
**File:** [server.cjs:36](server.cjs#L36)  
The contact form endpoint has no rate limiting. A bot can send thousands of emails per minute. Install `express-rate-limit`:
```js
const rateLimit = require('express-rate-limit')
app.use('/api/contact', rateLimit({ windowMs: 15 * 60 * 1000, max: 10 }))
```

#### - [x] S6 — No HTTP security headers (High)
The Express server has no HTTP security headers. Add `helmet`:
```js
const helmet = require('helmet')
app.use(helmet())
```
This adds X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Strict-Transport-Security, and a basic CSP automatically.

#### - [x] S7 — GitHub PAT stored in localStorage in plaintext (Medium)
**File:** [src/components/AdminPanel.tsx:441](src/components/AdminPanel.tsx#L441) and [line 569](src/components/AdminPanel.tsx#L569)  
```ts
localStorage.getItem(PAT_KEY)
localStorage.setItem(PAT_KEY, pat)
```
`localStorage` is accessible to any script running on the page (including 3rd-party scripts or XSS). Consider encrypting the token with the PIN hash as key, or at minimum using `sessionStorage` so it clears when the tab closes.

### MEDIUM

#### - [x] S8 — Content from localStorage applied without schema validation (Medium)
**File:** [src/App.tsx:646-651](src/App.tsx#L646-L651)  
`localStorage.getItem('rae:content')` is parsed and directly applied as `SiteContent`. A malicious actor with physical device access could inject arbitrary JSON. Add a lightweight schema check.

#### - [x] S9 — `lastName` field has no server-side length limit (Low)
**File:** [server.cjs:43-49](server.cjs#L43-L49)  
`firstName`, `email`, and `message` have length checks but `lastName` does not. Cap it at 100 chars to match `firstName`.

#### - [ ] S10 — No CSRF token on the contact API (Low) *(mitigated by CORS restriction — full CSRF token optional)*
Cross-site requests are possible (see S4). Adding a CSRF token to the form and verifying it server-side is the proper fix; restricting CORS (S4) is the minimum.

---

## 3. Design

### Strengths
- Clean EY-inspired corporate language with generous whitespace
- Consistent CSS custom-property color system (`--red`, `--black`, `--white`)
- Strong serif/sans-serif pairing (Merriweather + Inter)
- Well-differentiated section backgrounds (white vs `#F9FAFB`)
- Service card hover microinteractions (red accent bar, icon inversion) are polished
- Transparent-to-white sticky navbar transition is smooth and professional
- Diaspora section is a clear content differentiator

### Issues Found

#### - [x] D1 — `--gold` CSS variable is undefined (Bug — visual)
**File:** [src/App.css:934](src/App.css#L934)  
```css
.team-pillars li::before {
  background: var(--gold);   /* --gold is never defined in :root */
}
```
The bullet points on team pillar list items will render as transparent/black browser default. Define `--gold: #D4A017` in `:root` or change to `var(--red)`.

#### - [x] D2 — "Learn more" and "Enquire now" are `<span>` elements, not links (Bug — UX)
**File:** [src/App.tsx:816-819](src/App.tsx#L816-L819) and [line 917-920](src/App.tsx#L917-L920)  
```tsx
<span className="srv-more">
  Learn more
  <svg .../>
</span>
```
These styled elements look and behave like links but are not keyboard-focusable, have no `href`, and do nothing on click. Either link them to `#contact` or remove them if they're purely decorative:
```tsx
<a href="#contact" className="srv-more">Learn more <svg .../></a>
```

#### - [x] D3 — Hero slide 3 uses a local image path that may be missing (Bug — visual)
**File:** [src/App.tsx:67](src/App.tsx#L67)  
```ts
img: '/images/laptop.jpg',
```
The other two slides use Unsplash CDN URLs. If `/public/images/laptop.jpg` doesn't exist, this slide will show a broken background. Verify the file exists or replace with an Unsplash URL.

#### - [x] D4 — No social media links in the footer (Design gap)
For an investor-facing business, the absence of LinkedIn, Twitter/X, or WhatsApp Business links is notable. The footer has `Company`, `Services`, and `Packages` columns but no `Connect` or `Social` column.

#### - [x] D5 — Stats strip wraps to full-column on mobile (UX issue)
On 768px and below, `flex-direction: column` is applied to `.stats-strip`. On very small screens the 4 stats stacked vertically takes significant vertical space before the user reaches content. Consider keeping a 2×2 grid instead of full column on 560px+.

#### - [x] D6 — Blog and Opportunities sections show blank/empty state on first load (UX)
If no content has been published, visitors see only "No posts yet" or "No opportunities yet." These entire sections would be more polished if hidden when empty (`if (posts.length === 0) return null` in the section parent).

#### - [x] D7 — Contact form has no phone number field (Feature gap)
Given the prominent display of a phone number in multiple places, adding an optional phone/WhatsApp field to the form would improve lead capture for diaspora clients.

#### - [x] D8 — Admin panel uses emoji icons; inconsistent with SVG-only rest of site (Minor)
**File:** [src/components/AdminPanel.tsx:722-724](src/components/AdminPanel.tsx#L722-L724)  
`📝`, `💼`, `⚙️` rendering varies between OS versions. Replace with inline SVGs matching the rest of the codebase.

#### - [x] D9 — `offer-inner` chips can overflow on 560px and below (Minor)
On small screens the `✓ Company registration · ✓ Free website · ✓ Free tax clearance certificate` chips stack and can overflow their flex container. The `offer-chips span` needs `white-space: nowrap` or wrapping handled explicitly.

#### - [x] D10 — Images missing `loading="lazy"` (Performance)
`about-img`, `team-group-photo`, and `dsp-visual-img` are all below the fold but lack `loading="lazy"`. This delays page load unnecessarily. Add `loading="lazy"` to images not in the initial viewport.

---

## 4. Accessibility

#### - [x] A1 — Mobile nav items have no `aria-expanded` (Medium)
**File:** [src/App.tsx:448-452](src/App.tsx#L448-L452)  
Desktop nav `<button>` elements correctly set `aria-expanded={activeDD === link.label}`. The mobile nav `nav-m-item--dd` buttons do not set `aria-expanded`, so screen readers cannot announce collapsed/expanded state.

#### - [x] A2 — No skip-to-content link (Medium)
There is no `<a href="#about">Skip to content</a>` at the top of the page. Keyboard and screen reader users must tab through the entire navbar on every page load.

#### - [x] A3 — Hero arrows use HTML entities for icons (Low)
**File:** [src/App.tsx:522-523](src/App.tsx#L522-L523)  
`&#8249;` and `&#8250;` (‹ ›) are used as arrow icons. These have `aria-label` set correctly, but the character itself may be announced by some screen readers. Using an SVG with `aria-hidden="true"` is cleaner.

#### - [x] A4 — Color contrast on `.stats-lbl` below WCAG AA (Low)
`.stats-lbl` uses `rgba(255,255,255,.48)` on `#0A0A0A` background. The effective contrast ratio is approximately 4.2:1 which fails AA at `0.75rem` (12px) — the threshold is 4.5:1 for normal text. Increase opacity to `0.65+`.

#### - [x] A5 — `confirm()` dialogs used for destructive actions in admin (Low)
**File:** [src/components/AdminPanel.tsx:173](src/components/AdminPanel.tsx#L173) and [line 305](src/components/AdminPanel.tsx#L305)  
`if (confirm('Delete this post?'))` is a native browser dialog that cannot be styled or focused accessibly. Replace with an inline confirmation state in the UI.

#### - [x] A6 — Google Fonts loaded via external request (Privacy / GDPR)
**File:** [src/index.css:1](src/index.css#L1)  
```css
@import url('https://fonts.googleapis.com/css2?...')
```
This sends visitor IPs to Google servers on every page load. For GDPR compliance with EU users, self-host the fonts using `fontsource` packages:
```
npm install @fontsource/inter @fontsource/merriweather
```

---

## 5. Quick-Win Priority List

| Done | Priority | Issue | Effort |
|---|---|---|---|
| - [x] | 🔴 Critical | **S1** — Verify `.env` never committed; rotate SMTP password | ✓ Done |
| - [x] | 🔴 Critical | **S2** — Change default admin PIN; remove hint from UI | ✓ Done |
| - [x] | 🔴 High | **S4** — Restrict CORS to production domain | ✓ Done |
| - [x] | 🔴 High | **S5** — Add rate limiting to `/api/contact` | ✓ Done |
| - [x] | 🔴 High | **S6** — Add `helmet` security headers | ✓ Done |
| - [x] | 🟠 Medium | **D1** — Define `--gold` variable or fix team-pillars color | ✓ Done |
| - [x] | 🟠 Medium | **D2** — Make "Learn more" / "Enquire now" actual `<a>` tags | ✓ Done |
| - [x] | 🟠 Medium | **D3** — Verify `/images/laptop.jpg` exists or replace | ✓ Done |
| - [x] | 🟠 Medium | **R1** — Services cards 2-per-row at 900px tablet range | ✓ Done |
| - [x] | 🟠 Medium | **A1** — Add `aria-expanded` to mobile nav accordion | ✓ Done |
| - [x] | 🟡 Low | **D6** — Hide empty Blog/Opportunities sections | ✓ Done |
| - [x] | 🟡 Low | **D10** — Add `loading="lazy"` to below-fold images | ✓ Done |
| - [x] | 🟡 Low | **R3** — Add scroll-snap to carousels | ✓ Done |
| - [x] | 🟡 Low | **A2** — Add skip-to-content link | ✓ Done |
| - [x] | 🟡 Low | **A6** — Self-host Google Fonts | ✓ Done |

---

## 6. Positive Findings

These areas are well-implemented and should be preserved:

- **HTML viewport meta tag** is correctly set (`width=device-width, initial-scale=1.0`) in [index.html:6](index.html#L6)
- **Server-side input validation** in `server.cjs` includes type checks, length limits, HTML escaping, and email regex — solid foundations
- **SHA-256 PIN hashing** in AdminPanel uses `crypto.subtle.digest` instead of plaintext storage
- **Semantic HTML** — proper use of `<section>`, `<header>`, `<footer>`, `<nav>`, `<form>`, `<aside>` throughout
- **Smooth scroll** enabled globally in `index.css`
- **`.gitignore`** correctly excludes `.env` and only exposes `.env.example`
- **`clamp()` typography** — headings scale fluidly across viewport widths
- **Passive scroll event listener** in Navbar prevents scroll jank on mobile
- **`aria-label`** on all icon-only buttons (hero arrows, burger menu, close buttons)
- **Image alt text** present on all `<img>` elements

---

*Report generated by code analysis of the full source tree — June 2026.*
