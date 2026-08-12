export async function fetchPlaceReviews(placeId, languageCode = 'es') {
  const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || '';

  if (!GOOGLE_API_KEY) {
    throw new Error('GOOGLE_API_KEY no configurada. Verificá las variables de entorno en Vercel.');
  }

  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,user_ratings_total,reviews&reviews_sort=newest&language=${languageCode}&key=${GOOGLE_API_KEY}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Referer': process.env.NEXT_PUBLIC_DOMAIN || 'https://farias-asociados.vercel.app'
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(`Google Places API HTTP error ${response.status}: ${JSON.stringify(errorBody)}`);
  }

  const data = await response.json();

  if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
    throw new Error(`Google API Status Error: ${data.status} - ${data.error_message || 'Sin detalles'}`);
  }

  const result = data.result || {};

  return {
    placeId: placeId,
    name: result.name || '',
    reviews: result.reviews || [],
    overallRating: result.rating || null,
    totalRatings: result.user_ratings_total || null,
  };
}
