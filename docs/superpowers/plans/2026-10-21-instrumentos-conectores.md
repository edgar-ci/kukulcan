# Instrumentos con conectores — Implementation Plan

**Goal:** Cambiar la misión 06 a tres parejas ilustradas con conectores como la misión 04.
**Architecture:** Reutilizar createMatchingConnectors y los SVG existentes. Mantener rangos, mensajes de ayuda y reinicio; disponer listeners al salir.
**Tech Stack:** React, JavaScript, SVG, CSS, Playwright.
**Spec:** Petición del usuario: conectores como en el ejercicio 04 pero con imágenes.

## Restricciones
- Conservar español y almacenamiento heat-lab-v1.
- Sin dependencias nuevas. Regenerar dist mediante build.

## Implementación y validación
- [x] Sustituir la secuencia de encargos en src/simulations/scenes.js por dos columnas ilustradas.
- [x] Dar tamaño visible a los SVG en src/style.css, también en móvil.
- [x] Actualizar tests/browser/app.spec.js y cubrir errores, teclado, arrastre, reinicio y móvil en tests/browser/matching.spec.js.
- [x] Ejecutar npm test y npm run e2e; revisar captura móvil.

Validación: 14 pruebas Node y 25 pruebas Playwright aprobadas. Build regenerado; captura móvil revisada sin desbordamiento.
