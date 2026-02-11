# AKATSUKI | Professional Esports Organization

<div align="center">

![AKATSUKI Banner](https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&h=300&fit=crop)

**The dawn of a new era in competitive gaming.**

[![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Powered-green?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

[Live Demo](#) • [Documentation](#) • [Report Bug](#) • [Request Feature](#)

</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
- [Project Structure](#-project-structure)
- [Development](#-development)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)
- [Contact](#-contact)

---

## 🌟 Overview

**AKATSUKI** is a cutting-edge esports organization platform built with modern web technologies. This Next.js application serves as the official website and management portal for the AKATSUKI esports team, featuring:

- A stunning, cyberpunk-inspired design with advanced animations
- Discord OAuth integration for seamless user authentication
- Comprehensive admin panel for team management
- Tournament organization and player recruitment systems
- Real-time notifications via Discord webhooks
- Newsletter integration with Loops.so

The platform is designed to provide a premium, high-performance experience that reflects the elite nature of competitive esports.

---

## ✨ Features

### 🎨 Front-End Experience

- **Dynamic Animations**: Powered by Anime.js for smooth, professional transitions
- **Responsive Design**: Fully mobile-optimized with Tailwind CSS
- **Custom Cursor Effects**: Interactive cursor with glow effects
- **Background Particle System**: Animated red lines that respond to scrolling
- **Glassmorphism UI**: Modern, semi-transparent card designs
- **3D Tilt Effects**: Mouse-responsive card tilting for enhanced interactivity

### 🔐 Authentication & Authorization

- **Discord OAuth 2.0**: Secure single sign-on via Discord
- **Role-Based Access Control**: Super Admin, Admin, and User roles
- **Session Management**: Secure JWT-based sessions with configurable expiry
- **Protected Routes**: Middleware-based route protection

### 👥 Admin Panel

- **Dashboard Analytics**: Real-time statistics and metrics
- **User Management**: View and manage user applications
- **Application Review System**: Accept/reject player applications with notes
- **Activity Logging**: Track all admin actions
- **Discord Integration**: Automatic notifications for admin actions

### 🏆 Tournament Management

- **Tournament Listings**: Showcase active and upcoming tournaments
- **Prize Pool Tracking**: Display total prize pools and individual tournament rewards
- **Registration System**: Handle tournament sign-ups (coming soon)
- **Live Status Updates**: Real-time tournament status indicators

### 📧 Communication

- **Newsletter System**: Integrated with Loops.so for email campaigns
- **Discord Notifications**: Webhook-based real-time updates
- **Contact Forms**: Direct communication channels for inquiries

### 🗄️ Database & Backend

- **Supabase Integration**: Postgres database with real-time capabilities
- **Type-Safe Queries**: TypeScript interfaces for all database models
- **Row-Level Security**: Secure data access policies
- **API Routes**: RESTful endpoints for all operations

---

## 🛠️ Tech Stack

### Core Framework
- **[Next.js 16.1.6](https://nextjs.org/)** - React framework with App Router
- **[React 18.2.0](https://reactjs.org/)** - UI component library
- **[TypeScript 5](https://www.typescriptlang.org/)** - Type-safe JavaScript

### Styling & Animation
- **[Tailwind CSS 3.4.1](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Anime.js 3.2.2](https://animejs.com/)** - JavaScript animation library
- **PostCSS** - CSS transformations

### Backend & Database
- **[Supabase](https://supabase.com/)** - Backend-as-a-Service (PostgreSQL)
- **Supabase Client 2.39.3** - JavaScript client library

### Authentication & Security
- **[Discord OAuth 2.0](https://discord.com/developers/docs/topics/oauth2)** - User authentication
- **[Jose 6.1.3](https://github.com/panva/jose)** - JWT operations
- **Custom middleware** - Route protection and session validation

### Third-Party Services
- **[Loops.so](https://loops.so/)** - Email marketing and newsletters
- **Discord Webhooks** - Real-time notifications

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript Compiler** - Static type checking

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher)
- **npm** or **yarn** package manager
- **Git** version control
- A **Discord Application** ([Create one here](https://discord.com/developers/applications))
- A **Supabase Project** ([Create one here](https://supabase.com/dashboard))
- A **Loops.so Account** (optional, for newsletters)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/akatsuki-esports.git
   cd akatsuki-esports/akatsuki-nextjs
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory (see [Environment Variables](#environment-variables) section below)

4. **Set up the database**

   Run the Supabase migrations (schema available in the project):

   ```sql
   -- Create profiles table
   create table profiles (
     id text primary key,
     discord_id text unique not null,
     username text not null,
     discriminator text,
     avatar text,
     email text,
     role text default 'user',
     created_at timestamptz default now(),
     updated_at timestamptz default now()
   );

   -- Create applications table
   create table applications (
     id uuid primary key default uuid_generate_v4(),
     user_id text references profiles(id),
     game text not null,
     rank text not null,
     experience text not null,
     availability text not null,
     additional_info text,
     status text default 'pending',
     notes text,
     reviewed_by text references profiles(id),
     created_at timestamptz default now(),
     updated_at timestamptz default now()
   );

   -- Create indexes
   create index profiles_discord_id_idx on profiles(discord_id);
   create index applications_user_id_idx on applications(user_id);
   create index applications_status_idx on applications(status);

   -- Enable Row Level Security
   alter table profiles enable row level security;
   alter table applications enable row level security;

   -- Create policies (customize as needed)
   create policy "Public profiles are viewable by everyone"
     on profiles for select
     using (true);

   create policy "Users can update own profile"
     on profiles for update
     using (auth.uid() = id);
   ```

5. **Run the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. **Open the application**

   Navigate to [http://localhost:3000](http://localhost:3000) in your browser

### Environment Variables

Create a `.env.local` file in the project root with the following variables:

```env
# Discord OAuth Configuration
# Get these from Discord Developer Portal: https://discord.com/developers/applications
NEXT_PUBLIC_DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
NEXT_PUBLIC_DISCORD_REDIRECT_URI=http://localhost:3000/api/auth/callback

# Session Configuration
# Generate a random secret with: openssl rand -base64 32
AUTH_SECRET=your_random_secret_key
SESSION_MAX_AGE=604800  # 7 days in seconds

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Admin Configuration
# Comma-separated list of Discord user IDs with admin access
# First ID will be Super Admin, others will be regular Admins
ADMIN_USER_IDS=discord_user_id_1,discord_user_id_2

# Supabase Configuration
# Get these from: https://supabase.com/dashboard/project/_/settings/api
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Discord Webhook for Notifications (Optional)
# Create a webhook in your Discord server: Server Settings > Integrations > Webhooks
DISCORD_WEBHOOK_URL=your_discord_webhook_url

# Loops.so (Newsletter) - Optional
LOOPS_API_KEY=your_loops_api_key

# Production URLs (update when deploying)
# NEXT_PUBLIC_DISCORD_REDIRECT_URI=https://yourdomain.com/api/auth/callback
# NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

#### How to Get Your Discord Application Credentials

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name
3. Navigate to "OAuth2" in the sidebar
4. Copy your **Client ID** and **Client Secret**
5. Add `http://localhost:3000/api/auth/callback` to the **Redirects** list
6. Under "OAuth2 URL Generator", select scopes: `identify`, `email`, `guilds`

#### How to Get Your Discord User ID

1. Enable Developer Mode in Discord (User Settings > Advanced > Developer Mode)
2. Right-click your username and select "Copy ID"

---

## 📁 Project Structure

```
akatsuki-nextjs/
├── app/                          # Next.js App Router
│   ├── admin/                    # Admin panel routes
│   │   ├── applications/         # Application management
│   │   ├── content/              # Content management
│   │   ├── users/                # User management
│   │   ├── layout.tsx            # Admin layout wrapper
│   │   └── page.tsx              # Admin dashboard
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication endpoints
│   │   │   ├── callback/         # OAuth callback handler
│   │   │   ├── login/            # Login initiation
│   │   │   ├── logout/           # Logout handler
│   │   │   └── session/          # Session validation
│   │   ├── applications/         # Application CRUD
│   │   ├── newsletter/           # Newsletter subscription
│   │   └── contact/              # Contact form handler
│   ├── apply/                    # Player application form
│   ├── globals.css               # Global styles and animations
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
│
├── components/                   # React components
│   ├── admin/                    # Admin-specific components
│   │   ├── AdminSidebar.tsx      # Admin navigation
│   │   ├── ApplicationActions.tsx # Application action buttons
│   │   ├── ApplicationsList.tsx  # Applications table
│   │   └── StatsCard.tsx         # Dashboard statistics
│   ├── AuthProvider.tsx          # Authentication context
│   ├── BackgroundEffects.tsx     # Animated background particles
│   ├── Contact.tsx               # Contact section
│   ├── CustomCursor.tsx          # Custom cursor effect
│   ├── DiscordLoginButton.tsx    # Discord OAuth button
│   ├── Footer.tsx                # Site footer
│   ├── Hero.tsx                  # Hero section
│   ├── JoinTeam.tsx              # Recruitment CTA
│   ├── Mission.tsx               # About/Mission section
│   ├── Navbar.tsx                # Navigation bar
│   ├── Newsletter.tsx            # Newsletter subscription
│   ├── OperationalExcellence.tsx # Capabilities showcase
│   ├── PlayerRoster.tsx          # Team roster (coming soon)
│   ├── ProtectedRoute.tsx        # Route protection HOC
│   ├── Tournaments.tsx           # Tournament listings
│   └── UserAvatar.tsx            # User avatar component
│
├── lib/                          # Utility functions and configs
│   ├── admin-auth.ts             # Admin authorization utilities
│   ├── admin-roles.ts            # Role-based permissions
│   ├── date-utils.ts             # Date formatting helpers
│   ├── db.ts                     # Database operations
│   ├── discord-auth.ts           # Discord OAuth handlers
│   ├── discord-notifications.ts  # Discord webhook utilities
│   ├── session.ts                # Session management
│   ├── supabase-admin.ts         # Supabase admin client
│   └── supabase.ts               # Supabase client and types
│
├── public/                       # Static assets
│   └── favicon.svg               # Site favicon
│
├── scripts/                      # Utility scripts
│
├── .env.local                    # Environment variables (not in git)
├── .gitignore                    # Git ignore rules
├── next.config.js                # Next.js configuration
├── package.json                  # Project dependencies
├── postcss.config.js             # PostCSS configuration
├── tailwind.config.js            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
└── README.md                     # This file
```

---

## 💻 Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linter
npm run lint

# Type check
npx tsc --noEmit
```

### Code Style

This project uses:
- **ESLint** for JavaScript/TypeScript linting
- **Prettier** for code formatting (recommended)
- **TypeScript strict mode** for type safety

### Adding New Features

1. **Components**: Add new components to `/components` directory
2. **Pages**: Create new routes in `/app` directory following Next.js App Router conventions
3. **API Routes**: Add API endpoints in `/app/api` directory
4. **Database Models**: Update TypeScript types in `/lib/supabase.ts`
5. **Utilities**: Add helper functions to `/lib` directory

### Database Schema Updates

When modifying the database schema:

1. Update the Supabase tables via the Supabase Dashboard or SQL editor
2. Update TypeScript interfaces in `/lib/supabase.ts`
3. Regenerate types if using Supabase CLI: `npx supabase gen types typescript --project-id [PROJECT_ID]`

### Animation Guidelines

- Use `anime.js` for complex animations
- Use Tailwind CSS transitions for simple hover effects
- Ensure animations respect `prefers-reduced-motion` media query
- Test animations on low-end devices for performance

---

## 🚢 Deployment

### Vercel (Recommended)

1. **Push to GitHub**

   ```bash
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your repository
   - Configure environment variables from `.env.local`

3. **Update Discord OAuth**
   - Add production URL to Discord OAuth redirects
   - Update `NEXT_PUBLIC_DISCORD_REDIRECT_URI` and `NEXT_PUBLIC_APP_URL`

4. **Deploy**
   - Vercel will automatically build and deploy
   - Production URL: `https://your-project.vercel.app`

### Other Platforms

This Next.js application can be deployed to:
- **Netlify**: Follow [Next.js on Netlify guide](https://docs.netlify.com/integrations/frameworks/next-js/)
- **Railway**: Use the Next.js template
- **DigitalOcean App Platform**: Deploy from GitHub
- **AWS Amplify**: Configure build settings for Next.js

### Environment Variables in Production

Ensure all environment variables are set in your hosting platform:
- Update OAuth redirect URLs to production domain
- Use production Supabase credentials
- Generate new `AUTH_SECRET` for production

---

## 🤝 Contributing

We welcome contributions to the AKATSUKI project! Here's how you can help:

### Reporting Bugs

1. Check existing issues to avoid duplicates
2. Use the bug report template
3. Include steps to reproduce, expected behavior, and screenshots

### Suggesting Features

1. Open an issue with the feature request template
2. Describe the feature and its benefits
3. Include mockups or examples if possible

### Pull Requests

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
   - Follow the existing code style
   - Add comments for complex logic
   - Update documentation as needed
4. **Test thoroughly**
   - Ensure no TypeScript errors
   - Test in multiple browsers
   - Check mobile responsiveness
5. **Commit your changes**
   ```bash
   git commit -m "feat: add amazing feature"
   ```
6. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**
   - Use the PR template
   - Link related issues
   - Request review from maintainers

### Code of Conduct

- Be respectful and inclusive
- Accept constructive criticism
- Focus on what's best for the community
- Show empathy towards other contributors

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 AKATSUKI Esports

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 📞 Contact

**AKATSUKI Esports Team**

- **Website**: [https://akatsuki-esports.com](#)
- **Discord**: [Join our server](#)
- **Twitter**: [@AkatsukiEsports](#)
- **Email**: contact@akatsuki-esports.com

### Maintainers

- **Project Lead**: [@yourusername](https://github.com/yourusername)
- **Lead Developer**: [@yourusername](https://github.com/yourusername)

---

## 🙏 Acknowledgments

- **[Next.js Team](https://nextjs.org/)** - For the amazing React framework
- **[Vercel](https://vercel.com/)** - For hosting and deployment platform
- **[Supabase](https://supabase.com/)** - For the backend infrastructure
- **[Tailwind CSS](https://tailwindcss.com/)** - For the utility-first CSS framework
- **[Anime.js](https://animejs.com/)** - For the animation library
- **[Unsplash](https://unsplash.com/)** - For high-quality images
- **Discord** - For OAuth and community platform

---

## 🗺️ Roadmap

### Phase 1: Core Features (Current)
- [x] Main website with all sections
- [x] Discord OAuth integration
- [x] Admin panel
- [x] Application system
- [x] Newsletter integration

### Phase 2: Enhancement (Q2 2024)
- [ ] Player roster management
- [ ] Tournament registration system
- [ ] Match scheduling
- [ ] Performance analytics dashboard
- [ ] Live stream integration

### Phase 3: Community (Q3 2024)
- [ ] User profiles and statistics
- [ ] Team leaderboards
- [ ] Community forums
- [ ] Achievement system
- [ ] Merchandise store

### Phase 4: Advanced Features (Q4 2024)
- [ ] Mobile application
- [ ] AI-powered player scouting
- [ ] Advanced analytics and insights
- [ ] Multi-language support
- [ ] API for third-party integrations

---

<div align="center">

**Made with ❤️ by the AKATSUKI Team**

⭐ Star us on GitHub — it motivates us a lot!

[Back to Top](#akatsuki--professional-esports-organization)

</div>
