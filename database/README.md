# Database Setup Guide

This guide explains how to set up the Supabase database for fotografosantodomingo.com.

## Prerequisites

1. Supabase account and project
2. Database URL and API keys from Supabase dashboard

## Environment Variables

Add these to your `.env.local` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Email Configuration
SENDGRID_API_KEY=your_sendgrid_api_key
NEXT_PUBLIC_CONTACT_EMAIL=admin@fotografosantodomingo.com
```

## Database Schema Setup

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `database/schema.sql`
4. Run the SQL script

This will create all necessary tables, indexes, and Row Level Security policies.

## Tables Created

### contact_submissions
- Stores contact form submissions
- Includes validation and status tracking
- RLS enabled for admin access only

### newsletter_subscriptions
- Manages email newsletter subscriptions
- Handles unsubscribe/reactivation
- Users can manage their own subscriptions

### blog_posts
- Stores blog post data (for future CMS)
- SEO metadata and content in both languages
- Public read access for published posts

### analytics_events
- Tracks user interactions and events
- Supports campaign attribution
- Anonymous event logging

## API Routes

### POST /api/contact
- Handles contact form submissions
- Validates data and stores in database
- Sends notification email to admin

### POST /api/newsletter
- Manages newsletter subscriptions
- Handles unsubscribe via DELETE method
- Sends welcome emails

## Security Features

- Row Level Security (RLS) enabled on all tables
- Input validation and sanitization
- Rate limiting considerations (implement as needed)
- CORS headers configured for API routes

## Testing

After setup, test the contact form and newsletter signup to ensure:
1. Data is saved to Supabase
2. Emails are sent via SendGrid
3. No errors in application logs

## Maintenance

- Monitor database usage in Supabase dashboard
- Review contact submissions regularly
- Clean up old analytics data as needed
- Update email templates as required