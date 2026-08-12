'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function SuperadminPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/superadmin/users');
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      const res = await fetch(`/api/superadmin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
      } else {
        alert('Error al cambiar el rol');
      }
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Error de conexión');
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen text-purple-400">
        <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white mb-2 tracking-wide">Gestión de Roles</h1>
        <p className="text-zinc-400">Administra quién tiene acceso al panel de control principal.</p>
      </div>

      <div className="bg-[#121217] rounded-2xl border border-purple-900/30 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/50 border-b border-purple-900/30">
                <th className="px-6 py-4 text-[11px] font-bold text-purple-400 uppercase tracking-widest">Usuario</th>
                <th className="px-6 py-4 text-[11px] font-bold text-purple-400 uppercase tracking-widest">Email</th>
                <th className="px-6 py-4 text-[11px] font-bold text-purple-400 uppercase tracking-widest">Rol Actual</th>
                <th className="px-6 py-4 text-[11px] font-bold text-purple-400 uppercase tracking-widest text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-900/10">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {user.image ? (
                        <img src={user.image} alt={user.name} className="w-8 h-8 rounded-full border border-purple-500/20" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-purple-900/50 text-purple-300 flex items-center justify-center font-bold text-xs">
                          {user.name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="font-medium text-zinc-200">{user.name || 'Sin nombre'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-zinc-400 text-sm">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                      user.role === 'superadmin' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                      user.role === 'admin' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      'bg-zinc-800 text-zinc-400'
                    }`}>
                      {user.role || 'user'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {user.role === 'superadmin' ? (
                      <span className="text-xs text-purple-500/50 font-medium italic">Protegido</span>
                    ) : (
                      <button
                        onClick={() => toggleRole(user._id, user.role || 'user')}
                        className={`text-xs px-4 py-2 rounded-lg font-bold tracking-wide uppercase transition-all ${
                          user.role === 'admin' 
                            ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' 
                            : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                        }`}
                      >
                        {user.role === 'admin' ? 'Revocar Admin' : 'Hacer Admin'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {users.length === 0 && !loading && (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-zinc-500">
                    No hay usuarios registrados en el sistema.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Super Admin Tools */}
      <div className="mt-8">
        <h2 className="text-[16px] md:text-[20px] font-semibold text-white mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
          Herramientas de Administrador
        </h2>
        <div className="bg-[#121217] rounded-2xl border border-purple-900/30 overflow-hidden shadow-2xl p-5 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-[14px] md:text-[16px] font-bold text-white mb-1">Copia de Seguridad Inteligente (Backup Local)</h3>
              <p className="text-[12px] md:text-[13px] text-zinc-400 max-w-2xl">
                Para resguardar todas las fotos de Cloudinary en tu disco local (F:), abre la terminal en VS Code y ejecuta el comando de abajo. El sistema ordenará tus fotos en carpetas separadas por el nombre de cada propiedad y solo descargará las fotos nuevas que no tengas, ahorrando datos.
              </p>
            </div>
            <div className="bg-black/50 border border-purple-900/30 rounded-lg p-3 flex items-center gap-3 w-full md:w-auto">
              <code className="text-purple-400 text-[12px] md:text-[13px] font-mono whitespace-nowrap">
                node scripts/backup-cloudinary.js
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
