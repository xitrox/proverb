# Proverb Frontend & Notion Proxy

A frontend application for collecting and browsing "wrong proverbs" - proverbs that are slightly or completely wrong, often mixing up different sayings in funny ways. The collection is maintained by three proverb lovers and stored in a Notion database.

## Features

- **Random Proverbs**: Display a random wrong proverb at the top with a reload button
- **Search**: Fuzzy search through all proverbs by text or author
- **Add New Proverbs**: User-friendly form to submit new wrong proverbs
- **Mobile-Optimized**: Responsive design tailored for software engineers and product managers (40+)
- **Notion Integration**: Syncs with a Notion database via secure API proxy

## Tech Stack

- **Frontend**: Vite + React + TypeScript + Tailwind CSS
- **Backend**: Vercel Serverless Function (Notion API proxy)
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

### 3. Set up Notion Integration (Vercel)

1. Go to your project on [vercel.com](https://vercel.com/)
2. Open project settings ("Settings")
3. Select "Environment Variables"
4. Create these variables:
   - **Name:** `NOTION_TOKEN`
   - **Value:** Your Notion Integration Token (starting with `secret_...`)
   - **Name:** `NOTION_DATABASE_ID`  
   - **Value:** Your Notion Database ID (32-character string)
   - **Environment:** `Production` and/or `Preview`
5. Save changes and redeploy

The tokens will be automatically used in the Serverless Functions and remain invisible to the frontend.

### 4. Finding your Notion Database ID

1. Open your Notion database in the browser
2. The URL looks like: `https://notion.so/workspace/DATABASE_ID?v=...`
3. Copy the 32-character string after the workspace name
4. Example: `https://notion.so/myworkspace/a1b2c3d4e5f6...` → Database ID is `a1b2c3d4e5f6...`

### 5. Notion Database Setup

Your Notion database should have these properties:
- **Title** (Text) - The proverb text
- **Author** (Text) - Who said the wrong proverb
- **Created** (Date) - Creation timestamp (auto-generated)

## API Endpoints

Once deployed, the following endpoints are available:

- **GET** `/api/proverbs` - Fetch all proverbs from Notion
- **POST** `/api/proverbs` - Add a new proverb to Notion
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
│   │   ├── App.tsx    # Main component
│   │   └── ...
│   └── package.json
├── api/               # Vercel serverless functions
│   ├── proverbs.ts    # Main API for proverbs
│   ├── notion-proxy.ts # Generic Notion API proxy
│   └── package.json
├── README.md
└── package.json       # Root package.json
```

## Contributing

This project is maintained by three proverb lovers who actively collect wrong proverbs. Feel free to contribute by adding more funny wrong proverbs! 