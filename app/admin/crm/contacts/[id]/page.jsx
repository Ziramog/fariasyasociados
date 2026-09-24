import { getContactById } from '@/app/actions/crmContacts';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { FaPhone, FaWhatsapp, FaEnvelope, FaPlus, FaCheckSquare, FaHistory, FaMapMarkerAlt, FaHome, FaRegCommentDots, FaUserTie } from 'react-icons/fa';
import NewActivityModal from './NewActivityModal';
import CompleteTaskButton from './CompleteTaskButton';
import NewTaskModal from './NewTaskModal';
import NewProfileModal from './NewProfileModal';
import PropertyMatches from './PropertyMatches';
import StatusSelector from './StatusSelector';

import { getSessionUser } from '@/utils/getSessionUser';

export const dynamic = 'force-dynamic';

export default async function ContactDetailPage({ params }) {
  const session = await getSessionUser();
  const superAdminEmails = ['ingjuangomariz@gmail.com', 'fariasyasociadosweb@gmail.com'];
  const isSuperAdmin = session?.role === 'superadmin' || superAdminEmails.includes(session?.user?.email);
  
  if (!isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <h2 className="text-2xl font-bold text-white mb-2">Acceso Restringido</h2>
        <p className="text-gray-400">Esta sección está en desarrollo.</p>
        <Link href="/admin" className="mt-6 bg-[#222] border border-[#333] text-white px-4 py-2 rounded-lg hover:bg-[#333] transition">
          Volver al Panel
        </Link>
      </div>
    );
  }

  const data = await getContactById(params.id);
  if (!data) notFound();

  const { contact, activities, tasks, profiles } = data;
  
  // Encontrar próxima tarea
  const pendingTasks = tasks.filter(t => t.status !== 'completed');
  const nextTask = pendingTasks.length > 0 ? pendingTasks[0] : null;

  const latestActivity = activities.length > 0 ? activities[0] : null;

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 md:px-6 min-h-screen pb-24 md:pb-6 relative">
      
      {/* 1. HEADER E IDENTIDAD */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-end border-b border-[#333] pb-4 gap-4">
        <div className="w-full md:w-auto">
          <Link href="/admin/crm" className="text-xs text-gray-500 hover:text-[var(--color-brand)] uppercase tracking-wider font-bold mb-2 inline-block transition-colors">&larr; Volver al CRM</Link>
          <div className="flex flex-col md:flex-row md:items-center gap-3">
             <h1 className="text-3xl md:text-4xl font-bold text-white uppercase leading-none" style={{ fontFamily: 'var(--font-heading)' }}>
               {contact.firstName} {contact.lastName}
             </h1>
             <StatusSelector contactId={contact._id} currentStatus={contact.status} />
          </div>
          
          <div className="flex gap-2 flex-wrap mt-3">
            {contact.roles && contact.roles.map(role => (
              <span key={role} className="bg-[#222] border border-[#444] text-[10px] px-2 py-1 rounded-sm uppercase tracking-wider text-[var(--color-brand)] font-bold">
                {role}
              </span>
            ))}
            <span className="bg-[#111] border border-[#333] text-[10px] px-2 py-1 rounded-sm uppercase tracking-wider text-gray-400">
              Origen: {contact.source || 'Manual'}
            </span>
          </div>
        </div>
        
        {/* Acciones Rápidas Desktop */}
        <div className="hidden md:flex gap-3 w-full md:w-auto">
          {contact.phone && (
            <>
              <a href={`tel:${contact.phone}`} className="bg-[#222] hover:bg-[#333] text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 border border-[#444] transition">
                <FaPhone size={14} /> Llamar
              </a>
              <a href={`https://wa.me/${contact.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="bg-green-600/20 hover:bg-green-600/40 text-green-400 px-4 py-2 rounded-lg font-bold flex items-center gap-2 border border-green-600/50 transition">
                <FaWhatsapp size={16} /> WhatsApp
              </a>
            </>
          )}
        </div>
      </div>

      {/* GRID PRINCIPAL */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* COLUMNA IZQUIERDA (Prioridad Visual) */}
        <div className="md:col-span-8 space-y-6">
          
          {/* PRÓXIMA ACCIÓN (Hero Block) */}
          <div className={`rounded-xl border ${nextTask ? 'bg-amber-900/10 border-amber-500/30' : 'bg-[#111] border-[#333]'} p-5 md:p-6 shadow-xl relative overflow-hidden`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-sm font-bold uppercase tracking-wider flex items-center gap-2 ${nextTask ? 'text-amber-500' : 'text-gray-500'}`}>
                <FaCheckSquare /> Próxima Acción
              </h2>
              <NewTaskModal contactId={contact._id} />
            </div>
            
            {nextTask ? (
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl text-white font-bold mb-1">{nextTask.title}</h3>
                  <p className="text-gray-400 text-sm mb-2">{nextTask.description || 'Sin notas adicionales.'}</p>
                  <p className="text-xs text-amber-400 font-medium">Vence: {nextTask.dueDate ? `${new Date(nextTask.dueDate).toLocaleDateString()} a las ${new Date(nextTask.dueDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` : 'Sin fecha'}</p>
                </div>
                <CompleteTaskButton taskId={nextTask._id} contactId={contact._id} />
              </div>
            ) : (
              <p className="text-gray-500 text-sm italic py-2">No hay seguimientos programados. ¡Estás al día!</p>
            )}
          </div>

          {/* PERFIL DE BÚSQUEDA (El "Estado Comercial" Inmobiliario) */}
          <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-5 md:p-6 shadow-xl">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4 flex items-center gap-2">
              <FaHome /> Perfil de Búsqueda
            </h2>
            
            {profiles.length > 0 ? (
              profiles.map(p => (
                <div key={p._id} className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-[#111] rounded-lg border border-[#333]">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-bold">Operación</p>
                    <p className="text-white capitalize">{p.operation || '-'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-bold">Presupuesto</p>
                    <p className="text-green-400 font-bold">{p.currency} {p.priceMax ? p.priceMax.toLocaleString() : 'Abierto'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] text-gray-500 uppercase font-bold">Zonas</p>
                    <p className="text-gray-300">{p.locations?.join(', ') || 'No definidas'}</p>
                  </div>
                  <div className="col-span-2 md:col-span-4 mt-2">
                    <PropertyMatches profileId={p._id} contactPhone={contact.phone} />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 border-2 border-dashed border-[#333] rounded-lg">
                <p className="text-gray-500 text-sm mb-3">Aún no has definido qué busca este cliente.</p>
                <NewProfileModal contactId={contact._id} />
              </div>
            )}
          </div>

          {/* TIMELINE DE ACTIVIDAD */}
          <div className="bg-[#111] border border-[#333] rounded-xl p-5 md:p-6 shadow-xl">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-6 flex items-center gap-2">
              <FaHistory /> Actividad Reciente
            </h2>
            
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-[#333] before:to-transparent">
              {activities.length > 0 ? activities.map(activity => (
                <div key={activity._id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full border border-[#444] bg-[#1a1a1a] text-[var(--color-brand)] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-lg z-10">
                    {activity.type === 'call' && <FaPhone size={12} />}
                    {activity.type === 'whatsapp' && <FaWhatsapp size={14} />}
                    {activity.type === 'email' && <FaEnvelope size={12} />}
                    {activity.type === 'visit' && <FaMapMarkerAlt size={12} />}
                    {activity.type === 'note' && <FaRegCommentDots size={12} />}
                  </div>
                  
                  <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] bg-[#1a1a1a] border border-[#333] p-4 rounded-xl shadow-lg">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{activity.type}</span>
                      <div className="text-right">
                        <span className="text-[10px] text-gray-400 block">{new Date(activity.date).toLocaleDateString()}</span>
                        <span className="text-[10px] text-gray-500 block">{new Date(activity.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                    </div>
                    {activity.outcome && <p className="text-sm text-white font-bold mt-1">{activity.outcome}</p>}
                    <p className="text-gray-400 text-sm mt-2 whitespace-pre-wrap">{activity.notes}</p>
                  </div>
                </div>
              )) : (
                <p className="text-center text-gray-500 py-4 text-sm">Registro en blanco.</p>
              )}
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA (Contexto) */}
        <div className="md:col-span-4 space-y-6">
          
          <NewActivityModal contactId={contact._id} />

          {/* DATOS DE CONTACTO */}
          <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-5 shadow-xl mt-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4 flex items-center gap-2">
              <FaUserTie /> Contacto Principal
            </h2>
            
            <div className="space-y-4">
              {contact.phone && (
                <div>
                  <p className="text-[10px] text-gray-500 uppercase font-bold">Celular</p>
                  <p className="text-white text-sm">{contact.phone}</p>
                </div>
              )}
              {contact.email && (
                <div>
                  <p className="text-[10px] text-gray-500 uppercase font-bold">Email</p>
                  <p className="text-white text-sm">{contact.email}</p>
                </div>
              )}
              <div>
                <p className="text-[10px] text-gray-500 uppercase font-bold">Asesor Responsable</p>
                <p className="text-[var(--color-brand)] text-sm font-bold">{contact.assignedTo ? contact.assignedTo.name : 'Sin asignar'}</p>
              </div>
            </div>
          </div>

          {/* CREAR PROPUESTA FORMAL */}
          <div className="bg-[#111] border border-[#333] rounded-xl p-5 shadow-xl">
             <Link href={`/admin/quotations/new?contactId=${contact._id}`} className="block w-full text-center bg-[#222] border border-[#444] hover:bg-[#333] hover:border-[var(--color-brand)] text-gray-300 hover:text-white py-3 rounded-lg font-bold transition text-sm">
               Generar Propuesta Formal (PDF)
             </Link>
          </div>

        </div>
      </div>

      {/* MOBILE FLOATING ACTIONS (Thumbing UX) - Sólo si hay teléfono */}
      {contact.phone && (
        <div className="md:hidden fixed bottom-16 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/90 to-transparent z-30 pointer-events-none">
          <div className="flex gap-2 w-3/4 pointer-events-auto">
             <a href={`https://wa.me/${contact.phone?.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex-1 bg-green-600 hover:bg-green-500 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-xl">
                <FaWhatsapp size={20} /> Hablar
             </a>
          </div>
        </div>
      )}

    </div>
  );
}
