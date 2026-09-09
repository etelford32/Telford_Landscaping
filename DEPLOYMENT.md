# Deployment Guide - Telford Landscapes

## Quick Deploy to Vercel (Recommended)

Vercel is the fastest and easiest way to deploy this Next.js application.

### Option 1: Deploy via Vercel Dashboard (Easiest)

1. **Push your code to GitHub** (already done)
   ```bash
   git push origin claude/telford-landscapes-app-1FnHX
   ```

2. **Go to [Vercel](https://vercel.com)**
   - Sign in with your GitHub account
   - Click "Add New Project"
   - Import your `Telford_Landscaping` repository
   - Vercel will auto-detect Next.js settings
   - Click "Deploy"
   - Your site will be live in ~2 minutes!

3. **Custom Domain** (Optional)
   - In Vercel dashboard, go to your project settings
   - Click "Domains"
   - Add your custom domain (e.g., telfordlandscaping.com)
   - Follow DNS configuration instructions

### Option 2: Deploy via CLI

```bash
# Login to Vercel (one-time setup)
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

## Environment Variables

When deploying to production, add these environment variables in Vercel dashboard:

1. Go to Project Settings → Environment Variables
2. Add variables from `.env.example` as needed
3. Redeploy for changes to take effect

## Build Settings

Vercel auto-detects these settings from your Next.js project:

- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`
- **Development Command**: `npm run dev`

These are also configured in `vercel.json` for reference.

## Performance Optimizations

The app is already optimized for production:

✅ Static page generation (SSG) for fast loading
✅ Automatic image optimization
✅ Font optimization with Google Fonts
✅ CSS optimization with Tailwind
✅ SEO metadata configured
✅ Mobile-responsive design

## Post-Deployment

### 1. Test Your Site
- Visit your Vercel URL (e.g., telford-landscapes.vercel.app)
- Test on mobile and desktop
- Check all pages load correctly
- Verify contact form displays properly

### 2. SEO Configuration
- Submit sitemap to Google Search Console
- Set up Google Analytics (optional)
- Verify Open Graph tags for social sharing

### 3. Monitor Performance
- Use Vercel Analytics (free tier included)
- Monitor Core Web Vitals
- Check deployment logs for any issues

## Alternative Deployment Options

### Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
```

### Self-Hosted (Docker)

```dockerfile
# Dockerfile example
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/package*.json ./
RUN npm install --production
EXPOSE 3000
CMD ["npm", "start"]
```

### Traditional VPS (DigitalOcean, AWS EC2, etc.)

```bash
# Install Node.js on server
# Clone repository
git clone https://github.com/yourusername/Telford_Landscaping.git
cd Telford_Landscaping

# Install dependencies
npm install

# Build
npm run build

# Use PM2 for process management
npm install -g pm2
pm2 start npm --name "telford-landscapes" -- start
pm2 save
pm2 startup
```

## Continuous Deployment

Vercel automatically deploys:
- **Production**: When you push to `main` branch
- **Preview**: For every push to other branches (like your current branch)

### Setting Up Auto-Deploy

1. In Vercel dashboard, go to Project Settings
2. Click "Git" tab
3. Configure:
   - Production Branch: `main`
   - Preview Branches: All branches
4. Every git push will trigger a new deployment

## Domain Configuration

### Custom Domain Setup

1. **Buy a domain** (e.g., from Namecheap, GoDaddy, etc.)
2. **Add to Vercel**:
   - Project Settings → Domains
   - Add `telfordlandscaping.com` and `www.telfordlandscaping.com`
3. **Update DNS**:
   - Add A record: `76.76.21.21` (Vercel's IP)
   - Or CNAME: `cname.vercel-dns.com`
4. **Wait for SSL**: Vercel auto-provisions SSL certificates (free)

## Monitoring & Analytics

### Vercel Analytics (Recommended)
- Free tier: 2,500 events/month
- Upgrade for more: $10/month for 100k events
- Real User Monitoring (RUM)
- Core Web Vitals tracking

### Google Analytics
Add to `app/layout.tsx`:
```typescript
// Add Google Analytics script
<Script src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID" />
```

## Support

- **Vercel Documentation**: https://vercel.com/docs
- **Next.js Documentation**: https://nextjs.org/docs
- **Project Issues**: Check README.md for contact info

## Estimated Costs

- **Vercel Free Tier**: $0/month
  - Perfect for getting started
  - Includes custom domain, SSL, analytics
  - 100 GB bandwidth

- **Vercel Pro**: $20/month (when you need it)
  - Unlimited bandwidth
  - Advanced analytics
  - Team collaboration

## Current Status

✅ Repository ready for deployment
✅ Vercel CLI installed
✅ Configuration files created
✅ Build tested and passing
🎯 Ready to deploy!

**Next Step**: Run `vercel --prod` or deploy via Vercel dashboard!
