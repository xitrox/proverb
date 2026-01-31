import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyToken, extractTokenFromRequest } from './middleware/auth';
import { setCorsHeaders, handleCorsPreFlight } from './middleware/cors';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);

  if (handleCorsPreFlight(req, res)) {
    return;
  }

  // Check authentication
  const token = extractTokenFromRequest(req.headers.authorization);
  if (!token || !verifyToken(token)) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  const NOTION_TOKEN = process.env.NOTION_TOKEN;
  const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

  console.log('API called with method:', req.method);
  console.log('Database ID exists:', !!NOTION_DATABASE_ID);
  console.log('Token exists:', !!NOTION_TOKEN);

  if (!NOTION_TOKEN) {
    console.error('NOTION_TOKEN not set');
    res.status(500).json({ error: 'NOTION_TOKEN environment variable not set' });
    return;
  }

  if (!NOTION_DATABASE_ID) {
    console.error('NOTION_DATABASE_ID not set');
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
      console.log('Fetching from database:', NOTION_DATABASE_ID);
      
      const response = await fetch(`https://api.notion.com/v1/databases/${NOTION_DATABASE_ID}/query`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          page_size: 100
          // Removed sorting to avoid 400 error if "Created" property doesn't exist
        })
      });

      const data = await response.json();
      
      console.log('Notion response status:', response.status);
      console.log('Notion response data:', JSON.stringify(data, null, 2));
      
      if (!response.ok) {
        console.error('Notion API error:', data);
        res.status(response.status).json({ 
          error: 'Failed to fetch from Notion', 
          details: data,
          notionStatus: response.status 
        });
        return;
      }

      // Transform Notion data to our format - handle different property structures
      const proverbs = data.results.map((page: any, index: number) => {
        console.log(`Processing page ${index}:`, JSON.stringify(page.properties, null, 2));
        
        // Try different possible property names and structures
        let text = '';
        let author = '';
        
        // Try to extract text from various possible property names
        if (page.properties.Title?.title?.[0]?.plain_text) {
          text = page.properties.Title.title[0].plain_text;
        } else if (page.properties.Name?.title?.[0]?.plain_text) {
          text = page.properties.Name.title[0].plain_text;
        } else if (page.properties.Spruch?.title?.[0]?.plain_text) {
          text = page.properties.Spruch.title[0].plain_text;
        } else if (page.properties.Spruch?.rich_text?.[0]?.plain_text) {
          text = page.properties.Spruch.rich_text[0].plain_text;
        } else if (page.properties.Text?.rich_text?.[0]?.plain_text) {
          text = page.properties.Text.rich_text[0].plain_text;
        } else if (page.properties.Proverb?.rich_text?.[0]?.plain_text) {
          text = page.properties.Proverb.rich_text[0].plain_text;
        }
        
        // Try to extract author from various possible property names
        if (page.properties.Author?.rich_text?.[0]?.plain_text) {
          author = page.properties.Author.rich_text[0].plain_text;
        } else if (page.properties.Author?.title?.[0]?.plain_text) {
          author = page.properties.Author.title[0].plain_text;
        } else if (page.properties.Creator?.rich_text?.[0]?.plain_text) {
          author = page.properties.Creator.rich_text[0].plain_text;
        }

        return {
          id: page.id,
          text: text || 'Unknown proverb',
          author: author || 'Unknown author',
          createdAt: page.properties.Created?.created_time || page.created_time
        };
      });

      console.log('Transformed proverbs:', proverbs);
      res.status(200).json({ proverbs });

    } else if (req.method === 'POST') {
      // Add new proverb to Notion database
      const { text, author } = req.body;

      console.log('Adding proverb:', { text, author });

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
            Spruch: {
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

      console.log('Create page response status:', response.status);
      console.log('Create page response data:', JSON.stringify(data, null, 2));

      if (!response.ok) {
        console.error('Failed to create page:', data);
        res.status(response.status).json({ 
          error: 'Failed to create page in Notion', 
          details: data,
          notionStatus: response.status 
        });
        return;
      }

      // Transform response to our format
      const newProverb = {
        id: data.id,
        text: data.properties.Spruch?.title?.[0]?.plain_text || text,
        author: data.properties.Author?.rich_text?.[0]?.plain_text || author,
        createdAt: data.created_time
      };

      console.log('Successfully created proverb:', newProverb);
      res.status(201).json({ proverb: newProverb });

    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : String(error)
    });
  }
} 