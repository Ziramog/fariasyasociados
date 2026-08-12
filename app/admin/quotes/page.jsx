export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Admin — Presupuestos',
  robots: { index: false, follow: false },
};

import Link from 'next/link';
import connectDB from '@/config/database';
import Quote from '@/models/Quote';

function getStatusBadge(status) {
  const map = {
    draft: { label: 'Borrador', color: 'bg-gray-700 text-gray-300' },
    sent: { label: 'Enviado', color: 'bg-blue-900/40 text-blue-400' },
    accepted: { label: 'Aceptado', color: 'bg-green-900/40 text-green-400' },
    rejected: { label: 'Rechazado', color: 'bg-red-900/40 text-red-400' },
  };
  return map[status] || { label: status, color: 'bg-gray-700 text-gray-300' };
}

const AdminQuotesPage = async ({ searchParams }) => {
  await connectDB();

  const quotes = await Quote.find({})
    .populate('property', 'name location')
    .populate('createdBy', 'name')
    .sort({ createdAt: -1 })
    .lean();

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[28px] md:text-[36px] font-normal text-white" style={{ fontFamily: 'var(--font-heading)' }}>
          Presupuestos
        </h1>
        <Link
          href="/admin/quotes/create"
          className="bg-[var(--color-brand)] hover:bg-[var(--color-brand-dark)] text-white text-sm font-bold px-5 py-2.5 rounded-sm transition-colors uppercase tracking-wider"
        >
          + Nuevo
        </Link>
      </div>

      {quotes.length === 0 ? (
        <div className="bg-[#161616] border border-[#222] rounded-sm p-12 text-center">
          <p className="text-[#888] text-[15px]">No hay presupuestos todavía.</p>
          <Link href="/admin/quotes/create" className="text-[var(--color-brand)] hover:underline text-sm font-medium mt-2 inline-block">
            Crear el primer presupuesto
          </Link>
        </div>
      ) : (
        <div className="bg-[#161616] border border-[#222] rounded-sm overflow-hidden">
          <table className="w-full text-sm min-w-[600px]">
            <thead className="bg-[#0a0a0a] border-b border-[#222]">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-[#ccc]">Cliente</th>
                <th className="text-left px-4 py-3 font-semibold text-[#ccc]">Propiedad</th>
                <th className="text-left px-4 py-3 font-semibold text-[#ccc]">Total</th>
                <th className="text-left px-4 py-3 font-semibold text-[#ccc]">Estado</th>
                <th className="text-left px-4 py-3 font-semibold text-[#ccc] hidden md:table-cell">Fecha</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222]">
              {quotes.map((q) => {
                const badge = getStatusBadge(q.status);
                return (
                  <tr key={q._id.toString()} className="hover:bg-[#1a1a1a] transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-white">{q.client?.name}</p>
                      {q.client?.email && <p className="text-[11px] text-[#888]">{q.client.email}</p>}
                    </td>
                    <td className="px-4 py-3 text-[#bbb]">
                      {q.property?.name || '—'}
                    </td>
                    <td className="px-4 py-3 font-semibold text-white">
                      U$D {q.totalAmount?.toLocaleString('es-AR')}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block text-[11px] font-bold px-2 py-1 rounded-sm uppercase tracking-wider ${badge.color}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#888] hidden md:table-cell">
                      {new Date(q.createdAt).toLocaleDateString('es-AR')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/admin/quotes/${q._id.toString()}`} className="text-[var(--color-brand)] hover:underline text-xs font-medium">
                        Ver
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminQuotesPage;
