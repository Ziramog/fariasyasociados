'use client';
import { useState } from 'react';
import { createTask } from '@/app/actions/crmContacts';
import { toast } from 'react-toastify';

export default function NewTaskModal({ contactId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const formData = new FormData(e.currentTarget);
      formData.append('contactId', contactId);
      
      const res = await createTask(formData);
      
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success('Seguimiento guardado');
        setIsOpen(false);
      }
    } catch (err) {
      toast.error('Error al guardar la tarea');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = "w-full bg-[#111] border border-[#333] text-white py-2 px-3 rounded focus:outline-none focus:border-[var(--color-brand)]";

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="text-xs bg-[#222] hover:bg-[#333] px-3 py-1 rounded text-white border border-[#444] transition"
      >
        + Crear Tarea
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-[#1a1a1a] border border-[#333] rounded-xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">Programar Seguimiento</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 font-bold mb-1 uppercase">Título de la acción *</label>
                <input type="text" name="title" required placeholder="Ej. Llamar para coordinar visita..." className={inputClass} />
              </div>
              
              <div>
                <label className="block text-xs text-gray-400 font-bold mb-1 uppercase">Vencimiento</label>
                <input type="date" name="dueDate" className={inputClass} />
              </div>

              <div>
                <label className="block text-xs text-gray-400 font-bold mb-1 uppercase">Notas / Instrucciones (Opcional)</label>
                <textarea name="description" rows="3" placeholder="Detalles de lo que hay que hacer..." className={inputClass}></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#333]">
                <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 text-gray-400 hover:text-white transition">
                  Cancelar
                </button>
                <button type="submit" disabled={isSubmitting} className="bg-amber-500 hover:bg-amber-600 text-black font-bold px-6 py-2 rounded-lg transition disabled:opacity-50">
                  {isSubmitting ? 'Guardando...' : 'Programar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
