# Proverb Frontend & Notion Proxy

A frontend application for collecting and browsing "wrong proverbs" - proverbs that are slightly or completely wrong, often mixing up different sayings in funny ways. The collection is maintained by three proverb lovers and stored in a Notion database.

## Features

- **Random Proverbs**: Display a random wrong proverb at the top with a reload button
- **Search**: Fuzzy search through all proverbs by text or author
- **Add New Proverbs**: User-friendly form to submit new wrong proverbs
- **Mobile-Optimized**: Responsive design tailored for software engineers and product managers (40+)
- **Notion Integration**: Syncs with a Notion database via secure API proxy
- **PIN Authentication**: Simple PIN-based access control with 30-day sessions

## Tech Stack

- **Frontend**: Vite + React + TypeScript + Tailwind CSS
- **Backend**: Vercel Serverless Function (Notion API proxy)
- **Authentication**: JWT tokens with PIN-based login
- **Database**: Notion Database
- **Deployment**: Vercel

## Setup

### 1. Clone and Install
```bash
git clone https://github.com/yourusername/proverb-frontend.git
cd proverb-frontend
npm run install-all
```

### 2. Development
```bash
npm run dev
```

### 3. Set up Environment Variables (Vercel)

1. Go to your project on [vercel.com](https://vercel.com/)
2. Open project settings ("Settings")
3. Select "Environment Variables"
4. Create these variables:
   - **Name:** `NOTION_TOKEN`
   - **Value:** Your Notion Integration Token (starting with `secret_...`)
   - **Name:** `NOTION_DATABASE_ID`  
   - **Value:** Your Notion Database ID (32-character string)
   - **Name:** `ACCESS_PIN`
   - **Value:** Your chosen PIN for access (e.g., `1234`)
   - **Name:** `JWT_SECRET`
   - **Value:** A secure random string for JWT signing (e.g., generate with `openssl rand -base64 32`)
   - **Environment:** `Production` and/or `Preview`
5. Save changes and redeploy

### 4. Finding your Notion Database ID

1. Open your Notion database in the browser
2. The URL looks like: `https://notion.so/workspace/DATABASE_ID?v=...`
3. Copy the 32-character string after the workspace name
4. Example: `https://notion.so/myworkspace/a1b2c3d4e5f6...` → Database ID is `a1b2c3d4e5f6...`

### 5. Notion Database Setup

Your Notion database should have these properties:
- **Spruch** (Text/Title) - The proverb text
- **Author** (Text) - Who said the wrong proverb
- **Created** (Date) - Creation timestamp (auto-generated)

### 6. Public Access

Once deployed to Vercel, anyone can access your app at `https://your-project.vercel.app`

Users will need to enter the PIN to access the proverb collection. The session will be valid for 30 days.

## API Endpoints

Once deployed, the following endpoints are available:

- **POST** `/api/auth` - Authenticate with PIN, returns JWT token
  ```json
  {
    "pin": "1234"
  }
  ```
- **GET** `/api/proverbs` - Fetch all proverbs from Notion (requires authentication)
- **POST** `/api/proverbs` - Add a new proverb to Notion (requires authentication)
  ```json
  {
    "text": "The early bird catches the worm, but the second mouse gets the cheese.",
    "author": "Anonymous Developer"
  }
  ```

## Project Structure

```
proverb-frontend/
├── frontend/           # React application
│   ├── src/
│   │   ├── App.tsx           # Main component with auth
│   │   ├── components/
│   │   │   └── LoginForm.tsx # PIN authentication form
│   │   ├── services/
│   │   │   └── api.ts        # API service with auth headers
│   │   └── ...
│   └── package.json
├── api/               # Vercel serverless functions
│   ├── auth.ts        # PIN authentication API
│   ├── proverbs.ts    # Main API for proverbs (protected)
│   ├── middleware/
│   │   └── auth.ts    # JWT verification middleware
│   ├── notion-proxy.ts # Generic Notion API proxy
│   └── package.json
├── README.md
└── package.json       # Root package.json
```

## Security

- PIN is stored as environment variable, not in code
- JWT tokens expire after 30 days
- All API endpoints are protected by authentication
- Notion tokens remain server-side only

## Contributing

This project is maintained by three proverb lovers who actively collect wrong proverbs. Feel free to contribute by adding more funny wrong proverbs! 