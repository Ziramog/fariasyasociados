'use server';
import connectDB from '@/config/database';
import Contact from '@/models/Contact';
import Task from '@/models/Task';
import Activity from '@/models/Activity';
import { getSessionUser } from '@/utils/getSessionUser';

export async function getDashboardData() {
  try {
    await connectDB();
    const session = await getSessionUser();
    if (!session) return { error: 'No autorizado' };

    const userId = session.userId;
    const isSuperAdmin = session.role === 'superadmin' || session?.user?.email === 'ingjuangomariz@gmail.com' || session?.user?.email === 'fariasyasociadosweb@gmail.com';

    // Query filters (if not superadmin, only see own tasks/contacts)
    const taskFilter = { status: { $ne: 'completed' } };
    const contactFilter = {};
    
    if (!isSuperAdmin) {
      taskFilter.assignedTo = userId;
      contactFilter.assignedTo = userId;
    }

    // Tareas pendientes ordenadas por fecha de vencimiento
    const pendingTasks = await Task.find(taskFilter)
      .populate('contactId', 'firstName lastName phone')
      .sort({ dueDate: 1 })
      .limit(10)
      .lean();

    // Leads / Contactos Nuevos (Estado Pendiente)
    const pendingContacts = await Contact.find({ ...contactFilter, status: 'Pendiente' })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();
      
    // Clientes Activos (En gestión, Interesado, Oportunidad, Cotización)
    const activeContactsCount = await Contact.countDocuments({
      ...contactFilter,
      status: { $in: ['En gestión', 'Interesado', 'Oportunidad', 'Cotización'] }
    });

    // Actividad Reciente (Timeline global)
    const activityFilter = {};
    if (!isSuperAdmin) {
      activityFilter.createdBy = userId;
    }
    
    const recentActivities = await Activity.find(activityFilter)
      .populate('contactId', 'firstName lastName')
      .populate('propertyId', 'name')
      .sort({ date: -1 })
      .limit(15)
      .lean();

    // Embudo Comercial — Conteo por estado del pipeline
    const pipelineStatuses = ['Pendiente', 'En gestión', 'Interesado', 'Oportunidad', 'Cotización', 'Cliente', 'Descartado'];
    const pipelineCounts = {};
    for (const status of pipelineStatuses) {
      pipelineCounts[status] = await Contact.countDocuments({ ...contactFilter, status });
    }

    return {
      success: true,
      data: {
        tasks: pendingTasks.map(t => ({
          ...t,
          _id: t._id.toString(),
          dueDate: t.dueDate ? t.dueDate.toISOString() : null,
          createdAt: t.createdAt ? t.createdAt.toISOString() : null,
          updatedAt: t.updatedAt ? t.updatedAt.toISOString() : null,
          contactId: t.contactId ? { ...t.contactId, _id: t.contactId._id.toString() } : null
        })),
        pendingLeads: pendingContacts.map(c => ({ 
          ...c, 
          _id: c._id.toString(),
          createdAt: c.createdAt ? c.createdAt.toISOString() : null,
          updatedAt: c.updatedAt ? c.updatedAt.toISOString() : null
        })),
        activeContactsCount,
        activities: recentActivities.map(a => ({
          ...a,
          _id: a._id.toString(),
          date: a.date ? a.date.toISOString() : null,
          createdAt: a.createdAt ? a.createdAt.toISOString() : null,
          updatedAt: a.updatedAt ? a.updatedAt.toISOString() : null,
          contactId: a.contactId ? { ...a.contactId, _id: a.contactId._id.toString() } : null,
          propertyId: a.propertyId ? { ...a.propertyId, _id: a.propertyId._id.toString() } : null
        })),
        pipelineCounts
      }
    };
  } catch (error) {
    console.error('Error fetching CRM dashboard:', error);
    return { error: error.message };
  }
}
