import Link from 'next/link';
import { getContacts } from '@/app/actions/crmContacts';
import { getSessionUser } from '@/utils/getSessionUser';
import ContactsClient from './ContactsClient';

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

  // Convert Mongoose models to plain JS objects for the Client Component
  const serializedContacts = JSON.parse(JSON.stringify(contacts));

  return <ContactsClient initialContacts={serializedContacts} />;
}
