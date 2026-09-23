'use client';
import { useState } from 'react';
import { completeTask } from '@/app/actions/crmContacts';
import { toast } from 'react-toastify';

export default function CompleteTaskButton({ taskId, contactId }) {
  const [isCompleting, setIsCompleting] = useState(false);

  const handleComplete = async () => {
    setIsCompleting(true);
    try {
      const res = await completeTask(taskId, contactId);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success('¡Tarea completada!');
      }
    } catch (err) {
      toast.error('Error al completar tarea');
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <button 
      onClick={handleComplete}
      disabled={isCompleting}
      className="bg-amber-500 hover:bg-amber-600 text-black font-bold px-4 py-3 rounded-lg shadow-lg shadow-amber-500/20 whitespace-nowrap transition-transform active:scale-95 disabled:opacity-50"
    >
      {isCompleting ? '...' : 'Completar'}
    </button>
  );
}
