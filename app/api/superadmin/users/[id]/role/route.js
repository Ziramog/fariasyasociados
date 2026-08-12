import { NextResponse } from 'next/server';
import connectDB from '@/config/database';
import User from '@/models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/utils/authOptions';

export async function PATCH(request, { params }) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'superadmin') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { role } = body;

    if (!['user', 'admin', 'superadmin'].includes(role)) {
      return new NextResponse('Invalid role', { status: 400 });
    }

    const user = await User.findById(id);
    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    // Prevent changing other superadmins
    if (user.role === 'superadmin') {
      return new NextResponse('Cannot modify superadmin role', { status: 403 });
    }

    user.role = role;
    await user.save();

    return NextResponse.json({ message: 'Role updated successfully', user });
  } catch (error) {
    console.error('Error updating user role:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
