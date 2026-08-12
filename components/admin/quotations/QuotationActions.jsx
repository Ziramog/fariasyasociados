'use client';
import { useState } from 'react';
import { deleteQuotation } from '@/app/actions/deleteQuotation';
import Link from 'next/link';

export default function QuotationActions({ quotationId, trackingToken, aiDescription }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (confirm('¿Estás seguro de eliminar esta propuesta?')) {
      setIsDeleting(true);
      await deleteQuotation(quotationId);
      // El listado debería actualizarse automáticamente vía revalidatePath en el action
    }
  };

  const handleCopyLink = () => {
    if (!trackingToken) {
      alert('Esta propuesta es antigua y no tiene link de seguimiento.');
      return;
    }
    const link = `${window.location.origin}/p/${trackingToken}`;
    navigator.clipboard.writeText(link);
    alert('¡Link copiado! ' + link);
  };

  const handleCopyText = () => {
    if (!aiDescription) {
      alert('Esta propuesta no tiene descripción generada por IA.');
      return;
    }
    const link = trackingToken ? `\n\nLink a la propuesta: ${window.location.origin}/p/${trackingToken}` : '';
    const textToCopy = `${aiDescription}${link}`;
    navigator.clipboard.writeText(textToCopy);
    alert('¡Texto copiado al portapapeles!');
  };

  return (
    <div className="flex items-center gap-1.5">
      <Link
        href={`/admin/quotations/${quotationId}/edit`}
        className="inline-flex items-center justify-center w-7 h-7 bg-[#222] text-[#888] rounded-sm hover:bg-[var(--color-brand)] hover:text-white transition-colors"
        title="Editar"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      </Link>

      <button 
        onClick={handleCopyLink} 
        className="inline-flex items-center justify-center w-7 h-7 bg-[#222] text-[#888] rounded-sm hover:bg-[#333] hover:text-white transition-colors"
        title="Copiar Link Público"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      </button>

      {aiDescription && (
        <button 
          onClick={handleCopyText} 
          className="inline-flex items-center justify-center w-7 h-7 bg-[#222] text-[#888] rounded-sm hover:bg-[#10B981] hover:text-white transition-colors"
          title="Copiar Texto WhatsApp"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      )}

      <button 
        onClick={handleDelete} 
        disabled={isDeleting}
        className={`inline-flex items-center justify-center w-7 h-7 bg-red-900/20 text-red-500 rounded-sm hover:bg-red-500 hover:text-white transition-colors ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
        title="Eliminar"
      >
        {isDeleting ? (
          <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        )}
      </button>
    </div>
  );
}
