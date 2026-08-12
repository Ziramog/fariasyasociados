import connectDB from '@/config/database';
import Quotation from '@/models/Quotation';
import User from '@/models/User';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function PublicQuotationPage({ params }) {
  const { token } = params;

  await connectDB();
  
  // Find and update tracking stats
  const quotation = await Quotation.findOneAndUpdate(
    { 'delivery.trackingToken': token },
    { 
      $inc: { 'delivery.openCount': 1 },
      $set: { 'delivery.openedAt': new Date() }
    },
    { new: true }
  ).lean();

  if (!quotation) {
    notFound();
  }

  const { client, properties, payment, customization, quoteNumber, totalValue, createdBy } = quotation;

  let agentName = 'Farias & Asociados';
  if (createdBy) {
    const creator = await User.findById(createdBy).lean();
    if (creator) {
      agentName = creator.agentName || creator.username || 'Farias & Asociados';
    }
  }

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-[#1a1a18] selection:bg-[var(--color-brand)] selection:text-white py-12 px-4 sm:px-6">
      
      <main className="max-w-[800px] mx-auto bg-white shadow-2xl overflow-hidden">
        
        {/* Header - Black Bar */}
        <header className="bg-black text-white px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
             {/* Note: In a real scenario, you'd use the site logo here. For now, matching the PDF text. */}
             <div>
                <h1 className="text-xl font-bold tracking-widest uppercase text-[var(--color-brand)]" style={{ fontFamily: 'var(--font-heading)' }}>RR</h1>
             </div>
          </div>
          <div className="text-right">
             <h2 className="text-base font-bold font-serif" style={{ fontFamily: 'var(--font-heading)' }}>{properties?.[0]?.title || 'Propuesta'}</h2>
          </div>
        </header>

        <div className="px-8 py-8">
          
          {/* Client Bar */}
          <div className="border-b border-[#e8e6e0] pb-4 mb-6 flex justify-between items-end">
            <div>
              <p className="text-[10px] text-[#8c8c88] font-bold uppercase tracking-widest mb-1">Preparado para</p>
              <p className="text-sm font-semibold">{client.name}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-[#8c8c88]">Propuesta N° {quoteNumber} · {new Date().toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}</p>
            </div>
          </div>

          {/* Properties Photos (4 cols max) */}
          {properties?.length > 0 && properties[0].photos && properties[0].photos.length > 0 && (
            <div className="flex h-[180px] sm:h-[220px] mb-6 border-b border-[#e8e6e0] pb-6 gap-1 overflow-x-auto no-scrollbar">
               {properties[0].photos.slice(0, 4).map((photo, idx) => (
                 <Link key={idx} href={`/properties/${properties[0].propertyId}`} className="relative flex-1 min-w-[120px] h-full group overflow-hidden block">
                   <img 
                      src={photo} 
                      alt="Propiedad"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                   />
                   <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <span className="bg-white text-black text-[10px] font-bold px-2 py-1 rounded shadow-sm">Ver detalles</span>
                   </div>
                 </Link>
               ))}
            </div>
          )}

          {/* AI Intro Text */}
          {customization?.aiDescription && (
            <div className="mb-8">
              <p className="text-[15px] text-[#4b4b48] leading-relaxed">
                {customization.aiDescription}
              </p>
            </div>
          )}

          {/* Two Columns Data */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-0">
            
            {/* Left Col: Characteristics */}
            <div className="md:col-span-5 md:pr-8">
               <div className="flex items-center gap-3 mb-6">
                 <h3 className="text-xs font-bold uppercase tracking-widest text-[#1a1a18]">Características</h3>
                 <div className="h-[2px] w-10 bg-[var(--color-brand)]"></div>
               </div>

               <div className="space-y-4">
                 {properties.map((prop, idx) => (
                   <div key={idx} className="space-y-3 border-b border-[#e8e6e0] pb-4 last:border-0">
                      
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#8c8c88] mb-1">Tipo</span>
                        <span className="text-sm font-bold text-[#1a1a18]">{prop.type || '—'}</span>
                      </div>

                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#8c8c88] mb-1">Operación</span>
                        <span className="text-sm font-bold text-[#1a1a18] capitalize">{prop.operation || '—'}</span>
                      </div>

                      {prop.bedrooms && (
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8c8c88] mb-1">Dormitorios</span>
                          <span className="text-sm font-bold text-[#1a1a18]">{prop.bedrooms}</span>
                        </div>
                      )}

                      {prop.bathrooms && (
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8c8c88] mb-1">Baños</span>
                          <span className="text-sm font-bold text-[#1a1a18]">{prop.bathrooms}</span>
                        </div>
                      )}

                      {prop.surface && (
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8c8c88] mb-1">Área Total</span>
                          <span className="text-sm font-bold text-[#1a1a18]">{prop.surface} m²</span>
                        </div>
                      )}

                      {prop.address && (
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8c8c88] mb-1">Ubicación</span>
                          <span className="text-sm font-bold text-[#1a1a18]">{prop.address}</span>
                        </div>
                      )}

                   </div>
                 ))}
               </div>
            </div>

            {/* Right Col: Price Detail */}
            <div className="md:col-span-7 md:pl-8 md:border-l border-[#e8e6e0]">
               <div className="flex items-center gap-3 mb-6">
                 <h3 className="text-xs font-bold uppercase tracking-widest text-[#1a1a18]">Detalle de Precio</h3>
                 <div className="h-[2px] w-10 bg-[var(--color-brand)]"></div>
               </div>

               {payment.type === 'contado' ? (
                 <div className="border border-[#e8e6e0] rounded bg-[#faf9f7] p-5 mb-4">
                   <p className="text-[10px] font-bold uppercase tracking-widest text-[#8c8c88] mb-2">Pago de Contado</p>
                   <p className="text-2xl font-bold font-serif text-[#1a1a18]">U$D {totalValue?.toLocaleString('es-AR')}</p>
                 </div>
               ) : (
                 <div className="space-y-4 mb-6">
                    <div className="flex justify-between items-end border-b border-dashed border-[#dcd9d1] pb-2">
                      <span className="text-sm text-[#4b4b48]">Precio Total</span>
                      <span className="text-base font-bold text-[#1a1a18]">U$D {totalValue?.toLocaleString('es-AR')}</span>
                    </div>

                    {payment.downPayment > 0 && (
                      <div className="flex justify-between items-end border-b border-dashed border-[#dcd9d1] pb-2">
                        <span className="text-sm text-[#4b4b48]">Seña / Anticipo ({payment.downPaymentPct}%)</span>
                        <span className="text-sm font-bold text-[#1a1a18]">U$D {payment.downPayment?.toLocaleString('es-AR')}</span>
                      </div>
                    )}

                    {payment.installments > 0 && (
                      <div className="flex justify-between items-end border-b border-dashed border-[#dcd9d1] pb-2">
                        <span className="text-sm text-[#4b4b48]">{payment.installments} Cuotas de</span>
                        <span className="text-sm font-bold text-[#1a1a18]">U$D {payment.installmentAmount?.toLocaleString('es-AR')}</span>
                      </div>
                    )}

                    {payment.interestRate > 0 && (
                      <div className="flex justify-between items-end border-b border-dashed border-[#dcd9d1] pb-2">
                        <span className="text-sm text-[#4b4b48]">Tasa de Interés</span>
                        <span className="text-sm font-bold text-[#1a1a18]">{payment.interestRate}% anual</span>
                      </div>
                    )}

                    {payment.totalInterest > 0 && (
                      <div className="flex justify-between items-end border-b border-dashed border-[#dcd9d1] pb-2">
                        <span className="text-sm text-[#4b4b48]">Intereses Totales</span>
                        <span className="text-sm font-bold text-[#1a1a18]">U$D {payment.totalInterest?.toLocaleString('es-AR')}</span>
                      </div>
                    )}

                    <div className="bg-[#1a1a18] text-white p-4 rounded flex justify-between items-center mt-6">
                      <span className="text-[11px] font-bold uppercase tracking-widest text-white/70">Total Financiado</span>
                      <span className="text-lg font-bold">U$D {payment.totalPaid?.toLocaleString('es-AR')}</span>
                    </div>
                 </div>
               )}

               {payment.notes && (
                 <div className="mt-6 pt-5 border-t border-[#e8e6e0]">
                   <p className="text-[10px] font-bold uppercase tracking-widest text-[#8c8c88] mb-2">Notas de cotización</p>
                   <p className="text-xs text-[#4b4b48] leading-relaxed">{payment.notes}</p>
                 </div>
               )}
            </div>
            
          </div>

          {/* Footer Signature */}
          <div className="mt-16 pt-10 text-center">
             <div className="inline-block">
                {/* Fallback signature line if no real image */}
                <div className="mb-2">
                  <svg viewBox="0 0 100 30" className="h-8 mx-auto opacity-60" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10,20 Q20,5 30,20 T50,20 T70,15 T90,25" />
                    <path d="M25,25 L45,15" />
                  </svg>
                </div>
                <h4 className="text-sm font-bold text-[#1a1a18] mb-0.5">{agentName}</h4>
                <p className="text-[10px] font-bold text-[#8c8c88] tracking-widest uppercase mt-1">Farias & Asociados</p>
                <p className="text-[10px] font-bold text-[#8c8c88] tracking-widest uppercase">NEGOCIOS INMOBILIARIOS</p>
                <p className="text-[10px] text-[#8c8c88] mt-2">Propuesta N° {quoteNumber}</p>
             </div>
          </div>

        </div>
        
        {/* Validation Bar */}
        <div className="bg-[#faf9f7] border-t border-[#e8e6e0] px-8 py-5 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
           <p className="text-[11px] text-[#8c8c88] max-w-md">Ante cualquier consulta, por favor contactanos respondiendo el mensaje con el que recibiste este enlace.</p>
           {customization?.validUntil && (
             <div className="flex items-center gap-2 bg-white border border-[#e8e6e0] px-3 py-1.5 rounded-full shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-brand)]">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                <span className="text-[11px] font-bold text-[#4b4b48] uppercase tracking-wider">
                  Válido hasta: {new Date(customization.validUntil).toLocaleDateString('es-AR')}
                </span>
             </div>
           )}
        </div>

      </main>

    </div>
  );
}
