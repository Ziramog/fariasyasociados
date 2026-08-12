export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import connectDB from '@/config/database';
import User from '@/models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/utils/authOptions';

export async function GET() {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'superadmin') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const users = await User.find({}).sort({ createdAt: -1 }).select('-__v');

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error in /api/superadmin/users:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
