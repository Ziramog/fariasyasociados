# ADR 001 — Sellos Transparentes `VENDIDO` y `RESERVADO`

## Contexto y Decisión
Se incorporaron dos etiquetas especiales reservadas del sistema (`VENDIDO` y `RESERVADO`) sobre el campo existente `Property.status` para mostrar un sello diagonal delicado y transparente sobre las fotografías de las propiedades, sin alterar las imágenes originales almacenadas en Cloudinary ni mostrar la pill naranja estándar de la esquina superior izquierda.

## Diseño Implementado
- **Estilo visual elegido:** Minimalista Boutique (Opción C) con SVG vectorial inline transparente en [`components/shared/PropertyStamp.jsx`](../../components/shared/PropertyStamp.jsx):
  - `VENDIDO`: marco rectangular fino redondeado en blanco translúcido con doble línea sutil, acentos en las esquinas e inclinación de `-14deg`.
  - `RESERVADO`: cápsula con borde exterior discontinuo (`dashed`) en tono ámbar cálido translúcido e inclinación de `-12deg` para diferenciación visual inmediata.
- **Fuente única de verdad de estado:** [`utils/propertyDisplay.js`](../../utils/propertyDisplay.js) define `STAMP_STATUSES`, `RESERVED_SYSTEM_STATUSES`, `getStampStatus(property)` y `getStatusLabel(propertyOrStatus)`. `getStatusBadge(property)` retorna `null` cuando la propiedad tiene sello diagonal activo.

## Activación en Admin
- **Selector `Etiqueta Especial`:** [`PropertyAddForm.jsx`](../../components/PropertyAddForm.jsx) y [`PropertyEditForm.jsx`](../../components/PropertyEditForm.jsx) incluyen `VENDIDO` y `RESERVADO` como opciones fijas reservadas del sistema. [`CustomLabelsManager.jsx`](../../components/admin/CustomLabelsManager.jsx) bloquea su duplicación dentro de `SiteConfig.customPropertyLabels`.
- **Atajo de 1 clic en tabla Admin:** [`AdminPropertyTable.jsx`](../../components/admin/AdminPropertyTable.jsx) permite alternar `Vendida` y `Reserv.` directamente desde cada fila vía [`POST /api/admin/toggle-stamp`](../../app/api/admin/toggle-stamp/route.js) con revalidación de rutas (`/`, `/properties`, `/properties/[id]`, `/admin/properties`).

## Cobertura en Vistas Públicas, SEO y Stories
- **Tarjetas y mapas:** [`FeaturedPropertyCard.jsx`](../../components/FeaturedPropertyCard.jsx), [`PropertyCard.jsx`](../../components/PropertyCard.jsx), [`MapPropertySidebar.jsx`](../../components/MapPropertySidebar.jsx) y [`MapProperties.jsx`](../../components/MapProperties.jsx).
- **Ficha de detalle:** [`PropertyGallery.jsx`](../../components/PropertyGallery.jsx) muestra el sello en la imagen principal, mantiene visible el precio y adapta el CTA y aviso de WhatsApp ([`utils/whatsapp.js`](../../utils/whatsapp.js)) para consultar por opciones similares; [`PropertyContactForm.jsx`](../../components/PropertyContactForm.jsx) incluye el mismo aviso; [`app/properties/[id]/page.jsx`](../../app/properties/[id]/page.jsx) ajusta `offers.availability` en Schema.org (`SoldOut` / `LimitedAvailability`).
- **Stories IG:** [`app/api/generate-story/[id]/route.js`](../../app/api/generate-story/%5Bid%5D/route.js) renderiza el sello diagonal equivalente en la imagen generada con `next/og`.
