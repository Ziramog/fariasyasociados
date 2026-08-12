export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import Property from '@/models/Property';
import connectDB from '@/config/database';

const CORDOBA_CITIES = [
  'Alta Gracia', 'Anisacate', 'Despeñaderos', 'Falda del Carmen',
  'Huerta Grande', 'La Ladera', 'Los Aromitos', 'Maipaño', 'Malagueño',
  'Potrero de Garay', 'Rafael García', 'San Clemente', 'Santa Elena',
  'Tío Pujio', 'Toledo', 'Valle de Anisacate', 'Villa General Belgrano',
  'Villa La Bolsa', 'Villa Los Hornos', 'Villa Quara', 'Villa Serrano',
  'Córdoba Capital', 'Villa Carlos Paz', 'Cosquín', 'Unquillo',
  'Mendiolaza', 'Jesús María', 'Colonia Caroya', 'Saldán',
];

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    if (search.length < 2) {
      return NextResponse.json({ results: [] });
    }

    const lowerSearch = search.toLowerCase();

    // Match cities from the hardcoded list
    const matchedFromList = CORDOBA_CITIES.filter((city) =>
      city.toLowerCase().includes(lowerSearch)
    ).map((city) => ({ label: city, value: city }));

    // Also search in property cities from DB
    const dbCities = await Property.distinct('location.city', {
      'location.city': { $regex: search, $options: 'i' },
    });

    const dbResults = dbCities
      .filter((city) => !matchedFromList.some((m) => m.label === city))
      .map((city) => ({ label: city, value: city }));

    const allResults = [...matchedFromList, ...dbResults].slice(0, 10);

    return NextResponse.json(
      { results: allResults },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=43200',
        },
      }
    );
  } catch (error) {
    console.error('Autocomplete error:', error);
    return NextResponse.json({ results: [] }, { status: 500 });
  }
}