export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Admin — Nuevo Presupuesto',
  robots: { index: false, follow: false },
};

import Link from 'next/link';
import connectDB from '@/config/database';
import Property from '@/models/Property';
import { convertToSerializeableObject } from '@/utils/convertToObject';

const inputCls = 'w-full bg-[#0a0a0a] border border-[#333] rounded-sm px-4 py-3 text-sm text-white outline-none focus:border-[var(--color-brand)] transition-colors placeholder:text-[#555]';
const labelCls = 'block text-[13px] font-bold text-[#ccc] uppercase tracking-wider mb-2';

const AdminCreateQuotePage = async () => {
  await connectDB();
  const properties = await Property.find({}).sort({ name: 1 }).lean();
  const serialized = properties.map(p => convertToSerializeableObject(p));

  return (
    <div className="p-4 md:p-6">
      <Link href="/admin/quotes" className="text-[var(--color-brand)] hover:underline text-sm font-medium mb-4 inline-block">
        ← Volver a Presupuestos
      </Link>
      <h1 className="text-[28px] md:text-[36px] font-normal text-white mb-6" style={{ fontFamily: 'var(--font-heading)' }}>
        Nuevo Presupuesto
      </h1>

      <form action="/app/actions/addQuote" method="POST" className="bg-[#161616] border border-[#222] rounded-sm p-6 md:p-8 max-w-3xl">
        {/* property selector */}
        <div className="mb-5">
          <label className={labelCls}>Propiedad</label>
          <select name="property" required className={inputCls}>
            <option value="">Seleccionar propiedad...</option>
            {serialized.map(p => (
              <option key={p._id} value={p._id}>{p.name} — {p.location?.city || ''}</option>
            ))}
          </select>
        </div>

        {/* client fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          <div>
            <label className={labelCls}>Nombre del Cliente</label>
            <input type="text" name="clientName" required className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Email</label>
            <input type="email" name="clientEmail" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Teléfono</label>
            <input type="tel" name="clientPhone" className={inputCls} />
          </div>
        </div>

        {/* items (line items) */}
        <div className="mb-5">
          <label className={labelCls}>Items</label>
          <div id="items-container" className="space-y-3">
            <div className="flex gap-3 items-start item-row">
              <input type="text" name="itemDescription" placeholder="Descripción" required className={`${inputCls} flex-1`} />
              <input type="number" name="itemAmount" placeholder="Monto" required step="0.01" className={`${inputCls} w-[140px]`} />
              <select name="itemCurrency" className={`${inputCls} w-[80px]`}>
                <option value="U$D">U$D</option>
                <option value="$">$</option>
              </select>
              <button type="button" onClick={() => {}} className="text-red-400 hover:text-red-300 px-2 py-3 text-sm remove-item" disabled>✕</button>
            </div>
          </div>
          <button
            type="button"
            className="mt-3 text-[var(--color-brand)] hover:underline text-sm font-medium"
            onClick={() => {
              const container = document.getElementById('items-container');
              const row = container.querySelector('.item-row').cloneNode(true);
              row.querySelectorAll('input').forEach(i => i.value = '');
              row.querySelector('.remove-item').disabled = false;
              row.querySelector('.remove-item').onclick = () => row.remove();
              container.appendChild(row);
            }}
          >
            + Agregar Item
          </button>
        </div>

        {/* extra fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className={labelCls}>Válido hasta</label>
            <input type="date" name="validUntil" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Notas</label>
            <input type="text" name="notes" className={inputCls} />
          </div>
        </div>

        <button
          type="submit"
          className="bg-[var(--color-brand)] hover:bg-[var(--color-brand-dark)] text-white font-bold text-sm px-8 py-3 rounded-sm transition-colors uppercase tracking-wider"
        >
          Crear Presupuesto
        </button>
      </form>
    </div>
  );
};

export default AdminCreateQuotePage;
