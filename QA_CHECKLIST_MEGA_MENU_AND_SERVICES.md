# QA Checklist: Mega Menu + Service Landing Pages

## Scope
- Component: `src/components/Navigation.tsx`
- Routes:
  - `/[locale]/services`
  - `/[locale]/services/[service]`

## Devices
- Desktop: 1440x900
- Tablet: 1024x768
- Mobile: 390x844

## Browsers
- Chrome latest
- Safari latest
- Firefox latest

## Accessibility: Desktop Mega Menu
- Tab navigation reaches each top-level nav item.
- Arrow right/left moves between mega menu category buttons.
- Arrow down on a category opens panel and focuses first panel link.
- Arrow up/down cycles links inside the opened panel.
- Escape closes panel and returns focus to category trigger.
- `aria-expanded` updates correctly per category trigger.
- `aria-current="page"` appears only on current page link.
- Clicking outside closes open panel.

## Accessibility: Mobile Menu
- Opening menu traps focus inside mobile dialog.
- Shift+Tab/Tab cycles inside menu controls.
- Escape closes mobile menu.
- Background scroll is locked while menu is open.
- Closing menu restores focus to prior control.

## Functional: Navigation Links
- Service links resolve to landing pages (no 404):
  - `/es/services/wedding-photography`
  - `/es/services/portrait-photography`
  - `/es/services/event-photography`
  - `/es/services/commercial-photography`
  - `/es/services/family-photography`
  - `/es/services/drone-services-photography-punta-cana`
  - same for `/en/...`
- Legacy drone URLs redirect to service route:
  - `/es/drone-services-photography-punta-cana` -> `/es/services/drone-services-photography-punta-cana`
  - `/en/drone-services-photography-punta-cana` -> `/en/services/drone-services-photography-punta-cana`
- My Work and Portfolio links filter portfolio via category query.
- Info -> FAQ lands at `/[locale]/contact#faq` section.

## Service Landing Pages
- Invalid slug returns 404 under `/[locale]/services/[invalid]`.
- `h1` matches service title.
- Includes section renders full feature list.
- Investment section renders price and includes text.
- Related services cards link correctly.
- Internal links exist to `/[locale]/contact`, `/[locale]/portfolio`, `/[locale]/services`.

## SEO Checks
- Canonical URL format: no trailing slash.
- Hreflang has `es`, `en`, `x-default` for each service page.
- Open Graph URL/title/description match service page content.
- Breadcrumb JSON-LD present and localized labels.
- Run: `SEO_CHECK_INCLUDE_BLOG=0 npm run seo:check:canonical`

## Regression Checks
- `/[locale]/services` page still renders all cards and anchors.
- Legacy standalone drone page no longer exists as a dedicated route; it should redirect to `/[locale]/services/drone-services-photography-punta-cana`.
- Existing core pages unchanged: home, blog, portfolio, about, contact.

## Sign-off Template
- Date:
- Reviewer:
- Build/Commit:
- Result: PASS/FAIL
- Notes:
