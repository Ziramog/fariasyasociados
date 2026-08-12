import Image from 'next/image';

const LoadingOverlay = () => {
  return (
    <div className="fixed inset-0 w-full h-screen bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center z-[100] transition-opacity duration-500">
      <div className="flex flex-col items-center gap-8 animate-pulse scale-125">
        {/* Animated spinner with logo inside or just logo */}
        <div className="relative w-24 h-24 flex items-center justify-center">
          <div className="absolute inset-0 border-[3px] border-black/10 rounded-full" />
          <div className="absolute inset-0 border-[3px] border-transparent border-t-black rounded-full animate-spin" />
        </div>
        
        {/* Brand Name / Loading Text */}
        <div className="flex flex-col items-center gap-3">
          <Image
            src="/images/logo-farias-placeholder.svg"
            alt="Farias & Asociados"
            width={200}
            height={80}
            style={{ height: '50px', width: 'auto' }}
            priority
          />
          <span className="text-black/50 text-[12px] uppercase tracking-[0.25em] font-bold mt-2">
            Buscando Propiedades...
          </span>
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
