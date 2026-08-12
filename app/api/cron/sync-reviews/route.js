import { NextResponse } from 'next/server';
import { syncReviews } from '@/lib/sync/sync-reviews';

function validateCronRequest(request) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return false;
  const vercelCronHeader = request.headers.get('x-vercel-cron');
  return authHeader === `Bearer ${cronSecret}` || vercelCronHeader === '1';
}

export async function GET(request) {
  if (!validateCronRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  console.log('[CronJob] Iniciando sync de reviews...');
  const result = await syncReviews();
  console.log(`[CronJob] Sync: ${result.inserted} nuevas, ${result.updated} actualizadas`);

  return NextResponse.json({ success: true, result }, { status: 200 });
}
