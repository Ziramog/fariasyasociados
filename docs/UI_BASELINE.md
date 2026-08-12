# Línea Base de Interfaz de Usuario (UI Baseline)

## 1. Estado Visual Actual (Homepage y Estructura Global)
- **Tema y Paleta**: Predominan los fondos oscuros (`bg-black`), detalles en blanco y un color de marca primario (`var(--color-brand)`) utilizado en botones y estados hover.
- **Tipografías**: 
  - `Cormorant Garamond` para títulos decorativos y encabezados (Font-Display).
  - `PT Serif` para acentos.
  - `Lato` para cuerpos de texto e interfaz general.
- **Navegación**: 
  - Desktop: Navbar transparente que flota sobre el video de hero. Cambia a fondo negro (`bg-black`) al hacer scroll (pasando el 10vh).
  - Mobile: Barra compacta con botón tipo hamburguesa que activa un _full-screen overlay_ animado con fondo negro.

## 2. Orden de Secciones (Página Principal)
1. **Hero**: Video inmersivo a pantalla completa. Textos animados y buscador.
2. **Stats Bar**: Indicadores numéricos (Propiedades, Años de experiencia, Reseñas).
3. **Propiedades Destacadas**: Carrusel lateral (`FeaturedPropertiesCarousel`).
4. **Call To Action (Vendedores/Inversores)**.
5. **Nuestra Historia (Agentes)**.
6. **Reseñas de Clientes**: Carrusel animado con testimonios.
7. **Logos de Clientes**.
8. **Footer**: Enlaces de interés, redes sociales y contacto.

## 3. Comportamiento Desktop vs Mobile
- **Buscador (Hero)**: En desktop es una barra horizontal. En mobile se colapsa a un botón que despliega filtros de forma absoluta (`position: absolute`).
- **Gestos**: Carruseles de propiedades optimizados para _touch_ en móviles.

## 4. Evidencia y Clasificación de Hallazgos

| ID | Severidad | Estado de evidencia | Área | Evidencia | Reproducción | Recomendación |
| -- | --------- | ------------------- | ---- | --------- | ------------ | ------------- |
| 1 | Media | **Confirmado** | Hero/LCP | `components/Hero.jsx:167`. Etiqueta `<video>` sin atributo `poster`. | Inspección del código y DOM. No existe un frame inicial pre-cargado. | Añadir atributo `poster` con una imagen estática ultra-ligera para mejorar el LCP. |
| 2 | Baja | **Confirmado** | Navbar Mobile | `components/Navbar.jsx:251-296`. Atributos `animationDelay` de `0.4s` a `0.6s`. | Abrir menú móvil. Se observa demora perceptible en la aparición de los links. | Reducir delays estáticos (ej. `0.1s` y `0.2s`) para mayor respuesta. |
| 3 | Baja | **Descartado** | Navbar Desktop | `components/Navbar.jsx:48`. Variable `isScrolled` a `0.1vh` que activa `bg-black`. | El código garantiza el fondo negro (`isGlassMode`) protegiendo el contraste antes de alcanzar contenido claro. | Ninguna acción requerida. |
| 4 | Baja | **Descartado** | Buscador Mobile | DOM del Hero. Elemento con `position: 'absolute', top: '100%'`. | Al desplegar filtros en móvil, flotan sobre el contenido sin causar Cumulative Layout Shift (CLS). | Ninguna acción requerida. |
