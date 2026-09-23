import { getDashboardData } from '@/app/actions/crmDashboard';
import { getSessionUser } from '@/utils/getSessionUser';
import Link from 'next/link';
import { FaCheckSquare, FaUserPlus, FaArrowRight, FaBolt, FaHistory, FaPhone, FaWhatsapp, FaEnvelope, FaMapMarkerAlt, FaRegCommentDots } from 'react-icons/fa';

export const dynamic = 'force-dynamic';

export default async function CRMDashboardPage() {
  const session = await getSessionUser();
  const superAdminEmails = ['ingjuangomariz@gmail.com', 'fariasyasociadosweb@gmail.com'];
  const isSuperAdmin = session?.role === 'superadmin' || superAdminEmails.includes(session?.user?.email);
  
  if (!isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <h2 className="text-2xl font-bold text-white mb-2">Módulo en Desarrollo</h2>
        <p className="text-gray-400">El CRM Inmobiliario se encuentra en fase de pruebas.</p>
        <Link href="/admin" className="mt-6 bg-[#222] border border-[#333] text-white px-4 py-2 rounded-lg hover:bg-[#333] transition">
          Volver al Panel
        </Link>
      </div>
    );
  }

  const res = await getDashboardData();
  if (res.error) {
    return <div className="text-red-500 p-6">Error: {res.error}</div>;
  }

  const { tasks, pendingLeads, activeContactsCount, activities } = res.data;
  
  // Agrupar tareas
  const today = new Date();
  today.setHours(0,0,0,0);
  
  const overdueTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate) < today);
  const todayTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate) >= today && new Date(t.dueDate) <= new Date(today.getTime() + 86400000));
  const otherTasks = tasks.filter(t => !t.dueDate || new Date(t.dueDate) > new Date(today.getTime() + 86400000));

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 md:px-6 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-heading)' }}>Mi Día</h1>
          <p className="text-gray-400">Centro Operativo CRM</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <Link href="/admin/crm/contacts" className="flex-1 md:flex-none text-center bg-[#222] border border-[#444] hover:bg-[#333] text-white px-4 py-2 rounded-lg font-bold transition">
            Ver Directorio
          </Link>
          <Link href="/admin/crm/contacts/new" className="flex-1 md:flex-none text-center bg-[var(--color-brand)] hover:bg-[var(--color-brand-dark)] text-white px-4 py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition">
            <FaUserPlus /> Nuevo Lead
          </Link>
        </div>
      </div>

      {/* MÉTRICAS RÁPIDAS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
         <div className="bg-[#111] border border-[#333] p-5 rounded-xl">
            <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-1">En Gestión Activa</p>
            <p className="text-3xl font-bold text-white">{activeContactsCount}</p>
         </div>
         <div className="bg-[#111] border border-[#333] p-5 rounded-xl">
            <p className="text-[10px] uppercase font-bold text-amber-500 tracking-wider mb-1">Nuevos Leads</p>
            <p className="text-3xl font-bold text-amber-500">{pendingLeads.length}</p>
         </div>
         <div className="bg-[#111] border border-[#333] p-5 rounded-xl">
            <p className="text-[10px] uppercase font-bold text-red-400 tracking-wider mb-1">Tareas Vencidas</p>
            <p className="text-3xl font-bold text-red-400">{overdueTasks.length}</p>
         </div>
         <div className="bg-[#111] border border-[#333] p-5 rounded-xl">
            <p className="text-[10px] uppercase font-bold text-green-400 tracking-wider mb-1">Tareas para Hoy</p>
            <p className="text-3xl font-bold text-green-400">{todayTasks.length}</p>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* COLUMNA IZQUIERDA: Tareas y Seguimiento */}
        <div className="md:col-span-7 space-y-6">
          <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-5 shadow-xl">
            <h2 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 mb-4 text-gray-400">
              <FaCheckSquare /> Próximos Seguimientos
            </h2>

            {tasks.length === 0 ? (
               <div className="text-center py-10 border border-dashed border-[#333] rounded-lg">
                  <p className="text-gray-500">¡No tienes seguimientos pendientes!</p>
               </div>
            ) : (
               <div className="space-y-3">
                 {overdueTasks.length > 0 && (
                   <div className="mb-4">
                     <h3 className="text-[10px] font-bold text-red-400 uppercase mb-2 ml-1">Atrasadas</h3>
                     {overdueTasks.map(task => <TaskCard key={task._id} task={task} />)}
                   </div>
                 )}
                 
                 {todayTasks.length > 0 && (
                   <div className="mb-4">
                     <h3 className="text-[10px] font-bold text-green-400 uppercase mb-2 ml-1">Para Hoy</h3>
                     {todayTasks.map(task => <TaskCard key={task._id} task={task} />)}
                   </div>
                 )}

                 {otherTasks.length > 0 && (
                   <div>
                     <h3 className="text-[10px] font-bold text-gray-500 uppercase mb-2 ml-1">Próximamente</h3>
                     {otherTasks.map(task => <TaskCard key={task._id} task={task} />)}
                   </div>
                 )}
               </div>
            )}
          </div>
          
          {/* LÍNEA DE TIEMPO (TIMELINE) GLOBAL */}
          <div className="bg-[#111] border border-[#333] rounded-xl p-5 md:p-6 shadow-xl">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-6 flex items-center gap-2">
              <FaHistory /> Registro de Actividad Global
            </h2>
            
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-[#333] before:to-transparent">
              {activities && activities.length > 0 ? activities.map(activity => {
                const activityDate = new Date(activity.date);
                return (
                  <div key={activity._id} className="relative flex items-center justify-normal group is-active pl-12">
                    <div className="absolute left-0 flex items-center justify-center w-8 h-8 rounded-full border border-[#444] bg-[#1a1a1a] text-[var(--color-brand)] shadow-lg z-10">
                      {activity.type === 'call' && <FaPhone size={12} />}
                      {activity.type === 'whatsapp' && <FaWhatsapp size={14} />}
                      {activity.type === 'email' && <FaEnvelope size={12} />}
                      {activity.type === 'visit' && <FaMapMarkerAlt size={12} />}
                      {activity.type === 'note' && <FaRegCommentDots size={12} />}
                    </div>
                    
                    <div className="w-full bg-[#1a1a1a] border border-[#333] p-4 rounded-xl shadow-lg hover:border-[#555] transition">
                      <div className="flex justify-between items-start mb-1">
                        <div className="flex items-center gap-2">
                           <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{activity.type}</span>
                           {activity.contactId && (
                             <Link href={`/admin/crm/contacts/${activity.contactId._id}`} className="text-xs text-[var(--color-brand)] font-bold hover:underline">
                               Con {activity.contactId.firstName} {activity.contactId.lastName}
                             </Link>
                           )}
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-gray-400 block">{activityDate.toLocaleDateString()}</span>
                          <span className="text-[10px] text-gray-500 block">{activityDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                      </div>
                      {activity.outcome && <p className="text-sm text-white font-bold mt-1">{activity.outcome}</p>}
                      <p className="text-gray-400 text-sm mt-2 whitespace-pre-wrap">{activity.notes}</p>
                    </div>
                  </div>
                );
              }) : (
                <p className="text-center text-gray-500 py-4 text-sm">Registro en blanco.</p>
              )}
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: Leads y Captaciones */}
        <div className="md:col-span-5 space-y-6">
          <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-5 shadow-xl">
             <div className="flex justify-between items-center mb-4">
               <h2 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 text-amber-500">
                 <FaBolt /> Leads Nuevos (Pendientes)
               </h2>
               <span className="bg-amber-500/20 text-amber-500 text-[10px] font-bold px-2 py-0.5 rounded-full">{pendingLeads.length}</span>
             </div>

             {pendingLeads.length === 0 ? (
               <div className="text-center py-8 text-gray-500 text-sm">
                 No hay leads pendientes por contactar.
               </div>
             ) : (
               <div className="space-y-3">
                 {pendingLeads.map(lead => (
                   <Link href={`/admin/crm/contacts/${lead._id}`} key={lead._id} className="block bg-[#111] border border-[#333] hover:border-amber-500/50 p-3 rounded-lg transition group">
                     <div className="flex justify-between items-start">
                       <div>
                         <p className="font-bold text-white group-hover:text-amber-400 transition">{lead.firstName} {lead.lastName}</p>
                         <p className="text-xs text-gray-500 mt-0.5">Origen: {lead.source}</p>
                       </div>
                       <FaArrowRight className="text-gray-600 group-hover:text-amber-500 transition" />
                     </div>
                   </Link>
                 ))}
               </div>
             )}
          </div>
        </div>

      </div>
    </div>
  );
}

function TaskCard({ task }) {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date(new Date().setHours(0,0,0,0));
  
  return (
    <div className={`flex items-center justify-between p-4 rounded-lg border ${isOverdue ? 'bg-red-950/20 border-red-900/30' : 'bg-[#111] border-[#333]'} hover:border-[#555] transition mb-2 gap-4`}>
      <div className="flex-1 min-w-0">
        <Link href={`/admin/crm/contacts/${task.contactId?._id}`} className="text-sm font-bold text-white hover:text-[var(--color-brand)] transition truncate block">
          {task.title}
        </Link>
        {task.contactId && (
          <p className="text-xs text-gray-400 mt-1 truncate">
            👤 {task.contactId.firstName} {task.contactId.lastName} {task.contactId.phone && `· 📞 ${task.contactId.phone}`}
          </p>
        )}
      </div>
      
      <Link href={`/admin/crm/contacts/${task.contactId?._id}`} className="bg-[#222] hover:bg-[#333] text-white px-3 py-1.5 rounded text-xs font-bold whitespace-nowrap transition border border-[#444]">
        Abrir Ficha
      </Link>
    </div>
  );
}
