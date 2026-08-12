'use client';

import { useState } from 'react';
import { Download, Link as LinkIcon, MessageCircle } from 'lucide-react';

export default function SubscribersClient({ initialLink, subscribers }) {
  const [link, setLink] = useState(initialLink);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveLink = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const res = await fetch('/api/site-config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ whatsappGroupLink: link }),
      });
      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const exportCSV = () => {
    const headers = ['Numero_WhatsApp', 'Fecha_Ingreso', 'Estado'];
    const rows = subscribers.map(sub => [
      sub.whatsappNumber,
      new Date(sub.createdAt).toLocaleDateString('es-AR') + ' ' + new Date(sub.createdAt).toLocaleTimeString('es-AR'),
      sub.status
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `suscriptores_whatsapp_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-[28px] md:text-[36px] font-normal text-white flex items-center gap-3" style={{ fontFamily: 'var(--font-heading)' }}>
            <MessageCircle className="w-8 h-8 text-[#25D366]" />
            Comunidad WhatsApp
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-[#444] text-[#888] text-[12px] font-bold cursor-help" title="Gestiona los contactos que se unieron a través del enlace de invitación y exporta tu base de datos en CSV para realizar envíos masivos.">?</span>
          </h1>
          <p className="text-[#888] text-sm mt-1">
            Administra los números de la base de datos y el enlace de tu grupo.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Columna Izquierda: Configuración */}
        <div className="md:col-span-1 space-y-6">
          {/* Card Configuración */}
          <div className="bg-[#161616] border border-[#222] rounded-sm p-5">
            <h2 className="text-[14px] font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-[#25D366]" />
              Link de Invitación
              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full border border-[#444] text-[#888] text-[10px] font-bold cursor-help" title="Crea un grupo en WhatsApp, ve a 'Info del grupo', selecciona 'Enlace de invitación', cópialo y pégalo abajo. Luego ve a 'Ajustes del grupo' y configura 'Enviar mensajes' para que solo puedan hacerlo los Administradores.">?</span>
            </h2>
            <p className="text-[12px] text-[#888] mb-4">
              Este es el enlace al que serán redirigidos los usuarios tras suscribirse en el Footer. Debes crear un grupo de WhatsApp configurado para que <strong>solo los administradores</strong> puedan enviar mensajes, garantizando privacidad y evitando spam.
            </p>
            <form onSubmit={handleSaveLink}>
              <input
                type="url"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://chat.whatsapp.com/..."
                className="w-full bg-[#0a0a0a] border border-[#333] rounded-sm px-4 py-2.5 text-[13px] text-white outline-none focus:border-[#25D366] transition-colors mb-3"
              />
              <button
                type="submit"
                disabled={isSaving}
                className="w-full bg-[#25D366] hover:bg-[#1DA851] text-black font-bold text-[12px] uppercase tracking-wider py-2.5 rounded-sm transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Guardando...' : 'Guardar Link'}
              </button>
              {saveSuccess && (
                <p className="text-[#25D366] text-[12px] mt-2 font-medium text-center">¡Enlace guardado!</p>
              )}
            </form>
          </div>
          
          {/* Card Estadísticas */}
          <div className="bg-[#161616] border border-[#222] rounded-sm p-5 text-center">
            <p className="text-[40px] font-bold leading-none mb-1 text-white" style={{ fontFamily: 'var(--font-heading)' }}>
              {subscribers.length}
            </p>
            <p className="text-[10px] font-medium text-[#888] uppercase tracking-wider">Total Suscriptores</p>
          </div>
        </div>

        {/* Columna Derecha: Tabla */}
        <div className="md:col-span-2 bg-[#161616] border border-[#222] rounded-sm flex flex-col h-full">
          <div className="p-5 border-b border-[#222] flex items-center justify-between">
            <h2 className="text-[14px] font-bold text-white uppercase tracking-wider">Directorio de Números</h2>
            <button
              onClick={exportCSV}
              className="flex items-center gap-2 text-[#888] hover:text-white transition-colors text-[12px] font-medium border border-[#333] hover:border-[#555] px-3 py-1.5 rounded-sm bg-[#0a0a0a]"
            >
              <Download className="w-3.5 h-3.5" />
              Exportar CSV
            </button>
          </div>
          
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto overflow-y-auto max-h-[500px]">
            <table className="w-full text-left min-w-[600px]">
              <thead className="sticky top-0 bg-[#161616] z-10 shadow-[0_1px_0_#222]">
                <tr className="text-[10px] font-bold uppercase tracking-wider text-[#888]">
                  <th className="px-5 py-4">Teléfono (WhatsApp)</th>
                  <th className="px-5 py-4">Fecha de Ingreso</th>
                  <th className="px-5 py-4">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222]">
                {subscribers.map((sub, idx) => (
                  <tr key={idx} className="hover:bg-[#1a1a1a] transition-colors text-[13px]">
                    <td className="px-5 py-3 font-medium text-white">
                      <a href={`https://wa.me/${sub.whatsappNumber.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer" className="hover:text-[#25D366] transition-colors flex items-center gap-2">
                        {sub.whatsappNumber}
                        <svg className="w-3 h-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                      </a>
                    </td>
                    <td className="px-5 py-3 text-[#aaa]">
                      {new Date(sub.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-900/30 text-green-400 border border-green-800/50">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                        {sub.status === 'active' ? 'Activo' : sub.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {subscribers.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-5 py-12 text-center text-[#888] text-[13px]">
                      Aún no hay números registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden flex flex-col divide-y divide-[#222] overflow-y-auto max-h-[500px]">
            {subscribers.map((sub, idx) => (
              <div key={idx} className="p-4 flex items-center justify-between hover:bg-[#1a1a1a] transition-colors">
                <div>
                  <a href={`https://wa.me/${sub.whatsappNumber.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer" className="text-[14px] font-semibold text-white hover:text-[#25D366] transition-colors flex items-center gap-1.5">
                    {sub.whatsappNumber}
                    <svg className="w-3.5 h-3.5 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                  </a>
                  <p className="text-[11px] text-[#888] mt-1">
                    {new Date(sub.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div>
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-sm text-[10px] font-bold uppercase tracking-wider bg-green-900/30 text-green-400 border border-green-800/50">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                    {sub.status === 'active' ? 'Activo' : sub.status}
                  </span>
                </div>
              </div>
            ))}
            {subscribers.length === 0 && (
              <div className="p-8 text-center text-[#888] text-[13px]">
                Aún no hay números registrados.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
