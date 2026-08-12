'use client';
import { useState } from 'react';

export default function StepPreview({ wizardState, isGenerating, generatedPDFUrl, onGenerate, onBack }) {
  const { properties, client, payment, customization } = wizardState;
  const parsePrice = (val) => { if (!val) return 0; return parseFloat(String(val).replace(/[^0-9.]/g, '')) || 0; };
  const totalValue = properties.reduce((sum, p) => sum + parsePrice(p.price), 0);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-white">Resumen y generación</h2>

      <div className="space-y-4">
        {/* Propiedades */}
        <div className="bg-[#111] border border-[#222] rounded-sm p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#888] mb-2">Propiedades ({properties.length})</p>
          {properties.map((p, i) => (
            <div key={i} className="flex items-center gap-3 py-2 border-b border-[#333] last:border-0">
              {p.images?.[0]?.url && <img src={p.images[0].url} alt="" className="w-10 h-10 rounded-lg object-cover" />}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{p.name}</p>
                <p className="text-xs text-[#888]">{p.location?.city || ''}</p>
              </div>
              <span className="text-sm font-semibold text-white">{p.price || '—'}</span>
            </div>
          ))}
          <div className="flex justify-between pt-2 mt-1 border-t border-[#333]">
            <span className="text-sm font-semibold text-white">Valor total</span>
            <span className="text-sm font-bold text-[var(--color-brand)]">U$D {totalValue.toLocaleString('es-AR')}</span>
          </div>
        </div>

        {/* Cliente */}
        <div className="bg-[#111] border border-[#222] rounded-sm p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#888] mb-1">Cliente</p>
          <p className="text-sm font-medium text-white">{client.name}</p>
          {client.email && <p className="text-xs text-[#888]">{client.email}</p>}
          {client.phone && <p className="text-xs text-[#888]">{client.phone}</p>}
        </div>

        {/* Pago */}
        <div className="bg-[#111] border border-[#222] rounded-sm p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#888] mb-1">Pago</p>
          {payment.type === 'contado' ? (
            <p className="text-sm font-medium text-[#4ade80]">Pago de contado</p>
          ) : (
            <div className="space-y-1">
              <p className="text-sm font-medium text-white">Financiado</p>
              {payment.downPaymentPct > 0 && <p className="text-xs text-[#888]">{payment.downPaymentPct}% anticipo — U$D {payment.downPayment?.toLocaleString('es-AR')}</p>}
              {payment.installments > 0 && <p className="text-xs text-[#888]">{payment.installments} cuotas de U$D {payment.installmentAmount?.toLocaleString('es-AR')}</p>}
              {payment.interestRate > 0 && <p className="text-xs text-[#888]">{payment.interestRate}% interés anual</p>}
              {payment.totalPaid > 0 && <p className="text-xs font-semibold text-[var(--color-brand)]">Total con intereses: U$D {payment.totalPaid.toLocaleString('es-AR')}</p>}
            </div>
          )}
        </div>

        {/* Notas */}
        {(payment.notes || customization.agentNotes) && (
          <div className="bg-[#111] border border-[#222] rounded-sm p-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#888] mb-2">Notas</p>
            {payment.notes && <p className="text-xs text-[#888] mb-1">{payment.notes}</p>}
            {customization.agentNotes && <p className="text-xs text-[#888]">{customization.agentNotes}</p>}
          </div>
        )}

        {/* Generar PDF */}
        {generatedPDFUrl ? (
          <div className="bg-[#1a2e1e] border border-[#2e5234] rounded-sm p-4 text-center">
            <p className="text-sm font-semibold text-[#4ade80] mb-2">✅ PDF generado correctamente</p>
            <a href={generatedPDFUrl} target="_blank" rel="noopener noreferrer"
              className="inline-block bg-[var(--color-brand)] hover:bg-[var(--color-brand-dark)] text-white text-sm font-bold px-6 py-2.5 rounded-sm transition-colors uppercase tracking-wider">
              Descargar PDF
            </a>
          </div>
        ) : (
          <button onClick={onGenerate} disabled={isGenerating}
            className="w-full bg-[var(--color-brand)] hover:bg-[var(--color-brand-dark)] text-white text-sm font-bold px-6 py-3 rounded-sm transition-colors uppercase tracking-wider disabled:opacity-40">
            {isGenerating ? 'Generando PDF...' : 'Generar Propuesta'}
          </button>
        )}
      </div>

      <div className="flex justify-between mt-6">
        <button onClick={onBack} className="text-sm text-[#888] hover:text-white px-4 py-2.5 transition-colors">← Atrás</button>
      </div>
    </div>
  );
}
