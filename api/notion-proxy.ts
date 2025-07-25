import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const NOTION_TOKEN = process.env.NOTION_TOKEN;
  if (!NOTION_TOKEN) {
    res.status(500).json({ error: 'NOTION_TOKEN not set' });
    return;
  }

  const notionUrl = req.query.url as string;
  if (!notionUrl) {
    res.status(400).json({ error: 'Missing Notion API url in query parameter "url"' });
    return;
  }

  const notionApiUrl = `https://api.notion.com/v1/${notionUrl}`;

  try {
    const notionRes = await fetch(notionApiUrl, {
      method: req.method,
      headers: {
        'Authorization': `Bearer ${NOTION_TOKEN}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
        ...req.headers,
      },
      body: req.method !== 'GET' && req.body ? JSON.stringify(req.body) : undefined,
    });
    const data = await notionRes.json();
    res.status(notionRes.status).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Proxy error', details: error });
  }
} 