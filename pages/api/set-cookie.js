import { serialize } from 'cookie';

export default function handler(req, res) {
  const timestamp = new Date().toISOString();
  
  // Set the cookie
  res.setHeader('Set-Cookie', serialize('httpOnlyTestTimestamp', timestamp, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: '/',
  }));

  res.status(200).json({ message: 'HTTP-only cookie set successfully' });
}