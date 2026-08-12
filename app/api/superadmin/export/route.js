export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import connectDB from '@/config/database';
import Property from '@/models/Property';
import User from '@/models/User';
import BusinessInfo from '@/models/BusinessInfo';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/utils/authOptions';

export async function GET(request) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'superadmin') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json';

    const properties = await Property.find({}).lean();
    const users = await User.find({}).lean();
    const config = await BusinessInfo.findOne({}).lean();

    if (format === 'json') {
      const payload = {
        timestamp: new Date().toISOString(),
        properties,
        users,
        config
      };
      
      return new NextResponse(JSON.stringify(payload, null, 2), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': 'attachment; filename="backup_raw.json"',
        },
      });
    }

    if (format === 'csv') {
      // Create a CSV string from properties
      // Columns: ID, Name, Type, Status, Price, Location, Beds, Baths, URL
      const headers = ['ID', 'Nombre', 'Tipo', 'Estado', 'Moneda', 'Precio', 'Ciudad', 'Habitaciones', 'Baños'];
      
      const rows = properties.map(p => {
        return [
          p._id.toString(),
          `"${(p.name || '').replace(/"/g, '""')}"`,
          p.type || '',
          p.status || '',
          p.rates?.currency || '',
          p.rates?.price || '',
          `"${(p.location?.city || '').replace(/"/g, '""')}"`,
          p.beds || 0,
          p.baths || 0
        ].join(',');
      });

      const csvContent = [headers.join(','), ...rows].join('\n');

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="propiedades_export.csv"',
        },
      });
    }

    return new NextResponse('Invalid format', { status: 400 });

  } catch (error) {
    console.error('Error generating export:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
