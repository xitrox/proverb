import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import { setCorsHeaders, handleCorsPreFlight } from './middleware/cors';

const ACCESS_PIN = process.env.ACCESS_PIN || '1234'; // Set this in Vercel environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'; // Set this in Vercel environment variables

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);

  if (handleCorsPreFlight(req, res)) {
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { pin } = req.body;

  if (!pin) {
    res.status(400).json({ error: 'PIN is required' });
    return;
  }

  if (pin !== ACCESS_PIN) {
    res.status(401).json({ error: 'Invalid PIN' });
    return;
  }

  // Create JWT token valid for 30 days
  const token = jwt.sign(
    { authenticated: true },
    JWT_SECRET,
    { expiresIn: '30d' }
  );

  res.status(200).json({ 
    success: true, 
    token,
    expiresIn: 30 * 24 * 60 * 60 * 1000 // 30 days in milliseconds
  });
} 