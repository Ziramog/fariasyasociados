'use client';
import { useEffect } from 'react';
import { useFormState } from 'react-dom';
import { useSession } from 'next-auth/react';
import { toast } from 'react-toastify';
import addMessage from '@/app/actions/addMessage';
import SubmitMessageButton from './SubmitMessageButton';
import SectionTitle from '@/components/shared/SectionTitle';
import { trackContactFormSubmitted } from '@/utils/analytics';

const PropertyContactForm = ({ property }) => {
  const { data: session } = useSession();

  const [state, formAction] = useFormState(addMessage, {});

  useEffect(() => {
    if (state.error) toast.error(state.error);
    if (state.submitted) {
      toast.success('Mensaje enviado');
      trackContactFormSubmitted({ form_name: 'contact', form_location: 'property_detail' });
    }
  }, [state]);

  if (!session) {
    return (
      <div className="bg-white rounded-none md:rounded-[30px] overflow-hidden px-6 py-6 md:p-8 text-center">
        <p className="text-sm text-[#666]">
          <a href="/api/auth/signin" className="text-[var(--color-brand)] font-medium hover:underline">
            Iniciá sesión
          </a>{' '}
          para contactar al vendedor.
        </p>
      </div>
    );
  }

  if (state.submitted) {
    return (
      <div className="bg-white rounded-none md:rounded-[30px] overflow-hidden px-6 py-6 md:p-8 text-center">
        <p className="text-green-600 font-medium">Tu mensaje ha sido enviado</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-none md:rounded-[30px] overflow-hidden">
      <div className="px-6 py-6 md:p-8">
        <div className="pb-6 md:pb-7 flex items-center justify-between">
          <SectionTitle size="normal">Contactanos</SectionTitle>
        </div>
        <form action={formAction}>
          <input type="hidden" id="property" name="property" defaultValue={property._id} />
          <input type="hidden" id="recipient" name="recipient" defaultValue={property.owner} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <input
                className="w-full border border-[#ddd] rounded-[6px] py-3 px-4 text-sm text-[#0F172A] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]/20 focus:border-[var(--color-brand)] transition-all placeholder:text-[#999]"
                id="name"
                name="name"
                type="text"
                placeholder="Tu nombre"
                required
              />
            </div>
            <div>
              <input
                className="w-full border border-[#ddd] rounded-[6px] py-3 px-4 text-sm text-[#0F172A] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]/20 focus:border-[var(--color-brand)] transition-all placeholder:text-[#999]"
                id="email"
                name="email"
                type="email"
                placeholder="Tu email"
                required
              />
            </div>
            <div>
              <input
                className="w-full border border-[#ddd] rounded-[6px] py-3 px-4 text-sm text-[#0F172A] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]/20 focus:border-[var(--color-brand)] transition-all placeholder:text-[#999]"
                id="phone"
                name="phone"
                type="text"
                placeholder="Teléfono"
              />
            </div>
          </div>
          <div className="mb-5">
            <textarea
              className="w-full border border-[#ddd] rounded-[6px] py-3 px-4 text-sm text-[#0F172A] bg-white h-32 resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]/20 focus:border-[var(--color-brand)] transition-all placeholder:text-[#999]"
              id="message"
              name="message"
              placeholder="Tu mensaje..."
            ></textarea>
          </div>
          <SubmitMessageButton />
        </form>
      </div>
    </div>
  );
};
export default PropertyContactForm;
