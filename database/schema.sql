-- Database schema for fotografosantodomingo.com
-- Run this in Supabase SQL Editor

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create contact_submissions table
CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,

  -- Contact form fields
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  service TEXT,
  message TEXT NOT NULL,
  event_date DATE,
  location TEXT,

  -- Additional metadata
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  locale TEXT DEFAULT 'en',

  -- Status tracking
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'responded', 'archived')),
  responded_at TIMESTAMP WITH TIME ZONE,
  response_notes TEXT,

  -- Constraints
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Create newsletter_subscriptions table
CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,

  -- Subscription details
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  locale TEXT DEFAULT 'en',
  interests TEXT[], -- Array of interests: ['weddings', 'portraits', 'commercial', 'tips']

  -- Subscription status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed', 'bounced')),
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  unsubscribe_reason TEXT,

  -- Source tracking
  source TEXT DEFAULT 'website', -- website, blog, social, referral
  referrer TEXT,

  -- Constraints
  CONSTRAINT valid_newsletter_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Create blog_posts table (for future CMS functionality)
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,

  -- Content
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  title_es TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  excerpt_es TEXT NOT NULL,
  content TEXT NOT NULL,
  content_es TEXT NOT NULL,

  -- Metadata
  author TEXT DEFAULT 'Babula Shots',
  published_at TIMESTAMP WITH TIME ZONE,
  category TEXT NOT NULL,
  tags TEXT[],
  featured BOOLEAN DEFAULT false,

  -- SEO
  seo_title TEXT,
  seo_title_es TEXT,
  seo_description TEXT,
  seo_description_es TEXT,
  seo_keywords TEXT[],
  seo_keywords_es TEXT[],

  -- Media
  featured_image TEXT,
  reading_time INTEGER DEFAULT 5,

  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published BOOLEAN DEFAULT false
);

-- Create analytics_events table (for tracking)
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,

  -- Event data
  event_type TEXT NOT NULL, -- page_view, contact_form_submit, newsletter_signup, etc.
  event_data JSONB,

  -- User/context data
  user_id TEXT, -- For future user system
  session_id TEXT,
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  url TEXT,
  locale TEXT DEFAULT 'en',

  -- Campaign tracking
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_term TEXT,
  utm_content TEXT
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON contact_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_email ON contact_submissions(email);

CREATE INDEX IF NOT EXISTS idx_newsletter_subscriptions_email ON newsletter_subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscriptions_status ON newsletter_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscriptions_created_at ON newsletter_subscriptions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);

-- Enable Row Level Security (RLS)
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for contact_submissions
CREATE POLICY "Allow anonymous contact form submissions" ON contact_submissions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated users to view contact submissions" ON contact_submissions
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update contact submissions" ON contact_submissions
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Create RLS policies for newsletter_subscriptions
CREATE POLICY "Allow anonymous newsletter signups" ON newsletter_subscriptions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow users to manage their own subscriptions" ON newsletter_subscriptions
  FOR SELECT USING (email = auth.jwt() ->> 'email');

CREATE POLICY "Allow users to update their own subscriptions" ON newsletter_subscriptions
  FOR UPDATE USING (email = auth.jwt() ->> 'email');

CREATE POLICY "Allow authenticated users to view all subscriptions" ON newsletter_subscriptions
  FOR SELECT USING (auth.role() = 'authenticated');

-- Create RLS policies for blog_posts
CREATE POLICY "Allow public read access to published posts" ON blog_posts
  FOR SELECT USING (published = true);

CREATE POLICY "Allow authenticated users to manage blog posts" ON blog_posts
  FOR ALL USING (auth.role() = 'authenticated');

-- Create RLS policies for analytics_events
CREATE POLICY "Allow anonymous analytics event creation" ON analytics_events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated users to view analytics" ON analytics_events
  FOR SELECT USING (auth.role() = 'authenticated');

-- Create functions for updating updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_contact_submissions_updated_at
  BEFORE UPDATE ON contact_submissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_newsletter_subscriptions_updated_at
  BEFORE UPDATE ON newsletter_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create a function to get blog posts with pagination
CREATE OR REPLACE FUNCTION get_blog_posts(
  page_limit INTEGER DEFAULT 10,
  page_offset INTEGER DEFAULT 0,
  post_category TEXT DEFAULT NULL,
  search_query TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  slug TEXT,
  title TEXT,
  title_es TEXT,
  excerpt TEXT,
  excerpt_es TEXT,
  author TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  category TEXT,
  tags TEXT[],
  featured BOOLEAN,
  featured_image TEXT,
  reading_time INTEGER,
  seo_title TEXT,
  seo_title_es TEXT,
  seo_description TEXT,
  seo_description_es TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    bp.id,
    bp.slug,
    bp.title,
    bp.title_es,
    bp.excerpt,
    bp.excerpt_es,
    bp.author,
    bp.published_at,
    bp.category,
    bp.tags,
    bp.featured,
    bp.featured_image,
    bp.reading_time,
    bp.seo_title,
    bp.seo_title_es,
    bp.seo_description,
    bp.seo_description_es
  FROM blog_posts bp
  WHERE bp.published = true
    AND (post_category IS NULL OR bp.category = post_category)
    AND (search_query IS NULL OR
         bp.title ILIKE '%' || search_query || '%' OR
         bp.title_es ILIKE '%' || search_query || '%' OR
         bp.excerpt ILIKE '%' || search_query || '%' OR
         bp.excerpt_es ILIKE '%' || search_query || '%' OR
         EXISTS (SELECT 1 FROM unnest(bp.tags) AS tag WHERE tag ILIKE '%' || search_query || '%'))
  ORDER BY bp.published_at DESC
  LIMIT page_limit
  OFFSET page_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;