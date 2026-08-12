export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Admin — Presupuesto',
  robots: { index: false, follow: false },
};

import Link from 'next/link';
import connectDB from '@/config/database';
import Quote from '@/models/Quote';
import { convertToSerializeableObject } from '@/utils/convertToObject';
import updateQuoteStatus from '@/app/actions/updateQuoteStatus';
import { generateWhatsAppLink } from '@/utils/whatsapp';

function getStatusBadge(status) {
  const map = {
    draft: { label: 'Borrador', color: 'bg-gray-700 text-gray-300' },
    sent: { label: 'Enviado', color: 'bg-blue-900/40 text-blue-400' },
    accepted: { label: 'Aceptado', color: 'bg-green-900/40 text-green-400' },
    rejected: { label: 'Rechazado', color: 'bg-red-900/40 text-red-400' },
  };
  return map[status] || { label: status, color: 'bg-gray-700 text-gray-300' };
}

const AdminQuoteDetailPage = async ({ params }) => {
  await connectDB();
  const quote = await Quote.findById(params.id)
    .populate('property', 'name location images price')
    .populate('createdBy', 'name')
    .lean();

  if (!quote) {
    return (
      <div className="p-4 md:p-6">
        <p className="text-lg text-[#888]">Presupuesto no encontrado.</p>
        <Link href="/admin/quotes" className="text-[var(--color-brand)] hover:underline">← Volver</Link>
      </div>
    );
  }

  const badge = getStatusBadge(quote.status);
  const whatsappUrl = quote.client?.phone
    ? `https://wa.me/${quote.client.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
        `Hola ${quote.client.name}, te enviamos el presupuesto para ${quote.property?.name || ''} por U$D ${quote.totalAmount?.toLocaleString('es-AR') || ''}.`
      )}`
    : null;

  return (
    <div className="p-4 md:p-6 max-w-4xl">
      <Link href="/admin/quotes" className="text-[var(--color-brand)] hover:underline text-sm font-medium mb-4 inline-block">
        ← Volver a Presupuestos
      </Link>

      <div className="bg-[#161616] border border-[#222] rounded-sm p-6 md:p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-[28px] font-normal text-white mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
              Presupuesto
            </h1>
            <p className="text-[13px] text-[#888]">Creado el {new Date(quote.createdAt).toLocaleDateString('es-AR')}</p>
          </div>
          <span className={`inline-block text-[11px] font-bold px-3 py-1.5 rounded-sm uppercase tracking-wider ${badge.color}`}>
            {badge.label}
          </span>
        </div>

        {/* Cliente */}
        <div className="mb-6 p-4 bg-[#0a0a0a] border border-[#222] rounded-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#888] mb-2">Cliente</p>
          <p className="text-[16px] font-semibold text-white">{quote.client?.name}</p>
          {quote.client?.email && <p className="text-[13px] text-[#bbb]">{quote.client.email}</p>}
          {quote.client?.phone && <p className="text-[13px] text-[#bbb]">{quote.client.phone}</p>}
        </div>

        {/* Propiedad */}
        <div className="mb-6 p-4 bg-[#0a0a0a] border border-[#222] rounded-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#888] mb-2">Propiedad</p>
          <p className="text-[16px] font-semibold text-white">{quote.property?.name || '—'}</p>
          {quote.property?.location?.city && (
            <p className="text-[13px] text-[#bbb]">{quote.property.location.city}</p>
          )}
        </div>

        {/* Items */}
        <div className="mb-6">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#888] mb-3">Items</p>
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="border-b border-[#222]">
                <th className="text-left py-2 font-semibold text-[#ccc]">Descripción</th>
                <th className="text-right py-2 font-semibold text-[#ccc]">Monto</th>
                <th className="text-right py-2 font-semibold text-[#ccc] w-[60px]">Moneda</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222]">
              {(quote.items || []).map((item, i) => (
                <tr key={i}>
                  <td className="py-2.5 text-[#ccc]">{item.description}</td>
                  <td className="py-2.5 text-right font-medium text-white">{item.amount?.toLocaleString('es-AR')}</td>
                  <td className="py-2.5 text-right text-[#888]">{item.currency || 'U$D'}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-[#444]">
                <td className="py-3 font-bold text-white">Total</td>
                <td className="py-3 text-right font-bold text-white text-lg">
                  {quote.totalAmount?.toLocaleString('es-AR')}
                </td>
                <td className="py-3 text-right font-bold text-white">U$D</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {quote.notes && (
          <div className="mb-6 p-4 bg-[#0a0a0a] border border-[#222] rounded-sm">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#888] mb-1">Notas</p>
            <p className="text-[13px] text-[#bbb]">{quote.notes}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-3 pt-4 border-t border-[#222]">
          <form action={updateQuoteStatus.bind(null, quote._id.toString(), 'sent')}>
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-sm transition-colors uppercase tracking-wider">
              Marcar como Enviado
            </button>
          </form>
          <form action={updateQuoteStatus.bind(null, quote._id.toString(), 'accepted')}>
            <button type="submit" className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-5 py-2.5 rounded-sm transition-colors uppercase tracking-wider">
              Marcar como Aceptado
            </button>
          </form>
          <form action={updateQuoteStatus.bind(null, quote._id.toString(), 'rejected')}>
            <button type="submit" className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-5 py-2.5 rounded-sm transition-colors uppercase tracking-wider">
              Marcar como Rechazado
            </button>
          </form>
          {whatsappUrl && (
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
              className="bg-[#25D366] hover:bg-[#1DA851] text-white text-xs font-bold px-5 py-2.5 rounded-sm transition-colors uppercase tracking-wider inline-flex items-center gap-2">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Enviar por WhatsApp
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminQuoteDetailPage;
