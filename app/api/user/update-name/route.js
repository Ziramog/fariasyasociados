import { NextResponse } from 'next/server';
import connectDB from '@/config/database';
import User from '@/models/User';
import { getSessionUser } from '@/utils/getSessionUser';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  await connectDB();
  const sessionUser = await getSessionUser();
  if (!sessionUser || !sessionUser.userId) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const { agentName } = await request.json();
    const trimmed = typeof agentName === 'string' ? agentName.trim() : '';

    await User.findByIdAndUpdate(sessionUser.userId, {
      $set: { agentName: trimmed || null },
    });

    return NextResponse.json({ success: true, agentName: trimmed || null });
  } catch (err) {
    console.error('[POST /api/user/update-name] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
