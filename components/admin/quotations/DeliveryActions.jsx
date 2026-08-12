'use client';
import { generateWhatsAppLink } from '@/utils/whatsapp';

export default function DeliveryActions({ pdfUrl, clientName, clientPhone, quoteNumber }) {
  const shareText = encodeURIComponent(
    `Hola ${clientName}! 👋\n\nTe enviamos la propuesta comercial N° ${quoteNumber}.\n\nPodés ver y descargar el PDF aquí:\n${pdfUrl}\n\nQuedamos a tu disposición. 🏡`
  );

  const whatsappUrl = clientPhone
    ? `https://wa.me/${clientPhone.replace(/\D/g, '')}?text=${shareText}`
    : `https://wa.me/?text=${shareText}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(pdfUrl);
      alert('Link copiado al portapapeles');
    } catch { prompt('Copiá este link:', pdfUrl); }
  };

  return (
    <div className="flex flex-col gap-3 mt-4">
      <a href={pdfUrl} download={`propuesta-${quoteNumber}.pdf`} target="_blank" rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 bg-[var(--color-brand)] text-white rounded-xl px-5 py-3 text-sm font-semibold hover:bg-[var(--color-brand-dark)] transition-colors">
        ⬇️ Descargar PDF
      </a>
      <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 bg-[#25D366] text-white rounded-xl px-5 py-3 text-sm font-semibold hover:bg-[#22c55e] transition-colors">
        💬 Enviar por WhatsApp
      </a>
      <button onClick={handleCopy}
        className="flex items-center justify-center gap-2 bg-zinc-100 text-zinc-700 rounded-xl px-5 py-3 text-sm font-semibold hover:bg-zinc-200 transition-colors">
        🔗 Copiar link del PDF
      </button>
    </div>
  );
}
