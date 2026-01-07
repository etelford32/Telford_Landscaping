# Telford Landscapes

A modern landscape design and service platform for Telford Projects LLC, featuring local handyman and landscaping services with plans for advanced 3D design tools.

## Project Overview

**Company**: Telford Projects LLC
**Service Area**: Auburn, Roseville, Granite Bay, Lincoln, Loomis (California)
**App Name**: Telford Landscapes
**Premium Tier**: Telford Landscapes PRO ($15/month - Coming Soon)

## Current Features (Phase 1)

- SEO-optimized landing page
- Professional portfolio showcase
- Service area highlights
- Contact form for consultations
- Responsive design for all devices
- Fast, modern web application

## Planned Features

### Phase 2: Authentication & Subscriptions
- User registration and authentication
- Free and PRO tier subscriptions ($15/month)
- Automated email system for subscribers
- Payment integration with Stripe

### Phase 3: 3D Design Tools (PRO Feature)
- iPhone 3D mapping integration
- Photo upload for yard visualization
- 3D plant library (native CA plants, general landscaping plants)
- Interactive 3D design interface
- Design sharing with professionals

### Phase 4: Professional Services
- Design consultation booking
- Installation quote requests
- Project management
- Nationwide design services
- California installation services

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Deployment**: Ready for Vercel, Netlify, or any Node.js host

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
Telford_Landscaping/
├── app/
│   ├── layout.tsx          # Root layout with navigation
│   ├── page.tsx            # Landing page
│   ├── portfolio/
│   │   └── page.tsx        # Portfolio page
│   └── globals.css         # Global styles
├── components/
│   ├── Navigation.tsx      # Header navigation
│   └── Footer.tsx          # Footer component
├── public/                 # Static assets (add images here)
└── PROJECT_OUTLINE.md      # Detailed project roadmap
```

## Adding Content

### Adding Portfolio Projects

Edit `/app/portfolio/page.tsx` and modify the `projects` array:

```typescript
const projects: Project[] = [
  {
    id: 1,
    title: "Your Project Title",
    location: "City, CA",
    date: "Season Year",
    category: "Landscape Design",
    description: "Project description...",
    features: ["Feature 1", "Feature 2"],
    imageColor: "from-green-400 to-emerald-600",
  },
  // Add more projects...
];
```

### Adding Images

1. Place images in the `/public` folder
2. Update components to use Next.js Image component
3. Configure image domains in `next.config.ts` if using external images

## SEO Optimization

The site is optimized for:
- Local search (Auburn, Roseville, Granite Bay, Lincoln, Loomis)
- Landscaping keywords
- Service-specific searches
- Fast page load times
- Mobile-first responsive design

## Compliance

- California state law compliant
- Business license: Telford Projects LLC
- Contractor license: Pending

## Contact

For more information about services, visit the website or contact:
- Email: info@telfordlandscapes.com
- Service Area: Greater Sacramento Area, California

## License

© 2026 Telford Projects LLC. All rights reserved.
