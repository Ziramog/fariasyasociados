'use client';

import { useState } from 'react';

export default function BackupsPage() {
  const [downloadingCsv, setDownloadingCsv] = useState(false);
  const [downloadingJson, setDownloadingJson] = useState(false);

  const downloadBackup = async (format) => {
    const setDownloading = format === 'csv' ? setDownloadingCsv : setDownloadingJson;
    setDownloading(true);

    try {
      // Create an invisible iframe/link to trigger the browser download
      const url = `/api/superadmin/export?format=${format}`;
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup_${format}_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading backup:', error);
      alert('Hubo un error al generar el backup.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white mb-2 tracking-wide">Centro de Respaldos</h1>
        <p className="text-zinc-400">Descarga copias de seguridad de la base de datos de propiedades y usuarios.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* CSV Export Card */}
        <div className="bg-[#121217] p-8 rounded-2xl border border-emerald-900/30 flex flex-col items-start shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110" />
          
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-6">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="8" y1="13" x2="16" y2="13"></line><line x1="8" y1="17" x2="16" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          </div>
          
          <h2 className="text-xl font-bold text-white mb-2">Exportar Excel (CSV)</h2>
          <p className="text-zinc-400 text-sm leading-relaxed mb-8 flex-1">
            Formato ideal para lectura humana. Obtén una tabla limpia con los títulos, precios, estados y ubicaciones de todas tus propiedades.
          </p>
          
          <button 
            onClick={() => downloadBackup('csv')}
            disabled={downloadingCsv}
            className="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold tracking-wide rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {downloadingCsv ? (
              <>
                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                Descargar CSV
              </>
            )}
          </button>
        </div>

        {/* JSON Export Card */}
        <div className="bg-[#121217] p-8 rounded-2xl border border-purple-900/30 flex flex-col items-start shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110" />
          
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-6">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
          </div>
          
          <h2 className="text-xl font-bold text-white mb-2">Exportar Raw (JSON)</h2>
          <p className="text-zinc-400 text-sm leading-relaxed mb-8 flex-1">
            Respaldo técnico completo de la base de datos. Contiene todos los datos estructurados, IDs y enlaces a las imágenes en Cloudinary. Ideal para restauraciones del sistema.
          </p>
          
          <button 
            onClick={() => downloadBackup('json')}
            disabled={downloadingJson}
            className="w-full py-3.5 px-4 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 font-bold tracking-wide rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {downloadingJson ? (
              <>
                <div className="w-4 h-4 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                Descargar JSON
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
