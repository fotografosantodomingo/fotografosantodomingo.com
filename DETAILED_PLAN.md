# Detailed Action Plan for fotografosantodomingo.com - UPDATED

## Phase 1: Project Foundation ✅ COMPLETED
- [x] Create Next.js 14+ project structure
- [x] Set up TypeScript configuration
- [x] Configure Tailwind CSS
- [x] Install all dependencies
- [x] Set up internationalization (next-intl)
- [x] Create basic folder structure
- [x] Update all domain references to fotografosantodomingo.com
- [x] Configure next.config.js for new domain
- [x] Set up Vercel deployment config
- [x] Create environment variables template
- [x] Set up Supabase integration
- [x] Create basic layout and metadata
- [x] Generate sitemap and robots.txt
- [x] Set up schema.org structured data
- [x] Create contact form server actions
- [x] Start development server

## Phase 2: Core Infrastructure ✅ COMPLETED
- [x] Configure middleware for i18n routing
- [x] Set up global navigation component
- [x] Create footer component
- [x] Add WhatsApp floating button
- [x] Configure Google Analytics 4
- [x] Set up Google Tag Manager
- [x] Configure Cloudinary for images
- [x] Set up SendGrid for emails
- [x] Create error boundaries
- [x] Add loading states and skeletons

## Phase 3: Core Pages ✅ COMPLETED
- [x] Homepage - Hero, services preview, statistics, CTAs
- [x] Services Page - Detailed service offerings with pricing
- [x] Portfolio Page - Gallery with filtering and categories
- [x] About Page - Photographer story, achievements, testimonials

## Phase 4: Contact & Forms ✅ COMPLETED
- [x] Contact Page - Contact form with validation and integration
- [x] Form handling - Server actions for contact submissions
- [x] Email integration - SendGrid setup for notifications
- [x] Success/error pages - Form submission feedback

## Phase 5: Advanced Features ✅ COMPLETED
- [x] Blog system for SEO content - Blog listing page with filtering and search
- [x] Individual blog post pages with SEO optimization
- [x] Sample blog posts with photography tips and guides
- [x] Blog categories and tags system
- [x] Related posts functionality
- [x] Sitemap integration for blog posts
- [x] Internationalization support for blog content

## Phase 6: Database Integration ✅ COMPLETED
- [x] Set up Supabase database schema for contact forms and newsletter
- [x] Create API routes for contact form submissions
- [x] Implement newsletter subscription system
- [x] Set up image upload functionality with Cloudinary
- [x] Configure email notifications with SendGrid
- [x] Add database integration for blog posts (optional CMS)

## Phase 7: SEO & Performance Optimization 🔄 IN PROGRESS
- [ ] Build image gallery component
- [ ] Create booking integration (Setmore/Calendly)
- [ ] Add testimonial carousel
- [ ] Create service cards
- [ ] Build portfolio grid
- [ ] Add social media links
- [ ] Create newsletter signup
- [ ] Add cookie consent banner

## Phase 5: Database & Backend
- [ ] Set up Supabase database schema
- [ ] Create API routes for contact forms
- [ ] Add newsletter subscription
- [ ] Implement blog CMS
- [ ] Set up image upload to Cloudinary
- [ ] Configure email notifications

## Phase 6: SEO & Performance
- [ ] Optimize images and lazy loading
- [ ] Add meta tags and Open Graph
- [ ] Implement structured data (JSON-LD)
- [ ] Set up Google Search Console
- [ ] Configure Google My Business
- [ ] Add breadcrumbs navigation
- [ ] Optimize Core Web Vitals
- [ ] Set up performance monitoring

## Phase 7: Deployment & Launch
- [ ] Configure DNS in Hostinger
- [ ] Deploy to Vercel
- [ ] Set up SSL certificates
- [ ] Configure redirects from old domain
- [ ] Test all forms and integrations
- [ ] Set up monitoring and alerts
- [ ] Update social media profiles
- [ ] Submit sitemap to search engines

## Phase 8: Post-Launch Optimization
- [ ] Monitor analytics and user behavior
- [ ] A/B test key pages
- [ ] Optimize conversion funnels
- [ ] Update content based on performance
- [ ] Scale infrastructure as needed
- [ ] Add advanced features (booking system, etc.)

## Get Quote Plan (Current Database Only)

### Rule
- [x] Use only the existing Supabase project and current database.
- [x] Do not create a new database.

### Completed
- [x] Public page created: `src/app/[locale]/get-quote/page.tsx`.
- [x] Multi-step wizard created: `src/components/quote/GetQuoteWizard.tsx`.
- [x] API route created with service client: `src/app/api/quotes/route.ts`.
- [x] Quote schema migrations added in current DB migrations:
	- `supabase/migrations/20260412_006_create_quotes_system.sql`
	- `supabase/migrations/20260412_007_quote_participants_drone_step.sql`
- [x] Email notification + confirmation wired through Resend.
- [x] Verified current DB table works (`quotes` endpoint returns 200 with latest columns).

### Next Execution Steps
- [ ] Build internal admin quotes inbox page (`/admin/quotes`) to list/filter/update quote status.
- [ ] Add quote detail panel for internal notes, final price, and proposal expiration.
- [ ] Add status transition actions (`PENDING_REVIEW` -> `SENT_TO_CUSTOMER` -> `ACCEPTED/REJECTED`).
- [ ] Add server-side validation for phone format and stricter date checks.
- [ ] Add anti-spam controls (rate limit + honeypot field).
- [ ] Add analytics funnel events per step (`step_1_completed` ... `step_6_submitted`).
- [ ] Add integration tests for API route (`draft` and `final` payload paths).
- [ ] Add backoffice export endpoint (CSV) for accepted/rejected quote reporting.

### Final Validation Checklist
- [ ] Submit test quote in ES and EN.
- [ ] Confirm quote row is created/updated in current `quotes` table.
- [ ] Confirm admin and customer emails are delivered.
- [ ] Confirm no migration attempts target any external/new database.