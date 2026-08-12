export const metadata = {
  title: 'Admin — Nueva Propuesta',
  robots: { index: false, follow: false },
};

import Link from 'next/link';
import QuotationWizard from '@/components/admin/quotations/QuotationWizard';

export default function NewQuotationPage() {
  return (
    <div className="p-4 md:p-6">
      <h1 className="text-[24px] md:text-[36px] font-normal text-white mb-6" style={{ fontFamily: 'var(--font-heading)' }}>
        Nueva Propuesta
      </h1>
      <QuotationWizard />
    </div>
  );
}
