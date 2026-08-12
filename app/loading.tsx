export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        {/* Animated logo mark */}
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 border-2 border-white/20 rounded-full" />
          <div className="absolute inset-0 border-2 border-transparent border-t-white rounded-full animate-spin" />
        </div>
        {/* Brand name */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-white/80 text-[11px] font-bold uppercase tracking-[0.2em]">
            Farias & Asociados
          </span>
          <span className="text-white/40 text-[10px] uppercase tracking-widest">
            Cargando experiencia
          </span>
        </div>
      </div>
    </div>
  );
}
