export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Mis Favoritos',
  robots: { index: false, follow: false },
};

import PropertyCard from '@/components/PropertyCard';
import connectDB from '@/config/database';
import User from '@/models/User';
import ScrollReveal from '@/components/shared/ScrollReveal';
import { getSessionUser } from '@/utils/getSessionUser';

const SavedPropertiesPage = async () => {
  await connectDB();

  const sessionUser = await getSessionUser();

  const { userId } = sessionUser;

  // NOTE: here we can make one database query by using Model.populate
  const { bookmarks } = await User.findById(userId)
    .populate('bookmarks')
    .lean();

  return (
    <section className='px-4 py-6'>
      <div className='container-xl lg:container m-auto px-4 py-6'>
        <ScrollReveal>
          <h1 className='text-2xl mb-4 text-[#1a3c34]'>Propiedades Guardadas</h1>
        </ScrollReveal>
        {bookmarks.length === 0 ? (
          <p>No tienes propiedades guardadas</p>
        ) : (
          <ScrollReveal delay={100}>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              {bookmarks.map((property) => (
                <PropertyCard key={property._id} property={property} />
              ))}
            </div>
          </ScrollReveal>
        )}
      </div>
    </section>
  );
};
export default SavedPropertiesPage;
