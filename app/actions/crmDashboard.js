'use server';
import connectDB from '@/config/database';
import Contact from '@/models/Contact';
import Task from '@/models/Task';
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

    return {
      success: true,
      data: {
        tasks: pendingTasks.map(t => ({
          ...t,
          _id: t._id.toString(),
          contactId: t.contactId ? { ...t.contactId, _id: t.contactId._id.toString() } : null
        })),
        pendingLeads: pendingContacts.map(c => ({ ...c, _id: c._id.toString() })),
        activeContactsCount
      }
    };
  } catch (error) {
    console.error('Error fetching CRM dashboard:', error);
    return { error: error.message };
  }
}
