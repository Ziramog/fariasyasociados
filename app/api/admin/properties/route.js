import { NextResponse } from 'next/server';
import connectDB from '@/config/database';
import Property from '@/models/Property';
import { convertToSerializeableObject } from '@/utils/convertToObject';

export const dynamic = 'force-dynamic';

export async function GET() {
  await connectDB();
  const properties = await Property.find({}).sort({ name: 1 }).lean();
  const serialized = properties.map(p => ({
    ...convertToSerializeableObject(p),
    images: (p.images || []).map(i => typeof i === 'string' ? { url: i } : i),
  }));
  return NextResponse.json(serialized);
}
