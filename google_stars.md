# Google Stars — Sistema Profesional de Reseñas Google para SaaS Inmobiliario

> **Stack:** Next.js 14 App Router · TypeScript · MongoDB + Mongoose · Vercel · TailwindCSS  
> **Patrón:** Multi-tenant · SSR-first · Cache persistente · Zero frontend API calls

---

## 1. PRINCIPIOS DE ARQUITECTURA

### Flujo de datos (inmutable)

```
Google Places API (New)
        ↓  [solo server-side, solo cron]
Sync Service  ←→  Rate Limiter + Error Handler
        ↓
MongoDB  (fuente de verdad única)
        ↓
Next.js API Routes  (transformación + autorización)
        ↓
React Server Components  (SSR, indexable, rápido)
        ↓
Client Components  (interactividad mínima)
```

### Reglas duras

| ❌ Nunca | ✅ Siempre |
|---|---|
| Llamar Google Places desde el cliente | Todo fetch externo desde server-side |
| Exponer `GOOGLE_API_KEY` en el bundle | Variables de entorno server-only (`GOOGLE_API_KEY`, sin prefijo `NEXT_PUBLIC_`) |
| Leer Google Places en tiempo real para el frontend | Frontend consume solo MongoDB |
| Duplicar reviews por race condition | Upsert atómico con índice único compuesto |
| Bloquear render esperando sync | Sync es background job desacoplado del render |

---

## 2. ESTRUCTURA DE CARPETAS

```
/
├── app/
│   ├── [slug]/                          # Ruta pública de cada inmobiliaria
│   │   ├── page.tsx                     # RSC: página de agencia con reviews
│   │   └── reviews/
│   │       └── page.tsx                 # RSC: página dedicada de reviews (SEO)
│   │
│   └── api/
│       ├── reviews/
│       │   ├── route.ts                 # GET reviews públicas por agencia
│       │   └── [id]/
│       │       └── route.ts             # GET review individual
│       │
│       ├── admin/
│       │   └── reviews/
│       │       ├── route.ts             # GET/PATCH moderación
│       │       └── [id]/
│       │           └── route.ts         # PATCH featured/hidden/priority
│       │
│       └── cron/
│           └── sync-reviews/
│               └── route.ts            # POST — invocado por Vercel Cron
│
├── components/
│   ├── reviews/
│   │   ├── ReviewCard.tsx               # Card premium individual
│   │   ├── ReviewCarousel.tsx           # Carrusel horizontal
│   │   ├── ReviewGrid.tsx               # Grid responsive
│   │   ├── ReviewSummary.tsx            # Rating + distribución de estrellas
│   │   ├── ReviewSkeleton.tsx           # Loading skeleton
│   │   └── StarRating.tsx               # Componente de estrellas reutilizable
│   │
│   └── seo/
│       └── ReviewSchema.tsx             # JSON-LD schema markup
│
├── lib/
│   ├── db/
│   │   ├── mongoose.ts                  # Singleton de conexión
│   │   └── models/
│   │       ├── Agency.ts                # Modelo Mongoose Agency
│   │       └── Review.ts                # Modelo Mongoose Review
│   │
│   ├── google/
│   │   ├── places-client.ts             # Cliente Google Places API (New)
│   │   ├── rate-limiter.ts              # Control de rate limits
│   │   └── transformer.ts              # Normaliza respuesta Google → Review
│   │
│   ├── sync/
│   │   ├── sync-agency.ts               # Sync de una agencia individual
│   │   └── sync-runner.ts               # Orquestador multi-agencia
│   │
│   └── utils/
│       ├── auth.ts                       # Validación de cron secret
│       └── errors.ts                     # Tipos de error centralizados
│
├── types/
│   ├── agency.ts
│   ├── review.ts
│   └── google-places.ts
│
└── vercel.json                           # Configuración de cron jobs
```

---

## 3. VARIABLES DE ENTORNO

```bash
# .env.local (nunca al cliente, nunca con prefijo NEXT_PUBLIC_)

# MongoDB
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/google_stars

# Google Places API (New)
GOOGLE_API_KEY=AIza...

# Seguridad del cron job
CRON_SECRET=un-secret-largo-y-aleatorio-256-bits

# Admin (opcional, para panel de moderación)
ADMIN_SECRET=otro-secret-para-admin
```

---

## 4. MODELOS MONGOOSE

### `lib/db/models/Agency.ts`

```typescript
import mongoose, { Document, Model, Schema } from "mongoose";

export interface IAgency extends Document {
  name: string;
  slug: string;
  googlePlaceId: string;
  reviewsEnabled: boolean;
  syncConfig: {
    intervalHours: number;       // 6 | 12 | 24
    maxReviewsPerSync: number;   // default: 20 (límite Google)
    lastSyncAt: Date | null;
    lastSyncStatus: "success" | "error" | "pending" | null;
    lastSyncError: string | null;
    consecutiveErrors: number;
  };
  metadata: {
    displayName: string | null;  // Nombre a mostrar (puede diferir del name)
    website: string | null;
    phone: string | null;
    address: string | null;
    timezone: string;            // Ej: "America/Argentina/Buenos_Aires"
  };
  plan: "free" | "starter" | "pro" | "enterprise";
  createdAt: Date;
  updatedAt: Date;
}

const AgencySchema = new Schema<IAgency>(
  {
    name: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[a-z0-9-]+$/,
    },
    googlePlaceId: { type: String, required: true, trim: true },
    reviewsEnabled: { type: Boolean, default: true },

    syncConfig: {
      intervalHours: { type: Number, default: 12, enum: [6, 12, 24] },
      maxReviewsPerSync: { type: Number, default: 20 },
      lastSyncAt: { type: Date, default: null },
      lastSyncStatus: {
        type: String,
        enum: ["success", "error", "pending", null],
        default: null,
      },
      lastSyncError: { type: String, default: null },
      consecutiveErrors: { type: Number, default: 0 },
    },

    metadata: {
      displayName: { type: String, default: null },
      website: { type: String, default: null },
      phone: { type: String, default: null },
      address: { type: String, default: null },
      timezone: { type: String, default: "UTC" },
    },

    plan: {
      type: String,
      enum: ["free", "starter", "pro", "enterprise"],
      default: "free",
    },
  },
  {
    timestamps: true,
    collection: "agencies",
  }
);

// Índices
AgencySchema.index({ slug: 1 }, { unique: true });
AgencySchema.index({ googlePlaceId: 1 });
AgencySchema.index({ reviewsEnabled: 1 });
AgencySchema.index({ "syncConfig.lastSyncAt": 1 });

export const Agency: Model<IAgency> =
  mongoose.models.Agency ?? mongoose.model<IAgency>("Agency", AgencySchema);
```

### `lib/db/models/Review.ts`

```typescript
import mongoose, { Document, Model, Schema } from "mongoose";

export interface IReview extends Document {
  agencyId: mongoose.Types.ObjectId;
  googlePlaceId: string;

  // Identificación única en Google
  reviewId: string;              // Hash derivado: authorUri + publishTime

  // Datos del autor
  authorName: string;
  authorPhoto: string | null;
  authorUri: string | null;      // Perfil Google del autor

  // Contenido
  rating: number;                // 1–5
  text: string | null;
  textOriginalLanguage: string | null;  // BCP-47, ej: "es", "en"
  translatedText: string | null;        // Para futuro soporte i18n

  // Tiempo
  publishTime: Date;             // Fecha real de la reseña
  relativeTimeDescription: string;  // "hace 2 meses"
  googleUpdatedAt: Date;         // updateTime de Google

  // Moderación (admin)
  featured: boolean;
  hidden: boolean;
  priority: number;              // 0 = normal, mayor = más arriba

  // Análisis (preparado para futuro)
  sentiment: "positive" | "neutral" | "negative" | null;
  sentimentScore: number | null;  // -1.0 a 1.0

  // Trazabilidad
  firstSeenAt: Date;
  lastSeenAt: Date;

  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    agencyId: {
      type: Schema.Types.ObjectId,
      ref: "Agency",
      required: true,
      index: true,
    },
    googlePlaceId: { type: String, required: true },

    reviewId: { type: String, required: true },

    authorName: { type: String, required: true, trim: true },
    authorPhoto: { type: String, default: null },
    authorUri: { type: String, default: null },

    rating: { type: Number, required: true, min: 1, max: 5 },
    text: { type: String, default: null },
    textOriginalLanguage: { type: String, default: null },
    translatedText: { type: String, default: null },

    publishTime: { type: Date, required: true },
    relativeTimeDescription: { type: String, default: "" },
    googleUpdatedAt: { type: Date, required: true },

    featured: { type: Boolean, default: false, index: true },
    hidden: { type: Boolean, default: false, index: true },
    priority: { type: Number, default: 0, index: true },

    sentiment: {
      type: String,
      enum: ["positive", "neutral", "negative", null],
      default: null,
    },
    sentimentScore: { type: Number, default: null },

    firstSeenAt: { type: Date, default: Date.now },
    lastSeenAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    collection: "reviews",
  }
);

// CRÍTICO: Índice único compuesto para prevenir duplicados
ReviewSchema.index({ agencyId: 1, reviewId: 1 }, { unique: true });

// Índices de query frecuentes
ReviewSchema.index({ agencyId: 1, hidden: 1, publishTime: -1 });
ReviewSchema.index({ agencyId: 1, featured: 1, priority: -1 });
ReviewSchema.index({ agencyId: 1, rating: 1 });

export const Review: Model<IReview> =
  mongoose.models.Review ?? mongoose.model<IReview>("Review", ReviewSchema);
```

---

## 5. CONEXIÓN MONGODB (SINGLETON)

### `lib/db/mongoose.ts`

```typescript
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI no definida en variables de entorno.");
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var __mongoose: MongooseCache | undefined;
}

const cached: MongooseCache = global.__mongoose ?? { conn: null, promise: null };
global.__mongoose = cached;

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
```

---

## 6. TIPOS TYPESCRIPT

### `types/google-places.ts`

```typescript
// Google Places API (New) — campo `reviews` en Place Details
export interface GooglePlaceReview {
  name: string;                    // "places/{place_id}/reviews/{review_id}"
  relativePublishTimeDescription: string;
  rating: number;
  text?: {
    text: string;
    languageCode: string;
  };
  originalText?: {
    text: string;
    languageCode: string;
  };
  authorAttribution: {
    displayName: string;
    uri: string;
    photoUri: string;
  };
  publishTime: string;             // ISO 8601
  updateTime: string;              // ISO 8601
}

export interface GooglePlaceDetailsResponse {
  id: string;
  displayName?: { text: string; languageCode: string };
  reviews?: GooglePlaceReview[];
  userRatingCount?: number;
  rating?: number;
  websiteUri?: string;
  formattedAddress?: string;
  internationalPhoneNumber?: string;
}

export interface GooglePlacesAPIError {
  error: {
    code: number;
    message: string;
    status: string;
    details?: unknown[];
  };
}
```

### `types/review.ts`

```typescript
export interface ReviewDTO {
  id: string;
  agencySlug: string;
  authorName: string;
  authorPhoto: string | null;
  rating: number;
  text: string | null;
  relativeTimeDescription: string;
  publishTime: string;             // ISO string para JSON
  featured: boolean;
  priority: number;
}

export interface ReviewSummaryDTO {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: Record<1 | 2 | 3 | 4 | 5, number>;
  lastUpdated: string;
}

export interface ReviewsPageDTO {
  reviews: ReviewDTO[];
  summary: ReviewSummaryDTO;
  agencyName: string;
}
```

---

## 7. CLIENTE GOOGLE PLACES API (NEW)

### `lib/google/places-client.ts`

```typescript
import type {
  GooglePlaceDetailsResponse,
  GooglePlaceReview,
} from "@/types/google-places";

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY!;
const BASE_URL = "https://places.googleapis.com/v1";

// Campos necesarios — minimizar para reducir costos
// El campo "reviews" está en la categoría "Advanced" ($0.017/request)
const FIELD_MASK = [
  "id",
  "displayName",
  "rating",
  "userRatingCount",
  "reviews",
  "websiteUri",
  "formattedAddress",
  "internationalPhoneNumber",
].join(",");

export interface FetchPlaceReviewsResult {
  placeId: string;
  reviews: GooglePlaceReview[];
  overallRating: number | null;
  totalRatings: number | null;
}

export async function fetchPlaceReviews(
  placeId: string,
  languageCode: string = "es"
): Promise<FetchPlaceReviewsResult> {
  if (!GOOGLE_API_KEY) {
    throw new Error("GOOGLE_API_KEY no configurada.");
  }

  const url = `${BASE_URL}/places/${placeId}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": GOOGLE_API_KEY,
      "X-Goog-FieldMask": FIELD_MASK,
      "Accept-Language": languageCode,
    },
    // No cache en fetch de Node — el caching lo maneja MongoDB
    cache: "no-store",
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const status = response.status;

    // Rate limit
    if (status === 429) {
      throw new GoogleRateLimitError(`Rate limit alcanzado para placeId: ${placeId}`);
    }

    // Credenciales
    if (status === 403 || status === 401) {
      throw new GoogleAuthError(`Error de autenticación Google API: ${status}`);
    }

    // No encontrado
    if (status === 404) {
      throw new GoogleNotFoundError(`Place no encontrado: ${placeId}`);
    }

    throw new GoogleAPIError(
      `Google Places API error ${status}: ${JSON.stringify(errorBody)}`
    );
  }

  const data: GooglePlaceDetailsResponse = await response.json();

  return {
    placeId: data.id,
    reviews: data.reviews ?? [],
    overallRating: data.rating ?? null,
    totalRatings: data.userRatingCount ?? null,
  };
}

// Errores tipados
export class GoogleAPIError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GoogleAPIError";
  }
}
export class GoogleRateLimitError extends GoogleAPIError {
  constructor(message: string) {
    super(message);
    this.name = "GoogleRateLimitError";
  }
}
export class GoogleAuthError extends GoogleAPIError {
  constructor(message: string) {
    super(message);
    this.name = "GoogleAuthError";
  }
}
export class GoogleNotFoundError extends GoogleAPIError {
  constructor(message: string) {
    super(message);
    this.name = "GoogleNotFoundError";
  }
}
```

### `lib/google/transformer.ts`

```typescript
import crypto from "crypto";
import type { GooglePlaceReview } from "@/types/google-places";
import type { IReview } from "@/lib/db/models/Review";
import type mongoose from "mongoose";

/**
 * Genera un reviewId estable y único a partir de los datos de Google.
 * Google no provee un ID explícito en la respuesta — derivamos uno.
 */
export function deriveReviewId(review: GooglePlaceReview): string {
  // Usar authorUri + publishTime como semilla estable
  const seed = `${review.authorAttribution.uri}::${review.publishTime}`;
  return crypto.createHash("sha256").update(seed).digest("hex").slice(0, 32);
}

/**
 * Transforma una reseña de Google al formato del modelo IReview.
 */
export function transformGoogleReview(
  review: GooglePlaceReview,
  agencyId: mongoose.Types.ObjectId,
  googlePlaceId: string
): Omit<IReview, "_id" | "createdAt" | "updatedAt" | "firstSeenAt" | "lastSeenAt"> {
  const reviewId = deriveReviewId(review);

  return {
    agencyId,
    googlePlaceId,
    reviewId,

    authorName: review.authorAttribution.displayName,
    authorPhoto: review.authorAttribution.photoUri || null,
    authorUri: review.authorAttribution.uri || null,

    rating: review.rating,
    text: review.text?.text ?? null,
    textOriginalLanguage: review.originalText?.languageCode ?? review.text?.languageCode ?? null,
    translatedText: null,

    publishTime: new Date(review.publishTime),
    relativeTimeDescription: review.relativePublishTimeDescription,
    googleUpdatedAt: new Date(review.updateTime ?? review.publishTime),

    featured: false,
    hidden: false,
    priority: 0,

    sentiment: null,
    sentimentScore: null,
  } as Omit<IReview, "_id" | "createdAt" | "updatedAt" | "firstSeenAt" | "lastSeenAt">;
}
```

---

## 8. SYNC SERVICE

### `lib/sync/sync-agency.ts`

```typescript
import { connectDB } from "@/lib/db/mongoose";
import { Agency, type IAgency } from "@/lib/db/models/Agency";
import { Review } from "@/lib/db/models/Review";
import {
  fetchPlaceReviews,
  GoogleRateLimitError,
  GoogleNotFoundError,
} from "@/lib/google/places-client";
import { transformGoogleReview } from "@/lib/google/transformer";

export interface SyncResult {
  agencyId: string;
  agencySlug: string;
  inserted: number;
  updated: number;
  unchanged: number;
  errors: string[];
  durationMs: number;
}

export async function syncAgencyReviews(agency: IAgency): Promise<SyncResult> {
  const start = Date.now();
  const result: SyncResult = {
    agencyId: agency._id.toString(),
    agencySlug: agency.slug,
    inserted: 0,
    updated: 0,
    unchanged: 0,
    errors: [],
    durationMs: 0,
  };

  try {
    // Marcar como "pending"
    await Agency.findByIdAndUpdate(agency._id, {
      "syncConfig.lastSyncStatus": "pending",
    });

    const { reviews } = await fetchPlaceReviews(
      agency.googlePlaceId,
      "es" // idioma preferido para relativeTimeDescription
    );

    for (const googleReview of reviews) {
      try {
        const reviewData = transformGoogleReview(
          googleReview,
          agency._id,
          agency.googlePlaceId
        );

        // Buscar si ya existe
        const existing = await Review.findOne({
          agencyId: agency._id,
          reviewId: reviewData.reviewId,
        }).lean();

        if (!existing) {
          // Insertar nueva review
          await Review.create({
            ...reviewData,
            firstSeenAt: new Date(),
            lastSeenAt: new Date(),
          });
          result.inserted++;
        } else {
          // Detectar cambios relevantes (texto editado, rating editado)
          const hasChanged =
            existing.rating !== reviewData.rating ||
            existing.text !== reviewData.text ||
            existing.googleUpdatedAt.getTime() !==
              reviewData.googleUpdatedAt.getTime();

          if (hasChanged) {
            await Review.findOneAndUpdate(
              { agencyId: agency._id, reviewId: reviewData.reviewId },
              {
                $set: {
                  rating: reviewData.rating,
                  text: reviewData.text,
                  relativeTimeDescription: reviewData.relativeTimeDescription,
                  googleUpdatedAt: reviewData.googleUpdatedAt,
                  lastSeenAt: new Date(),
                },
              }
            );
            result.updated++;
          } else {
            // Solo actualizar lastSeenAt
            await Review.findOneAndUpdate(
              { agencyId: agency._id, reviewId: reviewData.reviewId },
              { $set: { lastSeenAt: new Date() } }
            );
            result.unchanged++;
          }
        }
      } catch (reviewError) {
        result.errors.push(
          `Review ${googleReview.authorAttribution.displayName}: ${
            reviewError instanceof Error ? reviewError.message : "Error desconocido"
          }`
        );
      }
    }

    // Marcar sync exitoso
    await Agency.findByIdAndUpdate(agency._id, {
      "syncConfig.lastSyncAt": new Date(),
      "syncConfig.lastSyncStatus": "success",
      "syncConfig.lastSyncError": null,
      "syncConfig.consecutiveErrors": 0,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    result.errors.push(message);

    const isNotFound = error instanceof GoogleNotFoundError;
    const isRateLimit = error instanceof GoogleRateLimitError;

    await Agency.findByIdAndUpdate(agency._id, {
      "syncConfig.lastSyncAt": new Date(),
      "syncConfig.lastSyncStatus": "error",
      "syncConfig.lastSyncError": message,
      $inc: { "syncConfig.consecutiveErrors": 1 },
      // Deshabilitar si el Place ID no existe
      ...(isNotFound && { reviewsEnabled: false }),
    });

    // Re-throw rate limit para que el runner pause
    if (isRateLimit) throw error;
  }

  result.durationMs = Date.now() - start;
  return result;
}
```

### `lib/sync/sync-runner.ts`

```typescript
import { connectDB } from "@/lib/db/mongoose";
import { Agency } from "@/lib/db/models/Agency";
import { syncAgencyReviews, type SyncResult } from "./sync-agency";
import { GoogleRateLimitError } from "@/lib/google/places-client";

const DELAY_BETWEEN_AGENCIES_MS = 1500; // Evitar ráfagas al API
const MAX_CONSECUTIVE_ERRORS_BEFORE_SKIP = 5;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface SyncRunnerResult {
  totalAgencies: number;
  synced: number;
  skipped: number;
  results: SyncResult[];
  rateLimitHit: boolean;
  startedAt: string;
  finishedAt: string;
}

export async function runFullSync(): Promise<SyncRunnerResult> {
  await connectDB();

  const startedAt = new Date();
  const runnerResult: SyncRunnerResult = {
    totalAgencies: 0,
    synced: 0,
    skipped: 0,
    results: [],
    rateLimitHit: false,
    startedAt: startedAt.toISOString(),
    finishedAt: "",
  };

  // Solo agencias con reviews habilitadas y sin demasiados errores consecutivos
  const agencies = await Agency.find({
    reviewsEnabled: true,
    "syncConfig.consecutiveErrors": {
      $lt: MAX_CONSECUTIVE_ERRORS_BEFORE_SKIP,
    },
  }).lean();

  runnerResult.totalAgencies = agencies.length;

  for (const agency of agencies) {
    try {
      // Verificar si necesita sync (por intervalo configurado)
      const now = Date.now();
      const lastSync = agency.syncConfig.lastSyncAt?.getTime() ?? 0;
      const intervalMs = agency.syncConfig.intervalHours * 60 * 60 * 1000;

      if (now - lastSync < intervalMs) {
        runnerResult.skipped++;
        continue;
      }

      const result = await syncAgencyReviews(agency as any);
      runnerResult.results.push(result);
      runnerResult.synced++;

      // Pausa cortés entre agencias
      await sleep(DELAY_BETWEEN_AGENCIES_MS);
    } catch (error) {
      if (error instanceof GoogleRateLimitError) {
        runnerResult.rateLimitHit = true;
        console.error("[SyncRunner] Rate limit alcanzado. Deteniendo sync.");
        break; // Parar todo el run, el próximo cron retomará
      }
      // Otros errores: loguear pero continuar con la siguiente agencia
      console.error(`[SyncRunner] Error en agencia ${agency.slug}:`, error);
    }
  }

  runnerResult.finishedAt = new Date().toISOString();
  return runnerResult;
}
```

---

## 9. CRON JOB — API ROUTE

### `app/api/cron/sync-reviews/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { runFullSync } from "@/lib/sync/sync-runner";

// Seguridad: Vercel Cron + secret propio
function validateCronRequest(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) return false;

  // Vercel agrega este header automáticamente desde sus servidores
  const vercelCronHeader = request.headers.get("x-vercel-cron");

  return (
    authHeader === `Bearer ${cronSecret}` || vercelCronHeader === "1"
  );
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  // Verificar origen autorizado
  if (!validateCronRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log("[CronJob] Iniciando sync de reviews...");

  try {
    const result = await runFullSync();

    console.log(
      `[CronJob] Sync completado: ${result.synced} agencias, ` +
        `${result.results.reduce((a, r) => a + r.inserted, 0)} nuevas reviews`
    );

    return NextResponse.json({ success: true, result }, { status: 200 });
  } catch (error) {
    console.error("[CronJob] Error fatal en sync:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}
```

### `vercel.json`

```json
{
  "crons": [
    {
      "path": "/api/cron/sync-reviews",
      "schedule": "0 */12 * * *"
    }
  ]
}
```

> **Nota:** El header `Authorization: Bearer {CRON_SECRET}` debe configurarse en Vercel → Project Settings → Cron Jobs → Edit → Authorization Header.

---

## 10. API ROUTES PÚBLICAS

### `app/api/reviews/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { Agency } from "@/lib/db/models/Agency";
import { Review } from "@/lib/db/models/Review";
import type { ReviewDTO, ReviewSummaryDTO, ReviewsPageDTO } from "@/types/review";

export const dynamic = "force-dynamic";
// Cache de 1h a nivel CDN — las reviews no cambian tan frecuentemente
export const revalidate = 3600;

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");
  const limitParam = searchParams.get("limit");
  const featuredOnly = searchParams.get("featured") === "true";

  if (!slug) {
    return NextResponse.json({ error: "slug requerido" }, { status: 400 });
  }

  try {
    await connectDB();

    const agency = await Agency.findOne({ slug, reviewsEnabled: true }).lean();

    if (!agency) {
      return NextResponse.json({ error: "Agencia no encontrada" }, { status: 404 });
    }

    const limit = Math.min(parseInt(limitParam ?? "20", 10), 50);

    const query: Record<string, unknown> = {
      agencyId: agency._id,
      hidden: false,
    };

    if (featuredOnly) {
      query.featured = true;
    }

    const [reviews, allReviews] = await Promise.all([
      Review.find(query)
        .sort({ priority: -1, publishTime: -1 })
        .limit(limit)
        .lean(),
      Review.find({ agencyId: agency._id, hidden: false })
        .select("rating")
        .lean(),
    ]);

    // Calcular summary
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<
      1 | 2 | 3 | 4 | 5,
      number
    >;
    let ratingSum = 0;
    for (const r of allReviews) {
      distribution[r.rating as 1 | 2 | 3 | 4 | 5]++;
      ratingSum += r.rating;
    }

    const summary: ReviewSummaryDTO = {
      totalReviews: allReviews.length,
      averageRating:
        allReviews.length > 0
          ? Math.round((ratingSum / allReviews.length) * 10) / 10
          : 0,
      ratingDistribution: distribution,
      lastUpdated:
        agency.syncConfig.lastSyncAt?.toISOString() ?? new Date().toISOString(),
    };

    const reviewDTOs: ReviewDTO[] = reviews.map((r) => ({
      id: r._id.toString(),
      agencySlug: slug,
      authorName: r.authorName,
      authorPhoto: r.authorPhoto,
      rating: r.rating,
      text: r.text,
      relativeTimeDescription: r.relativeTimeDescription,
      publishTime: r.publishTime.toISOString(),
      featured: r.featured,
      priority: r.priority,
    }));

    const payload: ReviewsPageDTO = {
      reviews: reviewDTOs,
      summary,
      agencyName: agency.metadata.displayName ?? agency.name,
    };

    return NextResponse.json(payload, {
      status: 200,
      headers: {
        "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("[API/reviews] Error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
```

---

## 11. COMPONENTES FRONTEND

### `components/reviews/StarRating.tsx`

```tsx
interface StarRatingProps {
  rating: number;         // 1–5
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
}

const sizeMap = {
  sm: "w-3.5 h-3.5",
  md: "w-5 h-5",
  lg: "w-6 h-6",
};

export function StarRating({ rating, size = "md", showValue = false }: StarRatingProps) {
  const stars = Array.from({ length: 5 }, (_, i) => {
    const filled = i < Math.floor(rating);
    const partial = !filled && i < rating;
    return { filled, partial, index: i };
  });

  return (
    <div className="flex items-center gap-1">
      {stars.map(({ filled, partial, index }) => (
        <svg
          key={index}
          className={`${sizeMap[size]} ${
            filled
              ? "text-amber-400"
              : partial
              ? "text-amber-300"
              : "text-zinc-200"
          } transition-colors`}
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      {showValue && (
        <span className="ml-1 text-sm font-semibold text-zinc-700">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
```

### `components/reviews/ReviewCard.tsx`

```tsx
import Image from "next/image";
import type { ReviewDTO } from "@/types/review";
import { StarRating } from "./StarRating";

interface ReviewCardProps {
  review: ReviewDTO;
  variant?: "default" | "featured" | "compact";
}

function AuthorAvatar({ name, photo }: { name: string; photo: string | null }) {
  if (photo) {
    return (
      <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-white shadow-sm flex-shrink-0">
        <Image
          src={photo}
          alt={name}
          fill
          className="object-cover"
          sizes="40px"
          unoptimized // Photos de Google son externas
        />
      </div>
    );
  }

  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("");

  const colors = [
    "bg-blue-500",
    "bg-emerald-500",
    "bg-violet-500",
    "bg-rose-500",
    "bg-amber-500",
    "bg-cyan-500",
  ];
  const color = colors[name.charCodeAt(0) % colors.length];

  return (
    <div
      className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center
        text-white text-sm font-semibold ${color} ring-2 ring-white shadow-sm`}
      aria-label={name}
    >
      {initials}
    </div>
  );
}

function ReviewText({ text }: { text: string | null }) {
  if (!text) return null;

  return (
    <p className="text-sm text-zinc-600 leading-relaxed line-clamp-4 mt-3">
      {text}
    </p>
  );
}

export function ReviewCard({ review, variant = "default" }: ReviewCardProps) {
  const isFeatured = variant === "featured" || review.featured;

  return (
    <article
      className={`
        relative flex flex-col p-5 rounded-2xl border transition-all duration-200
        ${
          isFeatured
            ? "bg-gradient-to-br from-amber-50 to-white border-amber-100 shadow-md shadow-amber-100/40"
            : "bg-white border-zinc-100 shadow-sm hover:shadow-md hover:border-zinc-200"
        }
      `}
      aria-label={`Reseña de ${review.authorName}`}
    >
      {isFeatured && (
        <span className="absolute top-4 right-4 text-xs font-medium text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
          Destacada
        </span>
      )}

      {/* Header */}
      <div className="flex items-center gap-3">
        <AuthorAvatar name={review.authorName} photo={review.authorPhoto} />
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-zinc-900 text-sm truncate">
            {review.authorName}
          </p>
          <time
            dateTime={review.publishTime}
            className="text-xs text-zinc-400"
          >
            {review.relativeTimeDescription}
          </time>
        </div>
      </div>

      {/* Stars */}
      <div className="mt-3">
        <StarRating rating={review.rating} size="sm" />
      </div>

      {/* Text */}
      <ReviewText text={review.text} />

      {/* Google attribution */}
      <div className="mt-4 flex items-center gap-1.5 pt-3 border-t border-zinc-50">
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        <span className="text-xs text-zinc-400">Reseña de Google</span>
      </div>
    </article>
  );
}
```

### `components/reviews/ReviewSummary.tsx`

```tsx
import { StarRating } from "./StarRating";
import type { ReviewSummaryDTO } from "@/types/review";

interface ReviewSummaryProps {
  summary: ReviewSummaryDTO;
  agencyName: string;
}

export function ReviewSummary({ summary, agencyName }: ReviewSummaryProps) {
  const { totalReviews, averageRating, ratingDistribution } = summary;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-8 p-6 bg-white rounded-2xl border border-zinc-100 shadow-sm">
      {/* Score central */}
      <div className="flex flex-col items-center gap-1 flex-shrink-0">
        <span className="text-5xl font-bold text-zinc-900 tracking-tight">
          {averageRating.toFixed(1)}
        </span>
        <StarRating rating={averageRating} size="md" />
        <span className="text-sm text-zinc-500 mt-1">
          {totalReviews} {totalReviews === 1 ? "reseña" : "reseñas"}
        </span>
      </div>

      {/* Divider */}
      <div className="hidden sm:block w-px h-24 bg-zinc-100" />

      {/* Distribución */}
      <div className="flex flex-col gap-2 flex-1 w-full max-w-xs">
        {([5, 4, 3, 2, 1] as const).map((star) => {
          const count = ratingDistribution[star] ?? 0;
          const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

          return (
            <div key={star} className="flex items-center gap-3">
              <span className="text-xs text-zinc-500 w-3 text-right">{star}</span>
              <svg className="w-3 h-3 text-amber-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <div className="flex-1 bg-zinc-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all duration-500"
                  style={{ width: `${pct}%` }}
                  role="progressbar"
                  aria-valuenow={pct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
              <span className="text-xs text-zinc-400 w-5 text-right">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

### `components/reviews/ReviewSkeleton.tsx`

```tsx
export function ReviewSkeleton() {
  return (
    <div className="flex flex-col p-5 rounded-2xl border border-zinc-100 bg-white animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-zinc-200 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 bg-zinc-200 rounded w-32" />
          <div className="h-3 bg-zinc-100 rounded w-20" />
        </div>
      </div>
      <div className="flex gap-1 mt-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="w-3.5 h-3.5 rounded bg-zinc-200" />
        ))}
      </div>
      <div className="mt-3 space-y-2">
        <div className="h-3 bg-zinc-100 rounded w-full" />
        <div className="h-3 bg-zinc-100 rounded w-5/6" />
        <div className="h-3 bg-zinc-100 rounded w-4/6" />
      </div>
    </div>
  );
}

export function ReviewGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <ReviewSkeleton key={i} />
      ))}
    </div>
  );
}
```

### `components/reviews/ReviewGrid.tsx`

```tsx
import type { ReviewDTO } from "@/types/review";
import { ReviewCard } from "./ReviewCard";

interface ReviewGridProps {
  reviews: ReviewDTO[];
  columns?: 2 | 3;
}

export function ReviewGrid({ reviews, columns = 3 }: ReviewGridProps) {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-12 text-zinc-400 text-sm">
        No hay reseñas disponibles.
      </div>
    );
  }

  return (
    <div
      className={`grid gap-4 ${
        columns === 3
          ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          : "grid-cols-1 sm:grid-cols-2"
      }`}
    >
      {reviews.map((review, index) => (
        <ReviewCard
          key={review.id}
          review={review}
          variant={index === 0 && review.featured ? "featured" : "default"}
        />
      ))}
    </div>
  );
}
```

---

## 12. SEO — JSON-LD SCHEMA

### `components/seo/ReviewSchema.tsx`

```tsx
import type { ReviewsPageDTO } from "@/types/review";

interface ReviewSchemaProps {
  data: ReviewsPageDTO;
  agencyUrl: string;
  agencyAddress?: string;
}

export function ReviewSchema({ data, agencyUrl, agencyAddress }: ReviewSchemaProps) {
  const { reviews, summary, agencyName } = data;

  const localBusiness = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: agencyName,
    url: agencyUrl,
    ...(agencyAddress && { address: agencyAddress }),
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: summary.averageRating.toString(),
      reviewCount: summary.totalReviews.toString(),
      bestRating: "5",
      worstRating: "1",
    },
    review: reviews.slice(0, 10).map((r) => ({
      "@type": "Review",
      author: {
        "@type": "Person",
        name: r.authorName,
      },
      reviewRating: {
        "@type": "Rating",
        ratingValue: r.rating.toString(),
        bestRating: "5",
        worstRating: "1",
      },
      datePublished: r.publishTime.split("T")[0],
      reviewBody: r.text ?? undefined,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusiness) }}
    />
  );
}
```

---

## 13. REACT SERVER COMPONENT — PÁGINA DE AGENCIA

### `app/[slug]/reviews/page.tsx`

```tsx
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { connectDB } from "@/lib/db/mongoose";
import { Agency } from "@/lib/db/models/Agency";
import { Review } from "@/lib/db/models/Review";
import { ReviewGrid } from "@/components/reviews/ReviewGrid";
import { ReviewSummary } from "@/components/reviews/ReviewSummary";
import { ReviewSchema } from "@/components/seo/ReviewSchema";
import type { ReviewDTO, ReviewsPageDTO } from "@/types/review";

interface PageProps {
  params: { slug: string };
}

// Revalidar cada hora — reviews no cambian al minuto
export const revalidate = 3600;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  await connectDB();
  const agency = await Agency.findOne({ slug: params.slug }).lean();

  if (!agency) return {};

  const name = agency.metadata.displayName ?? agency.name;

  return {
    title: `Reseñas de ${name} · Google Reviews`,
    description: `Lee las opiniones reales de clientes de ${name} en Google.`,
    openGraph: {
      title: `Reseñas de ${name}`,
      description: `Opiniones reales de clientes de ${name}.`,
    },
  };
}

async function getReviewsData(slug: string): Promise<ReviewsPageDTO | null> {
  await connectDB();

  const agency = await Agency.findOne({ slug, reviewsEnabled: true }).lean();
  if (!agency) return null;

  const [reviews, allReviews] = await Promise.all([
    Review.find({ agencyId: agency._id, hidden: false })
      .sort({ priority: -1, publishTime: -1 })
      .limit(20)
      .lean(),
    Review.find({ agencyId: agency._id, hidden: false })
      .select("rating")
      .lean(),
  ]);

  const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<1 | 2 | 3 | 4 | 5, number>;
  let sum = 0;
  for (const r of allReviews) {
    dist[r.rating as 1 | 2 | 3 | 4 | 5]++;
    sum += r.rating;
  }

  return {
    agencyName: agency.metadata.displayName ?? agency.name,
    summary: {
      totalReviews: allReviews.length,
      averageRating: allReviews.length ? Math.round((sum / allReviews.length) * 10) / 10 : 0,
      ratingDistribution: dist,
      lastUpdated: agency.syncConfig.lastSyncAt?.toISOString() ?? new Date().toISOString(),
    },
    reviews: reviews.map((r) => ({
      id: r._id.toString(),
      agencySlug: slug,
      authorName: r.authorName,
      authorPhoto: r.authorPhoto,
      rating: r.rating,
      text: r.text,
      relativeTimeDescription: r.relativeTimeDescription,
      publishTime: r.publishTime.toISOString(),
      featured: r.featured,
      priority: r.priority,
    })),
  };
}

export default async function ReviewsPage({ params }: PageProps) {
  const data = await getReviewsData(params.slug);

  if (!data) notFound();

  const agencyUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/${params.slug}`;

  return (
    <>
      <ReviewSchema data={data} agencyUrl={agencyUrl} />

      <main className="max-w-6xl mx-auto px-4 py-12">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900">
            Reseñas de {data.agencyName}
          </h1>
          <p className="text-zinc-500 mt-1 text-sm">
            Opiniones verificadas de Google
          </p>
        </header>

        <ReviewSummary summary={data.summary} agencyName={data.agencyName} />

        <div className="mt-8">
          <ReviewGrid reviews={data.reviews} columns={3} />
        </div>
      </main>
    </>
  );
}
```

---

## 14. PANEL DE ADMINISTRACIÓN — API ROUTE

### `app/api/admin/reviews/[id]/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { Review } from "@/lib/db/models/Review";
import { z } from "zod";

// Validación del body
const PatchReviewSchema = z.object({
  featured: z.boolean().optional(),
  hidden: z.boolean().optional(),
  priority: z.number().int().min(-100).max(100).optional(),
});

function validateAdminRequest(request: NextRequest): boolean {
  const secret = request.headers.get("x-admin-secret");
  return secret === process.env.ADMIN_SECRET;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  if (!validateAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = PatchReviewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    await connectDB();

    const updated = await Review.findByIdAndUpdate(
      params.id,
      { $set: parsed.data },
      { new: true, lean: true }
    );

    if (!updated) {
      return NextResponse.json({ error: "Review no encontrada" }, { status: 404 });
    }

    return NextResponse.json({ success: true, review: updated });
  } catch (error) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
```

---

## 15. OPTIMIZACIÓN DE COSTOS API

| Estrategia | Detalle |
|---|---|
| **Solo sync background** | Nunca llamar Google en tiempo real desde el frontend |
| **Intervalo por agencia** | Cada agencia configura su intervalo (6/12/24h) independientemente |
| **Skip inteligente** | El runner verifica `lastSyncAt + intervalHours` antes de llamar |
| **Field mask mínimo** | Solo los campos necesarios en `X-Goog-FieldMask` |
| **Backoff en errores** | `consecutiveErrors >= 5` suspende la agencia automáticamente |
| **Rate limiter** | `DELAY_BETWEEN_AGENCIES_MS` entre requests al API |
| **Cache CDN** | `Cache-Control: s-maxage=3600` en API Routes públicas |
| **ISR** | `revalidate = 3600` en Server Components |
| **Upsert atómico** | Sin reads innecesarios — índice único previene duplicados |

---

## 16. SEGURIDAD

| Vector | Mitigación |
|---|---|
| Exposición de `GOOGLE_API_KEY` | Variable sin prefijo `NEXT_PUBLIC_`, usada solo en server |
| Acceso no autorizado al cron | Header `Authorization: Bearer CRON_SECRET` + `x-vercel-cron` |
| Acceso no autorizado al admin | Header `x-admin-secret` (mejorar a JWT/Auth en producción) |
| Inyección en MongoDB | Mongoose schema tipado + `z.safeParse()` en todos los inputs |
| Abuso de API pública | Rate limiting a nivel de CDN (Vercel Edge) |
| Enumeración de slugs | 404 genérico sin revelar si el slug existe pero está deshabilitado |

---

## 17. ESCALABILIDAD Y FEATURES FUTURAS

### Preparado hoy

- **Multi-tenant:** `agencyId` en cada documento, índices compuestos
- **Moderación:** campos `featured`, `hidden`, `priority` + API admin
- **i18n:** `textOriginalLanguage`, `translatedText`
- **Analytics:** `firstSeenAt`, `lastSeenAt`, `publishTime`
- **Sentiment AI:** campos `sentiment`, `sentimentScore` — solo poblar con un job

### Features premium a agregar

```
Tier Starter  →  sync cada 12h, hasta 5 agencias
Tier Pro      →  sync cada 6h, reviews ilimitadas, moderación avanzada
Tier Enterprise → sync cada hora, sentiment AI, dashboard analytics,
                   widget embebido, exportación CSV, webhooks
```

### Dashboard de sync (próximo paso)

```typescript
// Endpoint para visualizar estado del sync
// GET /api/admin/sync-status
// Retorna: { agencies: [{ slug, lastSyncAt, status, reviewCount, errors }] }
```

---

## 18. CHECKLIST DE IMPLEMENTACIÓN

```
□ Configurar MONGODB_URI en Vercel
□ Configurar GOOGLE_API_KEY en Vercel (sin NEXT_PUBLIC_)
□ Configurar CRON_SECRET en Vercel
□ Habilitar Google Places API (New) en Google Cloud Console
□ Crear índices en MongoDB (correr los modelos una vez para auto-crear)
□ Insertar primera agencia en colección agencies con googlePlaceId correcto
□ Hacer POST manual a /api/cron/sync-reviews para verificar el primer sync
□ Verificar reviews en MongoDB
□ Deploy a Vercel — el cron se activa automáticamente con vercel.json
□ Revisar logs en Vercel Functions tab
□ Agregar ReviewSchema y ReviewSummary en la página pública
□ Verificar schema con Google Rich Results Test
```

---

## 19. NOTAS SOBRE GOOGLE PLACES API (NEW)

- La **API "New"** usa `https://places.googleapis.com/v1/places/{placeId}` (no la legacy `/maps/api/place/details/json`)
- El campo `reviews` requiere el header `X-Goog-FieldMask` explícito — sin él, no se retorna
- Google retorna **máximo 5 reseñas** por request en el tier actual; con plan Enterprise sube a 53
- El `publishTime` es un ISO 8601 string; `updateTime` puede no existir — usar `publishTime` como fallback
- No existe un `reviewId` nativo — hay que derivarlo desde `authorUri + publishTime` (ver `transformer.ts`)
- El campo `relativePublishTimeDescription` varía por idioma según el header `Accept-Language`
- Billing: el endpoint de Place Details con el campo `reviews` es categoría **Advanced** ($0.017 por request)

---

*Versión 1.0 — google_stars.md*
