import Link from 'next/link';
import { getContacts } from '@/app/actions/crmContacts';
import { FaUserPlus, FaSearch } from 'react-icons/fa';

export const dynamic = 'force-dynamic';

export default async function ContactsPage() {
  const contacts = await getContacts();

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
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

        <div className="overflow-x-auto">
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
      </div>
    </div>
  );
}
