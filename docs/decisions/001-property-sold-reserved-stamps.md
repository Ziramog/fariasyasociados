# ADR 001 — Sellos Transparentes `VENDIDO`, `ALQUILADO` y `RESERVADO`

## Contexto y Decisión
Se incorporaron etiquetas especiales reservadas del sistema (`VENDIDO`, `ALQUILADO` y `RESERVADO`) sobre el campo `Property.status` para mostrar un sello diagonal delicado y transparente sobre las fotografías de las propiedades, sin alterar las imágenes originales en Cloudinary ni mostrar la pill naranja estándar de la esquina superior izquierda.

## Concordancia Gramatical y Reglas por Operación
- **Separación por operación (`operation`):**
  - Las propiedades en **`alquiler`** solo admiten **`ALQUILADO`** y **`RESERVADO`** (nunca `VENDIDO`).
  - Las propiedades en **`venta` / `compra`** solo admiten **`VENDIDO`** y **`RESERVADO`**.
  - Tanto en formularios como en Server Actions ([`addProperty.js`](../../app/actions/addProperty.js), [`updateProperty.js`](../../app/actions/updateProperty.js)) y en [`POST /api/admin/toggle-stamp`](../../app/api/admin/toggle-stamp/route.js), el estado se valida y normaliza contra `operation`.
- **Flexión de género según sustantivo (`getPropertyGrammaticalGender`):**
  - `Casa` → femenino (`VENDIDA`, `ALQUILADA`, `RESERVADA`).
  - `Departamento`, `Terreno`, `Campo` → masculino (`VENDIDO`, `ALQUILADO`, `RESERVADO`).
  - `Inmueble Comercial`, `Gran Inversión` o sin tipo → detecta el primer sustantivo relevante en `property.name` (*local, galpón, lote, complejo, edificio, hotel* → masculino; *oficina, cochera, quinta, chacra, cabaña, propiedad* → femenino), con fallback femenino por defecto.

## Diseño Implementado
- **Estilo visual elegido:** Minimalista Boutique (Opción C) con SVG vectorial inline transparente en [`components/shared/PropertyStamp.jsx`](../../components/shared/PropertyStamp.jsx):
  - `VENDIDO`/`VENDIDA` y `ALQUILADO`/`ALQUILADA`: marco rectangular fino redondeado en blanco translúcido con doble línea sutil, acentos en las esquinas e inclinación de `-14deg`.
  - `RESERVADO`/`RESERVADA`: cápsula con borde exterior discontinuo (`dashed`) en tono ámbar cálido translúcido e inclinación de `-12deg` para diferenciación visual inmediata.
- **Fuente única de verdad de estado:** [`utils/propertyDisplay.js`](../../utils/propertyDisplay.js) define `STAMP_STATUSES`, `RESERVED_SYSTEM_STATUSES`, `getPropertyGrammaticalGender`, `normalizeStampStatus`, `getStampDisplay`, `getAvailableStampOptions` y `getStatusLabel`. `getStatusBadge(property)` retorna `null` cuando la propiedad tiene sello diagonal activo.

## Activación en Admin
- **Selector `Etiqueta Especial`:** [`PropertyAddForm.jsx`](../../components/PropertyAddForm.jsx) y [`PropertyEditForm.jsx`](../../components/PropertyEditForm.jsx) muestran opciones dinámicas flexionadas según `operation`, `type` y `name`, y convierten automáticamente `VENDIDO` ↔ `ALQUILADO` al cambiar de operación. [`CustomLabelsManager.jsx`](../../components/admin/CustomLabelsManager.jsx) bloquea la creación duplicada de variantes reservadas dentro de `SiteConfig.customPropertyLabels`.
- **Atajo de 1 clic en tabla Admin:** [`AdminPropertyTable.jsx`](../../components/admin/AdminPropertyTable.jsx) muestra los botones contextuales (`Vendida`/`Vendido` o `Alquilada`/`Alquilado`, más `Reserv.` según operación y género) vía [`POST /api/admin/toggle-stamp`](../../app/api/admin/toggle-stamp/route.js) con revalidación de rutas (`/`, `/properties`, `/properties/[id]`, `/admin/properties`).

## Cobertura en Vistas Públicas, SEO y Stories
- **Tarjetas y mapas:** [`FeaturedPropertyCard.jsx`](../../components/FeaturedPropertyCard.jsx), [`PropertyCard.jsx`](../../components/PropertyCard.jsx), [`MapPropertySidebar.jsx`](../../components/MapPropertySidebar.jsx) y [`MapProperties.jsx`](../../components/MapProperties.jsx).
- **Ficha de detalle:** [`PropertyGallery.jsx`](../../components/PropertyGallery.jsx) muestra el sello en la imagen principal, mantiene visible el precio y adapta el CTA y aviso de WhatsApp ([`utils/whatsapp.js`](../../utils/whatsapp.js)); [`PropertyContactForm.jsx`](../../components/PropertyContactForm.jsx) incluye el mismo aviso; [`app/properties/[id]/page.jsx`](../../app/properties/%5Bid%5D/page.jsx) ajusta `offers.availability` en Schema.org (`SoldOut` para `VENDIDO`/`ALQUILADO`, `LimitedAvailability` para `RESERVADO`).
- **Stories IG:** [`app/api/generate-story/[id]/route.js`](../../app/api/generate-story/%5Bid%5D/route.js) renderiza el sello diagonal flexionado en la imagen generada con `next/og`.
