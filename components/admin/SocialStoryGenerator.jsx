'use client';

import { useState, useRef } from 'react';
import { Image as ImageIcon, Download, X, LandPlot, Share2 } from 'lucide-react';
import Image from 'next/image';
import { getAreaDisplay } from '@/utils/propertyDisplay';

export default function SocialStoryGenerator({ property }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const mainImage = property?.images?.[0]?.url || '';
  const price = property?.price || 'Consultar';
  const op = property?.operation?.toUpperCase() || 'VENTA';
  const city = property?.location?.city || '';
  const title = property?.name || '';
  
  const displayArea = getAreaDisplay(property);
  const isLand = ['Terreno', 'Campo', 'Gran Inversión'].includes(property?.type);
  
  const operationLabel =
    property?.operation === 'venta' ? 'Venta' :
    property?.operation === 'alquiler' ? 'Alquiler' :
    property?.operation === 'compra' ? 'Compra' : '';

  const statusMap = {
    'PRECIO MEJORADO': 'Precio Mejorado',
    'ULTIMA UNIDAD': 'Última Unidad',
    'UNICO EN SU TIPO': 'Única en su Tipo',
    'MEJOR PRECIO': 'Mejor Precio del Mercado',
    'NUEVA': 'Nueva',
    'EXCELENTE PRECIO': 'Excelente Precio',
    'AMOBLADA': 'Amoblada',
  };
  const statusLabel = statusMap[property?.status];

  /* ────────────────────────────────────────────
   * Server-side image generation via /api/generate-story/[id]
   * Uses next/og (satori) — no html2canvas, no browser quirks.
   * ──────────────────────────────────────────── */
  const fetchStoryBlob = async () => {
    const res = await fetch(`/api/generate-story/${property._id}`);
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || 'Error del servidor');
    }
    return await res.blob();
  };

  const handleDownload = async () => {
    setLoading(true);
    try {
      const blob = await fetchStoryBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `historia-${property._id}.png`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Error al generar la imagen: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    setLoading(true);
    try {
      const blob = await fetchStoryBlob();
      const file = new File([blob], `historia-${property._id}.png`, { type: 'image/png' });
      
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: title,
            text: '¡Mirá esta propiedad!',
          });
        } catch (err) {
          if (err.name !== 'AbortError') {
            console.error('Share failed:', err);
          }
        }
      } else {
        alert('Tu navegador no soporta compartir imágenes directamente. Usa el botón de descargar.');
      }
    } catch (err) {
      console.error(err);
      alert('Error al compartir la imagen: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center justify-center md:gap-1.5 text-[12px] font-medium text-[#888] hover:text-pink-500 w-8 h-8 md:w-auto md:px-3 md:py-1.5 border border-[#333] hover:border-pink-500/50 rounded-sm transition-colors"
        title="Generar Historia IG"
      >
        <ImageIcon className="w-3.5 h-3.5" />
        <span className="hidden md:inline">Historia</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-4">
      {/* Modal Container */}
      <div className="bg-[#111] border border-[#333] rounded-sm w-full max-w-5xl flex flex-col md:flex-row h-full max-h-[90vh] overflow-hidden">
        
        {/* Left Side: Controls & Info */}
        <div className="w-full md:w-1/3 p-6 border-b md:border-b-0 md:border-r border-[#333] flex flex-col gap-6 overflow-y-auto">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white uppercase tracking-wider">Generador IG</h2>
            <button onClick={() => setIsOpen(false)} className="text-[#888] hover:text-white"><X /></button>
          </div>
          
          <p className="text-sm text-[#aaa]">
            La imagen se genera en el servidor de forma fiel al diseño. Hacé clic en descargar o compartir.
          </p>
          
          <div className="bg-[#0a0a0a] border border-[#222] p-4 rounded-sm flex flex-col gap-3 text-[13px]">
            <p><span className="text-[#888]">Operación:</span> <strong className="text-white">{op}</strong></p>
            <p><span className="text-[#888]">Precio:</span> <strong className="text-white">{price}</strong></p>
            <p><span className="text-[#888]">Ubicación:</span> <strong className="text-white">{city}</strong></p>
            <p><span className="text-[#888]">Detalles:</span> <strong className="text-white">{property.beds ? `${property.beds} Dorm | ` : ''}{property.baths ? `${property.baths} Baños | ` : ''}{displayArea}</strong></p>
          </div>
          
          <div className="mt-auto flex flex-col gap-3">
            <button 
              onClick={handleShare} 
              disabled={loading}
              className="bg-gradient-to-r from-pink-600 to-orange-500 hover:from-pink-500 hover:to-orange-400 text-white font-bold py-4 px-6 rounded-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Share2 className="w-5 h-5" />}
              {loading ? 'Generando...' : 'Compartir (Mobile)'}
            </button>
            <button 
              onClick={handleDownload} 
              disabled={loading}
              className="border border-[#444] hover:bg-[#222] text-[#ccc] hover:text-white font-bold py-3 px-6 rounded-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              Descargar Imagen
            </button>
          </div>
        </div>

        {/* Right Side: Preview */}
        <div className="w-full md:w-2/3 bg-[#0a0a0a] flex items-center justify-center p-4 relative overflow-hidden">
          <div className="relative w-full h-full flex items-center justify-center">
            <div 
              style={{
                width: 1080,
                height: 1920,
                transform: 'scale(min(0.35, 1))',
                transformOrigin: 'center center',
              }}
              className="absolute shadow-2xl"
            >
              {/* Visual preview only (not used for capture) */}
              <div className="w-[1080px] h-[1920px] bg-black relative flex flex-col overflow-hidden">
                {/* Background */}
                <div className="absolute inset-0">
                  {mainImage ? (
                    <img src={mainImage} alt="" className="w-full h-full object-cover" crossOrigin="anonymous" />
                  ) : (
                    <div className="w-full h-full bg-[#222]" />
                  )}
                </div>
                
                {/* Content */}
                <div className="relative z-10 flex flex-col h-full">
                  {/* Top: Logo & Badge */}
                  <div className="flex justify-between items-start p-[70px]">
                    <div className="w-[320px]">
                      <Image src="/images/logo_only.png" alt="Logo" width={500} height={500} className="w-full h-auto object-contain drop-shadow-[0_5px_15px_rgba(0,0,0,0.7)]" />
                    </div>
                    <div className="bg-[var(--color-brand)] text-white text-[42px] font-black uppercase tracking-[5px] px-9 h-[80px] flex items-center justify-center rounded-[20px] border-[3px] border-white/35">
                      {op}
                    </div>
                  </div>
                  
                  {/* Bottom */}
                  <div className="mt-auto w-full bg-black/[0.92] px-[60px] py-[50px] flex flex-col text-white">
                    <h1 className="text-[50px] leading-[1.2] font-normal text-white text-center mb-4 font-[Georgia,serif]">{title}</h1>
                    
                    <div className="flex items-center justify-center text-[#b8b8b8] text-[25px] mb-[35px]">
                      <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="none" viewBox="0 0 24 24" stroke="var(--color-brand)" strokeWidth="1.5" className="mr-2.5 flex-shrink-0">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                      </svg>
                      <span>
                        {property?.location?.street}{property?.location?.street && city ? ', ' : ''}
                        {city}{city && property?.location?.state ? ', ' : ''}
                        {property?.location?.state}
                      </span>
                    </div>

                    <div className="text-[78px] font-bold leading-none text-center mb-[18px] font-[Georgia,serif]">{price}</div>

                    <div className="flex justify-between items-end">
                      <div className="flex items-center">
                        {property.beds > 0 && (
                          <div className="flex items-center text-[34px] mr-[30px]">
                            <img src="/senada/images/icons/ico_bed.svg" alt="" className="w-[38px] h-[38px] mr-3" />
                            <span>{property.beds}</span>
                          </div>
                        )}
                        {property.baths > 0 && (
                          <div className="flex items-center text-[34px] mr-[30px]">
                            <img src="/senada/images/icons/ico_bath.svg" alt="" className="w-[38px] h-[38px] mr-3" />
                            <span>{property.baths}</span>
                          </div>
                        )}
                        {displayArea && (
                          <div className="flex items-center text-[34px]">
                            {isLand ? (
                              <LandPlot className="w-[38px] h-[38px] text-white mr-3" strokeWidth={1.5} />
                            ) : (
                              <img src="/senada/images/icons/ico_sqfoot.svg" alt="" className="w-[38px] h-[38px] mr-3" />
                            )}
                            <span>{displayArea}</span>
                          </div>
                        )}
                      </div>
                      <div className="text-right text-[22px]">
                        {operationLabel && <div className="text-[#b8b8b8]">Operación <span className="text-white font-bold">{operationLabel}</span></div>}
                        {statusLabel && <div className="text-[#b8b8b8]">Estado <span className="text-white font-bold">{statusLabel}</span></div>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
