'use client';
import { useState, useRef } from 'react';
import Image from 'next/image';
import SignatureCanvas from 'react-signature-canvas';
import AgentNameForm from '@/components/AgentNameForm';
import { HelpCircle } from 'lucide-react';
export default function ProfileClient({ user, totalProps, payments, config: initialConfig }) {
  const [config, setConfig] = useState(initialConfig || {});
        const [savingContact, setSavingContact] = useState(false);
    const [contactData, setContactData] = useState({
    contactEmail: config?.contactEmail || 'fariasyasociados.inmobiliaria@gmail.com',
    contactPhone: config?.contactPhone || '+54 9 3564 625246',
    contactAddress: config?.contactAddress || 'Bv Saenz Peña 2002, San Francisco, AR'
  });
  
  
  
  const saveContactInfo = async () => {
    setSavingContact(true);
    try {
      const res = await fetch('/api/site-config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactData),
      });
      const data = await res.json();
      if (data.success) {
        setConfig(prev => ({ ...prev, ...contactData }));
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setSavingContact(false);
    }
  };

  
  
  const cardCls = 'bg-[#161616]/70 backdrop-blur-md border border-[#222] rounded-sm p-5 shadow-2xl';
  const labelCls = 'text-[11px] font-bold uppercase tracking-wider text-[#888] mb-1 block';
  const inputCls = 'w-full bg-[#0a0a0a] border border-[#333] rounded-sm px-3 py-2 text-sm text-white outline-none focus:border-[var(--color-brand)] transition-colors placeholder:text-[#555]';
  const btnPrimary = 'bg-[var(--color-brand)] hover:bg-[var(--color-brand-dark)] text-white text-xs font-bold px-4 py-2 rounded-sm transition-colors uppercase tracking-wider disabled:opacity-40';
  const btnSecondary = 'text-xs text-[#999] hover:text-white border border-[#333] px-3 py-2 rounded-sm transition-colors';

  return (
    <div className="p-4 md:p-6 max-w-[1600px]">
      <h1 className="text-[24px] md:text-[30px] font-normal text-white mb-5" style={{ fontFamily: 'var(--font-heading)' }}>
        Perfil
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* ROW 1 */}
        {/* 1. User */}
        <div className={cardCls}>
          <div className="flex items-center gap-3 h-full">
            <Image
              src={user?.image || '/images/profile.png'}
              alt="Avatar"
              width={48}
              height={48}
              className="rounded-full object-cover w-12 h-12"
            />
            <div>
              <h3 className="text-[15px] font-semibold text-white">{user?.name || 'Admin'}</h3>
              <p className="text-[12px] text-[#888]">{user?.email || ''}</p>
            </div>
          </div>
        </div>

        {/* 2. Configuración de Contacto del Sitio */}
        <div className={cardCls}>
          <div className="flex items-center justify-between mb-2 relative">
            <div className="flex items-center gap-1.5">
              <p className={labelCls + ' mb-0'}>Contacto Global del Sitio</p>
              <div className="relative group cursor-help flex items-center">
                <HelpCircle className="w-3.5 h-3.5 text-[#888] hover:text-white transition-colors" />
                
                {/* Tooltip Popup */}
                <div className="absolute bottom-full right-[-8px] mb-2 w-72 bg-[#0a0a0a] border border-[#333] rounded-sm p-3 shadow-2xl opacity-0 pointer-events-none group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-200 z-[120]">
                  <p className="text-[11px] font-bold text-white uppercase tracking-wider mb-1.5 border-b border-[#222] pb-1">⚠️ Impacto Crítico Global</p>
                  <ul className="space-y-1.5 text-[10.5px] text-[#aaa] list-disc list-inside">
                    <li><strong className="text-white">Email:</strong> Cambia la dirección de correo y los links <code className="text-[#F26B2E]">mailto:</code> del menú y el pie de página de todo el sitio.</li>
                    <li><strong className="text-white">WhatsApp:</strong> Modifica la redirección y número de chat directo en la cabecera, pie de página y menú móvil de todo el sitio.</li>
                    <li><strong className="text-white">Dirección:</strong> Cambia la dirección expuesta en el pie de página y la búsqueda del local en Google Maps.</li>
                    <li><strong className="text-white">SEO Local:</strong> Actualiza automáticamente los metadatos de Google (Schema.org) de la empresa.</li>
                  </ul>
                  <div className="absolute top-full right-2 w-2 h-2 bg-[#0a0a0a] border-r border-b border-[#333] rotate-45"></div>
                </div>
              </div>
            </div>
            
            <button onClick={saveContactInfo} disabled={savingContact} className="text-[10px] text-[var(--color-brand)] font-bold uppercase hover:underline">
              {savingContact ? '...' : 'Guardar'}
            </button>
          </div>
          
          <div className="space-y-3 mt-4">
            <div>
              <label className="block text-[9px] font-bold uppercase text-[#555] mb-1">Email</label>
              <input type="email" value={contactData.contactEmail} onChange={e => setContactData({...contactData, contactEmail: e.target.value})} className={inputCls + " py-1.5"} />
            </div>
            <div>
              <label className="block text-[9px] font-bold uppercase text-[#555] mb-1">WhatsApp</label>
              <input type="text" value={contactData.contactPhone} onChange={e => setContactData({...contactData, contactPhone: e.target.value})} className={inputCls + " py-1.5"} />
            </div>
            <div>
              <label className="block text-[9px] font-bold uppercase text-[#555] mb-1">Dirección</label>
              <input type="text" value={contactData.contactAddress} onChange={e => setContactData({...contactData, contactAddress: e.target.value})} className={inputCls + " py-1.5"} />
            </div>
          </div>
        </div>

        {/* 3. Plan & Payments combined */}
        <div className={`${cardCls} md:col-span-2 xl:col-span-2 flex flex-col md:flex-row gap-6 bg-gradient-to-br from-[#161616]/70 via-[#1C1C1A]/80 to-[#161616]/70`}>
          {/* Plan Section */}
          <div className="flex-1 flex flex-col justify-between pr-0 md:pr-6 border-b md:border-b-0 md:border-r border-[#222] pb-6 md:pb-0">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--color-brand)] mb-1">Plan Actual</p>
              <h2 className="text-[28px] font-bold leading-tight mb-1 text-white" style={{ fontFamily: 'var(--font-heading)' }}>Pro</h2>
              <p className="text-white/50 text-xs">Propiedades: {totalProps} activas</p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
              <div>
                <p className="text-[20px] font-bold text-white">Plan Anual</p>
                <p className="text-[10px] text-[var(--color-brand)] uppercase tracking-wider mt-0.5 font-bold">Próximo pago: 08/06/27</p>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-green-400 bg-green-900/30 px-2 py-1 rounded-sm border border-green-800">
                Activo
              </span>
            </div>
          </div>

          {/* Payments Section */}
          <div className="flex-1 flex flex-col justify-between">
            <p className={labelCls}>Historial de Pagos</p>
            <div className="overflow-auto flex-1 mt-2 pr-1" style={{ maxHeight: 110 }}>
              {payments.length === 0 ? (
                <p className="text-[12px] text-[#666] text-center py-4">No hay pagos registrados.</p>
              ) : (
                <table className="w-full text-[11px]">
                  <thead>
                    <tr className="border-b border-[#333] text-[#888] uppercase tracking-wider text-[9px]">
                      <th className="text-left py-1">Fecha</th>
                      <th className="text-left py-1">Plan</th>
                      <th className="text-right py-1">Monto</th>
                      <th className="text-right py-1">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#222]">
                    {payments.map((p) => (
                      <tr key={p._id}>
                        <td className="py-1.5 text-[#999]">{new Date(p.createdAt).toLocaleDateString('es-AR')}</td>
                        <td className="py-1.5 text-white capitalize">{p.plan}</td>
                        <td className="py-1.5 text-right text-white font-medium">{p.currency || 'U$D'} {p.amount?.toLocaleString('es-AR')}</td>
                        <td className="py-1.5 text-right">
                          <span className={`text-[9px] font-bold px-1 py-0.5 rounded-sm uppercase tracking-wider text-white ${
                            p.status === 'paid' ? 'bg-green-600' : p.status === 'pending' ? 'bg-yellow-600' : 'bg-red-600'
                          }`}>
                            {p.status === 'paid' ? 'Pagado' : p.status === 'pending' ? 'Pendiente' : 'Vencido'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
