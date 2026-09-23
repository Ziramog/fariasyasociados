# Blueprint: Arquitectura del CRM Inmobiliario (Farias & Asociados)

*Este documento refleja el diseño funcional y arquitectónico del CRM integrado, adaptando el Core de PRESOL al vertical inmobiliario.*

## 1. Visión General: El Circuito Completo (Portal + CRM)

El mayor valor de esta integración es unificar la administración web con la gestión de clientes en un solo ciclo:
`PUBLICACIÓN → CONSULTA (Lead) → CRM → SEGUIMIENTO → VISITA → OFERTA → CIERRE`

## 2. Los Tres Centros Operativos

El CRM no se centra solo en "Personas", sino en tres pilares que interactúan entre sí:

### A. Ficha de Cliente
*   **Rol flexible:** Una misma persona puede ser Propietario, Comprador o Inversor simultáneamente.
*   **Perfil de Búsqueda:** Define qué busca (ej. Casa, Alta Gracia, USD 100k-150k, 3 dorm).
*   **Historial:** Propiedades enviadas, visitadas, ofertas realizadas y timeline de contactos (WhatsApp, llamadas).

### B. Ficha de Propiedad (Inventario Activo)
*   **Estado:** Activa, Reservada, Vendida.
*   **Métricas:** Consultas web, Interesados, Visitas realizadas, Ofertas vigentes.
*   **Propietarios:** Relación `property_owners` que soporta múltiples dueños y porcentajes (ej. 50% / 50%).

### C. Ficha de Operación (Pipeline/Negocio)
*   **Entidad:** Representa el interés activo de un Cliente por una Propiedad específica (Ej. *María Gómez → Casa Los Aromos*).
*   **Pipelines dinámicos:** Diferentes embudos según la operación (Comprador, Propietario captación, Alquiler).
*   **Tracking:** Valor ofertado, estado, documentos asociados y próximo paso.

## 3. Arquitectura de Datos

Se reutilizan entidades genéricas del CRM Core y se añaden entidades específicas del vertical *Real Estate*.

### Core Reutilizado (MongoDB)
*   `Users` (Asesores)
*   `Contacts` (Personas)
*   `Organizations` (Empresas/Inversoras)
*   `Activities` (Llamadas, WhatsApp, Emails)
*   `Tasks` (Seguimientos y tareas)
*   `Opportunities` (Operaciones genéricas)
*   `Comments` (Notas internas)
*   `Pipelines` & `Tags`

### Vertical Inmobiliario (Nuevos Modelos)
*   `Properties` (Catálogo actual expandido)
*   `PropertyOwners` (Relación Cliente ↔ Propiedad)
*   `BuyerProfiles` (Criterios de búsqueda)
*   `PropertyInquiries` (Consultas web entrantes)
*   `PropertyMatches` (Cruce automático Cliente ↔ Propiedad)
*   `PropertyShowings` (Visitas físicas a la propiedad)
*   `Offers` (Ofertas económicas)
*   `Reservations` (Reservas formales / Señas)

## 4. Funcionalidades Diferenciales

1.  **Matching Inteligente:** Motor de reglas que compara el `BuyerProfile` con las `Properties` vigentes y calcula un % de afinidad. (En V2 se sumará IA semántica).
2.  **Alertas Inteligentes (Reglas de Negocio):**
    *   *Propiedad sin consultas hace 21 días.*
    *   *Cliente interesado sin seguimiento hace 4 días.*
    *   *Cliente visitó 3 propiedades y no tiene un "Próximo paso" agendado.*
    *   *Oferta sin respuesta hace 48hs.*
3.  **Dashboards Cruzados:** Vistas diarias para el Asesor (tareas hoy, visitas hoy) y métricas semanales para Dirección (conversión de leads, captaciones, propiedades estancadas).

## 5. Fases de Implementación Recomendadas

*   **Fase 1 (Real Estate V1 - CRM):** Base de clientes, relación propietarios, catálogo de propiedades, perfil de búsqueda básica, registro de actividades, tareas, visitas físicas (Showings) y oportunidades.
*   **Fase 2 (Matching & Feedback):** Sistema automático de matching Cliente-Propiedad, registro de propiedades enviadas, feedback de las visitas, y motor de alertas inteligentes.
*   **Fase 3 (Portal Integrado):** Conexión profunda Web ↔ CRM (Ingreso de leads directos a la ficha, actualización de estados de propiedades impactando en la web).
*   **Fase 4 (Operaciones Formales):** Ofertas vinculantes, reservas, contratos, gestión documental (Títulos, planos) y comisiones.
*   **Fase 5 (IA & Automatización):** Enriquecimiento de perfiles, matching semántico ("busco algo verde y tranquilo"), y sugerencias proactivas de seguimiento.
