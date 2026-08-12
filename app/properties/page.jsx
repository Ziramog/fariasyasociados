
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Propiedades',
  description: 'Explorá propiedades en venta y alquiler de Farias & Asociados.',
};

import { Suspense } from 'react';
import PropertiesSearch from '@/components/PropertiesSearch';
import LoadingOverlay from '@/components/shared/LoadingOverlay';
import PropertiesContent from './PropertiesContent';

const PropertiesPage = async ({ searchParams }) => {
  const { type, term, operation, minPrice, maxPrice, bedrooms, baths, propertyType, status, sort, area, favoritos, granInversion } = searchParams;

  const title = favoritos === 'true'
    ? 'Mis Favoritos'
    : granInversion === 'true'
    ? 'Grandes Inversiones'
    : type && type !== 'Todos'
    ? type === 'Inmueble Comercial' ? 'Inmuebles Comerciales' : `${type}s`
    : term && term !== 'Ciudad'
    ? `Propiedades en ${term}`
    : 'Nuestras Propiedades';

  const subtitle = type && type !== 'Todos'
    ? `Búsqueda en ${type === 'Inmueble Comercial' ? 'INMUEBLES COMERCIALES' : type.toUpperCase() + 'S'}`
    : term && term !== 'Ciudad'
    ? `Búsqueda en ${term.toUpperCase()}`
    : 'Búsqueda de Propiedades';

  const isFiltered = !!(type && type !== 'Todos') || !!(term && term !== 'Ciudad');

  const currentFilters = {
    term: searchParams.term || '',
    address: searchParams.address || '',
    tipo: type || '',
    operation: operation || 'venta',
    area: area || '',
    price: searchParams.price || '',
    minPrice: minPrice || '',
    maxPrice: maxPrice || '',
    bedrooms: bedrooms || '',
    baths: baths || '',
    'property-type': propertyType ? propertyType.split('|') : [],
    status: status ? status.split('|') : [],
    sort: sort || 'price-desc',
    favoritos: favoritos || '',
  };

  // El key en Suspense asegura que la UI vuelva al fallback de Loading cuando searchParams cambien.
  const suspenseKey = JSON.stringify(searchParams);

  return (
    <div className="min-h-screen bg-white">
      {/* Header + Filters — full dark band */}
      <section className="bg-black px-4 md:px-[50px] pt-32 md:pt-36 pb-6">
        {/* Search */}
        <PropertiesSearch currentFilters={currentFilters} title={title} />
      </section>

      {/* 
        El Suspense Boundary intercepta la latencia del servidor cuando cambian 
        los filtros o la paginación, mostrando el LoadingOverlay en lugar 
        de congelar la pantalla anterior. 
      */}
      <div className="relative min-h-[70vh] bg-white">
        <Suspense key={suspenseKey} fallback={<LoadingOverlay />}>
          <PropertiesContent searchParams={searchParams} subtitle={subtitle} />
        </Suspense>
      </div>
    </div>
  );
};

export default PropertiesPage;
