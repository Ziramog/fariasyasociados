import Link from 'next/link';
import { getContacts } from '@/app/actions/crmContacts';
import { getSessionUser } from '@/utils/getSessionUser';
import { FaUserPlus, FaSearch, FaPhone, FaWhatsapp, FaEnvelope, FaChevronRight, FaRegUserCircle, FaCamera, FaDownload, FaHeart, FaFilter } from 'react-icons/fa';

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
    <div className="max-w-6xl mx-auto py-8 px-4 pb-24">
      {/* HEADER ROW (PRESOL Style) */}
      <div className="flex items-center gap-2 mb-4">
        <h1 className="text-2xl md:text-3xl font-bold text-white mr-auto" style={{ fontFamily: 'var(--font-heading)' }}>CRM Clientes</h1>
        
        <Link 
          href="/admin/crm/contacts/new"
          className="bg-[var(--color-brand)] hover:bg-[var(--color-brand-dark)] text-black w-10 h-10 flex items-center justify-center rounded-lg font-bold transition flex-shrink-0"
          title="Nuevo Cliente"
        >
          <FaUserPlus size={18} />
        </Link>

        <button 
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 md:px-4 h-10 flex items-center justify-center gap-2 rounded-lg font-bold transition flex-shrink-0"
        >
          <FaCamera size={16} />
          <span className="hidden md:inline text-sm">Escanear Tarjeta</span>
        </button>

        <button 
          className="bg-[#111] hover:bg-[#222] border border-[#333] text-gray-300 w-10 h-10 flex items-center justify-center rounded-lg transition flex-shrink-0"
        >
          <FaDownload size={16} />
        </button>
      </div>

      {/* FILTER ROW 1: SEARCH */}
      <div className="mb-3">
        <div className="relative w-full">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input 
            type="text" 
            placeholder="Buscar contacto..." 
            className="w-full bg-[#111] border border-[#333] text-white pl-10 pr-4 h-12 rounded-lg focus:outline-none focus:border-[var(--color-brand)]"
          />
        </div>
      </div>

      {/* FILTER ROW 2: SELECTS */}
      <div className="flex gap-2 mb-8">
        <button className="bg-[#111] border border-[#333] text-gray-400 w-12 h-12 flex items-center justify-center rounded-lg flex-shrink-0">
          <FaHeart size={16} />
        </button>
        <select className="flex-1 bg-[#111] border border-[#333] text-white h-12 px-3 rounded-lg focus:outline-none appearance-none">
          <option value="">Por Estado (Embudo)</option>
          <option value="Pendiente">Pendiente</option>
          <option value="En gestión">En gestión</option>
          <option value="Interesado">Interesado</option>
        </select>
        <button className="bg-[#111] border border-[#333] text-gray-400 w-12 h-12 flex items-center justify-center rounded-lg flex-shrink-0">
          <FaFilter size={16} />
        </button>
      </div>

      <div className="bg-[#111] md:bg-transparent border border-[#333] md:border-none rounded-xl overflow-hidden md:overflow-visible shadow-xl md:shadow-none">

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

        {/* MOBILE CARDS (PRESOL-Style) */}
        <div className="md:hidden flex flex-col gap-4">
          {contacts.map((contact) => (
            <div 
              key={contact._id} 
              className="bg-[#111] border border-[#222] rounded-2xl flex flex-col relative overflow-hidden"
            >
              {/* Top Section */}
              <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-4 items-start">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-[14px] bg-[#1a1a1a] border border-[#333] flex items-center justify-center text-[var(--color-brand)] shrink-0">
                      <FaRegUserCircle size={24} />
                    </div>
                    {/* Info */}
                    <div>
                      <h3 className="font-bold text-white text-[17px] leading-tight mb-1">{contact.firstName} {contact.lastName}</h3>
                      <div className="flex items-center text-xs text-gray-400 gap-1.5">
                        <span className="truncate max-w-[100px]">{contact.roles && contact.roles.length > 0 ? contact.roles[0].toUpperCase() : 'SIN CATEGORÍA'}</span>
                        {contact.phone && (
                          <>
                            <span>·</span>
                            <span>{contact.phone}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Top Right Pills */}
                  <div className="flex items-center gap-2">
                    <button className="w-8 h-8 rounded-full border border-[#333] flex items-center justify-center text-gray-500 hover:text-white transition">
                      <FaHeart size={12} />
                    </button>
                    {contact.status && (
                      <span className="text-[10px] bg-[#1a1a1a] border border-[#333] text-gray-300 px-2 py-1 rounded font-bold uppercase whitespace-nowrap">
                        {contact.status}
                      </span>
                    )}
                  </div>
                </div>

                {/* Sub-info row (like PRESOL "SIN CATEGORIA / EN GESTION") */}
                <div className="flex justify-between items-center mt-6">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                    {contact.roles && contact.roles.length > 0 ? contact.roles.join(', ') : 'SIN CATEGORÍA'}
                  </span>
                  <span className="text-[10px] text-white bg-[#1a1a1a] px-3 py-1.5 rounded-md font-bold uppercase tracking-wider">
                    {contact.status || 'EN GESTIÓN'}
                  </span>
                </div>
              </div>
              
              <hr className="border-[#222]" />

              {/* Bottom Quick Actions Grid */}
              <div className="p-4 grid grid-cols-4 gap-3 bg-[#0a0a0a]/30">
                {contact.phone ? (
                  <a 
                    href={`tel:${contact.phone}`}
                    className="flex items-center justify-center py-3.5 rounded-xl border border-[#333] bg-[#111] text-blue-400 hover:bg-[#222] transition-colors"
                  >
                    <FaPhone size={18} />
                  </a>
                ) : (
                  <div className="flex items-center justify-center py-3.5 rounded-xl border border-[#222] bg-transparent text-gray-700 pointer-events-none">
                    <FaPhone size={18} />
                  </div>
                )}
                
                {contact.phone ? (
                  <a 
                    href={`https://wa.me/${contact.phone.replace(/[^0-9]/g, '')}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center py-3.5 rounded-xl border border-[#333] bg-[#111] text-green-500 hover:bg-[#222] transition-colors"
                  >
                    <FaWhatsapp size={20} />
                  </a>
                ) : (
                  <div className="flex items-center justify-center py-3.5 rounded-xl border border-[#222] bg-transparent text-gray-700 pointer-events-none">
                    <FaWhatsapp size={20} />
                  </div>
                )}

                {contact.email ? (
                  <a 
                    href={`mailto:${contact.email}`}
                    className="flex items-center justify-center py-3.5 rounded-xl border border-[#333] bg-[#111] text-purple-400 hover:bg-[#222] transition-colors"
                  >
                    <FaEnvelope size={18} />
                  </a>
                ) : (
                  <div className="flex items-center justify-center py-3.5 rounded-xl border border-[#222] bg-transparent text-gray-700 pointer-events-none">
                    <FaEnvelope size={18} />
                  </div>
                )}

                <Link 
                  href={`/admin/crm/contacts/${contact._id}`}
                  className="flex items-center justify-center py-3.5 rounded-xl border border-[#333] bg-[#111] text-gray-300 hover:bg-[#222] hover:text-white transition-colors"
                >
                  <FaChevronRight size={18} />
                </Link>
              </div>
            </div>
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
