# Reglas y Decisiones para Agentes

## Durable Knowledge
- Ningún contexto, decisión arquitectónica, auditoría importante o cambio estructural puede quedar únicamente en la carpeta temporal `.gemini/antigravity/brain`. Todo conocimiento duradero **debe materializarse obligatoriamente** en el repositorio del proyecto (por ejemplo, en `PROJECT_CONTEXT.md`, `AGENTS.md`, `docs/decisions/` u Obsidian).
- Los detalles técnicos del pipeline pertenecen a `PROJECT_CONTEXT.md`.

## Arquitectura protegida de imágenes
- Mantener `images.unoptimized=true` salvo investigación y autorización explícitas.

## Seguridad para producción
- Este proyecto está en producción.
- No ejecutar `pull`, `reset`, `checkout`, `clean`, `force push` ni descartar cambios locales sin autorización.
- No modificar ni eliminar archivos dirty o untracked preexistentes.
- No hacer `commit` ni `push` sin autorización explícita.

## Protección de secretos
- No mostrar valores de `.env`.

## Verificación antes de despliegues
- Para cambios de código o configuración, ejecutar `build` antes de proponer despliegue.
