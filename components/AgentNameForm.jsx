'use client';
import { useState } from 'react';

export default function AgentNameForm({ initialName }) {
  const [agentName, setAgentName] = useState(initialName || '');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch('/api/user/update-name', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentName }),
      });
      if (!res.ok) throw new Error('Error al guardar');
      setSaved(true);
    } catch {
      alert('Error al guardar el nombre del agente');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#888] mb-1">
        Nombre del Agente (PDF)
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={agentName}
          onChange={(e) => setAgentName(e.target.value)}
          placeholder="Ej: Juan Gomariz"
          className="flex-1 bg-[#0a0a0a] border border-[#333] rounded-sm px-3 py-2 text-sm text-white outline-none focus:border-[var(--color-brand)] transition-colors placeholder:text-[#555]"
        />
        <button
          type="submit"
          disabled={saving}
          className="bg-[var(--color-brand)] hover:bg-[var(--color-brand-dark)] text-white text-xs font-bold px-3 py-2 rounded-sm transition-colors disabled:opacity-50 uppercase tracking-wider"
        >
          {saving ? '...' : 'Guardar'}
        </button>
      </div>
      {saved && (
        <p className="text-[10px] text-green-400 mt-1">Guardado correctamente</p>
      )}
    </form>
  );
}
