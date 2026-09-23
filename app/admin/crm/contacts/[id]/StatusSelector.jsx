'use client';
import { useState } from 'react';
import { updateContactStatus } from '@/app/actions/crmContacts';
import { toast } from 'react-toastify';

export default function StatusSelector({ contactId, currentStatus }) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    setIsUpdating(true);
    
    try {
      const res = await updateContactStatus(contactId, newStatus);
      if (res.error) toast.error(res.error);
      else toast.success(`Estado actualizado a: ${newStatus}`);
    } catch (err) {
      toast.error('Error al actualizar estado');
    } finally {
      setIsUpdating(false);
    }
  };

  const statusColors = {
    'Pendiente': 'bg-gray-500/20 text-gray-400',
    'En gestión': 'bg-blue-500/20 text-blue-400',
    'Interesado': 'bg-amber-500/20 text-amber-400',
    'Oportunidad': 'bg-purple-500/20 text-purple-400',
    'Cotización': 'bg-[var(--color-brand)]/20 text-[var(--color-brand)]',
    'Cliente': 'bg-green-500/20 text-green-400',
    'Descartado': 'bg-red-500/20 text-red-400',
  };

  const colorClass = statusColors[currentStatus || 'Pendiente'];

  return (
    <div className="relative inline-block w-full md:w-auto">
      <select 
        value={currentStatus || 'Pendiente'}
        onChange={handleStatusChange}
        disabled={isUpdating}
        className={`w-full appearance-none px-3 py-1.5 pr-8 border border-[#444] rounded text-xs font-bold uppercase tracking-wider outline-none cursor-pointer transition ${colorClass} ${isUpdating ? 'opacity-50' : 'hover:border-[#666]'}`}
      >
        {Object.keys(statusColors).map(status => (
          <option key={status} value={status} className="bg-[#222] text-white normal-case">
            {status}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-current opacity-70">
        <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
      </div>
    </div>
  );
}
