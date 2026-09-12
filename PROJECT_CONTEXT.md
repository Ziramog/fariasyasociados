# Farias & Asociados - Contexto de Proyecto y Arquitectura

## 1. Visión General del Proyecto
**Farias & Asociados** es una plataforma inmobiliaria moderna construida sobre **Next.js 14 (App Router)**, **Tailwind CSS**, **MongoDB (Mongoose)**, y servicios auxiliares de mapas (Leaflet / Mapbox) y medios (Cloudinary).

El sitio opera en producción con un panel administrativo (`/admin`) y catálogo público de propiedades (`/properties`, `/properties/[id]`, `/properties/saved`, `/properties/search-results`).

---

## 2. Decisiones de Arquitectura y Guardrails Protegidos

### 2.1. Optimización de Imágenes (`next.config.mjs`)
- **Regla estricta:** `images.unoptimized = true` debe mantenerse activo salvo investigación formal y autorización explícita previa.
- **Razón:** Las imágenes se sirven desde Cloudinary con transformaciones y compresiones gestionadas en el pipeline de subida o cliente para evitar sobrecostos y cuellos de botella en la renderización serverless de Next.js.

### 2.2. Manejo de Git y Seguridad de Producción
- El repositorio está en producción:
  - Prohibido ejecutar comandos destructivos: `git pull`, `git reset`, `git checkout`, `git clean`, `git push --force`.
  - Nunca descartar ni alterar archivos *dirty* o *untracked* preexistentes sin autorización explícita.
  - Ningún commit o push sin aprobación previa del usuario.
- **Secretos:** Nunca exponer valores confidenciales contenidos en `.env` o archivos locales.

---

## 3. Sistema de Diseño: Tema Oscuro Charcoal & Brand Orange

El sistema visual del sitio se migró a un diseño Charcoal / Dark inspirado en el patrón de alto contraste y elegancia de `wolfim-motors-demo`, conservando intacta la identidad de marca naranja.

### 3.1. Paleta de Colores
| Token | Hex / Valor | Uso Principal |
| :--- | :--- | :--- |
| **Brand Orange** | `#fe8b01` | Acento principal, llamadas a la acción, enlaces activos, badges destacados. |
| **Brand Orange Hover** | `#E47D00` | Estados hover de botones y elementos interactivos. |
| **Body Background** | `#141412` | Fondo base global del body, secciones principales y páginas públicas del catálogo. |
| **Carbon Wrappers** | `#0A0A0A` / `bg-[#0A0A0A]` | Tarjetas de propiedades, paneles laterales, formularios, tarjetas de reviews, modales y popups. |
| **Carbon Light** | `#F5F5F2` / `#F7F8FA` | Texto primario de alta legibilidad, títulos y encabezados. |
| **Carbon Muted** | `#A6ADB8` | Texto secundario, subtítulos, etiquetas y metadata. |
| **Bordes y Divisores** | `rgba(255, 255, 255, 0.10)` (`border-white/10`) | Delimitación sutil entre secciones carbón y contenedores negros. |

### 3.2. Implementación en Componentes
1. **Layout & Globals (`assets/styles/globals.css` & `app/layout.jsx`):**
   - El fondo del `body` se establece en `#141412` (carbón) con texto `#F7F8FA`.
   - Scrollbars oscuros con track carbón `#141412` y thumb grisáceo.
   - Popups de Leaflet / Mapbox estilizados en fondo negro (`#0A0A0A`) con bordes sutiles y texto claro.
   - `ToastContainer` configurado con `theme="dark"`.
2. **Tarjetas de Propiedades (`PropertyCard.jsx` & `PropertyCardInfo.jsx`):**
   - Contenedor con `bg-[#0A0A0A] border border-white/10` y transiciones suaves de elevación.
   - Títulos en blanco con transición a `text-[var(--color-brand)]` en hover.
3. **Listado y Filtros (`app/properties/page.jsx` & `PropertiesContent.jsx`):**
   - Fondo general carbón `#141412`.
   - Contenedores de mapa de categorías y estado vacío en `bg-[#0A0A0A] border border-white/10`.
   - Sort bar y paginadores con fondos `bg-[#0A0A0A] border-white/10` y acento naranja.
4. **Ficha de Propiedad (`app/properties/[id]/page.jsx`, `PropertyDetails.jsx`, `PropertyContactForm.jsx`):**
   - Fondo carbón `#141412`.
   - Bloques de descripción, detalles, características y formulario de contacto en `bg-[#0A0A0A] border border-white/10`.
   - Formulario de contacto con inputs en `bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-500` y focus ring naranja.
5. **Secciones de Home (`FeaturedProperties.jsx`, `SellerCTA.jsx`, `Agents.jsx`, `ReviewsCarousel.jsx`, `Clients.jsx`):**
   - Fondos de sección en carbón `#141412` con divisores `border-white/5`.
   - Contenedores individuales (tarjetas de reviews, tarjetas de clientes) en `bg-[#0A0A0A] border border-white/10`.
   - Textos de títulos en blanco con acento de marca naranja.
