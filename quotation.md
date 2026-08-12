# Quotation Engine — Sistema de Presupuestos y Propuestas Comerciales

> **Módulo:** Admin Panel · SaaS Inmobiliario  
> **Stack:** Next.js 14 App Router · TypeScript · MongoDB · @react-pdf/renderer · Vercel Blob  
> **Patrón:** Wizard multi-paso · PDF server-side · Quote pipeline · Delivery multicanal

---

## 1. VISIÓN DEL PRODUCTO

El dueño de la inmobiliaria necesita enviar propuestas comerciales profesionales en minutos, no en horas. Este módulo convierte esa necesidad en una ventaja competitiva: un PDF de calidad premium, listo para enviar por email o WhatsApp, generado desde el admin panel sin necesidad de abrir Word, Canva ni ninguna otra herramienta externa.

### Flujo completo

```
Admin Panel (Wizard)
        ↓
  [1] Seleccionar propiedad(es)
  [2] Datos del cliente
  [3] Condiciones de venta / financiación
  [4] Personalización del documento
  [5] Preview + Generar
        ↓
API Route → @react-pdf/renderer
        ↓
PDF generado server-side
        ↓
Vercel Blob Storage  (URL persistente)
        ↓
MongoDB  (Quote guardada con status)
        ↓
Entrega: Descarga directa / Email / Link WhatsApp
```

### Por qué `@react-pdf/renderer` y no Puppeteer

| | @react-pdf/renderer | Puppeteer / html-to-pdf |
|---|---|---|
| Funciona en Vercel Serverless | ✅ | ❌ (requiere instancia con Chrome) |
| Tamaño del bundle | Ligero | +300MB |
| Control tipográfico | Total | Depende del render del browser |
| Fuentes custom | ✅ Fácil | Complejo |
| Tablas y layouts | ✅ Flexbox-like | ✅ |
| Velocidad | Muy rápido | Lento |

---

## 2. INNOVACIONES INCLUIDAS

| Feature | Descripción | Valor |
|---|---|---|
| 🤖 **Descripción IA** | Claude genera un párrafo de venta personalizado por propiedad + cliente | Ahorra tiempo, sube la calidad del discurso |
| 📊 **Calculadora de cuotas** | Simulador de financiación integrado en el wizard | El cliente ve su cuota antes de recibir el PDF |
| 📱 **QR en el PDF** | QR code embebido que lleva al listing online de la propiedad | Conexión entre papel y digital |
| 👁️ **Open tracking** | El PDF incluye un pixel de tracking; el admin ve cuándo fue abierto | Saber cuándo hacer follow-up |
| 💬 **1-click WhatsApp** | Botón que genera el mensaje preformateado con el link del PDF | Reducir fricción de envío |
| 🎨 **3 templates** | Luxury, Modern, Minimal — seleccionable por agencia | Identidad de marca |
| ⏳ **Quote expiry** | Fecha de vencimiento configurable en la propuesta | Urgencia comercial |
| 📋 **Multi-propiedad** | Hasta 3 propiedades en una misma propuesta comparativa | Propuesta de portafolio |
| 🔄 **Pipeline de estados** | Draft → Sent → Viewed → Accepted / Rejected | CRM ligero integrado |
| 💱 **Dual currency** | Precio en USD y ARS con tipo de cambio configurable | Mercado argentino / latinoamericano |

---

## 3. ESTRUCTURA DE CARPETAS

```
app/
└── admin/
    └── quotations/
        ├── page.tsx                    # Lista de presupuestos (pipeline view)
        ├── new/
        │   └── page.tsx                # Wizard de creación
        └── [id]/
            ├── page.tsx                # Detalle / edición
            └── preview/
                └── page.tsx            # Preview del PDF antes de generar

app/
└── api/
    └── quotations/
        ├── route.ts                    # GET lista / POST crear
        ├── [id]/
        │   ├── route.ts                # GET / PATCH / DELETE
        │   ├── generate-pdf/
        │   │   └── route.ts            # POST → genera PDF, sube a Blob
        │   ├── send-email/
        │   │   └── route.ts            # POST → envía email con PDF
        │   └── status/
        │       └── route.ts            # PATCH → actualizar estado
        └── track/
            └── [token]/
                └── route.ts            # GET → pixel de tracking (open event)

lib/
└── quotations/
    ├── pdf/
    │   ├── renderer.ts                 # Entry point: genera PDF Buffer
    │   ├── templates/
    │   │   ├── luxury.tsx              # Template Luxury
    │   │   ├── modern.tsx              # Template Modern
    │   │   └── minimal.tsx             # Template Minimal
    │   ├── components/
    │   │   ├── Cover.tsx               # Página de portada
    │   │   ├── PropertySection.tsx     # Bloque de propiedad
    │   │   ├── ClientSection.tsx       # Datos del cliente
    │   │   ├── PaymentSection.tsx      # Condiciones y cuotas
    │   │   ├── AIDescription.tsx       # Párrafo generado por IA
    │   │   ├── QRCode.tsx              # QR embebido
    │   │   ├── SignatureBlock.tsx      # Bloque de firmas
    │   │   └── Footer.tsx              # Footer con datos de agencia
    │   └── fonts.ts                    # Registro de fuentes (Inter, Playfair)
    │
    ├── ai-description.ts               # Genera texto de venta con Claude API
    ├── payment-calculator.ts           # Lógica de cuotas / financiación
    ├── qr-generator.ts                 # Genera QR como base64
    ├── storage.ts                      # Upload/download Vercel Blob
    └── tracking.ts                     # Genera y valida tracking tokens

lib/
└── db/
    └── models/
        ├── Quotation.ts                # Modelo Mongoose
        └── QuotationEvent.ts           # Timeline de eventos

components/
└── admin/
    └── quotations/
        ├── QuotationWizard.tsx         # Wizard multi-paso (Client Component)
        ├── steps/
        │   ├── StepProperty.tsx        # Paso 1: selector de propiedades
        │   ├── StepClient.tsx          # Paso 2: datos del cliente
        │   ├── StepPayment.tsx         # Paso 3: financiación / condiciones
        │   ├── StepCustomize.tsx       # Paso 4: template, notas, vencimiento
        │   └── StepPreview.tsx         # Paso 5: preview + generar
        ├── PaymentCalculator.tsx       # Calculadora de cuotas interactiva
        ├── QuotationPipeline.tsx       # Vista kanban de estados
        ├── QuotationCard.tsx           # Card en la lista
        └── DeliveryActions.tsx         # Botones: descargar / email / WhatsApp

types/
└── quotation.ts                        # Tipos completos
```

---

## 4. MODELO MONGOOSE — `Quotation`

### `lib/db/models/Quotation.ts`

```typescript
import mongoose, { Document, Model, Schema } from "mongoose";

// ─── Sub-schemas ──────────────────────────────────────────────

export interface IQuotationProperty {
  propertyId: mongoose.Types.ObjectId | null;  // Ref a la colección de propiedades
  // Snapshot de datos — no depender del original si cambia
  title: string;
  address: string;
  neighborhood: string;
  type: string;                  // "Casa" | "Departamento" | "Terreno" | "Local"
  operation: "venta" | "alquiler" | "alquiler_temporal";
  priceUSD: number;
  priceARS: number | null;
  surface: number | null;        // m²
  bedrooms: number | null;
  bathrooms: number | null;
  parkingSpots: number | null;
  amenities: string[];
  photos: string[];              // URLs (máximo 4 en el PDF)
  listingUrl: string | null;     // Para el QR
}

export interface IQuotationClient {
  name: string;
  email: string | null;
  phone: string | null;
  dni: string | null;
  notes: string | null;          // Notas internas sobre el cliente
}

export interface IPaymentCondition {
  type: "contado" | "financiado" | "permuta" | "credito_hipotecario";
  downPaymentPct: number | null;          // % de seña / anticipo
  downPaymentUSD: number | null;
  installments: number | null;            // Cantidad de cuotas
  installmentAmountUSD: number | null;    // Valor de cada cuota
  interestRate: number | null;            // % anual
  notes: string | null;
}

export interface IQuotationCustomization {
  template: "luxury" | "modern" | "minimal";
  primaryColor: string;                   // Hex, default de la agencia
  showAIDescription: boolean;
  aiDescription: string | null;           // Guardado para no regenerar
  agentNotes: string | null;              // Nota personalizada del agente
  validUntil: Date | null;                // Vencimiento de la propuesta
  showComparables: boolean;               // Mostrar propiedades similares
  language: "es" | "en" | "pt";
}

export interface IQuotationDelivery {
  pdfUrl: string | null;                  // Vercel Blob URL
  pdfGeneratedAt: Date | null;
  trackingToken: string | null;           // UUID para open tracking
  emailSentAt: Date | null;
  emailSentTo: string | null;
  openedAt: Date | null;                  // Primer open tracking hit
  openCount: number;
}

// ─── Main document ────────────────────────────────────────────

export interface IQuotation extends Document {
  agencyId: mongoose.Types.ObjectId;
  quoteNumber: string;                    // "INM-2024-0042" — autoincrement
  status: "draft" | "sent" | "viewed" | "accepted" | "rejected" | "expired";
  
  properties: IQuotationProperty[];       // 1 a 3 propiedades
  client: IQuotationClient;
  payment: IPaymentCondition;
  customization: IQuotationCustomization;
  delivery: IQuotationDelivery;

  exchangeRateARS: number | null;         // Tipo de cambio al momento de crear
  totalValueUSD: number;                  // Suma si multi-propiedad
  
  createdBy: string;                      // userId del agente
  createdAt: Date;
  updatedAt: Date;
}

// ─── Schema ───────────────────────────────────────────────────

const PropertySchema = new Schema<IQuotationProperty>({
  propertyId: { type: Schema.Types.ObjectId, ref: "Property", default: null },
  title: { type: String, required: true },
  address: { type: String, required: true },
  neighborhood: { type: String, default: "" },
  type: { type: String, required: true },
  operation: { type: String, enum: ["venta", "alquiler", "alquiler_temporal"], required: true },
  priceUSD: { type: Number, required: true },
  priceARS: { type: Number, default: null },
  surface: { type: Number, default: null },
  bedrooms: { type: Number, default: null },
  bathrooms: { type: Number, default: null },
  parkingSpots: { type: Number, default: null },
  amenities: [{ type: String }],
  photos: [{ type: String }],
  listingUrl: { type: String, default: null },
}, { _id: false });

const PaymentSchema = new Schema<IPaymentCondition>({
  type: { type: String, enum: ["contado", "financiado", "permuta", "credito_hipotecario"], required: true },
  downPaymentPct: { type: Number, default: null },
  downPaymentUSD: { type: Number, default: null },
  installments: { type: Number, default: null },
  installmentAmountUSD: { type: Number, default: null },
  interestRate: { type: Number, default: null },
  notes: { type: String, default: null },
}, { _id: false });

const CustomizationSchema = new Schema<IQuotationCustomization>({
  template: { type: String, enum: ["luxury", "modern", "minimal"], default: "modern" },
  primaryColor: { type: String, default: "#1a1a2e" },
  showAIDescription: { type: Boolean, default: true },
  aiDescription: { type: String, default: null },
  agentNotes: { type: String, default: null },
  validUntil: { type: Date, default: null },
  showComparables: { type: Boolean, default: false },
  language: { type: String, enum: ["es", "en", "pt"], default: "es" },
}, { _id: false });

const DeliverySchema = new Schema<IQuotationDelivery>({
  pdfUrl: { type: String, default: null },
  pdfGeneratedAt: { type: Date, default: null },
  trackingToken: { type: String, default: null },
  emailSentAt: { type: Date, default: null },
  emailSentTo: { type: String, default: null },
  openedAt: { type: Date, default: null },
  openCount: { type: Number, default: 0 },
}, { _id: false });

const QuotationSchema = new Schema<IQuotation>(
  {
    agencyId: { type: Schema.Types.ObjectId, ref: "Agency", required: true, index: true },
    quoteNumber: { type: String, required: true },
    status: {
      type: String,
      enum: ["draft", "sent", "viewed", "accepted", "rejected", "expired"],
      default: "draft",
      index: true,
    },
    properties: { type: [PropertySchema], required: true, validate: [(v: unknown[]) => v.length >= 1 && v.length <= 3, "Entre 1 y 3 propiedades"] },
    client: {
      name: { type: String, required: true },
      email: { type: String, default: null },
      phone: { type: String, default: null },
      dni: { type: String, default: null },
      notes: { type: String, default: null },
    },
    payment: { type: PaymentSchema, required: true },
    customization: { type: CustomizationSchema, default: () => ({}) },
    delivery: { type: DeliverySchema, default: () => ({}) },
    exchangeRateARS: { type: Number, default: null },
    totalValueUSD: { type: Number, required: true },
    createdBy: { type: String, required: true },
  },
  { timestamps: true, collection: "quotations" }
);

// Índices
QuotationSchema.index({ agencyId: 1, status: 1, createdAt: -1 });
QuotationSchema.index({ agencyId: 1, quoteNumber: 1 }, { unique: true });
QuotationSchema.index({ "delivery.trackingToken": 1 }, { sparse: true });
QuotationSchema.index({ "client.email": 1 });

export const Quotation: Model<IQuotation> =
  mongoose.models.Quotation ?? mongoose.model<IQuotation>("Quotation", QuotationSchema);
```

### `lib/db/models/QuotationEvent.ts`

```typescript
// Timeline de eventos — audit log y CRM básico
import mongoose, { Document, Model, Schema } from "mongoose";

export interface IQuotationEvent extends Document {
  quotationId: mongoose.Types.ObjectId;
  agencyId: mongoose.Types.ObjectId;
  type:
    | "created"
    | "pdf_generated"
    | "email_sent"
    | "whatsapp_shared"
    | "opened"          // tracking hit
    | "status_changed"
    | "edited";
  meta: Record<string, unknown>;
  createdAt: Date;
}

const QuotationEventSchema = new Schema<IQuotationEvent>(
  {
    quotationId: { type: Schema.Types.ObjectId, ref: "Quotation", required: true, index: true },
    agencyId: { type: Schema.Types.ObjectId, ref: "Agency", required: true },
    type: { type: String, required: true },
    meta: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: { createdAt: true, updatedAt: false }, collection: "quotation_events" }
);

export const QuotationEvent: Model<IQuotationEvent> =
  mongoose.models.QuotationEvent ??
  mongoose.model<IQuotationEvent>("QuotationEvent", QuotationEventSchema);
```

---

## 5. CALCULADORA DE PAGOS

### `lib/quotations/payment-calculator.ts`

```typescript
export interface PaymentSchedule {
  downPaymentUSD: number;
  downPaymentPct: number;
  installmentAmount: number;
  totalInterest: number;
  totalAmountUSD: number;
  installments: number;
  effectiveAnnualRate: number;
  schedule: Array<{
    month: number;
    principal: number;
    interest: number;
    balance: number;
  }>;
}

/**
 * Sistema Francés (cuota constante) — el más usado en inmobiliaria Argentina
 */
export function calculateFrenchSystem(
  principalUSD: number,
  annualRatePct: number,
  installments: number,
  downPaymentPct: number = 30
): PaymentSchedule {
  const downPaymentUSD = principalUSD * (downPaymentPct / 100);
  const financedAmount = principalUSD - downPaymentUSD;
  const monthlyRate = annualRatePct / 100 / 12;

  // Cuota fija (sistema francés)
  const installmentAmount =
    monthlyRate === 0
      ? financedAmount / installments
      : (financedAmount * monthlyRate * Math.pow(1 + monthlyRate, installments)) /
        (Math.pow(1 + monthlyRate, installments) - 1);

  const schedule = [];
  let balance = financedAmount;

  for (let i = 1; i <= installments; i++) {
    const interest = balance * monthlyRate;
    const principal = installmentAmount - interest;
    balance -= principal;

    schedule.push({
      month: i,
      principal: Math.round(principal * 100) / 100,
      interest: Math.round(interest * 100) / 100,
      balance: Math.max(0, Math.round(balance * 100) / 100),
    });
  }

  const totalPaid = installmentAmount * installments + downPaymentUSD;
  const totalInterest = totalPaid - principalUSD;

  return {
    downPaymentUSD: Math.round(downPaymentUSD),
    downPaymentPct,
    installmentAmount: Math.round(installmentAmount),
    totalInterest: Math.round(totalInterest),
    totalAmountUSD: Math.round(totalPaid),
    installments,
    effectiveAnnualRate: annualRatePct,
    schedule,
  };
}

/**
 * Resumen legible para el PDF
 */
export function formatPaymentSummary(schedule: PaymentSchedule, currency = "USD"): string {
  const fmt = (n: number) =>
    new Intl.NumberFormat("es-AR", { style: "currency", currency }).format(n);

  return [
    `Anticipo: ${fmt(schedule.downPaymentUSD)} (${schedule.downPaymentPct}%)`,
    `${schedule.installments} cuotas de ${fmt(schedule.installmentAmount)}`,
    `Total financiado: ${fmt(schedule.totalAmountUSD)}`,
    `Intereses totales: ${fmt(schedule.totalInterest)}`,
  ].join(" · ");
}
```

---

## 6. DESCRIPCIÓN CON IA

### `lib/quotations/ai-description.ts`

```typescript
interface AIDescriptionInput {
  propertyTitle: string;
  address: string;
  type: string;
  surface: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  amenities: string[];
  priceUSD: number;
  clientName: string;
  operation: string;
  agentNotes: string | null;
  language: "es" | "en" | "pt";
}

const PROMPTS: Record<string, string> = {
  es: `Eres un agente inmobiliario de lujo experto en redacción persuasiva.
Escribe UN párrafo de 3-4 oraciones presentando esta propiedad a un cliente potencial.
Tono: profesional, cálido, aspiracional. Sin exageraciones. Sin bullet points.
Personaliza mencionando el nombre del cliente.
Datos de la propiedad: {data}`,
  en: `You are a luxury real estate agent expert in persuasive writing.
Write ONE paragraph of 3-4 sentences presenting this property to a potential client.
Tone: professional, warm, aspirational. No exaggerations. No bullet points.
Personalize by mentioning the client's name.
Property data: {data}`,
  pt: `Você é um agente imobiliário de luxo especialista em redação persuasiva.
Escreva UM parágrafo de 3-4 frases apresentando este imóvel a um cliente potencial.
Tom: profissional, caloroso, aspiracional. Sem exageros. Sem bullet points.
Personalize mencionando o nome do cliente.
Dados do imóvel: {data}`,
};

export async function generateAIDescription(
  input: AIDescriptionInput
): Promise<string> {
  const dataString = JSON.stringify({
    propiedad: input.propertyTitle,
    ubicacion: input.address,
    tipo: input.type,
    superficie: input.surface ? `${input.surface}m²` : null,
    dormitorios: input.bedrooms,
    banos: input.bathrooms,
    amenities: input.amenities,
    precio: `USD ${input.priceUSD.toLocaleString()}`,
    operacion: input.operation,
    cliente: input.clientName,
    notas_agente: input.agentNotes,
  });

  const prompt = PROMPTS[input.language].replace("{data}", dataString);

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",  // Rápido y económico para esta tarea
      max_tokens: 300,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    throw new Error(`Claude API error: ${response.status}`);
  }

  const data = await response.json();
  return data.content?.[0]?.text?.trim() ?? "";
}
```

---

## 7. GENERADOR DE QR

### `lib/quotations/qr-generator.ts`

```typescript
import QRCode from "qrcode";

/**
 * Genera un QR code como string base64 para embeber en el PDF.
 * El QR apunta al listing online de la propiedad.
 */
export async function generateQRBase64(url: string): Promise<string> {
  try {
    const dataUrl = await QRCode.toDataURL(url, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 120,
      color: {
        dark: "#1a1a1a",
        light: "#ffffff",
      },
    });
    // Retornar solo el base64, sin el prefijo "data:image/png;base64,"
    return dataUrl.split(",")[1];
  } catch {
    return ""; // Si falla, el PDF simplemente no incluye el QR
  }
}
```

---

## 8. OPEN TRACKING

### `lib/quotations/tracking.ts`

```typescript
import { randomUUID } from "crypto";

export function generateTrackingToken(): string {
  return randomUUID().replace(/-/g, "");
}

/**
 * URL del pixel de tracking embebida en el email HTML.
 * El PDF en sí no puede trackear opens, pero el email que lo acompaña sí.
 */
export function getTrackingPixelUrl(token: string, baseUrl: string): string {
  return `${baseUrl}/api/quotations/track/${token}`;
}

/**
 * URL de descarga del PDF con tracking implícito.
 * Cuando el cliente hace click en "Ver propuesta" en el email,
 * esta URL registra el open antes de servir el redirect al Blob URL.
 */
export function getTrackedPDFUrl(token: string, baseUrl: string): string {
  return `${baseUrl}/api/quotations/track/${token}?type=download`;
}
```

### `app/api/quotations/track/[token]/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { Quotation } from "@/lib/db/models/Quotation";
import { QuotationEvent } from "@/lib/db/models/QuotationEvent";

// Pixel transparente de 1x1 para tracking de emails
const TRANSPARENT_PIXEL = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
  "base64"
);

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
): Promise<NextResponse> {
  const { token } = params;
  const type = new URL(request.url).searchParams.get("type");

  try {
    await connectDB();

    const quotation = await Quotation.findOne({
      "delivery.trackingToken": token,
    });

    if (quotation) {
      const now = new Date();

      // Actualizar estado y conteo
      const updates: Record<string, unknown> = {
        $inc: { "delivery.openCount": 1 },
      };

      if (!quotation.delivery.openedAt) {
        updates.$set = {
          "delivery.openedAt": now,
          status: quotation.status === "sent" ? "viewed" : quotation.status,
        };
      }

      await Quotation.findByIdAndUpdate(quotation._id, updates);

      await QuotationEvent.create({
        quotationId: quotation._id,
        agencyId: quotation.agencyId,
        type: "opened",
        meta: {
          ip: request.ip ?? "unknown",
          userAgent: request.headers.get("user-agent"),
          trackingType: type ?? "pixel",
        },
      });

      // Si es click en el PDF, redirigir al Blob URL
      if (type === "download" && quotation.delivery.pdfUrl) {
        return NextResponse.redirect(quotation.delivery.pdfUrl);
      }
    }
  } catch {
    // Silenciar errores de tracking — no interrumpir al cliente
  }

  // Retornar pixel 1x1 transparente
  return new NextResponse(TRANSPARENT_PIXEL, {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
}
```

---

## 9. STORAGE — VERCEL BLOB

### `lib/quotations/storage.ts`

```typescript
import { put, del } from "@vercel/blob";

export interface UploadedPDF {
  url: string;
  pathname: string;
  size: number;
}

/**
 * Sube el PDF generado a Vercel Blob con acceso público.
 * La URL es permanente y se guarda en MongoDB.
 */
export async function uploadQuotationPDF(
  pdfBuffer: Buffer,
  filename: string
): Promise<UploadedPDF> {
  const { url, pathname, size } = await put(
    `quotations/${filename}`,
    pdfBuffer,
    {
      access: "public",
      contentType: "application/pdf",
      addRandomSuffix: false, // El nombre incluye el quoteNumber, ya es único
    }
  );

  return { url, pathname, size };
}

export async function deleteQuotationPDF(url: string): Promise<void> {
  await del(url);
}
```

---

## 10. PDF RENDERER — ENTRY POINT

### `lib/quotations/pdf/renderer.ts`

```typescript
import { renderToBuffer } from "@react-pdf/renderer";
import type { IQuotation } from "@/lib/db/models/Quotation";
import { LuxuryTemplate } from "./templates/luxury";
import { ModernTemplate } from "./templates/modern";
import { MinimalTemplate } from "./templates/minimal";
import type { AgencyBranding } from "./types";

const TEMPLATES = {
  luxury: LuxuryTemplate,
  modern: ModernTemplate,
  minimal: MinimalTemplate,
} as const;

export async function renderQuotationPDF(
  quotation: IQuotation,
  branding: AgencyBranding
): Promise<Buffer> {
  const Template = TEMPLATES[quotation.customization.template];

  const pdfBuffer = await renderToBuffer(
    <Template quotation={quotation} branding={branding} />
  );

  return Buffer.from(pdfBuffer);
}
```

### `lib/quotations/pdf/types.ts`

```typescript
export interface AgencyBranding {
  name: string;
  logoBase64: string | null;     // Logo como base64 para embeber en PDF
  primaryColor: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  licenseNumber: string | null;  // Matrícula / número de habilitación
}
```

---

## 11. PDF TEMPLATE — EJEMPLO `modern.tsx`

```tsx
// lib/quotations/pdf/templates/modern.tsx
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import type { IQuotation } from "@/lib/db/models/Quotation";
import type { AgencyBranding } from "../types";

// Registrar fuentes — se cargan desde URLs públicas o archivos locales
Font.register({
  family: "Inter",
  fonts: [
    { src: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff", fontWeight: 400 },
    { src: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fAZ9hiJ-Ek-_EeA.woff", fontWeight: 600 },
    { src: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hiJ-Ek-_EeA.woff", fontWeight: 700 },
  ],
});

interface TemplateProps {
  quotation: IQuotation;
  branding: AgencyBranding;
}

export function ModernTemplate({ quotation, branding }: TemplateProps) {
  const primary = quotation.customization.primaryColor || branding.primaryColor;
  const property = quotation.properties[0];
  const isMulti = quotation.properties.length > 1;

  const styles = StyleSheet.create({
    page: { fontFamily: "Inter", backgroundColor: "#ffffff", padding: 0 },
    
    // Header con color de marca
    header: {
      backgroundColor: primary,
      padding: "32 40",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    logo: { width: 120, height: 48, objectFit: "contain" },
    headerRight: { alignItems: "flex-end" },
    agencyName: { color: "#ffffff", fontSize: 16, fontWeight: 700 },
    quoteNumber: { color: "rgba(255,255,255,0.7)", fontSize: 9, marginTop: 2 },

    // Sección de título
    titleSection: { padding: "28 40 0", borderBottom: "1 solid #f0f0f0" },
    proposalLabel: { fontSize: 10, color: "#999", textTransform: "uppercase", letterSpacing: 2 },
    proposalTitle: { fontSize: 22, fontWeight: 700, color: "#111", marginTop: 4 },
    clientName: { fontSize: 13, color: primary, marginTop: 6, marginBottom: 20 },

    // Body
    body: { padding: "20 40" },
    
    // Propiedad
    propertyCard: {
      borderRadius: 8,
      border: "1 solid #e8e8e8",
      overflow: "hidden",
      marginBottom: 16,
    },
    propertyImage: { width: "100%", height: 180, objectFit: "cover" },
    propertyInfo: { padding: "14 16" },
    propertyTitle: { fontSize: 13, fontWeight: 700, color: "#111" },
    propertyAddress: { fontSize: 10, color: "#666", marginTop: 2 },
    propertyPrice: { fontSize: 18, fontWeight: 700, color: primary, marginTop: 8 },
    
    // Stats row
    statsRow: { flexDirection: "row", gap: 16, marginTop: 10 },
    stat: { flexDirection: "row", alignItems: "center", gap: 4 },
    statValue: { fontSize: 11, fontWeight: 600, color: "#333" },
    statLabel: { fontSize: 9, color: "#999" },

    // Descripción IA
    aiSection: {
      backgroundColor: "#fafafa",
      borderLeft: `3 solid ${primary}`,
      padding: "12 16",
      marginBottom: 16,
      borderRadius: "0 6 6 0",
    },
    aiText: { fontSize: 10, color: "#444", lineHeight: 1.6, fontStyle: "italic" },

    // Condiciones de pago
    paymentSection: { marginBottom: 16 },
    sectionTitle: { fontSize: 11, fontWeight: 700, color: "#111", marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 },
    paymentRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6, borderBottom: "1 solid #f5f5f5" },
    paymentLabel: { fontSize: 10, color: "#666" },
    paymentValue: { fontSize: 10, fontWeight: 600, color: "#111" },
    paymentHighlight: { backgroundColor: primary, borderRadius: 4, padding: "8 12", marginTop: 8 },
    paymentHighlightText: { fontSize: 12, fontWeight: 700, color: "#ffffff", textAlign: "center" },

    // QR + validez
    bottomRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginTop: 12 },
    validityBox: {
      border: "1 solid #e8e8e8",
      borderRadius: 6,
      padding: "8 12",
      flex: 1,
      marginRight: 16,
    },
    validityLabel: { fontSize: 8, color: "#999", textTransform: "uppercase", letterSpacing: 1 },
    validityDate: { fontSize: 12, fontWeight: 700, color: "#111", marginTop: 2 },
    qrContainer: { alignItems: "center" },
    qrImage: { width: 64, height: 64 },
    qrLabel: { fontSize: 7, color: "#999", marginTop: 4, textAlign: "center" },

    // Footer
    footer: {
      borderTop: "1 solid #eeeeee",
      padding: "12 40",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    footerText: { fontSize: 8, color: "#aaa" },

    // Firma
    signatureSection: { flexDirection: "row", gap: 40, marginTop: 24, paddingTop: 16 },
    signatureBox: { flex: 1, alignItems: "center" },
    signatureLine: { width: "100%", borderTop: "1 solid #333", marginBottom: 6 },
    signatureLabel: { fontSize: 8, color: "#666" },
  });

  const validUntilFormatted = quotation.customization.validUntil
    ? new Date(quotation.customization.validUntil).toLocaleDateString("es-AR", {
        day: "2-digit", month: "long", year: "numeric",
      })
    : null;

  return (
    <Document
      title={`Propuesta ${quotation.quoteNumber} — ${quotation.client.name}`}
      author={branding.name}
      subject="Propuesta Comercial Inmobiliaria"
      creator="Google Stars Admin"
    >
      <Page size="A4" style={styles.page}>
        
        {/* ── HEADER ── */}
        <View style={styles.header}>
          {branding.logoBase64 ? (
            <Image style={styles.logo} src={`data:image/png;base64,${branding.logoBase64}`} />
          ) : (
            <Text style={styles.agencyName}>{branding.name}</Text>
          )}
          <View style={styles.headerRight}>
            <Text style={styles.agencyName}>{branding.name}</Text>
            <Text style={styles.quoteNumber}>N° {quotation.quoteNumber}</Text>
          </View>
        </View>

        {/* ── TÍTULO ── */}
        <View style={styles.titleSection}>
          <Text style={styles.proposalLabel}>Propuesta Comercial</Text>
          <Text style={styles.proposalTitle}>
            {isMulti ? "Selección de Propiedades" : property.title}
          </Text>
          <Text style={styles.clientName}>Para: {quotation.client.name}</Text>
        </View>

        {/* ── BODY ── */}
        <View style={styles.body}>

          {/* Descripción IA */}
          {quotation.customization.showAIDescription && quotation.customization.aiDescription && (
            <View style={styles.aiSection}>
              <Text style={styles.aiText}>{quotation.customization.aiDescription}</Text>
            </View>
          )}

          {/* Propiedad(es) */}
          {quotation.properties.map((prop, idx) => (
            <View key={idx} style={styles.propertyCard}>
              {prop.photos[0] && (
                <Image style={styles.propertyImage} src={prop.photos[0]} />
              )}
              <View style={styles.propertyInfo}>
                <Text style={styles.propertyTitle}>{prop.title}</Text>
                <Text style={styles.propertyAddress}>{prop.address} · {prop.neighborhood}</Text>
                <Text style={styles.propertyPrice}>
                  USD {prop.priceUSD.toLocaleString("es-AR")}
                  {prop.priceARS ? `  ·  ARS ${prop.priceARS.toLocaleString("es-AR")}` : ""}
                </Text>
                <View style={styles.statsRow}>
                  {prop.surface && (
                    <View style={styles.stat}>
                      <Text style={styles.statValue}>{prop.surface} m²</Text>
                      <Text style={styles.statLabel}> sup.</Text>
                    </View>
                  )}
                  {prop.bedrooms && (
                    <View style={styles.stat}>
                      <Text style={styles.statValue}>{prop.bedrooms}</Text>
                      <Text style={styles.statLabel}> dorm.</Text>
                    </View>
                  )}
                  {prop.bathrooms && (
                    <View style={styles.stat}>
                      <Text style={styles.statValue}>{prop.bathrooms}</Text>
                      <Text style={styles.statLabel}> baños</Text>
                    </View>
                  )}
                  {prop.parkingSpots && (
                    <View style={styles.stat}>
                      <Text style={styles.statValue}>{prop.parkingSpots}</Text>
                      <Text style={styles.statLabel}> coch.</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          ))}

          {/* Condiciones de Pago */}
          <View style={styles.paymentSection}>
            <Text style={styles.sectionTitle}>Condiciones de la Oferta</Text>
            {quotation.payment.downPaymentUSD && (
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Anticipo / Seña</Text>
                <Text style={styles.paymentValue}>
                  USD {quotation.payment.downPaymentUSD.toLocaleString()}
                  {quotation.payment.downPaymentPct ? ` (${quotation.payment.downPaymentPct}%)` : ""}
                </Text>
              </View>
            )}
            {quotation.payment.installments && quotation.payment.installmentAmountUSD && (
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Cuotas</Text>
                <Text style={styles.paymentValue}>
                  {quotation.payment.installments} cuotas de USD {quotation.payment.installmentAmountUSD.toLocaleString()}
                </Text>
              </View>
            )}
            {quotation.payment.notes && (
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Condiciones adicionales</Text>
                <Text style={styles.paymentValue}>{quotation.payment.notes}</Text>
              </View>
            )}
            <View style={styles.paymentHighlight}>
              <Text style={styles.paymentHighlightText}>
                Precio total: USD {quotation.totalValueUSD.toLocaleString("es-AR")}
              </Text>
            </View>
          </View>

          {/* Nota del agente */}
          {quotation.customization.agentNotes && (
            <View style={{ marginBottom: 16 }}>
              <Text style={styles.sectionTitle}>Observaciones</Text>
              <Text style={{ fontSize: 10, color: "#555", lineHeight: 1.5 }}>
                {quotation.customization.agentNotes}
              </Text>
            </View>
          )}

          {/* QR + Validez */}
          <View style={styles.bottomRow}>
            {validUntilFormatted && (
              <View style={styles.validityBox}>
                <Text style={styles.validityLabel}>Oferta válida hasta</Text>
                <Text style={styles.validityDate}>{validUntilFormatted}</Text>
              </View>
            )}
          </View>

          {/* Bloque de firmas */}
          <View style={styles.signatureSection}>
            <View style={styles.signatureBox}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureLabel}>{branding.name}</Text>
              <Text style={{ ...styles.signatureLabel, marginTop: 2 }}>Agente Inmobiliario</Text>
            </View>
            <View style={styles.signatureBox}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureLabel}>{quotation.client.name}</Text>
              <Text style={{ ...styles.signatureLabel, marginTop: 2 }}>Comprador</Text>
            </View>
          </View>
        </View>

        {/* ── FOOTER ── */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            {branding.address ?? ""} {branding.phone ? `· ${branding.phone}` : ""} {branding.email ? `· ${branding.email}` : ""}
          </Text>
          <Text style={styles.footerText}>
            {branding.licenseNumber ? `Matrícula: ${branding.licenseNumber} · ` : ""}
            Generado con Google Stars
          </Text>
        </View>

      </Page>
    </Document>
  );
}
```

---

## 12. API ROUTE — GENERACIÓN DE PDF

### `app/api/quotations/[id]/generate-pdf/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { Quotation } from "@/lib/db/models/Quotation";
import { Agency } from "@/lib/db/models/Agency";
import { QuotationEvent } from "@/lib/db/models/QuotationEvent";
import { renderQuotationPDF } from "@/lib/quotations/pdf/renderer";
import { uploadQuotationPDF } from "@/lib/quotations/storage";
import { generateQRBase64 } from "@/lib/quotations/qr-generator";
import { generateTrackingToken } from "@/lib/quotations/tracking";
import type { AgencyBranding } from "@/lib/quotations/pdf/types";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  // TODO: Reemplazar con auth real (NextAuth / Clerk)
  const adminSecret = request.headers.get("x-admin-secret");
  if (adminSecret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const quotation = await Quotation.findById(params.id);
    if (!quotation) {
      return NextResponse.json({ error: "Presupuesto no encontrado" }, { status: 404 });
    }

    const agency = await Agency.findById(quotation.agencyId).lean();
    if (!agency) {
      return NextResponse.json({ error: "Agencia no encontrada" }, { status: 404 });
    }

    // Construir branding desde la agencia
    const branding: AgencyBranding = {
      name: agency.metadata.displayName ?? agency.name,
      logoBase64: null, // TODO: cargar desde Vercel Blob si existe
      primaryColor: quotation.customization.primaryColor,
      address: agency.metadata.address,
      phone: agency.metadata.phone,
      email: null,
      website: agency.metadata.website,
      licenseNumber: null,
    };

    // Generar QR si hay listingUrl
    const firstProperty = quotation.properties[0];
    if (firstProperty?.listingUrl) {
      // Embeber QR en el objeto antes de renderizar
      // (El template lo leerá desde customization o de props extra)
    }

    // Generar tracking token único
    const trackingToken = generateTrackingToken();

    // Renderizar PDF
    const pdfBuffer = await renderQuotationPDF(quotation, branding);

    // Subir a Vercel Blob
    const filename = `${agency.slug}-${quotation.quoteNumber}-${Date.now()}.pdf`;
    const { url } = await uploadQuotationPDF(pdfBuffer, filename);

    // Actualizar quotation con URL y token
    await Quotation.findByIdAndUpdate(quotation._id, {
      $set: {
        "delivery.pdfUrl": url,
        "delivery.pdfGeneratedAt": new Date(),
        "delivery.trackingToken": trackingToken,
        status: quotation.status === "draft" ? "draft" : quotation.status,
      },
    });

    // Registrar evento
    await QuotationEvent.create({
      quotationId: quotation._id,
      agencyId: quotation.agencyId,
      type: "pdf_generated",
      meta: { filename, url },
    });

    return NextResponse.json({
      success: true,
      pdfUrl: url,
      trackingToken,
    });

  } catch (error) {
    console.error("[generate-pdf] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al generar PDF" },
      { status: 500 }
    );
  }
}
```

---

## 13. WIZARD DE CREACIÓN — COMPONENTE

### `components/admin/quotations/QuotationWizard.tsx` (estructura)

```typescript
"use client";

import { useState } from "react";
import { StepProperty } from "./steps/StepProperty";
import { StepClient } from "./steps/StepClient";
import { StepPayment } from "./steps/StepPayment";
import { StepCustomize } from "./steps/StepCustomize";
import { StepPreview } from "./steps/StepPreview";

const STEPS = [
  { id: 1, label: "Propiedad",    icon: "🏠" },
  { id: 2, label: "Cliente",      icon: "👤" },
  { id: 3, label: "Condiciones",  icon: "💳" },
  { id: 4, label: "Diseño",       icon: "🎨" },
  { id: 5, label: "Generar",      icon: "📄" },
] as const;

export interface WizardState {
  properties: SelectedProperty[];
  client: ClientData;
  payment: PaymentData;
  customization: CustomizationData;
}

export function QuotationWizard() {
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPDFUrl, setGeneratedPDFUrl] = useState<string | null>(null);

  const [wizardState, setWizardState] = useState<WizardState>({
    properties: [],
    client: { name: "", email: null, phone: null, dni: null, notes: null },
    payment: { type: "contado", downPaymentPct: 30, installments: null, interestRate: null, notes: null },
    customization: { template: "modern", showAIDescription: true, validUntil: null, language: "es" },
  });

  const updateState = <K extends keyof WizardState>(key: K, value: WizardState[K]) => {
    setWizardState((prev) => ({ ...prev, [key]: value }));
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      // 1. Crear quotation en MongoDB
      const createRes = await fetch("/api/quotations", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-secret": process.env.NEXT_PUBLIC_ADMIN_SECRET! },
        body: JSON.stringify(wizardState),
      });
      const { id } = await createRes.json();

      // 2. Generar PDF
      const pdfRes = await fetch(`/api/quotations/${id}/generate-pdf`, {
        method: "POST",
        headers: { "x-admin-secret": process.env.NEXT_PUBLIC_ADMIN_SECRET! },
      });
      const { pdfUrl } = await pdfRes.json();

      setGeneratedPDFUrl(pdfUrl);
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
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all
                ${step === s.id ? "bg-zinc-900 text-white" : step > s.id ? "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 cursor-pointer" : "text-zinc-300 cursor-default"}`}
            >
              <span>{s.icon}</span>
              <span className="hidden sm:inline">{s.label}</span>
            </button>
            {i < STEPS.length - 1 && (
              <div className={`w-8 h-px mx-1 ${step > s.id ? "bg-zinc-400" : "bg-zinc-100"}`} />
            )}
          </div>
        ))}
      </nav>

      {/* Steps */}
      {step === 1 && (
        <StepProperty
          selected={wizardState.properties}
          onChange={(p) => updateState("properties", p)}
          onNext={() => setStep(2)}
        />
      )}
      {step === 2 && (
        <StepClient
          data={wizardState.client}
          onChange={(c) => updateState("client", c)}
          onNext={() => setStep(3)}
          onBack={() => setStep(1)}
        />
      )}
      {step === 3 && (
        <StepPayment
          data={wizardState.payment}
          propertyPriceUSD={wizardState.properties[0]?.priceUSD ?? 0}
          onChange={(p) => updateState("payment", p)}
          onNext={() => setStep(4)}
          onBack={() => setStep(2)}
        />
      )}
      {step === 4 && (
        <StepCustomize
          data={wizardState.customization}
          onChange={(c) => updateState("customization", c)}
          onNext={() => setStep(5)}
          onBack={() => setStep(3)}
        />
      )}
      {step === 5 && (
        <StepPreview
          wizardState={wizardState}
          isGenerating={isGenerating}
          generatedPDFUrl={generatedPDFUrl}
          onGenerate={handleGenerate}
          onBack={() => setStep(4)}
        />
      )}
    </div>
  );
}
```

---

## 14. DELIVERY — ACCIONES POST-GENERACIÓN

### `components/admin/quotations/DeliveryActions.tsx`

```tsx
"use client";

interface DeliveryActionsProps {
  pdfUrl: string;
  clientName: string;
  clientPhone: string | null;
  clientEmail: string | null;
  quoteNumber: string;
  agencyName: string;
  quotationId: string;
}

export function DeliveryActions({
  pdfUrl, clientName, clientPhone, quoteNumber, agencyName, quotationId,
}: DeliveryActionsProps) {

  const whatsappMessage = encodeURIComponent(
    `Hola ${clientName}! 👋\n\nTe enviamos la propuesta comercial *N° ${quoteNumber}* de *${agencyName}*.\n\nPodés ver y descargar el PDF aquí:\n${pdfUrl}\n\nQuedamos a tu disposición para cualquier consulta. 🏡`
  );

  const whatsappUrl = clientPhone
    ? `https://wa.me/${clientPhone.replace(/\D/g, "")}?text=${whatsappMessage}`
    : `https://wa.me/?text=${whatsappMessage}`;

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(pdfUrl);
    // TODO: toast de confirmación
  };

  const handleSendEmail = async () => {
    await fetch(`/api/quotations/${quotationId}/send-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pdfUrl }),
    });
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Descarga directa */}
      <a
        href={pdfUrl}
        download={`propuesta-${quoteNumber}.pdf`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 bg-zinc-900 text-white rounded-xl px-5 py-3 text-sm font-semibold hover:bg-zinc-800 transition-colors"
      >
        ⬇️ Descargar PDF
      </a>

      {/* WhatsApp */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 bg-[#25D366] text-white rounded-xl px-5 py-3 text-sm font-semibold hover:bg-[#22c55e] transition-colors"
      >
        💬 Enviar por WhatsApp
      </a>

      {/* Copiar link */}
      <button
        onClick={handleCopyLink}
        className="flex items-center justify-center gap-2 bg-zinc-100 text-zinc-700 rounded-xl px-5 py-3 text-sm font-semibold hover:bg-zinc-200 transition-colors"
      >
        🔗 Copiar link del PDF
      </button>

      {/* Email */}
      <button
        onClick={handleSendEmail}
        className="flex items-center justify-center gap-2 border border-zinc-200 text-zinc-600 rounded-xl px-5 py-3 text-sm font-semibold hover:border-zinc-300 transition-colors"
      >
        ✉️ Enviar por email
      </button>
    </div>
  );
}
```

---

## 15. PIPELINE VIEW — LISTA DE PRESUPUESTOS

### `components/admin/quotations/QuotationPipeline.tsx`

```tsx
// Vista tipo Kanban por estado — RSC para el shell, Client Component para drag futuro

const STATUS_COLUMNS = [
  { id: "draft",    label: "Borrador",   color: "bg-zinc-100  text-zinc-600",   dot: "bg-zinc-400"   },
  { id: "sent",     label: "Enviado",    color: "bg-blue-50   text-blue-700",    dot: "bg-blue-500"   },
  { id: "viewed",   label: "Visto",      color: "bg-amber-50  text-amber-700",   dot: "bg-amber-500"  },
  { id: "accepted", label: "Aceptado",   color: "bg-green-50  text-green-700",   dot: "bg-green-500"  },
  { id: "rejected", label: "Rechazado",  color: "bg-red-50    text-red-700",     dot: "bg-red-500"    },
  { id: "expired",  label: "Vencido",    color: "bg-zinc-50   text-zinc-500",    dot: "bg-zinc-300"   },
] as const;
```

---

## 16. DEPENDENCIAS A INSTALAR

```bash
# PDF rendering (works serverless)
npm install @react-pdf/renderer

# QR code generation (Node-compatible)
npm install qrcode
npm install -D @types/qrcode

# Vercel Blob storage
npm install @vercel/blob

# Validación (ya en el proyecto si usás google_stars.md)
npm install zod

# Email (elegir uno)
npm install resend           # Recomendado — SDK simple, generous free tier
# npm install nodemailer     # Alternativa más configurable

# Número de cuota (opcional — para formateo)
npm install numeral
```

---

## 17. VARIABLES DE ENTORNO ADICIONALES

```bash
# Vercel Blob (se genera automáticamente al habilitar Blob en el proyecto)
BLOB_READ_WRITE_TOKEN=vercel_blob_...

# Claude AI para descripciones
ANTHROPIC_API_KEY=sk-ant-...

# Email (si usás Resend)
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=presupuestos@tuinmobiliaria.com

# URL base (para tracking y QR)
NEXT_PUBLIC_BASE_URL=https://tuapp.vercel.app
```

---

## 18. ESTRUCTURA DE NÚMERO DE PRESUPUESTO

```typescript
// lib/quotations/quote-number.ts
// Formato: AGE-2024-0042 (slug corto + año + secuencial)

export async function generateQuoteNumber(
  agencySlug: string,
  agencyId: mongoose.Types.ObjectId
): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = agencySlug.slice(0, 3).toUpperCase();

  // Contar cuántas quotes tiene esta agencia este año
  const count = await Quotation.countDocuments({
    agencyId,
    createdAt: { $gte: new Date(`${year}-01-01`) },
  });

  const sequential = String(count + 1).padStart(4, "0");
  return `${prefix}-${year}-${sequential}`;
}
```

---

## 19. CHECKLIST DE IMPLEMENTACIÓN

```
□ npm install @react-pdf/renderer qrcode @vercel/blob resend zod
□ Habilitar Vercel Blob en el proyecto (Vercel Dashboard → Storage → Blob)
□ Configurar ANTHROPIC_API_KEY, BLOB_READ_WRITE_TOKEN, RESEND_API_KEY
□ Crear modelos Quotation y QuotationEvent en MongoDB
□ Implementar generateQuoteNumber con autoincrement
□ Registrar fuentes Inter en lib/quotations/pdf/fonts.ts
□ Implementar los 3 templates (luxury, modern, minimal) — empezar con modern
□ Crear wizard multi-paso (5 steps)
□ Conectar StepProperty con la colección de propiedades existente
□ Implementar calculadora de cuotas (sistema francés)
□ Integrar generateAIDescription en StepCustomize (con toggle on/off)
□ Crear API Route POST /api/quotations para guardar el draft
□ Crear API Route POST /api/quotations/[id]/generate-pdf
□ Testear generación de PDF localmente con `renderToBuffer`
□ Subir PDF de prueba a Vercel Blob y verificar URL pública
□ Implementar tracking pixel en /api/quotations/track/[token]
□ Crear DeliveryActions con botones de descarga, WhatsApp, email
□ Implementar QuotationPipeline (lista por estado)
□ Agregar página /admin/quotations a la navegación del admin
□ QA: verificar que el PDF abre correctamente en iOS / Android (WhatsApp preview)
```

---

## 20. ROADMAP FUTURO

| Fase | Feature | Impacto |
|---|---|---|
| v1.1 | **Logo upload** desde admin panel → almacenado en Vercel Blob → embebido en PDF | Branding completo |
| v1.2 | **Firma digital** con canvas → se guarda como imagen en el PDF | Cierre legal básico |
| v1.3 | **Comparativa multi-propiedad** — tabla de comparison en el PDF | Upsell de portafolio |
| v1.4 | **Dashboard de pipeline** con métricas: conversion rate, avg time to accept | Business intelligence |
| v2.0 | **Template editor** visual — el agente edita colores, secciones, orden | Self-service branding |
| v2.1 | **Integración CRM** — importar clientes desde HubSpot / Pipedrive | Reducir entrada manual |
| v2.2 | **AI pricing** — Claude sugiere precio de oferta basado en comparables del mercado | Ventaja competitiva |

---

*Versión 1.0 — quotation.md*
