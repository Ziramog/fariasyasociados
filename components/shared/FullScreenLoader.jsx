'use client';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';

const FullScreenLoader = ({ isUploading, isSuccess, error, onCloseError }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isUploading && !isSuccess && !error) return null;
  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center transition-all duration-500">
      <div className="relative w-40 h-40 flex items-center justify-center mb-8">
        {/* Animated SVG Circle */}
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
          {/* Background Track */}
          <circle 
            cx="50" cy="50" r="45" 
            fill="none" 
            stroke="#222" 
            strokeWidth="4" 
          />
          {/* Progress / Success / Error Stroke */}
          <circle 
            cx="50" cy="50" r="45" 
            fill="none" 
            stroke={error ? "#EF4444" : isSuccess ? "#4ADE80" : "var(--color-brand)"} 
            strokeWidth="4"
            strokeLinecap="round"
            className={isSuccess || error ? "transition-all duration-1000 ease-out" : "animate-spin origin-center"}
            strokeDasharray="283"
            strokeDashoffset={isSuccess || error ? "0" : "180"}
          />
        </svg>

        {/* Logo in the center */}
        <div className="absolute inset-0 m-auto w-24 h-24 rounded-full flex items-center justify-center p-2 bg-[#111] overflow-hidden shadow-xl">
          <Image 
            src="/images/isotipo-farias-placeholder.svg" 
            alt="Farias & Asociados" 
            width={80} 
            height={80} 
            className={`object-contain transition-all duration-500 ${isUploading && !isSuccess && !error ? 'animate-pulse' : ''}`} 
          />
        </div>
      </div>

      {/* Text Indicator */}
      <div className="text-center max-w-md px-4">
        {error ? (
          <div className="flex flex-col items-center transition-opacity duration-500 opacity-100">
            <div className="w-12 h-12 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mb-3">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-6 h-6 stroke-[3]"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-heading)' }}>Error al Guardar</h2>
            <p className="text-gray-400 text-sm mb-6">{error}</p>
            <button type="button" onClick={onCloseError} className="px-6 py-2 bg-[#222] hover:bg-[#333] text-white rounded-md font-bold transition-colors">Volver al Formulario</button>
          </div>
        ) : isSuccess ? (
          <div className="flex flex-col items-center transition-opacity duration-500 opacity-100">
            <div className="w-12 h-12 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-3">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-6 h-6 stroke-[3]"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-heading)' }}>¡Carga Exitosa!</h2>
            <p className="text-gray-400 text-sm">Redirigiendo al panel de propiedades...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center transition-opacity duration-500 opacity-100">
            <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-heading)' }}>Subiendo Archivos</h2>
            <p className="text-[var(--color-brand)] text-sm font-medium animate-pulse">Por favor, no cierres esta ventana...</p>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default FullScreenLoader;
