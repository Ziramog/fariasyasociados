import SmartPropertyAddForm from '@/components/SmartPropertyAddForm';

export const metadata = {
  title: 'Carga Inteligente con IA | Admin',
};

export default function SmartAddPage() {
  return (
    <section className="bg-[var(--color-bg)] min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <SmartPropertyAddForm />
      </div>
    </section>
  );
}
