import { getContactById } from '@/app/actions/crmContacts';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { FaPhone, FaWhatsapp, FaEnvelope, FaPlus, FaHistory, FaCheckSquare } from 'react-icons/fa';
import ActivityForm from './ActivityForm';

export const dynamic = 'force-dynamic';

export default async function ContactDetailPage({ params }) {
  const data = await getContactById(params.id);
  if (!data) notFound();

  const { contact, activities, tasks, profiles } = data;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Columna Izquierda: Datos del Cliente */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-6 shadow-xl">
          <Link href="/admin/crm/contacts" className="text-xs text-gray-500 hover:text-white uppercase tracking-wider font-bold mb-4 inline-block">&larr; Volver</Link>
          
          <h1 className="text-2xl font-bold text-white uppercase mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
            {contact.firstName} {contact.lastName}
          </h1>
          
          <div className="flex gap-2 flex-wrap mb-6 mt-3">
            {contact.roles && contact.roles.map(role => (
              <span key={role} className="bg-[#222] border border-[#444] text-[10px] px-2 py-1 rounded-sm uppercase tracking-wider text-gray-300">
                {role}
              </span>
            ))}
          </div>

          <div className="space-y-3 mb-8">
            {contact.phone && (
              <div className="flex items-center gap-3 text-gray-300">
                <FaPhone className="text-gray-500" />
                <span>{contact.phone}</span>
              </div>
            )}
            {contact.email && (
              <div className="flex items-center gap-3 text-gray-300">
                <FaEnvelope className="text-gray-500" />
                <span>{contact.email}</span>
              </div>
            )}
            <div className="text-xs text-gray-500 mt-2">
              Asignado a: <span className="text-gray-300">{contact.assignedTo ? contact.assignedTo.name : 'Nadie'}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <a href={`tel:${contact.phone}`} className="flex-1 bg-[#222] hover:bg-[#333] border border-[#444] text-white py-2 rounded flex items-center justify-center gap-2 transition">
              <FaPhone size={14} /> Llamar
            </a>
            <a href={`https://wa.me/${contact.phone?.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex-1 bg-green-600/20 hover:bg-green-600/40 border border-green-600/50 text-green-400 py-2 rounded flex items-center justify-center gap-2 transition">
              <FaWhatsapp size={16} /> WhatsApp
            </a>
          </div>
        </div>

        {/* Tareas / Seguimientos pendientes */}
        <div className="bg-[#111] border border-[#333] rounded-xl p-6 shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-white font-bold flex items-center gap-2"><FaCheckSquare className="text-[var(--color-brand)]"/> Próximas Acciones</h3>
            <button className="text-gray-400 hover:text-white"><FaPlus size={12} /></button>
          </div>
          
          <div className="space-y-3">
            {tasks.length > 0 ? tasks.map(task => (
              <div key={task._id} className="bg-[#1a1a1a] border border-[#333] p-3 rounded-lg flex gap-3 items-start">
                <input type="checkbox" className="mt-1 accent-[var(--color-brand)]" />
                <div>
                  <p className="text-sm text-white font-medium">{task.title}</p>
                  {task.dueDate && <p className="text-xs text-red-400 mt-1">Vence: {new Date(task.dueDate).toLocaleDateString()}</p>}
                </div>
              </div>
            )) : (
              <p className="text-sm text-gray-500 italic">No hay tareas pendientes.</p>
            )}
          </div>
        </div>
      </div>

      {/* Columna Derecha: Timeline y Actividad */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Registro rápido de actividad */}
        <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-6 shadow-xl">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2"><FaPlus className="text-[var(--color-brand)]"/> Registrar Actividad</h3>
          <ActivityForm contactId={contact._id} />
        </div>

        {/* Timeline */}
        <div className="bg-[#111] border border-[#333] rounded-xl p-6 shadow-xl">
          <h3 className="text-white font-bold mb-6 flex items-center gap-2"><FaHistory className="text-gray-400"/> Historial de Actividades</h3>
          
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-[#333] before:to-transparent">
            {activities.length > 0 ? activities.map(activity => (
              <div key={activity._id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                {/* Icon */}
                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-[#444] bg-[#1a1a1a] text-gray-400 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow">
                  {activity.type === 'call' && <FaPhone size={14} />}
                  {activity.type === 'whatsapp' && <FaWhatsapp size={14} />}
                  {activity.type === 'email' && <FaEnvelope size={14} />}
                  {activity.type === 'visit' && <FaCheckSquare size={14} />}
                  {activity.type === 'note' && <span className="font-serif italic text-lg leading-none">N</span>}
                  {activity.type === 'other' && <span className="w-2 h-2 bg-gray-400 rounded-full"></span>}
                </div>
                
                {/* Card */}
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-[#1a1a1a] border border-[#333] p-4 rounded-xl shadow">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-bold text-[var(--color-brand)] uppercase tracking-wider">{activity.type}</span>
                    <span className="text-xs text-gray-500">{new Date(activity.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                  </div>
                  {activity.outcome && (
                    <p className="text-sm text-gray-300 font-bold mt-1">Resultado: {activity.outcome}</p>
                  )}
                  <p className="text-gray-400 text-sm mt-2 whitespace-pre-wrap">{activity.notes}</p>
                  <p className="text-xs text-gray-600 mt-3 text-right">por {activity.createdBy?.name || 'Sistema'}</p>
                </div>
              </div>
            )) : (
              <p className="text-center text-gray-500 py-10">No hay actividades registradas.</p>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
