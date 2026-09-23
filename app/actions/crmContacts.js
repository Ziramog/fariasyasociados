'use server';

import connectDB from '@/config/database';
import Contact from '@/models/Contact';
import BuyerProfile from '@/models/BuyerProfile';
import Activity from '@/models/Activity';
import Task from '@/models/Task';
import { getSessionUser } from '@/utils/getSessionUser';
import { revalidatePath } from 'next/cache';

export async function getContacts(filters = {}) {
  try {
    await connectDB();
    const contacts = await Contact.find(filters)
      .populate('assignedTo', 'name email')
      .sort({ updatedAt: -1 })
      .lean();
      
    // Convert ObjectIds to strings
    return contacts.map(c => ({
      ...c,
      _id: c._id.toString(),
      assignedTo: c.assignedTo ? { ...c.assignedTo, _id: c.assignedTo._id.toString() } : null,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    }));
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return [];
  }
}

export async function getContactById(id) {
  try {
    await connectDB();
    const contact = await Contact.findById(id)
      .populate('assignedTo', 'name email')
      .lean();
      
    if (!contact) return null;
    
    // Fetch related data
    const profiles = await BuyerProfile.find({ contactId: id }).lean();
    const activities = await Activity.find({ contactId: id })
      .populate('createdBy', 'name')
      .populate('propertyId', 'name')
      .sort({ date: -1 })
      .lean();
    const tasks = await Task.find({ contactId: id })
      .populate('assignedTo', 'name')
      .sort({ dueDate: 1 })
      .lean();

    return {
      contact: {
        ...contact,
        _id: contact._id.toString(),
        assignedTo: contact.assignedTo ? { ...contact.assignedTo, _id: contact.assignedTo._id.toString() } : null,
      },
      profiles: profiles.map(p => ({ ...p, _id: p._id.toString(), contactId: p.contactId.toString() })),
      activities: activities.map(a => ({ 
        ...a, 
        _id: a._id.toString(), 
        contactId: a.contactId.toString(),
        createdBy: a.createdBy ? { ...a.createdBy, _id: a.createdBy._id.toString() } : null,
        propertyId: a.propertyId ? { ...a.propertyId, _id: a.propertyId._id.toString() } : null,
      })),
      tasks: tasks.map(t => ({ 
        ...t, 
        _id: t._id.toString(), 
        contactId: t.contactId.toString(),
        assignedTo: t.assignedTo ? { ...t.assignedTo, _id: t.assignedTo._id.toString() } : null,
      }))
    };
  } catch (error) {
    console.error('Error fetching contact:', error);
    return null;
  }
}

export async function createContact(formData) {
  try {
    await connectDB();
    const sessionUser = await getSessionUser();
    
    if (!sessionUser || !sessionUser.userId) {
      return { error: 'No autorizado' };
    }

    const contactData = {
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      whatsapp: formData.get('whatsapp'),
      source: formData.get('source'),
      status: formData.get('status') || 'Pendiente',
      roles: formData.getAll('roles'),
      tags: formData.get('tags') ? formData.get('tags').split(',').map(t => t.trim()) : [],
      assignedTo: sessionUser.userId,
      notes: formData.get('notes'),
    };

    const newContact = new Contact(contactData);
    await newContact.save();
    
    revalidatePath('/admin/crm/contacts');
    return { success: true, contactId: newContact._id.toString() };
  } catch (error) {
    console.error('Error creating contact:', error);
    return { error: error.message };
  }
}

export async function updateContactStatus(contactId, status) {
  try {
    await connectDB();
    const sessionUser = await getSessionUser();
    if (!sessionUser) return { error: 'No autorizado' };

    await Contact.findByIdAndUpdate(contactId, { status });
    revalidatePath(`/admin/crm/contacts/${contactId}`);
    return { success: true };
  } catch (error) {
    console.error('Error updating status:', error);
    return { error: error.message };
  }
}

export async function addActivity(formData) {
  try {
    await connectDB();
    const sessionUser = await getSessionUser();
    
    if (!sessionUser || !sessionUser.userId) {
      return { error: 'No autorizado' };
    }

    const activityData = {
      contactId: formData.get('contactId'),
      type: formData.get('type'),
      outcome: formData.get('outcome'),
      notes: formData.get('notes'),
      createdBy: sessionUser.userId,
    };
    
    const propertyId = formData.get('propertyId');
    if (propertyId) {
      activityData.propertyId = propertyId;
    }

    const newActivity = new Activity(activityData);
    await newActivity.save();
    
    revalidatePath(`/admin/crm/contacts/${activityData.contactId}`);
    return { success: true };
  } catch (error) {
    console.error('Error adding activity:', error);
    return { error: error.message };
  }
}

export async function createTask(formData) {
  try {
    await connectDB();
    const sessionUser = await getSessionUser();
    if (!sessionUser || !sessionUser.userId) return { error: 'No autorizado' };

    const contactId = formData.get('contactId');
    const newTask = new Task({
      contactId,
      title: formData.get('title'),
      description: formData.get('description'),
      dueDate: formData.get('dueDate') || null,
      priority: formData.get('priority') || 'normal',
      assignedTo: sessionUser.userId,
      createdBy: sessionUser.userId,
    });
    
    await newTask.save();
    revalidatePath(`/admin/crm/contacts/${contactId}`);
    return { success: true };
  } catch (error) {
    console.error('Error creating task:', error);
    return { error: error.message };
  }
}

export async function completeTask(taskId, contactId) {
  try {
    await connectDB();
    await Task.findByIdAndUpdate(taskId, { status: 'completed' });
    revalidatePath(`/admin/crm/contacts/${contactId}`);
    return { success: true };
  } catch (error) {
    console.error('Error completing task:', error);
    return { error: error.message };
  }
}

export async function createBuyerProfile(formData) {
  try {
    await connectDB();
    const contactId = formData.get('contactId');
    const newProfile = new BuyerProfile({
      contactId,
      operation: formData.get('operation'),
      priceMax: formData.get('priceMax') || null,
      currency: formData.get('currency') || 'USD',
      locations: formData.get('locations') ? formData.get('locations').split(',').map(l => l.trim()) : [],
    });
    
    await newProfile.save();
    revalidatePath(`/admin/crm/contacts/${contactId}`);
    return { success: true };
  } catch (error) {
    console.error('Error creating profile:', error);
    return { error: error.message };
  }
}
