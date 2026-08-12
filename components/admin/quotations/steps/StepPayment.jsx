'use client';
import { useState, useMemo } from 'react';
import { calculateFrenchSystem } from '@/lib/quotations/payment-calculator';

export default function StepPayment({ data, propertyPrice, onChange, onNext, onBack }) {
  const update = (field, value) => onChange({ ...data, [field]: value });

  const principal = propertyPrice || 0;
  const isFinanced = data.type === 'financiado';

  const schedule = useMemo(() => {
    if (!isFinanced || !data.installments) return null;
    try {
      return calculateFrenchSystem(principal, data.interestRate || 10, data.installments, data.downPaymentPct || 30);
    } catch { return null; }
  }, [isFinanced, principal, data.installments, data.interestRate, data.downPaymentPct]);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-white">Condiciones de pago</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#999] mb-1">Tipo de operación</label>
          <select value={data.type} onChange={(e) => update('type', e.target.value)}
            className="w-full bg-[#1a1a1a] text-white border border-[#333] rounded-sm px-4 py-2.5 text-sm outline-none focus:border-[var(--color-brand)]">
            <option value="contado">Contado</option>
            <option value="financiado">Financiado</option>
          </select>
        </div>

        {isFinanced && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#999] mb-1">% Anticipo</label>
                <input type="number" value={data.downPaymentPct || 30} onChange={(e) => update('downPaymentPct', Number(e.target.value))}
                  className="w-full bg-[#1a1a1a] text-white border border-[#333] rounded-sm px-4 py-2.5 text-sm outline-none focus:border-[var(--color-brand)]" min={0} max={100} />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#999] mb-1">Cuotas</label>
                <input type="number" value={data.installments || ''} onChange={(e) => update('installments', Number(e.target.value))}
                  className="w-full bg-[#1a1a1a] text-white border border-[#333] rounded-sm px-4 py-2.5 text-sm outline-none focus:border-[var(--color-brand)]" min={1} max={360} />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#999] mb-1">Tasa interés anual (%)</label>
              <input type="number" value={data.interestRate || 10} onChange={(e) => update('interestRate', Number(e.target.value))}
                className="w-full bg-[#1a1a1a] text-white border border-[#333] rounded-sm px-4 py-2.5 text-sm outline-none focus:border-[var(--color-brand)]" step="0.1" min={0} max={100} />
            </div>

            {schedule && (
              <div className="bg-[#111] border border-[#222] rounded-sm p-4 space-y-2">
                <p className="text-xs font-semibold text-[#888] uppercase tracking-wider">Resumen financiero</p>
                <div className="flex justify-between text-sm"><span className="text-[#888]">Valor propiedad</span><span className="font-semibold text-white">U$D {principal.toLocaleString('es-AR')}</span></div>
                <div className="flex justify-between text-sm"><span className="text-[#888]">Anticipo ({schedule.downPaymentPct}%)</span><span className="font-semibold text-white">U$D {schedule.downPayment.toLocaleString('es-AR')}</span></div>
                <div className="flex justify-between text-sm"><span className="text-[#888]">Cuotas</span><span className="font-semibold text-white">{schedule.installments} de U$D {schedule.installmentAmount.toLocaleString('es-AR')}</span></div>
                <div className="flex justify-between text-sm"><span className="text-[#888]">Total financiado</span><span className="font-semibold text-white">U$D {schedule.totalPaid.toLocaleString('es-AR')}</span></div>
                <div className="flex justify-between text-sm border-t border-[#333] pt-2"><span className="text-white font-semibold">Total con intereses</span><span className="font-bold text-[var(--color-brand)]">U$D {schedule.totalPaid.toLocaleString('es-AR')}</span></div>
              </div>
            )}
          </>
        )}

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#999] mb-1">Notas de cotización</label>
          <textarea value={data.notes || ''} onChange={(e) => update('notes', e.target.value)} rows={2}
            className="w-full bg-[#1a1a1a] text-white border border-[#333] rounded-sm px-4 py-2.5 text-sm outline-none focus:border-[var(--color-brand)]" placeholder="Ej: El precio incluye gastos de escrituración..." />
        </div>
      </div>

      <div className="flex justify-between mt-6">
        <button onClick={onBack} className="text-sm text-[#888] hover:text-white px-4 py-2.5 transition-colors">← Atrás</button>
        <button onClick={onNext}
          className="bg-[var(--color-brand)] hover:bg-[var(--color-brand-dark)] text-white text-sm font-bold px-6 py-2.5 rounded-sm transition-colors uppercase tracking-wider">
          Continuar
        </button>
      </div>
    </div>
  );
}
