'use client';

import { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { Image as ImageIcon, Download, X, LandPlot, Share2 } from 'lucide-react';
import Image from 'next/image';
import { getAreaDisplay } from '@/utils/propertyDisplay';

export default function SocialStoryGenerator({ property }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const printRef = useRef(null);

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

  const getCanvas = async () => {
    if (!printRef.current) return null;
    const parent = printRef.current.parentElement;
    const originalTransform = parent.style.transform;
    parent.style.transform = 'none';
    
    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      const canvas = await html2canvas(printRef.current, {
        useCORS: true,
        scale: 1, 
        allowTaint: true,
        backgroundColor: '#000000',
      });
      return canvas;
    } finally {
      parent.style.transform = originalTransform;
    }
  };

  const handleDownload = async () => {
    setLoading(true);
    try {
      const canvas = await getCanvas();
      if (!canvas) return;
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `historia-${property._id}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error(err);
      alert('Error al generar la imagen');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    setLoading(true);
    try {
      const canvas = await getCanvas();
      if (!canvas) return;
      
      canvas.toBlob(async (blob) => {
        if (!blob) throw new Error('Blob nulo');
        const file = new File([blob], `historia-${property._id}.png`, { type: 'image/png' });
        
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: title,
              text: '¡Mirá esta propiedad!',
            });
          } catch (err) {
            console.error('Share cancelled or failed:', err);
          }
        } else {
          alert('Tu navegador no soporta compartir imágenes directamente. Usa el botón de descargar.');
        }
      }, 'image/png');
    } catch (err) {
      console.error(err);
      alert('Error al compartir la imagen');
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
            Este módulo genera una imagen vertical (1080x1920) lista para subir a Historias de Instagram o Facebook.
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
          {/* We use CSS transform to scale down the 1080x1920 div so it fits the screen while keeping real pixels for html2canvas */}
          <div className="relative" style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div 
              style={{
                width: 1080,
                height: 1920,
                transform: 'scale(min(0.35, 1))', /* visually scale down */
                transformOrigin: 'center center',
              }}
              className="absolute shadow-2xl"
            >
              {/* The Actual Canvas Content */}
              <div ref={printRef} className="w-[1080px] h-[1920px] bg-black relative flex flex-col overflow-hidden">
                {/* Main Background Image */}
                <div className="absolute inset-0">
                  {mainImage ? (
                    <img src={mainImage} alt="" className="w-full h-full object-cover" crossOrigin="anonymous" />
                  ) : (
                    <div className="w-full h-full bg-[#222]" />
                  )}
                </div>
                
                {/* Content */}
                <div className="relative z-10 flex flex-col h-full">
                  {/* Top: Logo & Label */}
                  <div className="flex justify-between items-center p-[80px]">
                    <div className="w-[380px]">
                      <Image src="/images/logo_only.png" alt="Logo" width={500} height={500} className="w-full h-auto object-contain drop-shadow-[0_5px_15px_rgba(0,0,0,0.7)]" />
                    </div>
                  </div>
                  {/* Bottom: Signature Info Section */}
                  <div className="mt-auto w-full bg-black/95 px-[60px] py-[60px] flex flex-col text-white">
                    <h1 className="text-[55px] leading-[1.2] font-normal text-white mb-8" style={{ fontFamily: 'Georgia, serif', letterSpacing: 'normal', textAlign: 'right' }}>{title}</h1>
                    
                    <div className="flex items-center justify-end text-[#b8b8b8] text-[28px] mb-12" style={{ fontFamily: 'Arial, sans-serif', letterSpacing: 'normal' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" fill="none" viewBox="0 0 24 24" stroke="var(--color-brand)" strokeWidth="1.5" className="mr-4 flex-shrink-0">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                      </svg>
                      <div className="text-right">
                        {property?.location?.street}{property?.location?.street && city ? ', ' : ''}
                        {city}{city && property?.location?.state ? ', ' : ''}
                        {property?.location?.state}
                      </div>
                    </div>

                    <div className="flex justify-between items-end">
                      <div className="flex items-center mt-auto">
                        {property.beds > 0 && (
                          <div className="flex items-center font-normal text-[38px] mr-[40px]" style={{ fontFamily: 'Georgia, serif' }}>
                            <img src="/senada/images/icons/ico_bed.svg" alt="" className="w-[40px] h-[40px] mr-[15px]" />
                            <span>{property.beds}</span>
                          </div>
                        )}
                        {property.baths > 0 && (
                          <div className="flex items-center font-normal text-[38px] mr-[40px]" style={{ fontFamily: 'Georgia, serif' }}>
                            <img src="/senada/images/icons/ico_bath.svg" alt="" className="w-[40px] h-[40px] mr-[15px]" />
                            <span>{property.baths}</span>
                          </div>
                        )}
                        {displayArea && (
                          <div className="flex items-center font-normal text-[38px]" style={{ fontFamily: 'Georgia, serif' }}>
                            {isLand ? (
                               <LandPlot className="w-[40px] h-[40px] text-white mr-[15px]" strokeWidth={1.5} />
                            ) : (
                               <img src="/senada/images/icons/ico_sqfoot.svg" alt="" className="w-[40px] h-[40px] mr-[15px]" />
                            )}
                            <span>{displayArea}</span>
                          </div>
                        )}
                      </div>

                      <div className="text-right flex flex-col items-end justify-end">
                         <div className="text-[75px] font-bold leading-[1] mb-3" style={{ fontFamily: 'Georgia, serif' }}>{price}</div>
                         {(operationLabel || statusLabel) && (
                           <div className="text-[#b8b8b8] text-[24px] flex flex-col items-end" style={{ fontFamily: 'Arial, sans-serif' }}>
                              {operationLabel && <div>Operación <span className="text-white">{operationLabel}</span></div>}
                              {statusLabel && <div>Estado <span className="text-white">{statusLabel}</span></div>}
                           </div>
                         )}
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
