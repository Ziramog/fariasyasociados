export const metadata = {
  title: 'Resultados de Búsqueda',
  robots: { index: false, follow: false },
};

import Link from 'next/link';
import { FaArrowAltCircleLeft } from 'react-icons/fa';
import PropertyCard from '@/components/PropertyCard';
import PropertySearchForm from '@/components/PropertySearchForm';
import ScrollReveal from '@/components/shared/ScrollReveal';
import connectDB from '@/config/database';
import Property from '@/models/Property';
import { convertToSerializeableObject } from '@/utils/convertToObject';

const SearchResultsPage = async ({
  searchParams: { location = '', propertyType = 'All' },
}) => {
  await connectDB();

  let query = {};

  // Only add location search if location is provided
  if (location && location.trim()) {
    const locationPattern = new RegExp(location, 'i');
    query.$or = [
      { name: locationPattern },
      { description: locationPattern },
      { 'location.street': locationPattern },
      { 'location.city': locationPattern },
      { 'location.state': locationPattern },
      { 'location.zipcode': locationPattern },
    ];
  }

  // Only check for property if its not 'All'
  if (propertyType && propertyType !== 'All') {
    const typePattern = new RegExp(propertyType, 'i');
    query.type = typePattern;
  }

  const propertiesQueryResults = await Property.find(query).lean();
  const properties = propertiesQueryResults.map(convertToSerializeableObject);

  return (
    <>
      <section className='bg-[#1a3c34] py-4'>
        <div className='max-w-7xl mx-auto px-4 flex flex-col items-start sm:px-6 lg:px-8'>
          <PropertySearchForm />
        </div>
      </section>
      <section className='px-4 py-6'>
        <div className='container-xl lg:container m-auto px-4 py-6'>
          <ScrollReveal>
            <Link
              href='/properties'
              className='flex items-center text-[#d4a574] hover:underline mb-3'
            >
              <FaArrowAltCircleLeft className='mr-2 mb-1' /> Volver a Propiedades
            </Link>
            <h1 className='text-2xl mb-4 text-[#1a3c34]'>Resultados de Búsqueda</h1>
          </ScrollReveal>
          {properties.length === 0 ? (
            <p>No se encontraron resultados</p>
          ) : (
            <ScrollReveal delay={100}>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                {properties.map((property) => (
                  <PropertyCard key={property._id} property={property} />
                ))}
              </div>
            </ScrollReveal>
          )}
        </div>
      </section>
    </>
  );
};
export default SearchResultsPage;
