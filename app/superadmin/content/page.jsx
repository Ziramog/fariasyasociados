'use client';

import { useState, useEffect } from 'react';

export default function ContentManagerPage() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/site-config');
      const data = await res.json();
      if (res.ok) {
        setConfig(data);
      }
    } catch (error) {
      console.error('Error fetching config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setConfig((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccessMsg('');
    try {
      const res = await fetch('/api/site-config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (res.ok) {
        setSuccessMsg('¡Cambios guardados con éxito! La web se ha actualizado.');
        setTimeout(() => setSuccessMsg(''), 5000);
      } else {
        alert('Error al guardar los cambios.');
      }
    } catch (error) {
      console.error('Error saving config:', error);
      alert('Error de conexión.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh] text-purple-400">
        <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const InputField = ({ label, name, type = 'text', placeholder, description }) => (
    <div className="mb-6">
      <label className="block text-[11px] font-bold text-purple-400 uppercase tracking-widest mb-1">
        {label}
      </label>
      {description && <p className="text-[12px] text-zinc-500 mb-2 leading-relaxed">{description}</p>}
      {type === 'textarea' ? (
        <textarea
          name={name}
          value={config[name] || ''}
          onChange={handleChange}
          placeholder={placeholder}
          className="w-full bg-black/50 border border-purple-900/30 rounded-xl px-4 py-3 text-sm text-zinc-200 outline-none focus:border-purple-500/50 focus:bg-black/80 transition-colors min-h-[100px] resize-y"
        />
      ) : (
        <input
          type={type}
          name={name}
          value={config[name] || ''}
          onChange={handleChange}
          placeholder={placeholder}
          className="w-full bg-black/50 border border-purple-900/30 rounded-xl px-4 py-3 text-sm text-zinc-200 outline-none focus:border-purple-500/50 focus:bg-black/80 transition-colors"
        />
      )}
    </div>
  );

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto pb-24">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-wide">Gestor de Contenido</h1>
          <p className="text-zinc-400">Edita los textos principales de la web y configura herramientas de marketing.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-8 py-3 rounded-xl tracking-wide transition-colors shadow-[0_0_20px_rgba(147,51,234,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Guardando...
            </>
          ) : (
            'Guardar Cambios'
          )}
        </button>
      </div>

      {successMsg && (
        <div className="mb-8 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 font-medium flex items-center gap-3">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          {successMsg}
        </div>
      )}

      <div className="space-y-8">
        
        {/* Section: Portada */}
        <div className="bg-[#121217] p-6 md:p-8 rounded-2xl border border-purple-900/20 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">1</span>
            Portada Principal (Hero)
          </h2>
          <div className="grid grid-cols-1 gap-4">
            <InputField 
              label="Título Principal" 
              name="heroTitle" 
              placeholder="Vendemos Inmuebles, Construimos Confianza"
              description="Es lo primero que lee la gente al entrar."
            />
            <InputField 
              label="Subtítulo" 
              name="heroSubtitle" 
              placeholder="Alta Gracia, Córdoba, Argentina"
              description="Texto pequeño debajo del título principal."
            />
          </div>
        </div>

        {/* Section: Nosotros */}
        <div className="bg-[#121217] p-6 md:p-8 rounded-2xl border border-purple-900/20 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">2</span>
            Sección "Sobre Nosotros"
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div className="md:col-span-2">
              <InputField 
                label="Título de la Sección" 
                name="aboutTitle" 
                description="Ejemplo: Farias & Asociados"
              />
            </div>
            <div className="md:col-span-2">
              <InputField 
                label="Subtítulo / Rubro" 
                name="aboutSubtitle" 
                description="Ejemplo: NEGOCIOS INMOBILIARIOS"
              />
            </div>
            <div className="md:col-span-2">
              <InputField 
                label="Párrafo de Historia" 
                name="aboutText" 
                type="textarea"
                description="Cuenta la experiencia y visión de la empresa."
              />
            </div>
          </div>
        </div>

        {/* Section: Pie de página */}
        <div className="bg-[#121217] p-6 md:p-8 rounded-2xl border border-purple-900/20 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">3</span>
            Pie de Página (Footer)
          </h2>
          <div className="grid grid-cols-1 gap-4">
            <InputField 
              label="Párrafo del Footer" 
              name="footerDescription" 
              type="textarea"
              description="El texto que aparece en la parte más oscura abajo de todo."
            />
          </div>
        </div>

        {/* Section: Marketing */}
        <div className="bg-[#121217] p-6 md:p-8 rounded-2xl border border-purple-900/20 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-full pointer-events-none" />
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
            </span>
            Herramientas de Marketing
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <InputField 
              label="ID de Google Analytics" 
              name="analyticsId" 
              description="Solo el código (Ej: ). Déjalo en blanco para desactivar."
            />
            <InputField 
              label="ID de Facebook Pixel" 
              name="facebookPixelId" 
              description="Solo el número (Ej: 123456789012345). Déjalo en blanco para desactivar."
            />
            <div className="md:col-span-2">
              <InputField 
                label="Mensaje Base de WhatsApp" 
                name="whatsappDefaultMessage" 
                type="textarea"
                description="Mensaje por defecto que enviarán los clientes cuando hagan clic en el botón de WhatsApp de una propiedad."
              />
            </div>
          </div>
        </div>

      </div>

      {/* Floating Save Button / Bottom Save Button */}
      <div className="mt-12 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-10 py-4 rounded-xl tracking-wide transition-colors shadow-[0_0_20px_rgba(147,51,234,0.4)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
        >
          {saving ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Guardando...
            </>
          ) : (
            'Guardar Cambios'
          )}
        </button>
      </div>
    </div>
  );
}
