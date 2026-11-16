import { db, isDemo } from '@/lib/db';
export async function GET() {
  try {
    if (!isDemo()) await db.query('SELECT id FROM products LIMIT 1');
    return Response.json({ status: 'ok', mode: isDemo() ? 'demo' : 'live' });
  } catch {
    return Response.json({ status: 'unavailable' }, { status: 503 });
  }
}
