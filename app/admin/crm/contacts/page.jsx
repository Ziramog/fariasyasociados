import Link from 'next/link';
import { getContacts } from '@/app/actions/crmContacts';
import { getSessionUser } from '@/utils/getSessionUser';
import { FaUserPlus, FaSearch } from 'react-icons/fa';

export const dynamic = 'force-dynamic';

export default async function ContactsPage() {
  const session = await getSessionUser();
  const superAdminEmails = ['ingjuangomariz@gmail.com', 'fariasyasociadosweb@gmail.com'];
  const isSuperAdmin = session?.role === 'superadmin' || superAdminEmails.includes(session?.user?.email);
  
  if (!isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <h2 className="text-2xl font-bold text-white mb-2">Módulo en Desarrollo</h2>
        <p className="text-gray-400">El CRM Inmobiliario se encuentra en fase de pruebas. Pronto estará disponible para todos los asesores.</p>
        <Link href="/admin" className="mt-6 bg-[#222] border border-[#333] text-white px-4 py-2 rounded-lg hover:bg-[#333] transition">
          Volver al Panel
        </Link>
      </div>
    );
  }

  const contacts = await getContacts();

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <Link href="/admin/crm" className="text-xs text-gray-500 hover:text-[var(--color-brand)] uppercase tracking-wider font-bold mb-4 inline-block transition-colors">&larr; Volver a Mi Día</Link>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-heading)' }}>CRM Clientes</h1>
          <p className="text-gray-400">Directorio de contactos e inversores</p>
        </div>
        <Link 
          href="/admin/crm/contacts/new"
          className="bg-[var(--color-brand)] hover:bg-[var(--color-brand-dark)] text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition"
        >
          <FaUserPlus /> Nuevo Cliente
        </Link>
      </div>

      <div className="bg-[#111] border border-[#333] rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-[#333] flex items-center gap-4 bg-[#1a1a1a]">
          <div className="relative flex-1 max-w-md">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar por nombre, email o teléfono..." 
              className="w-full bg-[#111] border border-[#333] text-white pl-10 pr-4 py-2 rounded focus:outline-none focus:border-[var(--color-brand)]"
            />
          </div>
          <div className="flex gap-2">
            <select className="bg-[#111] border border-[#333] text-white py-2 px-3 rounded focus:outline-none">
              <option value="">Todos los roles</option>
              <option value="comprador">Compradores</option>
              <option value="propietario">Propietarios</option>
              <option value="inversor">Inversores</option>
            </select>
          </div>
        </div>

        {/* DESKTOP TABLE */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#1a1a1a] text-gray-400 text-sm">
                <th className="py-3 px-4 font-bold border-b border-[#333]">Nombre</th>
                <th className="py-3 px-4 font-bold border-b border-[#333]">Contacto</th>
                <th className="py-3 px-4 font-bold border-b border-[#333]">Roles</th>
                <th className="py-3 px-4 font-bold border-b border-[#333]">Asesor</th>
                <th className="py-3 px-4 font-bold border-b border-[#333] text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-white divide-y divide-[#333]">
              {contacts.map((contact) => (
                <tr key={contact._id} className="hover:bg-[#1a1a1a] transition-colors">
                  <td className="py-4 px-4">
                    <div className="font-bold">{contact.firstName} {contact.lastName}</div>
                    <div className="text-xs text-gray-400 mt-1">Origen: {contact.source || 'Web'}</div>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-300">
                    <div>{contact.phone || contact.whatsapp || 'Sin teléfono'}</div>
                    <div className="text-xs text-gray-500">{contact.email}</div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex gap-1 flex-wrap">
                      {contact.roles && contact.roles.map(role => (
                        <span key={role} className="bg-[#222] border border-[#444] text-xs px-2 py-1 rounded-full uppercase tracking-wider text-gray-300">
                          {role}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-400">
                    {contact.assignedTo ? contact.assignedTo.name : 'Sin asignar'}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <Link 
                      href={`/admin/crm/contacts/${contact._id}`}
                      className="text-[var(--color-brand)] hover:text-white font-bold text-sm transition"
                    >
                      Abrir Ficha &rarr;
                    </Link>
                  </td>
                </tr>
              ))}
              {contacts.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-gray-500">
                    No hay clientes registrados aún.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* MOBILE CARDS */}
        <div className="md:hidden flex flex-col divide-y divide-[#333]">
          {contacts.map((contact) => (
            <Link 
              key={contact._id} 
              href={`/admin/crm/contacts/${contact._id}`}
              className="p-4 hover:bg-[#1a1a1a] transition-colors block"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-white text-lg">{contact.firstName} {contact.lastName}</h3>
                  <div className="flex gap-1 flex-wrap mt-1">
                    {contact.roles && contact.roles.map(role => (
                      <span key={role} className="bg-[#222] border border-[#444] text-[9px] px-1.5 py-0.5 rounded-sm uppercase tracking-wider text-[var(--color-brand)] font-bold">
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
                {contact.status && (
                  <span className="text-[10px] bg-gray-800 text-gray-300 px-2 py-1 rounded-full font-bold uppercase">
                    {contact.status}
                  </span>
                )}
              </div>
              
              <div className="text-sm text-gray-400 mt-3 space-y-1">
                {(contact.phone || contact.whatsapp) && (
                  <p>📞 {contact.phone || contact.whatsapp}</p>
                )}
                {contact.email && (
                  <p>✉️ {contact.email}</p>
                )}
              </div>
              
              <div className="mt-3 flex justify-between items-center text-xs text-gray-500">
                <span>👤 {contact.assignedTo ? contact.assignedTo.name : 'Sin asignar'}</span>
                <span className="text-[var(--color-brand)] font-bold">Ver Ficha &rarr;</span>
              </div>
            </Link>
          ))}
          {contacts.length === 0 && (
            <div className="py-8 text-center text-gray-500">
              No hay clientes registrados aún.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
