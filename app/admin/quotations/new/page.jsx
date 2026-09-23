export const metadata = {
  title: 'Admin — Nueva Propuesta',
  robots: { index: false, follow: false },
};

import Link from 'next/link';
import QuotationWizard from '@/components/admin/quotations/QuotationWizard';
import { getContactById } from '@/app/actions/crmContacts';

export default async function NewQuotationPage({ searchParams }) {
  let initialData = null;

  if (searchParams?.contactId) {
    const data = await getContactById(searchParams.contactId);
    if (data && data.contact) {
      initialData = {
        properties: [],
        client: {
          name: `${data.contact.firstName} ${data.contact.lastName}`.trim(),
          email: data.contact.email || '',
          phone: data.contact.phone || '',
          dni: '',
          notes: data.contact.notes || ''
        },
        payment: { type: 'contado', downPaymentPct: 30, downPayment: null, installments: null, installmentAmount: null, interestRate: null, notes: '' },
        customization: { template: 'modern', showAIDescription: false, aiDescription: null, agentNotes: '', validUntil: '' },
      };
    }
  }

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-[24px] md:text-[36px] font-normal text-white mb-6" style={{ fontFamily: 'var(--font-heading)' }}>
        Nueva Propuesta
      </h1>
      <QuotationWizard initialData={initialData} />
    </div>
  );
}
