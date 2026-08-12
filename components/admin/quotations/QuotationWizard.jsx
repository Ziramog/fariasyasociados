'use client';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import StepProperty from './steps/StepProperty';
import StepClient from './steps/StepClient';
import StepPayment from './steps/StepPayment';
import StepCustomize from './steps/StepCustomize';
import StepPreview from './steps/StepPreview';
import { calculateFrenchSystem } from '@/lib/quotations/payment-calculator';
import { Home, User, CreditCard, Palette, FileText } from 'lucide-react';

const STEPS = [
  { id: 1, label: 'Propiedad', icon: <Home className="w-4 h-4" /> },
  { id: 2, label: 'Cliente', icon: <User className="w-4 h-4" /> },
  { id: 3, label: 'Pago', icon: <CreditCard className="w-4 h-4" /> },
  { id: 4, label: 'Diseño', icon: <Palette className="w-4 h-4" /> },
  { id: 5, label: 'Generar', icon: <FileText className="w-4 h-4" /> },
];

export default function QuotationWizard({ initialData = null, editId = null }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPDFUrl, setGeneratedPDFUrl] = useState(null);
  const [generatedId, setGeneratedId] = useState(editId || null);

  const [wizardState, setWizardState] = useState(initialData || {
    properties: [],
    client: { name: '', email: '', phone: '', dni: '', notes: '' },
    payment: { type: 'contado', downPaymentPct: 30, downPayment: null, installments: null, installmentAmount: null, interestRate: null, notes: '' },
    customization: { template: 'modern', showAIDescription: false, aiDescription: null, agentNotes: '', validUntil: '' },
  });

  const updateState = (key, value) => setWizardState(prev => ({ ...prev, [key]: value }));
  const parsePrice = (val) => { if (!val) return 0; return parseFloat(String(val).replace(/[^0-9.]/g, '')) || 0; };
  const totalPrice = wizardState.properties.reduce((sum, p) => sum + parsePrice(p.price), 0);

  // Calculate payment values using French amortization system
  const paymentData = wizardState.payment;
  const calcDownPayment = paymentData.downPaymentPct ? totalPrice * (paymentData.downPaymentPct / 100) : 0;
  const paymentSchedule = useMemo(() => {
    if (paymentData.type !== 'financiado' || !paymentData.installments) return null;
    try {
      return calculateFrenchSystem(totalPrice, paymentData.interestRate || 10, paymentData.installments, paymentData.downPaymentPct || 30);
    } catch { return null; }
  }, [paymentData.type, paymentData.installments, paymentData.interestRate, paymentData.downPaymentPct, totalPrice]);
  const calcInstallmentAmount = paymentSchedule?.installmentAmount || 0;

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      // Fetch exchange rate for dual currency
      let exchangeRate = null;
      try {
        const rateRes = await fetch('/api/site-config');
        const rateData = await rateRes.json();
        exchangeRate = rateData.exchangeRateARS;
      } catch {}

      // Always generate WhatsApp message silently for the clipboard action
      let whatsappMessage = null;
      const firstProp = wizardState.properties[0];
      if (firstProp) {
        const aiRes = await fetch('/api/quotations/generate-ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            selector_version: 'whatsapp',
            nombre_cliente: wizardState.client.name || 'Cliente',
            tipo_propiedad: firstProp.type || '',
            operacion: firstProp.operation || 'venta',
            ubicacion: `${firstProp.location?.city || ''}`,
            barrio: firstProp.location?.street || '',
            dormitorios: firstProp.beds || '',
            banos: firstProp.baths || '',
            superficie: firstProp.square_feet ? `${firstProp.square_feet} m²` : '',
            precio: `USD ${totalPrice.toLocaleString('es-AR')}`,
            puntos_destacados: wizardState.customization.aiDescription || '',
            referencias_ubicacion: '',
            uso_ideal: 'vivir o invertir'
          }),
        });
        const aiData = await aiRes.json();
        whatsappMessage = aiData.description || null;
      }

      const body = {
        properties: wizardState.properties.map(p => ({
          propertyId: p._id,
          title: p.name,
          address: `${p.location?.street || ''}, ${p.location?.city || ''}`,
          type: p.type || '',
          operation: p.operation || 'venta',
          price: parsePrice(p.price),
          priceARS: exchangeRate ? parsePrice(p.price) * exchangeRate : null,
          surface: p.square_feet || null,
          bedrooms: p.beds || null,
          bathrooms: p.baths || null,
          photos: (p.images || []).map(i => i?.url).filter(Boolean),
          status: p.status || null,
          description: p.description || null,
          coveredArea: p.covered_area || null,
          garage: p.garage || null,
          services: p.services || [],
          titlesStatus: p.titles_status || null,
        })),
        client: wizardState.client,
        payment: {
          type: wizardState.payment.type,
          downPaymentPct: wizardState.payment.downPaymentPct || null,
          downPayment: calcDownPayment || null,
          installments: wizardState.payment.installments || null,
          installmentAmount: calcInstallmentAmount || null,
          interestRate: wizardState.payment.interestRate || null,
          totalPaid: paymentSchedule?.totalPaid || null,
          totalInterest: paymentSchedule?.totalInterest || null,
          notes: wizardState.payment.notes || null,
        },
        customization: {
          template: wizardState.customization.template,
          aiDescription: wizardState.customization.aiDescription || null,
          whatsappMessage,
          agentNotes: wizardState.customization.agentNotes || null,
          validUntil: wizardState.customization.validUntil || null,
        },
      };

      let createRes;
      if (editId) {
        createRes = await fetch(`/api/quotations/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      } else {
        createRes = await fetch('/api/quotations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      }
      if (!createRes.ok) throw new Error(editId ? 'Error al actualizar presupuesto' : 'Error al crear presupuesto');
      const { id } = await createRes.json();
      setGeneratedId(id);

      // Generate PDF
      const pdfRes = await fetch(`/api/quotations/${id}/generate-pdf`, { method: 'POST' });
      if (!pdfRes.ok) {
        const errData = await pdfRes.json().catch(() => ({}));
        throw new Error(errData.error || 'Error al generar PDF');
      }

      // Create a blob URL from the response
      const blob = await pdfRes.blob();
      const url = URL.createObjectURL(blob);
      
      // Auto-download the PDF
      const link = document.createElement('a');
      link.href = url;
      link.download = `Propuesta-${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Redirect back to quotations list
      router.push('/admin/quotations');

    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress steps */}
      <nav className="flex items-center justify-between mb-8">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center">
            <button
              onClick={() => step > s.id && setStep(s.id)}
              disabled={step < s.id}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                step === s.id ? 'bg-[var(--color-brand)] text-white' :
                step > s.id ? 'bg-[#222] text-[#bbb] hover:bg-[#333] cursor-pointer border border-[#333]' :
                'text-[#555] cursor-default border border-transparent'
              }`}
            >
              <span>{s.icon}</span>
              <span className="hidden sm:inline">{s.label}</span>
            </button>
            {i < STEPS.length - 1 && <div className={`w-6 h-px mx-1 ${step > s.id ? 'bg-[var(--color-brand)]' : 'bg-[#222]'}`} />}
          </div>
        ))}
      </nav>

      {/* Steps */}
      {step === 1 && <StepProperty selected={wizardState.properties} onChange={(p) => updateState('properties', p)} onNext={() => setStep(2)} />}
      {step === 2 && <StepClient data={wizardState.client} onChange={(c) => updateState('client', c)} onNext={() => setStep(3)} onBack={() => setStep(1)} />}
      {step === 3 && <StepPayment data={wizardState.payment} propertyPrice={totalPrice} onChange={(p) => updateState('payment', p)} onNext={() => setStep(4)} onBack={() => setStep(2)} />}
      {step === 4 && <StepCustomize data={wizardState.customization} wizardState={wizardState} onChange={(c) => updateState('customization', c)} onNext={() => setStep(5)} onBack={() => setStep(3)} />}
      {step === 5 && <StepPreview wizardState={wizardState} isGenerating={isGenerating} generatedPDFUrl={generatedPDFUrl} onGenerate={handleGenerate} onBack={() => setStep(4)} />}
    </div>
  );
}
