import QuotationWizard from '@/components/admin/quotations/QuotationWizard';
import connectDB from '@/config/database';
import Quotation from '@/models/Quotation';
import { getSessionUser } from '@/utils/getSessionUser';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Editar Propuesta | Farias & Asociados',
};

export default async function EditQuotationPage({ params }) {
  await connectDB();
  const sessionUser = await getSessionUser();
  
  if (!sessionUser || !sessionUser.userId) {
    redirect('/');
  }

  const { id } = await params;
  const quotation = await Quotation.findById(id).lean();

  if (!quotation) {
    redirect('/admin/quotations');
  }

  // Format properties to match what StepProperty expects
  const formattedProperties = (quotation.properties || []).map(p => ({
    _id: p.propertyId?.toString() || p._id?.toString(),
    name: p.title || '',
    type: p.type || '',
    operation: p.operation || 'venta',
    price: p.price || 0,
    square_feet: p.surface || null,
    beds: p.bedrooms || null,
    baths: p.bathrooms || null,
    location: {
      city: p.address?.split(',')[1]?.trim() || '',
      street: p.address?.split(',')[0]?.trim() || '',
    },
    images: (p.photos || []).map(url => ({ url })),
    status: p.status || null,
    description: p.description || null,
    covered_area: p.coveredArea || null,
    garage: p.garage || null,
    services: p.services || [],
    titles_status: p.titlesStatus || null,
  }));

  const initialData = {
    properties: formattedProperties,
    client: quotation.client || { name: '', email: '', phone: '', dni: '', notes: '' },
    payment: {
      type: quotation.payment?.type || 'contado',
      downPaymentPct: quotation.payment?.downPaymentPct || 30,
      installments: quotation.payment?.installments || null,
      interestRate: quotation.payment?.interestRate || null,
      notes: quotation.payment?.notes || '',
    },
    customization: {
      template: quotation.customization?.template || 'modern',
      showAIDescription: quotation.customization?.showAIDescription || false,
      aiDescription: quotation.customization?.aiDescription || null,
      agentNotes: quotation.customization?.agentNotes || '',
      validUntil: quotation.customization?.validUntil || '',
    },
  };

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-white">Editar Propuesta {quotation.quoteNumber}</h1>
        <p className="text-sm text-[#888]">Modifica los datos y genera el presupuesto actualizado manteniendo el mismo link público.</p>
      </div>

      <div className="bg-[#111] border border-[#222] rounded-lg">
        <QuotationWizard initialData={initialData} editId={id} />
      </div>
    </div>
  );
}
