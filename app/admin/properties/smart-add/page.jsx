import SmartPropertyAddForm from '@/components/SmartPropertyAddForm';
import { getUserAICredits } from '@/app/actions/userCredits';

export const metadata = {
  title: 'Carga Inteligente con IA | Admin',
};

export default async function SmartAddPage() {
  const { credits = 0 } = await getUserAICredits();

  return (
    <section className="bg-[var(--color-bg)] min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <SmartPropertyAddForm initialCredits={credits} />
      </div>
    </section>
  );
}
