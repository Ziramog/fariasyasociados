'use client';

import { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { Image as ImageIcon, Download, X } from 'lucide-react';
import Image from 'next/image';
import logo from '@/assets/images/logo.png';

export default function SocialStoryGenerator({ property }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const printRef = useRef(null);

  const mainImage = property?.images?.[0]?.url || '';
  const price = property?.price || 'Consultar';
  const op = property?.operation?.toUpperCase() || 'VENTA';
  const city = property?.location?.city || '';
  const title = property?.name || '';
  
  // Format for specs
  const specs = [];
  if (property.beds) specs.push(`${property.beds} Dorm`);
  if (property.baths) specs.push(`${property.baths} Baños`);
  if (property.square_feet) {
    if (property.square_feet >= 10000 && property.type === 'Campo') {
      specs.push(`${property.square_feet / 10000} Has`);
    } else {
      specs.push(`${property.square_feet} m²`);
    }
  }

  const handleDownload = async () => {
    if (!printRef.current) return;
    setLoading(true);
    try {
      const canvas = await html2canvas(printRef.current, {
        useCORS: true,
        scale: 1, // 1080x1920 is already big enough
        allowTaint: true,
        backgroundColor: '#000000',
      });
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
            <p><span className="text-[#888]">Detalles:</span> <strong className="text-white">{specs.join(' | ')}</strong></p>
          </div>
          
          <button 
            onClick={handleDownload} 
            disabled={loading}
            className="mt-auto bg-gradient-to-r from-pink-600 to-orange-500 hover:from-pink-500 hover:to-orange-400 text-white font-bold py-4 px-6 rounded-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Download className="w-5 h-5" />}
            {loading ? 'Generando...' : 'Descargar Historia'}
          </button>
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
                    <img src={mainImage} alt="" className="w-full h-full object-cover opacity-80" crossOrigin="anonymous" />
                  ) : (
                    <div className="w-full h-full bg-[#222]" />
                  )}
                  {/* Gradient Overlays */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/90" />
                </div>
                
                {/* Content */}
                <div className="relative z-10 flex flex-col h-full p-[80px]">
                  {/* Top: Logo & Label */}
                  <div className="flex justify-between items-start">
                    <div className="w-[250px] bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20">
                      <Image src={logo} alt="Logo" width={400} height={400} className="w-full h-auto object-contain brightness-0 invert" />
                    </div>
                    <div className="bg-[var(--color-brand)] text-white text-[42px] font-black uppercase tracking-[0.2em] px-10 py-5 rounded-sm">
                      {op}
                    </div>
                  </div>

                  {/* Bottom: Info */}
                  <div className="mt-auto flex flex-col gap-8 pb-10">
                    <div>
                      <p className="text-[var(--color-brand)] text-[40px] font-bold uppercase tracking-widest mb-2">{city}</p>
                      <h1 className="text-white text-[80px] font-black leading-[1.1] max-w-[900px] shadow-black drop-shadow-2xl">{title}</h1>
                    </div>
                    
                    <div className="h-[2px] w-[200px] bg-[var(--color-brand)]" />
                    
                    <div className="flex items-center gap-6 text-[45px] font-semibold text-white/90">
                      {specs.map((s, i) => (
                        <div key={i} className="flex items-center gap-6">
                          <span>{s}</span>
                          {i < specs.length - 1 && <div className="w-3 h-3 rounded-full bg-[var(--color-brand)]" />}
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-8 bg-white text-black self-start px-12 py-6 rounded-sm flex flex-col">
                      <span className="text-[30px] font-bold uppercase tracking-widest text-[#666]">Precio</span>
                      <span className="text-[85px] font-black leading-none">{price}</span>
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
