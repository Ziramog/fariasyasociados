'use client';
import { useState } from 'react';
import { updateQuotationStatus } from '@/app/actions/updateQuotationStatus';

const STATUS_CONFIG = [
  { id: 'draft', label: 'Borrador', color: 'bg-zinc-700 text-zinc-300', border: 'border-zinc-500' },
  { id: 'sent', label: 'Enviado', color: 'bg-blue-900/40 text-blue-400', border: 'border-blue-500/50' },
  { id: 'viewed', label: 'Visto', color: 'bg-amber-900/40 text-amber-400', border: 'border-amber-500/50' },
  { id: 'accepted', label: 'Aceptado', color: 'bg-green-900/40 text-green-400', border: 'border-green-500/50' },
  { id: 'rejected', label: 'Rechazado', color: 'bg-red-900/40 text-red-400', border: 'border-red-500/50' },
  { id: 'expired', label: 'Vencido', color: 'bg-zinc-800 text-zinc-500', border: 'border-zinc-600/50' },
];

export default function StatusSelector({ quotationId, initialStatus }) {
  const [status, setStatus] = useState(initialStatus);
  const [isUpdating, setIsUpdating] = useState(false);

  const currentCfg = STATUS_CONFIG.find((s) => s.id === status) || STATUS_CONFIG[0];

  const handleChange = async (e) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    setIsUpdating(true);
    await updateQuotationStatus(quotationId, newStatus);
    setIsUpdating(false);
  };

  return (
    <div className="relative inline-block w-[100px]">
      <select
        value={status}
        onChange={handleChange}
        disabled={isUpdating}
        className={`appearance-none w-full text-center text-[10px] font-bold px-2 py-1.5 rounded-sm uppercase tracking-wider cursor-pointer border focus:outline-none focus:ring-1 focus:ring-white/20 transition-colors ${currentCfg.color} ${currentCfg.border} ${isUpdating ? 'opacity-50' : ''}`}
      >
        {STATUS_CONFIG.map((cfg) => (
          <option key={cfg.id} value={cfg.id} className="bg-[#1a1a1a] text-white">
            {cfg.label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1">
        <svg className={`w-3 h-3 ${currentCfg.color.split(' ')[1]}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}
