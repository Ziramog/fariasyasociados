import Image from 'next/image';

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full">
      <div className="relative w-32 h-32 flex items-center justify-center mb-4">
        {/* Animated SVG Circle */}
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#222" strokeWidth="4" />
          <circle 
            cx="50" cy="50" r="45" 
            fill="none" 
            stroke="var(--color-brand)" 
            strokeWidth="4" 
            strokeLinecap="round" 
            strokeDasharray="283" 
            strokeDashoffset="180" 
            className="animate-spin origin-center"
          />
        </svg>

        {/* Logo in the center */}
        <div className="absolute inset-0 m-auto w-20 h-20 rounded-full flex items-center justify-center p-2 bg-[#111] overflow-hidden shadow-xl">
          <Image 
            src="/images/isotipo-farias-placeholder.svg" 
            alt="Farias & Asociados" 
            width={60} 
            height={60} 
            className="object-contain animate-pulse" 
          />
        </div>
      </div>
      <p className="mt-2 text-[12px] font-bold text-[var(--color-brand)] tracking-widest uppercase animate-pulse">
        Cargando Panel...
      </p>
    </div>
  );
}
