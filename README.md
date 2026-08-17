# BioLink — Personal Hub & Biolink Website

Minimal, modern, and lightning-fast BioLink website with a public visitor page and a full-featured password-protected Admin Dashboard.

## Features

- **Public Biolink Page (`/`)**:
  - 1:1 Circular profile avatar, name, and bio
  - Dynamic social media icon bar (X, Instagram, Threads, YouTube, Medium, Pinterest, Facebook)
  - Mixed stream of standalone links and expandable accordion category folders
  - Thumbnail Lightbox modal for high-res image previews
  - Soft Dark / Clean Light theme toggle with persistence
  - Real-time click tracking on link interactions

- **Admin Dashboard (`/admin`)**:
  - **Dashboard**: 8 KPI cards, quick actions, and quick-scan link overview
  - **Analytics**: Click Over Time interactive chart (7D, 30D, 90D) + Top 10 links leaderboard + safe Reset Analytics
  - **Link Management**: Add/Edit/Delete links, thumbnail uploads, category assignment, Active/Inactive switch
  - **Category Management**: Add/Edit categories, cascading active status, and child link preservation
  - **Overview**: Drag-and-drop mixed reorder (links & categories) with Framer Motion animations
  - **Customization**: Profile & social links editor with a **Live Interactive Mobile Device Preview**

## Admin Credentials

- **URL**: `/admin`
- **Default Password**: `051102`

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Open in browser
http://localhost:3000
```

## Deploy to Vercel

1. Push this repository to GitHub.
2. Go to [vercel.com](https://vercel.com) and click **"Add New..."** -> **"Project"**.
3. Import your GitHub repository (`biolink`).
4. Keep the default settings (Framework Preset: **Next.js**).
5. Click **"Deploy"**.

Your BioLink will be live within seconds!
