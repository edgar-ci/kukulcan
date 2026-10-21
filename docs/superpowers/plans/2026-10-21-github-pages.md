# GitHub Pages Implementation Plan

**Goal:** Preparar la publicación automática del laboratorio en GitHub Pages.

**Architecture:** GitHub Actions instala dependencias, ejecuta las pruebas y compila antes de publicar `dist/`. Vite ya usa `base: './'`, compatible con la subcarpeta del repositorio y con la raíz.

**Tech Stack:** React, Vite, Node.js 22 y acciones oficiales de GitHub.

**Spec:** Petición del usuario: modificar el proyecto y agregar lo necesario para publicarlo en GitHub Pages.

## Restricciones

- Conservar los cambios existentes, el hosting actual y `heat-lab-v1`.
- Usar acciones oficiales conocidas; no añadir dependencias.
- El repositorio local todavía no tiene remoto.

## Tarea: configuración y guía de publicación

- [x] Crear `.github/workflows/deploy-pages.yml` con disparadores para `main` y ejecución manual, permisos de Pages, Node 22, `npm ci`, `npm test`, compilación y publicación.
- [x] Añadir a `README.md` los pasos para crear el remoto, subir el código, activar Pages y localizar la URL.
- [x] Ejecutar `npm test` y `npm run build`; comprobar rutas relativas y archivos del resultado.
- [x] Revisar el diff. La publicación real queda pendiente de subir el repositorio y activar Pages en GitHub.
