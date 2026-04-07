# Fotografo Santo Domingo - fotografosantodomingo.com

Professional photography website for Santo Domingo, Dominican Republic.

## 🚀 Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   - Copy `.env.local` and fill in your actual API keys
   - Update Supabase credentials
   - Add Google Analytics, Cloudinary, and other service keys

3. **Run development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

## 📁 Project Structure

```
src/
├── app/[locale]/
│   ├── layout.tsx      # Root layout with metadata
│   ├── page.tsx        # Home page
│   └── contact/
│       └── actions.ts  # Server actions for contact form
├── components/
│   └── seo/
│       └── JsonLd.ts   # Schema.org structured data
├── lib/
│   ├── supabase/
│   │   └── server.ts   # Supabase server client
│   └── utils/
│       └── constants.ts # Site constants
└── messages/           # Internationalization files
    ├── en.json
    └── es.json
```

## 🌐 Internationalization

The site supports English (`/en`) and Spanish (`/es`) with Spanish as the default locale.

## 🗄️ Database Schema

Create these tables in Supabase:

```sql
-- Inquiries table
CREATE TABLE inquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  service_id TEXT,
  location_id TEXT,
  message TEXT NOT NULL,
  preferred_date TIMESTAMPTZ,
  source_page TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 🚀 Deployment

### Vercel Setup

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Set build command: `npm run build`
4. Set output directory: `.next`

### DNS Configuration (Hostinger)

Add these records in Hostinger DNS panel:

```
Type: A
Host: @
Value: 76.76.21.21

Type: CNAME
Host: www
Value: vercel-dns.com
```

## 📊 Analytics & Monitoring

- **Google Analytics 4**: Set up GA4 property for fotografosantodomingo.com
- **Google Search Console**: Verify ownership and submit sitemap
- **Vercel Analytics**: Automatic with Vercel deployment

## 📧 Email & Communication

- **SendGrid**: For transactional emails
- **WhatsApp Business**: For customer communication
- **Setmore/Calendly**: For booking management

## 🖼️ Image Management

- **Cloudinary**: For image optimization and CDN
- Configure upload presets for different image types
- Set up transformations for gallery images

## 🔍 SEO Checklist

- [ ] Update all internal links to use new domain
- [ ] Submit sitemap to Google Search Console
- [ ] Set up Google My Business profile
- [ ] Update social media profiles
- [ ] Configure Google Analytics goals
- [ ] Test all forms and booking integrations

## 📞 Support

For questions about this setup, check the detailed domain migration guide in the project documentation.