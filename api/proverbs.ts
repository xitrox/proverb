import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const NOTION_TOKEN = process.env.NOTION_TOKEN;
  const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

  if (!NOTION_TOKEN) {
    res.status(500).json({ error: 'NOTION_TOKEN environment variable not set' });
    return;
  }

  if (!NOTION_DATABASE_ID) {
    res.status(500).json({ error: 'NOTION_DATABASE_ID environment variable not set' });
    return;
  }

  const headers = {
    'Authorization': `Bearer ${NOTION_TOKEN}`,
    'Notion-Version': '2022-06-28',
    'Content-Type': 'application/json',
  };

  try {
    if (req.method === 'GET') {
      // Get all proverbs from Notion database
      const response = await fetch(`https://api.notion.com/v1/databases/${NOTION_DATABASE_ID}/query`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          page_size: 100,
          sorts: [
            {
              property: 'Created',
              direction: 'descending'
            }
          ]
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        res.status(response.status).json({ error: 'Failed to fetch from Notion', details: data });
        return;
      }

      // Transform Notion data to our format
      const proverbs = data.results.map((page: any) => ({
        id: page.id,
        text: page.properties.Title?.title?.[0]?.plain_text || '',
        author: page.properties.Author?.rich_text?.[0]?.plain_text || '',
        createdAt: page.properties.Created?.created_time || page.created_time
      }));

      res.status(200).json({ proverbs });

    } else if (req.method === 'POST') {
      // Add new proverb to Notion database
      const { text, author } = req.body;

      if (!text || !author) {
        res.status(400).json({ error: 'text and author are required' });
        return;
      }

      const response = await fetch('https://api.notion.com/v1/pages', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          parent: {
            database_id: NOTION_DATABASE_ID
          },
          properties: {
            Title: {
              title: [
                {
                  text: {
                    content: text
                  }
                }
              ]
            },
            Author: {
              rich_text: [
                {
                  text: {
                    content: author
                  }
                }
              ]
            }
          }
        })
      });

      const data = await response.json();

      if (!response.ok) {
        res.status(response.status).json({ error: 'Failed to create page in Notion', details: data });
        return;
      }

      // Transform response to our format
      const newProverb = {
        id: data.id,
        text: data.properties.Title?.title?.[0]?.plain_text || text,
        author: data.properties.Author?.rich_text?.[0]?.plain_text || author,
        createdAt: data.created_time
      };

      res.status(201).json({ proverb: newProverb });

    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error', details: error });
  }
} 