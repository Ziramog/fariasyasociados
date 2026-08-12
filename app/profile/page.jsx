export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Perfil',
  robots: { index: false, follow: false },
};

import Image from 'next/image';
import connectDB from '@/config/database';
import Property from '@/models/Property';
import { getSessionUser } from '@/utils/getSessionUser';
import profileDefault from '@/assets/images/profile.png';
import ProfileProperties from '@/components/ProfileProperties';
import AgentNameForm from '@/components/AgentNameForm';
import ScrollReveal from '@/components/shared/ScrollReveal';
import { convertToSerializeableObject } from '@/utils/convertToObject';

const ProfilePage = async () => {
  await connectDB();

  const sessionUser = await getSessionUser();

  const { userId } = sessionUser;

  if (!userId) {
    throw new Error('User ID is required');
  }

  const propertiesDocs = await Property.find({ owner: userId }).lean();
  const properties = propertiesDocs.map(convertToSerializeableObject);

  return (
    <section className='bg-[#f5f0e8]'>
      <div className='container m-auto py-24'>
        <div className='bg-white px-6 py-8 mb-4 shadow-md rounded-md border m-4 md:m-0'>
          <ScrollReveal>
            <h1 className='text-3xl font-bold mb-4 text-[#1a3c34]'>Tu Perfil</h1>
          </ScrollReveal>
          <div className='flex flex-col md:flex-row'>
            <ScrollReveal delay={100} className='md:w-1/4 mx-20 mt-10'>
              <div className='mb-4'>
                <Image
                  className='h-32 w-32 md:h-48 md:w-48 rounded-full mx-auto md:mx-0'
                  src={sessionUser.user.image || profileDefault}
                  width={200}
                  height={200}
                  alt='Usuario'
                />
              </div>

              <h2 className='text-2xl mb-4'>
                <span className='font-bold block'>Nombre: </span>{' '}
                {sessionUser.user.name}
              </h2>
              <h2 className='text-2xl'>
                <span className='font-bold block'>Correo: </span>{' '}
                {sessionUser.user.email}
              </h2>

              <AgentNameForm initialName={sessionUser.user.name || ''} />
            </ScrollReveal>

            <ScrollReveal delay={200} className='md:w-3/4 md:pl-4'>
              <h2 className='text-xl font-semibold mb-4'>Tus Propiedades</h2>
              {properties.length === 0 ? (
                <p>No tienes propiedades publicadas</p>
              ) : (
                <ProfileProperties properties={properties} />
              )}
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProfilePage;
