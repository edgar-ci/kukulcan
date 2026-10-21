# Card placement Implementation Plan

> **For agentic workers:** Execute the tasks in order within this session.

**Goal:** Mover las tarjetas de las misiones 05, 06 y 07 con salto, caída y espacio de origen vacío.

**Architecture:** Un adaptador de colocación conserva los botones originales, sus eventos y huecos. Anima una copia visual entre las posiciones medidas; permite recolocar la funda y devolver piezas reemplazadas.

**Tech Stack:** React existente, JavaScript, CSS, Web Animations API y Playwright. Sin dependencias nuevas.

**Spec:** Petición del usuario de este turno.

## Global Constraints

- Conservar español, clases existentes y almacenamiento `heat-lab-v1`.
- Movimiento reducido: colocación inmediata.
- Limpiar animaciones al navegar y mantener teclado y móvil.
- Regenerar `dist/` mediante build.

## Review Focus

- Recolocar funda: un solo ejemplar y hueco inicial vacío.
- Sustituir pieza: la anterior regresa a su hueco.
- Destino incorrecto: sin traslado.
- Navegar durante vuelo: sin copias ni callbacks pendientes.
- Arrastre táctil y teclado: mismos resultados sin desbordamiento.

### Task 1: Colocación animada

**Files:** Crear `src/simulations/cardPlacement.js`; modificar `src/simulations/scenes.js` y `src/style.css`; probar `tests/browser/placement.spec.js`.

**Interfaces:** `createCardPlacement(stage, reduced)` devuelve `prepare(sourceIds, targetIds)`, `place(sourceId, targetId, originRect, done)` y `dispose()`.

- [x] Añadir regresiones de traslado, sustitución, movimiento reducido y navegación.
- [x] Implementar huecos persistentes, tarjetas colocadas y vuelo con aterrizaje.
- [x] Integrar misiones 05–07 y origen de arrastre.
- [x] Ejecutar `npm test` y `npm run e2e`; inspeccionar capturas de escritorio y móvil.
- [x] Regenerar producción y revisar cambios.

**Validación:** 9 pruebas Node y 13 pruebas Playwright aprobadas. Capturas de escritorio, sartén móvil e instrumento móvil inspeccionadas. Build de producción regenerado.
