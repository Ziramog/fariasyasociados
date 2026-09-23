'use client';
import { useState } from 'react';
import { createBuyerProfile } from '@/app/actions/crmContacts';
import { toast } from 'react-toastify';

export default function NewProfileModal({ contactId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const formData = new FormData(e.currentTarget);
      formData.append('contactId', contactId);
      
      const res = await createBuyerProfile(formData);
      
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success('Perfil de búsqueda configurado');
        setIsOpen(false);
      }
    } catch (err) {
      toast.error('Error al guardar el perfil');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = "w-full bg-[#111] border border-[#333] text-white py-2 px-3 rounded focus:outline-none focus:border-[var(--color-brand)]";
  const labelClass = "block text-xs text-gray-400 font-bold mb-1 uppercase";

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="text-[var(--color-brand)] font-bold text-sm hover:underline"
      >
        + Configurar Perfil
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-[#1a1a1a] border border-[#333] rounded-xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">Perfil de Búsqueda</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Operación *</label>
                  <select name="operation" required className={inputClass}>
                    <option value="venta">Comprar (Venta)</option>
                    <option value="alquiler">Alquilar</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Presupuesto Máximo</label>
                  <input type="number" name="priceMax" placeholder="Ej. 150000" className={inputClass} />
                </div>
              </div>
              
              <div>
                <label className={labelClass}>Zonas de Interés</label>
                <input type="text" name="locations" placeholder="Ej. Alta Gracia, Anisacate (separadas por coma)" className={inputClass} />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#333]">
                <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 text-gray-400 hover:text-white transition">
                  Cancelar
                </button>
                <button type="submit" disabled={isSubmitting} className="bg-[var(--color-brand)] hover:bg-[var(--color-brand-dark)] text-white font-bold px-6 py-2 rounded-lg transition disabled:opacity-50">
                  {isSubmitting ? 'Guardando...' : 'Guardar Perfil'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
