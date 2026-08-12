export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Admin — Propuestas',
  robots: { index: false, follow: false },
};

import Link from 'next/link';
import connectDB from '@/config/database';
import Quotation from '@/models/Quotation';
import QuotationActions from '@/components/admin/quotations/QuotationActions';
import StatusSelector from '@/components/admin/quotations/StatusSelector';

const AdminQuotationsPage = async () => {
  await connectDB();
  const quotations = await Quotation.find({}).sort({ createdAt: -1 }).lean();

  const stats = {
    total: quotations.length,
    draft: quotations.filter(q => q.status === 'draft').length,
    sent: quotations.filter(q => q.status === 'sent').length,
    accepted: quotations.filter(q => q.status === 'accepted').length,
  };

  return (
    <div className="p-3 md:p-6">
      <h1 className="text-[24px] md:text-[36px] font-normal text-white mb-3 flex items-center gap-3" style={{ fontFamily: 'var(--font-heading)' }}>
        Propuestas
        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-[#444] text-[#888] text-[12px] font-bold cursor-help" title="Crea y gestiona presupuestos en PDF o web para tus clientes. Al generar una propuesta, puedes enviar un enlace seguro para que la aprueben.">?</span>
      </h1>
      <Link href="/admin/quotations/new"
        className="inline-block bg-[var(--color-brand)] hover:bg-[var(--color-brand-dark)] text-white text-[12px] md:text-[13px] font-bold uppercase tracking-wider px-5 py-2.5 rounded-sm transition-colors mb-6">
        + Nueva Propuesta
      </Link>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { value: stats.total, label: 'Total', color: '#fff' },
          { value: stats.draft, label: 'Borradores', color: '#888' },
          { value: stats.sent, label: 'Enviadas', color: '#60A5FA' },
          { value: stats.accepted, label: 'Aceptadas', color: '#4ADE80' },
        ].map(s => (
          <div key={s.label} className="bg-[#161616] border border-[#222] rounded-sm p-3 md:p-4 text-center">
            <p className="text-[20px] md:text-[28px] font-bold leading-none mb-1" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[10px] font-medium text-[#888] uppercase tracking-wider">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Desktop Table */}
      <div className="bg-[#161616] border border-[#222] rounded-sm max-h-[600px] overflow-y-auto hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-left relative min-w-[700px]">
            <thead className="sticky top-0 bg-[#161616] z-20 shadow-sm shadow-black/50">
              <tr className="border-b border-[#222] text-[10px] font-bold uppercase tracking-wider text-[#888]">
                <th className="px-2 md:px-4 py-3">N°</th>
                <th className="px-2 md:px-4 py-3">Cliente</th>
                <th className="px-2 md:px-3 py-3 hidden md:table-cell">Propiedad</th>
                <th className="px-2 md:px-3 py-3 text-right">Total</th>
                <th className="px-2 md:px-3 py-3 text-center">Estado</th>
                <th className="px-2 md:px-3 py-3 hidden md:table-cell">Creador</th>
                <th className="px-2 md:px-3 py-3 hidden md:table-cell">Fecha</th>
                <th className="px-2 md:px-4 py-3 text-right group">
                  <div className="flex justify-end items-center gap-1">
                    Acciones
                    <span 
                      className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full border border-[#444] text-[#888] text-[8px] font-bold cursor-help"
                      title="👁️ Ver PDF | ✏️ Editar Propuesta | 🔗 Copiar Link Público | 💬 Copiar Descripción de IA para WhatsApp (solo si generaste la descripción) | 🗑️ Eliminar Propuesta"
                    >
                      ?
                    </span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222]">
              {quotations.map(q => {
                return (
                  <tr key={q._id.toString()} className="hover:bg-[#1a1a1a] transition-colors text-[13px]">
                    <td className="px-2 md:px-4 py-3 font-medium text-white text-[11px] md:text-[12px]">{q.quoteNumber}</td>
                    <td className="px-2 md:px-4 py-3">
                      <p className="font-medium text-white truncate max-w-[80px] md:max-w-[140px]">{q.client?.name}</p>
                    </td>
                    <td className="px-2 md:px-3 py-3 text-[#bbb] truncate max-w-[160px] hidden md:table-cell">{q.properties?.[0]?.title || '—'}</td>
                    <td className="px-2 md:px-3 py-3 text-right font-semibold text-[12px] text-white">U$D {q.totalValue?.toLocaleString('es-AR')}</td>
                    <td className="px-2 md:px-3 py-3 text-center">
                      <StatusSelector quotationId={q._id.toString()} initialStatus={q.status} />
                    </td>
                    <td className="px-2 md:px-3 py-3 text-[#bbb] truncate max-w-[120px] hidden md:table-cell">{q.creatorName}</td>
                    <td className="px-2 md:px-3 py-3 text-[#888] text-[12px] hidden md:table-cell">{new Date(q.createdAt).toLocaleDateString('es-AR')}</td>
                    <td className="px-2 md:px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5 relative z-10">
                        <a href={`/api/quotations/${q._id}/generate-pdf`} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center justify-center w-7 h-7 bg-[#222] text-[#888] hover:bg-[#333] hover:text-white rounded-sm transition-colors" title="Ver PDF">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        </a>
                        <QuotationActions quotationId={q._id.toString()} trackingToken={q.delivery?.trackingToken} aiDescription={q.customization?.whatsappMessage || q.customization?.aiDescription} />
                      </div>
                    </td>
                  </tr>
                );
              })}
              {quotations.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-[#888] text-[14px]">
                    No hay propuestas. <Link href="/admin/quotations/new" className="text-[var(--color-brand)] font-medium hover:underline">Crear la primera</Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden bg-[#161616] border border-[#222] rounded-sm flex flex-col divide-y divide-[#222]">
        {quotations.map(q => (
          <div key={q._id.toString()} className="p-4 flex flex-col gap-3 hover:bg-[#1a1a1a] transition-colors">
            {/* Header: Name and N° */}
            <div className="flex justify-between items-start gap-2">
              <div className="min-w-0">
                <p className="font-semibold text-white truncate text-[14px]">{q.client?.name}</p>
                <p className="text-[12px] font-medium text-[#888]">{q.quoteNumber}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-white text-[14px]">U$D {q.totalValue?.toLocaleString('es-AR')}</p>
                <p className="text-[11px] text-[#888]">{new Date(q.createdAt).toLocaleDateString('es-AR')}</p>
              </div>
            </div>

            {/* Body: Status */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#888]">Estado:</span>
              <div className="flex-1">
                <StatusSelector quotationId={q._id.toString()} initialStatus={q.status} />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#222] mt-1 relative z-10">
              <a href={`/api/quotations/${q._id}/generate-pdf`} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-3 py-1.5 text-[12px] font-medium bg-[#222] text-[#bbb] hover:bg-[#333] hover:text-white border border-[#333] rounded-sm transition-colors gap-1" title="Ver PDF">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                PDF
              </a>
              <QuotationActions quotationId={q._id.toString()} trackingToken={q.delivery?.trackingToken} aiDescription={q.customization?.whatsappMessage || q.customization?.aiDescription} />
            </div>
          </div>
        ))}
        {quotations.length === 0 && (
          <div className="p-8 text-center text-[#888] text-[14px]">
            No hay propuestas. <Link href="/admin/quotations/new" className="text-[var(--color-brand)] font-medium hover:underline">Crear la primera</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminQuotationsPage;
