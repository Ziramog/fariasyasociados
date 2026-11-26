# Auditoría de `property-pulse-nextjs` (Roggero & Roma) → Mejoras a importar en `farias-asociados`

**Fecha de auditoría:** 2026-11-26  
**Repositorios comparados:**
- Origen: `C:\Projects\property-pulse-nextjs` (Roggero & Roma)
- Destino: `c:\Projects\farias-asociados` (Farías & Asociados)

---

## Resumen Ejecutivo

Ambos proyectos comparten la misma base arquitectónica (Next.js 14 App Router, Mongoose, Cloudinary, Mapbox/Google Maps, PhotoSwipe, `@react-pdf/renderer`). Sin embargo, `property-pulse-nextjs` evolucionó en **búsqueda semántica, flujo completo de alquileres/monedas, lightbox móvil, ordenamiento independiente de galería, suite de difusión en redes (Story + Carrusel Feed + Social Studio 2.9)** y algunas correcciones de estabilidad.

Por su parte, `farias-asociados` cuenta con módulos exclusivos muy valiosos (**CRM inmobiliario, Smart Add por audio, sellos `VENDIDO/ALQUILADO/RESERVADO` por género, `config/site.js`, `XintelExporter`, `area_unit` en hectáreas, `computeMapCenter`, `getReviewStats` y tema oscuro Charcoal `#141412`**) que **deben preservarse intactos** durante cualquier importación.

---

## Listado Priorizado de Mejoras a Importar

### Prioridad Alta — Catálogo, Búsqueda y UX Core _(IMPLEMENTADO en 2026-11-26)_

> **Estado:** Ítems 1–4 importados y verificados en `farias-asociados` preservando `config/site.js`, tema oscuro Charcoal `#141412`, `PropertyStamp`, `area_unit` en hectáreas y sin abreviaturas `k` en precios. (Categoría `Dúplex` quedó pendiente como ítem opcional #10; en `searchSemantics.js` términos como `duplex` se dejan como búsqueda literal para encontrar propiedades cargadas bajo `Casa`/`Departamento`).

#### 1. Búsqueda semántica en lenguaje natural
- **Archivos origen:** `utils/searchSemantics.js`, `components/Hero.jsx`, `components/PropertiesSearch.jsx`, `app/properties/PropertiesContent.jsx`.
- **Qué aporta:** `interpretSearchTerm(rawTerm)` normaliza acentos/mayúsculas y detecta automáticamente el **tipo de propiedad** (sinónimos: `lote`, `depto`, `galpón`, `chacra`, `dúplex`, `chalet`, etc.) y la **operación** (`venta`, `vendo`, `comprar`, `alquiler`, `alquilo`, `renta`), limpiando esas palabras clave del término literal antes de consultar MongoDB. Funciona tanto en los buscadores cliente (`Hero`, `PropertiesSearch`) como de fallback SSR en `PropertiesContent`.
- **Por qué importarlo:** Evita resultados vacíos cuando un usuario busca *"casa en venta san francisco"* o *"lote alquiler"*.

#### 2. Ordenamiento por defecto "Más Recientes", navegación SPA y precios "Consultar" al final
- **Archivos origen:** `components/shared/SortBar.jsx`, `app/properties/PropertiesContent.jsx`, `app/properties/page.jsx`, `components/PropertiesSearch.jsx`.
- **Qué aporta:**
  - `SortBar.jsx` reemplaza `window.location.href` por `router.push(...)` (sin recarga completa de página) y fija `newest` (*Más Recientes*) como opción por defecto, manteniendo la URL limpia cuando es el orden default.
  - `PropertiesContent.jsx` ordena por `{ createdAt: -1, _id: -1 }` y en `price-asc` / `price-desc` envía explícitamente las propiedades sin precio o con `"Consultar"` al final de la lista (hoy en Farías `CONSULTAR` devuelve `0` y aparece primero al ordenar de menor a mayor).
  - Corrige la inconsistencia actual de Farías donde `SortBar` mostraba `price-desc` pero el servidor devolvía `createdAt: -1`.

#### 3. Lightbox PhotoSwipe sin deformación inicial y full-width en móvil
- **Archivos origen:** `components/shared/PropertyLightbox.jsx`, `components/PropertyGallery.jsx`, `components/FullGallery.jsx`, `components/PropertyImages.jsx`.
- **Qué aporta:**
  - Wrapper compartido `PropertyLightbox` con `showHideAnimationType: 'fade'` y caché en memoria de dimensiones reales (`registerImageDimensions(url, img)` en `onLoad`).
  - En viewports compactos (`< 900px` ancho o `< 560px` alto) elimina el padding lateral/vertical para visualización edge-to-edge y escucha `visualViewport` + `resize`/`orientationchange` para reajustar zoom y bounds al rotar el celular.
  - Elimina el prop `thumbnail` de `<Item>` para evitar el salto visual cuando una foto vertical se abría con placeholder `1920x1280`.
- **Nota de adaptación:** Conservar el `<PropertyStamp property={property} size="hero" />` y los hover overlays oscuros de Farías en `PropertyGallery.jsx` / `FullGallery.jsx`.

#### 4. Flujo completo de Alquileres y estandarización de precios ARS/USD
- **Archivos origen:** `utils/priceUtils.js`, `components/PropertyAddForm.jsx`, `components/PropertyEditForm.jsx`, `app/actions/addProperty.js`, `app/actions/updateProperty.js`, `components/PropertiesSearch.jsx`, `components/PropertyCard.jsx`, `components/FeaturedPropertyCard.jsx`, `components/Navbar.jsx`, `components/MapAllProperties.jsx`, `app/properties/page.jsx`.
- **Qué aporta:**
  - `formatPriceDisplay(priceStr, operation)` agrega `/mes` automáticamente en propiedades en alquiler y `parsePrice` maneja `CONSULTAR` explícitamente.
  - `normalizePriceValue(rawPrice, currency)` en server actions limpia formatos inconsistentes antes de persistir `${currency} ${digits}`.
  - En los formularios de carga/edición, al seleccionar `alquiler`, cambia automáticamente la moneda por defecto a `ARS` y adapta label/placeholder (*Precio de Alquiler Mensual*).
  - En `PropertiesSearch`, agrega el filtro `Operación` (`Todas`, `Venta`, `Alquiler`) con rangos de precio dinámicos (`PRECIO_RANGES_ALQUILER` en pesos ARS vs `PRECIO_RANGES` en USD) y reseteo del rango al cambiar de operación.
  - Agrega badge `Alquiler` en cards (`PropertyCard`, `FeaturedPropertyCard`), enlace directo `Alquileres` primero en el menú `Propiedades` del `Navbar`, títulos dinámicos en `/properties` (*Alquileres*, *Casas en Alquiler*, *Propiedades en Venta*) y filtro por `operation` en `MapAllProperties`.
- **Nota de adaptación:** Farías ya mejoró `getPriceDisplay` en `utils/propertyDisplay.js` para no abreviar en `k`. Conviene integrar `/mes` y `parsePrice` sin reintroducir abreviaturas ni perder `config/site.js` o `PropertyStamp`.

---

### Prioridad Alta — Administración y Redes Sociales

#### 5. Gestor unificado de fotos con orden independiente Top 7 vs Galería Completa _(IMPLEMENTADO en 2026-11-26)_
- **Archivos origen:** `components/admin/PropertyImageSorter.jsx`, `components/PropertyAddForm.jsx`, `components/PropertyEditForm.jsx`, `app/actions/addProperty.js`, `app/actions/updateProperty.js`, `app/properties/[id]/page.jsx`.
- **Estado:** Implementado con tema oscuro Charcoal y helper compartido `utils/cloudinaryClientUpload.js` usando exclusivamente `NEXT_PUBLIC_CLOUDINARY_*` (cloud/preset/folder de Farías) y conservando `area_unit` en hectáreas y `normalizeStampStatus`.
- **Qué aporta:**
  - `PropertyImageSorter` unifica carga, vista previa, drag & drop, modo numeración por click (`Hash`), botones rápidos (subir a portada, quitar de grilla principal sin borrar de galería, deshacer eliminación).
  - Separa dos órdenes independientes: las **7 fotos de la grilla superior** (`property.images`) y el **orden completo de la galería inferior** (`property.gallery_order`, campo que ya existe en `models/Property.js` de Farías pero hoy no se persiste ni se lee).
  - Corrige un bug de `updateProperty.js`: ejecuta el ordenamiento (`orderedImagesList`) **después** de incorporar las nuevas imágenes subidas, permitiendo ordenar fotos nuevas y existentes en un solo guardado.

#### 6. Generador de Carrusel Feed (4:5 / Original) + Story IG (9:16) con procesamiento en navegador
- **Archivos origen:** `components/SocialSharePanel.jsx`, `components/FeedShareButton.jsx`, `components/StoryShareButton.jsx`, `app/api/feed/[id]/route.jsx`, `app/api/story/[id]/route.jsx`, `utils/processImageInBrowser.js`, `utils/convertBlobToJpeg.js`, `utils/feedCaption.js`, `utils/socialExportAssets.js`, `utils/socialStudioAuth.js`, `components/admin/AdminPropertyTable.jsx`, `components/PropertyDetails.jsx`.
- **Qué aporta frente al actual `SocialStoryGenerator.jsx` de Farías:**
  - **Cero consumo de créditos de transformación en Cloudinary:** `processImageInBrowser.js` recorta y reescala la imagen original en `<canvas>` del navegador antes de enviarla a Satori.
  - **Carrusel Feed multi-placa (hasta 7 fotos):** soporta modo `Ampliar (4:5, 1080×1350)` y `Original (apaisado)` con proporción nativa de portada, switches ON/OFF para logo y textos, y conversión a JPEG sRGB (`convertBlobToJpeg`) con liberación explícita de memoria canvas/GPU en móviles.
  - **Compartir nativo en 2 pasos (iOS/Android):** `Preparar` → `Compartir` usando `navigator.share({ files })` sin `url` para abrir directo en Instagram, más descarga fallback en escritorio.
  - **Generador automático de Caption (`buildFeedCaption`):** arma texto limpio con moneda diferenciada por operación, viñetas físicas y extracto de descripción (protegiendo abreviaturas como `Av.`, `Ing.`), copiándolo al portapapeles.
  - **Modal "Redes" en `AdminPropertyTable`** (y acceso en `PropertyDetails` para admin/superadmin).
- **Nota de adaptación:** Reemplazar logotipo, tipografías, hashtags y dominio por los de `config/site.js` / marca Farías & Asociados. Evaluar si `XintelExporter` + `Redes` conviven en la columna de acciones sin romper el layout desktop (`cdac318`).

#### 7. Acortador público `/w/[id]` para Sticker Enlace de Instagram Stories
- **Archivos origen:** `app/w/[id]/route.js`, `utils/whatsapp.js` (`generateStoryShortWhatsAppLink`).
- **Qué aporta:** Provee una URL corta (`/w/[id]`, ~50–65 caracteres) compatible con el límite del Sticker «Enlace» de Instagram Stories, que redirige (`302`) al link completo de WhatsApp con nombre, localidad y URL de la ficha de la propiedad.
- **Nota de adaptación:** Conservar el `getPublicSiteUrl()` de `config/site.js` y la lógica de `PropertyStamp` en `utils/whatsapp.js`.

#### 8. Social Studio 2.9 embebido con Retoque IA (Opcional / Fase 2)
- **Archivos origen:** `app/admin/social-studio/page.jsx`, `app/admin/social-studio/embed/route.js`, `data/social-studio/*`, `app/api/social-studio/properties/route.js`, `app/api/social-studio/retouch/route.js`, `app/api/social-studio/generate-copy/route.js`, `models/SocialStudioUsage.js`, `next.config.mjs` (`outputFileTracingIncludes`).
- **Qué aporta:** Editor visual de 5 columnas conectado al catálogo web de propiedades, con autoguardado en IndexedDB, exportación ZIP selectiva, nubes de contraste ajustables y retoque fotográfico IA con OpenAI + control de cuota mensual (`50 créditos/mes` en `SocialStudioUsage`).
- **Esfuerzo de adaptación:** Alto (requiere rebrandear el HTML monolítico del studio y adaptar assets/colores a Farías). Conviene importarlo en una segunda etapa después de los puntos 1–7.

---

### Prioridad Media — Formularios, Datos, Auth y Estabilidad

#### 9. Servicios desglosados en formularios de propiedad
- **Archivos origen:** `components/PropertyAddForm.jsx`, `components/PropertyEditForm.jsx`.
- **Qué aporta:** Divide `Agua Corriente` en `Agua de pozo` y `Agua de Red`, agrega `Gas Envasado`, `Gas deposito Zepelin` y `Energia Solar`, e incluye helper `hasAmenity` en edición para mantener compatibilidad con propiedades cargadas previamente. Muy útil para quintas, campos y loteos.

#### 10. Categoría `Dúplex` en catálogo y filtros (si aplica al inventario)
- **Archivos origen:** `components/Navbar.jsx`, `components/PropertiesSearch.jsx`, `components/PropertyFilters.jsx`, `components/search/FilterBar.jsx`, `components/sections/CategoryCards.jsx`, `components/MapProperties.jsx`, `components/admin/AdminPropertyTable.jsx`, `app/properties/PropertiesContent.jsx`, `utils/filterProperties.js`, `components/MapAllProperties.jsx`.
- **Qué aporta:** Soporte transversal de `Dúplex` con tolerancia de tildes (`/d[uú]plex/i`).

#### 11. Hardening de `authOptions`, Analytics, `0` dormitorios/baños y precios en Admin/Mapa
- **Archivos origen:**
  - `utils/authOptions.js`: `await connectDB()` dentro del callback `session()` (previene fallos en invocaciones serverless frías) y asignación de `token.email`.
  - `utils/analytics.js`: log de advertencia única (`warnedHosts`) cuando un evento se descarta por hostname no permitido (integrar manteniendo `getAllowedAnalyticsHosts()` de `config/site.js`).
  - `components/FeaturedPropertyCard.jsx`, `components/PropertyDetails.jsx`, `components/MapProperties.jsx`: validación `!= null` en `beds`/`baths` en lugar de `> 0` o `|| null` para no ocultar monoambientes (`0` dormitorios).
  - `components/admin/AdminPropertyTable.jsx`, `components/MapView.jsx`: uso de `formatPriceDisplay(prop.price, prop.operation)` para mostrar moneda y `/mes` de forma uniforme en admin y popups de mapa.
  - `components/PropertyEditForm.jsx`: limpieza más robusta del prefijo de moneda (`USD`, `U$D`, `ARS`, `$`) al editar el precio.

---

## Elementos de `farias-asociados` a Proteger (NO sobrescribir)

1. **`config/site.js`**: centralización de dominio canónico, analytics hosts y branding (en `property-pulse-nextjs` están hardcodeados).
2. **Tema oscuro Charcoal & Brand Orange (`PROJECT_CONTEXT.md`)**: `#141412`, `#0A0A0A`, `#1C1C1A` (en `property-pulse-nextjs` usan tema claro `bg-white` / `#F6F6F6`).
3. **CRM Inmobiliario completo**: `/admin/crm`, `Contact`, `BuyerProfile`, `Activity`, `Task`, matching y funnel comercial.
4. **Sellos de estado y género gramatical**: `PropertyStamp.jsx`, `/api/admin/toggle-stamp`, `utils/propertyDisplay.js` (`getStampDisplay`, `normalizeStampStatus`, `getPropertyGrammaticalGender`) y mensajes WhatsApp diferenciados para vendidas/alquiladas/reservadas.
5. **Smart Property Add por Audio**: `/admin/properties/smart-add`, `parsePropertyAudio.js`, `ai_credits`.
6. **Superficie en hectáreas (`area_unit === 'has'`) y `total_area`**: en `PropertyAddForm`, `PropertyEditForm`, `addProperty.js`, `updateProperty.js`.
7. **Exportador Xintel**: `components/admin/XintelExporter.jsx`.
8. **Centro dinámico de mapas (`computeMapCenter`) y `fitBounds`**: en `components/shared/MapConfig.jsx`, `MapView.jsx`, `MapAllProperties.jsx`.
9. **Estadísticas reales de reseñas (`getReviewStats`)**: en `components/sections/StatsBar.jsx`.
10. **Pagos MercadoPago y configuración PDF**: `/api/checkout/mercadopago`, `/api/webhooks/mercadopago`, `PDFSettingsModal.jsx`.
