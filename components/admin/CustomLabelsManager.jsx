'use client';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Settings, X, Trash2 } from 'lucide-react';
import updateCustomLabels from '@/app/actions/updateCustomLabels';
import { toast } from 'react-toastify';

export default function CustomLabelsManager({ labels, setLabels }) {
  const [isOpen, setIsOpen] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAdd = async () => {
    const trimmed = newLabel.trim().toUpperCase();
    if (!trimmed || labels.includes(trimmed)) return;
    
    setIsSaving(true);
    const updated = [...labels, trimmed];
    try {
      const res = await updateCustomLabels(updated);
      if (res.error) toast.error(res.error);
      else {
        setLabels(updated);
        setNewLabel('');
      }
    } catch (err) {
      toast.error('Error: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemove = async (labelToRemove) => {
    setIsSaving(true);
    const updated = labels.filter(l => l !== labelToRemove);
    try {
      const res = await updateCustomLabels(updated);
      if (res.error) toast.error(res.error);
      else setLabels(updated);
    } catch (err) {
      toast.error('Error: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#111] border border-[#333] shadow-2xl rounded-xl w-full max-w-md overflow-hidden relative animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-4 border-b border-[#222]">
          <h3 className="text-[14px] font-bold uppercase tracking-wider text-[var(--color-brand)]">Gestor de Etiquetas</h3>
          <button type="button" onClick={() => setIsOpen(false)} className="text-[#888] hover:text-white transition-colors p-1">
            <X className="w-5 h-5" />
          </button>
        </div>
            
        <div className="p-5">
          <div className="mb-6">
            <label className="block text-[11px] font-bold uppercase text-[#555] mb-2">Agregar Nueva</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={newLabel} 
                onChange={e => setNewLabel(e.target.value.toUpperCase())}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAdd();
                  }
                }}
                placeholder="Ej: OPORTUNIDAD" 
                className="w-full bg-[#0a0a0a] border border-[#333] rounded-sm px-3 py-2 text-sm text-white outline-none focus:border-[var(--color-brand)] transition-colors placeholder:text-[#555]"
              />
              <button type="button" onClick={handleAdd} disabled={isSaving || !newLabel.trim()} className="bg-[var(--color-brand)] hover:bg-[var(--color-brand-dark)] text-white px-4 py-2 rounded-sm text-sm font-bold uppercase tracking-wider transition-colors disabled:opacity-50">
                {isSaving ? '...' : 'Agregar'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-[#555] mb-2">Etiquetas Activas</label>
            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[#333] scrollbar-track-transparent">
              {labels.map(label => (
                <div key={label} className="flex items-center gap-2 bg-[#1a1a1a] border border-[#333] pl-3 pr-1 py-1 rounded-sm group">
                  <span className="text-[11px] font-bold text-white uppercase tracking-wider">{label}</span>
                  <button type="button" onClick={() => handleRemove(label)} disabled={isSaving} className="p-1.5 text-[#666] hover:text-red-500 transition-colors opacity-50 group-hover:opacity-100" title="Eliminar">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {labels.length === 0 && (
                <span className="text-[12px] text-[#666] italic py-1">No hay etiquetas personalizadas.</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button 
        type="button" 
        onClick={() => setIsOpen(true)}
        className="ml-auto text-[var(--color-brand)] hover:text-white transition-colors text-sm font-semibold flex items-center gap-1.5"
      >
        <Settings className="w-3.5 h-3.5" />
        Gestionar Etiquetas
      </button>

      {mounted && isOpen && createPortal(modalContent, document.body)}
    </>
  );
}
