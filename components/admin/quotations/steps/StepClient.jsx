'use client';
export default function StepClient({ data, onChange, onNext, onBack }) {
  const update = (field, value) => onChange({ ...data, [field]: value });

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-white">Datos del Cliente</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#999] mb-1">Nombre completo *</label>
          <input type="text" value={data.name} onChange={(e) => update('name', e.target.value)}
            className="w-full bg-[#1a1a1a] text-white border border-[#333] rounded-sm px-4 py-2.5 text-sm outline-none focus:border-[var(--color-brand)]" placeholder="Ej: Juan Pérez" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#999] mb-1">Email</label>
            <input type="email" value={data.email || ''} onChange={(e) => update('email', e.target.value)}
              className="w-full bg-[#1a1a1a] text-white border border-[#333] rounded-sm px-4 py-2.5 text-sm outline-none focus:border-[var(--color-brand)]" />
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#999] mb-1">Teléfono</label>
            <input type="tel" value={data.phone || ''} onChange={(e) => update('phone', e.target.value)}
              className="w-full bg-[#1a1a1a] text-white border border-[#333] rounded-sm px-4 py-2.5 text-sm outline-none focus:border-[var(--color-brand)]" />
          </div>
        </div>
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#999] mb-1">DNI / Documento</label>
          <input type="text" value={data.dni || ''} onChange={(e) => update('dni', e.target.value)}
            className="w-full bg-[#1a1a1a] text-white border border-[#333] rounded-sm px-4 py-2.5 text-sm outline-none focus:border-[var(--color-brand)]" />
        </div>
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#999] mb-1">Notas internas</label>
          <textarea value={data.notes || ''} onChange={(e) => update('notes', e.target.value)} rows={2}
            className="w-full bg-[#1a1a1a] text-white border border-[#333] rounded-sm px-4 py-2.5 text-sm outline-none focus:border-[var(--color-brand)]" />
        </div>
      </div>
      <div className="flex justify-between mt-6">
        <button onClick={onBack} className="text-sm text-[#888] hover:text-white px-4 py-2.5 transition-colors">← Atrás</button>
        <button onClick={onNext} disabled={!data.name.trim()}
          className="bg-[var(--color-brand)] hover:bg-[var(--color-brand-dark)] text-white text-sm font-bold px-6 py-2.5 rounded-sm transition-colors uppercase tracking-wider disabled:opacity-40">
          Continuar
        </button>
      </div>
    </div>
  );
}
