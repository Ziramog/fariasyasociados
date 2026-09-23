'use server';

import connectDB from '@/config/database';
import Property from '@/models/Property';
import BuyerProfile from '@/models/BuyerProfile';

export async function getMatchesForProfile(profileId) {
  try {
    await connectDB();
    const profile = await BuyerProfile.findById(profileId).lean();
    if (!profile) return { error: 'Perfil no encontrado', matches: [] };

    // Solo propiedades activas publicadas
    const allProperties = await Property.find({ is_published: { $ne: false }, status: 'active' }).lean();

    const matches = allProperties.map(property => {
      let score = 0;
      const maxScore = 100;
      let breakdown = [];

      // 1. Operación (Filtro duro)
      // Si el perfil busca 'venta', la propiedad debe ser 'venta' o 'compra'
      // Si el perfil busca 'alquiler', la propiedad debe ser 'alquiler'
      let propertyOperation = property.operation ? property.operation.toLowerCase() : '';
      let profileOperation = profile.operation ? profile.operation.toLowerCase() : '';
      
      let isOperationMatch = false;
      if (profileOperation === 'venta' && (propertyOperation === 'venta' || propertyOperation === 'compra' || !propertyOperation)) {
         isOperationMatch = true;
      } else if (profileOperation === 'alquiler' && propertyOperation === 'alquiler') {
         isOperationMatch = true;
      }

      if (!isOperationMatch) {
         return null; // Ni siquiera la consideramos
      }

      // Base score for matching operation
      score += 20;
      breakdown.push({ criteria: 'Operación', points: 20 });

      // 2. Presupuesto (30 puntos)
      if (profile.priceMax && property.price) {
         // Limpiar precio (quitar USD, $, comas, puntos)
         const cleanPrice = parseFloat(property.price.replace(/[^0-9]/g, ''));
         if (!isNaN(cleanPrice)) {
            if (cleanPrice <= profile.priceMax) {
               score += 30;
               breakdown.push({ criteria: 'Presupuesto', points: 30 });
            } else {
               // Penalización gradual. Si se pasa por un 10%, pierde algunos puntos. Si se pasa por >30%, 0 puntos.
               const diffPercent = (cleanPrice - profile.priceMax) / profile.priceMax;
               if (diffPercent < 0.1) {
                  score += 20;
                  breakdown.push({ criteria: 'Presupuesto Cercano', points: 20 });
               } else if (diffPercent < 0.2) {
                  score += 10;
                  breakdown.push({ criteria: 'Presupuesto Estirado', points: 10 });
               }
            }
         }
      } else {
         // Si no hay precio, sumamos los puntos por defecto asumiendo que encaja hasta ver el precio real
         score += 30;
      }

      // 3. Ubicación (30 puntos)
      if (profile.locations && profile.locations.length > 0) {
         const city = property.location?.city ? property.location.city.toLowerCase() : '';
         const matchLocation = profile.locations.some(loc => city.includes(loc.toLowerCase().trim()));
         if (matchLocation) {
            score += 30;
            breakdown.push({ criteria: 'Ubicación', points: 30 });
         }
      } else {
         score += 30;
      }

      // 4. Dormitorios (20 puntos)
      // En Phase 1 profile no tenía minBeds configurado en UI, pero si está en el modelo:
      if (profile.minBeds) {
         if (property.beds >= profile.minBeds) {
            score += 20;
            breakdown.push({ criteria: 'Dormitorios', points: 20 });
         } else if (property.beds === profile.minBeds - 1) {
             score += 10;
             breakdown.push({ criteria: 'Dormitorios Cercano', points: 10 });
         }
      } else {
         score += 20;
      }

      return {
        property: {
          _id: property._id.toString(),
          name: property.name,
          price: property.price,
          beds: property.beds,
          city: property.location?.city,
          image: property.images?.length > 0 ? property.images[0].url : null,
          type: property.type
        },
        score,
        breakdown
      };
    }).filter(Boolean); // Remover nulos

    // Ordenar por score descendente
    matches.sort((a, b) => b.score - a.score);

    // Retornar top 5
    return { success: true, matches: matches.slice(0, 5) };

  } catch (error) {
    console.error('Error calculando matches:', error);
    return { error: error.message, matches: [] };
  }
}
