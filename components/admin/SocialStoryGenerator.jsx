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

  /* ────────────────────────────────────────────
   * CAPTURE FIX:
   * The preview uses CSS transform:scale() to fit 1080×1920 on screen.
   * html2canvas can't handle that — it distorts the output.
   *
   * Solution: clone the canvas node, append it to <body> at full size
   * but off-screen (left:-9999px), capture the clone, then remove it.
   * This guarantees a pixel-perfect 1080×1920 capture every time.
   * ──────────────────────────────────────────── */
  const getCanvas = async () => {
    if (!printRef.current) return null;

    // Clone the entire canvas DOM
    const clone = printRef.current.cloneNode(true);

    // Position off-screen at full 1080×1920
    Object.assign(clone.style, {
      position: 'fixed',
      left: '-9999px',
      top: '0',
      width: '1080px',
      height: '1920px',
      minWidth: '1080px',
      maxWidth: '1080px',
      transform: 'none',
      zIndex: '-1',
      overflow: 'hidden',
    });

    document.body.appendChild(clone);

    // Wait for images inside the clone to load
    const images = clone.querySelectorAll('img');
    await Promise.all(
      Array.from(images).map(
        (img) =>
          new Promise((resolve) => {
            if (img.complete) return resolve();
            img.onload = resolve;
            img.onerror = resolve;
          })
      )
    );

    // Small extra delay for layout
    await new Promise((r) => setTimeout(r, 200));

    try {
      const canvas = await html2canvas(clone, {
        useCORS: true,
        scale: 1,
        width: 1080,
        height: 1920,
        windowWidth: 1080,
        windowHeight: 1920,
        allowTaint: true,
        backgroundColor: '#000000',
      });
      return canvas;
    } finally {
      document.body.removeChild(clone);
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
          <div className="relative" style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div 
              style={{
                width: 1080,
                height: 1920,
                transform: 'scale(min(0.35, 1))',
                transformOrigin: 'center center',
              }}
              className="absolute shadow-2xl"
            >
              {/* The Actual Canvas Content — ref={printRef} */}
              <div ref={printRef} style={{ width: 1080, height: 1920, position: 'relative', display: 'flex', flexDirection: 'column', overflow: 'hidden', backgroundColor: '#000' }}>
                {/* Main Background Image */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                  {mainImage ? (
                    <img src={mainImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} crossOrigin="anonymous" />
                  ) : (
                    <div style={{ width: '100%', height: '100%', backgroundColor: '#222' }} />
                  )}
                </div>
                
                {/* Content overlay */}
                <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', height: '100%' }}>
                  {/* Top: Logo & Operation Label */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: 80 }}>
                    <div style={{ width: 380 }}>
                      <Image src="/images/logo_only.png" alt="Logo" width={500} height={500} style={{ width: '100%', height: 'auto', objectFit: 'contain' }} />
                    </div>
                    {/* Operation badge — simple solid styles only, no CSS shadows */}
                    <div style={{
                      backgroundColor: 'var(--color-brand)',
                      color: '#fff',
                      fontSize: 42,
                      fontWeight: 900,
                      fontFamily: 'Arial, sans-serif',
                      textTransform: 'uppercase',
                      letterSpacing: 6,
                      paddingLeft: 40,
                      paddingRight: 40,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: 85,
                      lineHeight: 1,
                      borderRadius: 24,
                      border: '3px solid rgba(255,255,255,0.3)',
                    }}>
                      {op}
                    </div>
                  </div>

                  {/* Bottom: Info Section */}
                  <div style={{
                    marginTop: 'auto',
                    width: '100%',
                    backgroundColor: 'rgba(0,0,0,0.92)',
                    paddingLeft: 60,
                    paddingRight: 60,
                    paddingTop: 55,
                    paddingBottom: 55,
                    display: 'flex',
                    flexDirection: 'column',
                    color: '#fff',
                  }}>
                    {/* Title */}
                    <div style={{
                      fontSize: 52,
                      lineHeight: 1.15,
                      fontWeight: 400,
                      fontFamily: 'Georgia, serif',
                      color: '#fff',
                      textAlign: 'center',
                      marginBottom: 20,
                    }}>
                      {title}
                    </div>
                    
                    {/* Location */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#b8b8b8',
                      fontSize: 26,
                      fontFamily: 'Arial, sans-serif',
                      marginBottom: 40,
                    }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="none" viewBox="0 0 24 24" stroke="var(--color-brand)" strokeWidth="1.5" style={{ marginRight: 10, flexShrink: 0 }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                      </svg>
                      <span>
                        {property?.location?.street}{property?.location?.street && city ? ', ' : ''}
                        {city}{city && property?.location?.state ? ', ' : ''}
                        {property?.location?.state}
                      </span>
                    </div>

                    {/* Price row */}
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
                      <div style={{ fontSize: 80, fontWeight: 700, lineHeight: 1, fontFamily: 'Georgia, serif', color: '#fff', textAlign: 'center' }}>
                        {price}
                      </div>
                    </div>

                    {/* Bottom row: amenities left, operation/status right */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        {property.beds > 0 && (
                          <div style={{ display: 'flex', alignItems: 'center', fontSize: 36, fontFamily: 'Georgia, serif', marginRight: 35 }}>
                            <img src="/senada/images/icons/ico_bed.svg" alt="" style={{ width: 38, height: 38, marginRight: 12 }} />
                            <span>{property.beds}</span>
                          </div>
                        )}
                        {property.baths > 0 && (
                          <div style={{ display: 'flex', alignItems: 'center', fontSize: 36, fontFamily: 'Georgia, serif', marginRight: 35 }}>
                            <img src="/senada/images/icons/ico_bath.svg" alt="" style={{ width: 38, height: 38, marginRight: 12 }} />
                            <span>{property.baths}</span>
                          </div>
                        )}
                        {displayArea && (
                          <div style={{ display: 'flex', alignItems: 'center', fontSize: 36, fontFamily: 'Georgia, serif' }}>
                            {isLand ? (
                               <LandPlot style={{ width: 38, height: 38, color: '#fff', marginRight: 12 }} strokeWidth={1.5} />
                            ) : (
                               <img src="/senada/images/icons/ico_sqfoot.svg" alt="" style={{ width: 38, height: 38, marginRight: 12 }} />
                            )}
                            <span>{displayArea}</span>
                          </div>
                        )}
                      </div>

                      <div style={{ textAlign: 'right', fontFamily: 'Arial, sans-serif' }}>
                        {operationLabel && (
                          <div style={{ color: '#b8b8b8', fontSize: 22 }}>
                            Operación <span style={{ color: '#fff', fontWeight: 700 }}>{operationLabel}</span>
                          </div>
                        )}
                        {statusLabel && (
                          <div style={{ color: '#b8b8b8', fontSize: 22 }}>
                            Estado <span style={{ color: '#fff', fontWeight: 700 }}>{statusLabel}</span>
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
