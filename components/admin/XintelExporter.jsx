'use client';
import { toast } from 'react-toastify';
import { useState } from 'react';

export default function XintelExporter({ property }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    try {
      const imagesList = property.images && property.images.length > 0 
        ? property.images.map((img, i) => `${i + 1}. ${img.url}`).join('\n')
        : 'Sin fotos';

      const text = `[XINTEL-START]
TITULO: ${property.name || 'Sin título'}
OPERACION: ${property.operation || 'N/A'}
TIPO: ${property.type || 'N/A'}
PRECIO: ${property.price || 'Consultar'}
DORMITORIOS: ${property.beds || 0}
BANOS: ${property.baths || 0}
SUPERFICIE_TOTAL: ${property.square_feet || 0}
DESCRIPCION: ${property.description || 'Sin descripción'}
UBICACION: ${property.location?.street || ''}, ${property.location?.city || ''}, ${property.location?.state || ''}
FOTOS:
${imagesList}
[XINTEL-END]`;

      navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('¡Resumen de Xintel copiado al portapapeles!');
      
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Error al copiar al portapapeles');
    }
  };

  return (
    <button 
      onClick={handleCopy}
      className={`inline-flex items-center justify-center md:gap-1.5 w-8 h-8 md:w-auto md:px-3 md:py-1.5 border rounded-sm transition-colors ${
        copied 
          ? 'text-green-400 border-green-400/50 bg-green-400/10' 
          : 'text-[12px] font-medium text-[#888] hover:text-[var(--color-brand)] border-[#333] hover:border-[var(--color-brand)]/50'
      }`}
      title="Copiar formato Xintel"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {copied ? (
          <polyline points="20 6 9 17 4 12"></polyline>
        ) : (
          <>
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </>
       )}
      </svg>
      <span className="hidden md:inline">Xintel</span>
    </button>
  );
}