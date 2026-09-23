'use client';
import { useState } from 'react';
import { addActivity } from '@/app/actions/crmContacts';
import { toast } from 'react-toastify';
import { FaPlus } from 'react-icons/fa';

export default function NewActivityModal({ contactId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const formData = new FormData(e.currentTarget);
      formData.append('contactId', contactId);
      
      const res = await addActivity(formData);
      
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success('Actividad guardada');
        setIsOpen(false);
      }
    } catch (err) {
      toast.error('Error al guardar la actividad');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = "w-full bg-[#111] border border-[#333] text-white py-2 px-3 rounded focus:outline-none focus:border-[var(--color-brand)]";

  return (
    <>
      {/* Desktop Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="hidden md:flex w-full bg-[var(--color-brand)] hover:bg-[var(--color-brand-dark)] text-white font-bold py-3 px-4 rounded-xl items-center justify-center gap-2 transition"
      >
        <FaPlus /> Registrar Gestión
      </button>

      {/* Mobile Floating CTA */}
      <div className="md:hidden fixed bottom-24 right-4 z-40">
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-[var(--color-brand)] text-white w-14 h-14 rounded-full flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-transform"
        >
          <FaPlus size={20} />
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center bg-black/80 md:p-4 animate-in fade-in duration-200">
          <div className="bg-[#1a1a1a] border border-[#333] rounded-t-2xl md:rounded-xl w-full max-w-lg p-6 shadow-2xl animate-in slide-in-from-bottom-8 md:slide-in-from-bottom-4 duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white uppercase tracking-wider text-[var(--color-brand)] flex items-center gap-2">
                <FaPlus /> Nueva Gestión
              </h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white text-2xl leading-none">&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Tipo de acción *</label>
                  <select name="type" required className={inputClass}>
                    <option value="call">Llamada telefónica</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="visit">Visita (Showing)</option>
                    <option value="email">Email</option>
                    <option value="note">Nota Interna</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Resultado (Corto)</label>
                  <input type="text" name="outcome" placeholder="Ej. 'Interesado'" className={inputClass} />
                </div>
              </div>
              
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Detalles de la gestión *</label>
                <textarea name="notes" rows="4" placeholder="Qué se habló, qué pidió, qué pasó..." required className={inputClass}></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-[#333]">
                <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 text-gray-400 hover:text-white transition font-medium">
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-[var(--color-brand)] hover:bg-[var(--color-brand-dark)] text-white px-6 py-2 rounded-lg font-bold transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Guardando...' : 'Guardar Actividad'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
