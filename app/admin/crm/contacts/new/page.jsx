'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createContact } from '@/app/actions/crmContacts';
import { toast } from 'react-toastify';
import Link from 'next/link';

export default function NewContactPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const formData = new FormData(e.currentTarget);
      const res = await createContact(formData);
      
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success('Cliente creado con éxito');
        router.push(`/admin/crm/contacts/${res.contactId}`);
      }
    } catch (err) {
      toast.error('Error de conexión');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = "w-full bg-[#111] border border-[#333] text-white py-2 px-3 rounded focus:outline-none focus:border-[var(--color-brand)]";
  const labelClass = "block text-sm font-bold text-gray-400 mb-2";

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <Link href="/admin/crm/contacts" className="text-gray-400 hover:text-white mb-6 inline-block">&larr; Volver a Clientes</Link>
      
      <h1 className="text-3xl font-extrabold text-white mb-8 tracking-tight uppercase">Nuevo Cliente</h1>

      <form onSubmit={handleSubmit} className="bg-[#1a1a1a] border border-[#333] p-6 rounded-xl shadow-xl space-y-6">
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Nombre *</label>
            <input type="text" name="firstName" required className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Apellido *</label>
            <input type="text" name="lastName" required className={inputClass} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Email</label>
            <input type="email" name="email" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Teléfono</label>
            <input type="tel" name="phone" className={inputClass} />
          </div>
        </div>

        <div>
          <label className={labelClass}>Roles (Mantén presionado Ctrl/Cmd para elegir varios)</label>
          <select name="roles" multiple className={inputClass + " h-32"} required>
            <option value="comprador">Comprador</option>
            <option value="propietario">Propietario</option>
            <option value="inversor">Inversor</option>
            <option value="inquilino">Inquilino</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>Notas iniciales</label>
          <textarea name="notes" rows="4" className={inputClass}></textarea>
        </div>

        <div className="pt-4 border-t border-[#333]">
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-[var(--color-brand)] text-white font-bold py-3 rounded-lg hover:bg-[var(--color-brand-dark)] transition disabled:opacity-50"
          >
            {isSubmitting ? 'Guardando...' : 'Crear Cliente'}
          </button>
        </div>
      </form>
    </div>
  );
}
