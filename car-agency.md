# Car Agency — Sistema de Gestión para Concesionarias de Autos Usados

## Overview

Sistema web para agencias de autos usados (30-40 vehículos). Similar al de Franco (propiedades) pero adaptado para inventario vehicular.

**Stack confirmado:** Next.js 14 (App Router) + MongoDB/Mongoose + Tailwind CSS + NextAuth

---

## Inspiration / Referentes

### Ruatta Automotores — https://www.ruattaautomotores.com.ar/
- Catálogo de autos y motos
- Filtros por query string: `/autos?carroceria=SUV`
- Carrocerías: SUV, Sedán, Pick-Up
- Estado: 0km / Usados
- Marcas: Volkswagen, Toyota, BMW, Chevrolet, Jeep, Mercedes-Benz
- Info de contacto visible en header
- Sección "Unidades destacadas" + historia familiar

### Autocity — https://autocity.com.ar/
- Concesionario con múltiples sucursales (Córdoba Capital, Río Cuarto)
- Filtros avanzados: Marca → Modelo → Versión → Año
- Precios en pesos argentinos ($ 10.799.999 - $ 13.500.000)
- Sección 0km y Usados separada
- 24 marcas en usados
- Información de contacto por cada sucursal

---

## Modelo de Datos — Vehicle Schema

```js
{
  marca: String,           // Ford, Volkswagen, Toyota, etc
  modelo: String,          // Focus, Gol, Corolla, etc
  año: Number,             // 2018, 2020, etc
  kilometrage: Number,    // en km
  combustible: 'nafta' | 'diesel' | 'gnc' | 'hibrido' | 'eléctrico',
  transmisión: 'manual' | 'automático',
  carroceria: 'sedan' | 'hatchback' | 'suv' | 'pickup' | 'coupé' | 'furgón',
  color: String,
  precio: Number,          // en ARS
  precioDolar: Number,    // opcional, precio referencia USD
  operation: 'venta' | 'reservado' | 'vendido',
  images: [String],        // URLs de fotos
  features: {
    aireAcondicionado: Boolean,
    direcciónAsistida: Boolean,
    levantavidrios: Boolean,
    airbags: Boolean,
    abs: Boolean,
    stereo: Boolean,
    gps: Boolean,
    sunroof: Boolean,
    tracción: '4x2' | '4x4' | 'AWD',
  },
  description: String,     // descripción libre del vehículo
  observaciones: String,   // état actual, detalles
  savedBy: [ObjectId],    // usuarios que guardaron favorito
  createdAt: Date
}
```

### Campos que se reutilizan del schema Property
- `_id`, `createdAt` — mismo pattern
- `images`, `savedBy`, `description` — idénticos
- `price` → `precio` (mismo concepto)
- `owner` — el admin que cargó el vehículo

### Campos nuevos específicos de vehicles
| Campo | Tipo | Notas |
|---|---|---|
| `marca` | String | Requerido, indexado para filtro |
| `modelo` | String | Requerido |
| `año` | Number | Range: 1990-2026 |
| `kilometraje` | Number | En km, sin comas |
| `combustible` | Enum | 5 opciones |
| `transmisión` | Enum | 2 opciones |
| `carroceria` | Enum | 6 opciones |
| `color` | String | |
| `precioDolar` | Number | Opcional,参考 |
| `observaciones` | String | Detalles del estado actual |
| `operation` | Enum | 3 estados de stock |

### Indexación recomendada (Mongoose)
```js
VehicleSchema.index({ marca: 1, modelo: 1 });
VehicleSchema.index({ precio: 1 });
VehicleSchema.index({ año: 1 });
VehicleSchema.index({ operation: 1 });
VehicleSchema.index({ kilometrage: 1 });
```

---

## Páginas del sistema

### / (Home)
- Hero con búsqueda por marca/modelo
- Últimos ingresos (últimos 6 vehicles con `operation: 'venta'`)
- Marcas destacadas (logos)
- Stats: años en el mercado, vehículos vendidos, clientes
- CTA WhatsApp

### /vehicles (Catálogo)
- Grid de VehicleCard
- Filtros: marca, año (range), km (range), precio (range), combustible, transmisión, carroceria
- Query string params para filtros (como Ruatta)
- Sorting: precio menor/mayor, año más nuevo, más reciente

### /vehicles/[id] (Detalle)
- Galería de fotos (photoswipe)
- Ficha técnica completa
- Features checklist
- Precio en ARS + USD si aplica
- Botón WhatsApp con mensaje pre-armado
- Vehículos relacionados (misma marca/modelo)
- Botón guardar/favorito

### /vehicles/add (Alta de vehículo) — Admin
- Formulario de carga con todos los campos
- Upload múltiple de imágenes
- Preview antes de publicar

### /profile (Perfil del usuario)
- Vehículos guardados
- Consultas enviadas

### /messages (Mensajes)
- Sistema de contacto (como en propiedades)

---

## Estructura de URLs

```
app/
  page.jsx                    # Homepage
  layout.jsx                  # Root layout
  vehicles/
    page.jsx                  # Catálogo
    add/page.jsx               # Agregar vehículo (admin)
    [id]/
      page.jsx                # Detalle
      edit/page.jsx           # Editar (admin)
  profile/page.jsx
  messages/page.jsx
  api/
    auth/[...nextauth]/
    vehicles/
  actions/
    addVehicle.js
    updateVehicle.js
    deleteVehicle.js
    bookmarkVehicle.js
```

---

## Filtros de búsqueda — query params

```
/vehicles?marca=Toyota&modelo=Corolla&añoMin=2018&añoMax=2023&kmMin=0&kmMax=50000&precioMin=5000000&precioMax=15000000&combustible=nafta&transmisión=automático&carroceria=sedan&sort=precio-asc
```

---

## WhatsApp Integration

```js
// Genera link con datos del vehículo
const generateWhatsAppLink = (vehicle, phone) => {
  const msg = `Hola! Vi el ${vehicle.año} ${vehicle.marca} ${vehicle.modelo} en su web. ¿Está disponible?`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
};
```

---

## Comparación — Sistema Properties vs Vehicles

| Aspecto | Properties | Vehicles |
|---|---|---|
| Filtro principal | ubicación, type, operación | marca, modelo, año |
| Atributos visuales | beds, baths, area, garage | km, año, combustible |
| Status | venta/alquiler | venta/reservado/vendido |
| Mapa | sí | no (no aplica geolocalización) |
| Galería | fotos | fotos + possibly video |
| Hero búsqueda | ubicación texto | marca/modelo |
| Mapa de features | no | sí (especificaciones mecánicas) |

---

## Decisiones de diseño aún abiertas

1. **¿Mostrar precio en dólares, pesos, o ambos?** Ruatta muestra solo pesos. Autocity muestra pesos. Recomendación: pesos ARS con precio USD como参考 opcional.

2. **¿Unicación del dealer?** Ruatta tiene una sola sede. Autocity tiene varias sucursales. Para agency de 30-40 autos: una sola sede es lo normal.

3. **¿Integración con APIs de terceros?**Autos usados no suelen sincronizar con fuentes externas (a diferencia de 0km). Carga manual.

4. **¿Motos?** Ruatta incluye /motos. Si la agency también vende motos, el schema Vehicles puede tener un campo `categoria: 'auto' | 'moto'` o se separa en dos modelos.

5. **¿Planes de ahorro o financiación?** Autocity tiene sección de BNA. Si se ofrece financing, habría que agregar campos de financing options.

---

## MVP Scope — v1.0

- Alta, edición, baja de vehículos (admin)
- Catálogo con filtros (marca, año, km, precio)
- Detalle con galería + WhatsApp
- Favoritos por usuario
- Responsive mobile
- Sin ecommercé, sin payment, sin cart

---

## Posibles v2.0

- Reservas online (estado: `reservado`)
- Múltiples sucursales con ubicación en mapa
- Importación masiva de inventario (CSV)
- Estadísticas de consultas/vistas por vehículo
- Integración con Mercado Libre (publicación automática)
- Comparador de hasta 3 vehículos
