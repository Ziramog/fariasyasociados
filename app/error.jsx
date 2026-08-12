'use client';

export default function Error({ error, reset }) {
  console.error('[Error boundary]', error);
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#F6F6F6' }}>
      <div className="text-center max-w-md px-6">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
          <svg viewBox="0 0 24 24" fill="none" stroke="#E94560" strokeWidth="2" className="w-8 h-8">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-[#0F172A] mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
          Algo salió mal
        </h2>
        <p className="text-sm text-[#666] mb-2">
          Ocurrió un error inesperado. Por favor intentá de nuevo.
        </p>
        {error?.digest && (
          <p className="text-[11px] text-[#bbb] mb-6 font-mono">
            ID: {error.digest}
          </p>
        )}
        <button
          onClick={() => reset()}
          className="bg-[var(--color-brand)] hover:bg-[var(--color-brand-dark)] text-white font-bold text-sm uppercase tracking-wider px-6 py-3 rounded-[6px] transition-colors"
        >
          Intentar de nuevo
        </button>
        <a
          href="/admin"
          className="block mt-3 text-sm text-[#999] hover:text-[#666] transition-colors"
        >
          Volver al panel admin
        </a>
      </div>
    </div>
  );
}
