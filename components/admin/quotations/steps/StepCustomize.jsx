'use client';
import { useState } from 'react';

export default function StepCustomize({ data, wizardState, onChange, onNext, onBack }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const update = (field, value) => onChange({ ...data, [field]: value });

  const handleGenerateAI = async () => {
    setIsGenerating(true);
    try {
      const firstProp = wizardState.properties[0];
      if (!firstProp) {
        alert('Debes seleccionar al menos una propiedad primero.');
        return;
      }

      if (!data.aiMode) {
        alert('Por favor, selecciona un tono de redacción primero (WhatsApp, Comercial o Formal).');
        setIsGenerating(false);
        return;
      }
      
      const parsePrice = (val) => { if (!val) return 0; return parseFloat(String(val).replace(/[^0-9.]/g, '')) || 0; };
      const totalPrice = wizardState.properties.reduce((sum, p) => sum + parsePrice(p.price), 0);

      const aiRes = await fetch('/api/quotations/generate-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selector_version: data.aiMode,
          nombre_cliente: wizardState.client.name || 'Cliente',
          tipo_propiedad: firstProp.type || '',
          operacion: firstProp.operation || 'venta',
          ubicacion: `${firstProp.location?.city || ''}`,
          barrio: firstProp.location?.street || '',
          dormitorios: firstProp.beds || '',
          banos: firstProp.baths || '',
          superficie: firstProp.square_feet ? `${firstProp.square_feet} m²` : '',
          precio: `USD ${totalPrice.toLocaleString('es-AR')}`,
          puntos_destacados: data.aiDescription || 'Excelente oportunidad',
          referencias_ubicacion: '',
          uso_ideal: 'vivir o invertir'
        }),
      });
      const aiData = await aiRes.json();
      if (aiData.description) {
        update('aiDescription', aiData.description);
      } else {
        alert('Error al generar la descripción.');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-white">Personalizar propuesta</h2>

      <div className="space-y-4">


        <div className="flex flex-col gap-4 bg-[#111] border border-[#222] rounded-sm px-4 py-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-white flex items-center gap-2">
                Descripción de la Propiedad
                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full border border-[#444] text-[#888] text-[10px] font-bold cursor-help" title="Puedes escribir la descripción manualmente. Si prefieres, elige un tono y haz clic en 'Generar con IA' para que se escriba sola. Luego podrás editar el resultado a tu gusto antes de generar la propuesta.">?</span>
              </p>
              <p className="text-xs text-[#888] mt-1">Escribe la presentación o usa la IA para generarla.</p>
            </div>
          </div>

          <div className="pt-2">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#999] mb-2">Asistente de Inteligencia Artificial</label>
            <div className="flex flex-wrap items-center gap-3">
              {[
                { id: 'whatsapp', label: 'WhatsApp', desc: 'Natural' },
                { id: 'comercial', label: 'Comercial', desc: 'Venta' },
                { id: 'formal', label: 'Formal', desc: 'Serio' },
              ].map(t => (
                <button key={t.id} onClick={() => update('aiMode', t.id)}
                  className={`px-3 py-1.5 rounded-sm border transition-colors ${data.aiMode === t.id ? 'border-[var(--color-brand)] bg-[var(--color-brand)]/10 text-white' : 'border-[#333] bg-[#1a1a1a] text-[#888] hover:border-[#444]'}`}>
                  <span className="text-xs font-semibold">{t.label}</span>
                </button>
              ))}
              <button 
                onClick={handleGenerateAI} 
                disabled={isGenerating}
                className="ml-auto flex items-center gap-2 bg-[#222] border border-[#333] hover:border-[var(--color-brand)] text-[var(--color-brand)] text-xs font-bold px-4 py-1.5 rounded-sm transition-colors disabled:opacity-50 uppercase tracking-wider">
                {isGenerating ? 'Generando...' : '✨ Generar con IA'}
              </button>
            </div>
          </div>

          <textarea 
            value={data.aiDescription || ''} 
            onChange={(e) => update('aiDescription', e.target.value)} 
            rows={5}
            className="w-full bg-[#1a1a1a] text-white border border-[#333] rounded-sm px-4 py-3 text-[13px] outline-none focus:border-[var(--color-brand)] leading-relaxed" 
            placeholder="Puedes escribir aquí la presentación de la propiedad..." 
          />
        </div>

        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-brand)]">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#999]">Válido hasta</label>
          </div>
          <input type="date" value={data.validUntil || ''} onChange={(e) => update('validUntil', e.target.value)}
            className="w-full bg-[#1a1a1a] text-white border border-[#333] rounded-sm px-4 py-2.5 text-sm outline-none focus:border-[var(--color-brand)] [color-scheme:dark]" />
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