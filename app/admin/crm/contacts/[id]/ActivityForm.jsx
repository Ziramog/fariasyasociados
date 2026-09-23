'use client';
import { useState } from 'react';
import { addActivity } from '@/app/actions/crmContacts';
import { toast } from 'react-toastify';

export default function ActivityForm({ contactId }) {
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
        e.target.reset();
      }
    } catch (err) {
      toast.error('Error al guardar la actividad');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = "w-full bg-[#111] border border-[#333] text-white py-2 px-3 rounded focus:outline-none focus:border-[var(--color-brand)]";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <select name="type" required className={inputClass}>
            <option value="note">Nota Interna</option>
            <option value="call">Llamada telefónica</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="visit">Visita (Showing)</option>
            <option value="email">Email</option>
          </select>
        </div>
        <div>
          <input type="text" name="outcome" placeholder="Resultado corto (ej. 'Interesado')" className={inputClass} />
        </div>
      </div>
      
      <div>
        <textarea name="notes" rows="3" placeholder="Detalles de la conversación o visita..." required className={inputClass}></textarea>
      </div>

      <div className="flex justify-end">
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="bg-[var(--color-brand)] hover:bg-[var(--color-brand-dark)] text-white px-4 py-2 rounded font-bold transition disabled:opacity-50"
        >
          {isSubmitting ? 'Guardando...' : 'Guardar Actividad'}
        </button>
      </div>
    </form>
  );
}
