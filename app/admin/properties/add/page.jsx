export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Agregar Propiedad',
  robots: { index: false, follow: false },
};

import PropertyAddForm from '@/components/PropertyAddForm';
import ScrollReveal from '@/components/shared/ScrollReveal';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import connectDB from '@/config/database';
import SiteConfig from '@/models/SiteConfig';

const DEFAULT_LABELS = ['PRECIO MEJORADO', 'ULTIMA UNIDAD', 'UNICO EN SU TIPO', 'MEJOR PRECIO', 'EXCELENTE PRECIO', 'AMOBLADA'];

const PropertyAddPage = async () => {
  let customLabels = DEFAULT_LABELS;
  if (process.env.MONGODB_URI) {
    try {
      await connectDB();
      const config = await SiteConfig.findOne({}).lean();
      customLabels = config?.customPropertyLabels || DEFAULT_LABELS;
    } catch (error) {
      console.log('[admin:add-property] SiteConfig unavailable:', error.message);
    }
  }

  return (
    <div className='container mx-auto px-4 py-8 max-w-3xl'>
      <div className='mb-4'>
        <Link href='/admin/properties' className='inline-flex items-center text-gray-400 hover:text-white transition-colors text-sm font-medium'>
          <ArrowLeft className='w-4 h-4 mr-2' />
          Volver a Propiedades
        </Link>
      </div>
      <ScrollReveal>
        <div className='bg-[#111] border border-[#333] px-6 py-8 shadow-xl rounded-xl'>
          <PropertyAddForm customLabels={customLabels} />
        </div>
      </ScrollReveal>
    </div>
  );
};
export default PropertyAddPage;
