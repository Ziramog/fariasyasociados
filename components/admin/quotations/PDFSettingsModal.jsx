'use client';
import { useState, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import AgentNameForm from '@/components/AgentNameForm';
import { Settings, X } from 'lucide-react';

export default function PDFSettingsModal({ initialConfig, user }) {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState(initialConfig || {});
  const [uploading, setUploading] = useState(false);
  const [savingRate, setSavingRate] = useState(false);
  const [savingSig, setSavingSig] = useState(false);
  const [rateValue, setRateValue] = useState(config?.exchangeRateARS || '');

  const sigRef = useRef(null);

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('logo', file);
      const res = await fetch('/api/quotations/upload-logo', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.logoUrl) {
        setConfig(prev => ({ ...prev, logoUrl: data.logoUrl }));
      } else {
        alert('Error: ' + (data.error || 'No se pudo subir el logo'));
      }
    } catch (err) {
      alert('Error al subir logo: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const saveExchangeRate = async () => {
    setSavingRate(true);
    try {
      const res = await fetch('/api/site-config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exchangeRateARS: parseFloat(rateValue) || null }),
      });
      const data = await res.json();
      if (data.success) {
        setConfig(prev => ({ ...prev, exchangeRateARS: parseFloat(rateValue) || null }));
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setSavingRate(false);
    }
  };

  const saveSignature = async () => {
    setSavingSig(true);
    try {
      const dataUrl = sigRef.current?.toDataURL?.('image/png');
      const isEmpty = !dataUrl || dataUrl === 'data:image/png;base64,';
      const res = await fetch('/api/site-config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signatureBase64: isEmpty ? null : dataUrl }),
      });
      if (res.ok) {
        setConfig(prev => ({ ...prev, signatureBase64: isEmpty ? null : dataUrl }));
      } else {
        const errData = await res.json();
        alert('Error al guardar firma: ' + (errData.error || res.status));
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setSavingSig(false);
    }
  };

  const clearSignaturePad = () => {
    if (sigRef.current) sigRef.current.clear();
  };

  const inputCls = 'w-full bg-[#0a0a0a] border border-[#333] rounded-sm px-3 py-2 text-sm text-white outline-none focus:border-[var(--color-brand)] transition-colors placeholder:text-[#555]';
  const btnPrimary = 'bg-[var(--color-brand)] hover:bg-[var(--color-brand-dark)] text-white text-xs font-bold px-4 py-2 rounded-sm transition-colors uppercase tracking-wider disabled:opacity-40';
  const btnSecondary = 'text-xs text-[#999] hover:text-white border border-[#333] px-3 py-2 rounded-sm transition-colors';

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="inline-flex items-center justify-center bg-[#161616] border border-[#222] hover:bg-[#222] hover:border-[#333] text-[#888] hover:text-white rounded-sm p-2 transition-all ml-3" title="Configuración de Propuestas (PDF)">
        <Settings className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#161616] border border-[#333] rounded-sm max-w-4xl w-full max-h-[90vh] overflow-y-auto relative shadow-2xl">
            <div className="sticky top-0 bg-[#161616] z-10 flex items-center justify-between p-4 md:p-5 border-b border-[#333]">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-[var(--color-brand)]" />
                <h2 className="text-lg font-bold text-white tracking-wide uppercase">Configuración de Propuestas PDF</h2>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-[#888] hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-5 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Agent Name */}
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 mb-3">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#888] mb-0">Nombre del Agente</p>
                </div>
                <AgentNameForm initialName={user?.agentName} />
                <p className="text-[10px] text-[#aaa] mt-2">Se imprime en el pie de página de los PDF, estableciendo al responsable.</p>
              </div>

              {/* Logo */}
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 mb-3">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#888] mb-0">Logo Inmobiliaria</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-sm border border-[#333] flex items-center justify-center overflow-hidden bg-[#0a0a0a]">
                    {config.logoUrl ? (
                      <img src={config.logoUrl} alt="Logo" className="object-contain w-full h-full" />
                    ) : (
                      <span className="text-[#555] text-[10px] text-center px-1">Sin logo</span>
                    )}
                  </div>
                  <div>
                    <label className={`${btnPrimary} cursor-pointer inline-block`}>
                      {uploading ? 'Subiendo...' : 'Seleccionar'}
                      <input type="file" accept="image/png,image/jpeg" className="hidden" onChange={handleLogoUpload} disabled={uploading} />
                    </label>
                    <p className="text-[10px] text-[#555] mt-1">PNG o JPG ideal</p>
                  </div>
                </div>
              </div>

              {/* Tipo de Cambio */}
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 mb-3">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#888] mb-0">Tipo de Cambio (ARS/USD)</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[12px] text-[#666]">$</span>
                    <input type="number" value={rateValue} onChange={(e) => setRateValue(e.target.value)}
                      className={`${inputCls} w-32 pl-5`} placeholder="1200" min="0" step="1" />
                  </div>
                  <button onClick={saveExchangeRate} disabled={savingRate} className={btnPrimary}>
                    {savingRate ? '...' : 'Guardar'}
                  </button>
                </div>
                <p className="text-[10px] text-[#aaa] mt-2">Convierte automáticamente los precios USD a ARS en las propuestas.</p>
              </div>

              {/* Signature */}
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#888] mb-0">Firma Digital</p>
                  {config.signatureBase64 && (
                    <span className="text-[10px] text-green-400 font-bold uppercase tracking-wider">Guardada</span>
                  )}
                </div>
                <div className="border border-[#333] rounded-sm overflow-hidden mb-2 bg-white" style={{ filter: 'invert(1) hue-rotate(180deg)' }}>
                  <SignatureCanvas
                    ref={sigRef}
                    penColor="#1a1a1a"
                    canvasProps={{ className: 'w-full', style: { width: '100%', height: 75 } }}
                  />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex gap-2">
                    <button onClick={clearSignaturePad} className={btnSecondary}>Limpiar</button>
                    <button onClick={saveSignature} disabled={savingSig} className={btnPrimary}>
                      {savingSig ? 'Guardando...' : 'Guardar'}
                    </button>
                  </div>
                  {config.signatureBase64 && (
                    <div className="w-16 p-1 bg-[#0a0a0a] border border-[#222] rounded-sm flex items-center justify-center flex-shrink-0">
                      <img src={config.signatureBase64} alt="Firma" className="h-6 object-contain invert opacity-90" />
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
}
