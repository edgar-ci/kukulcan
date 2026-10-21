# Simplificar las mesas — Implementation Plan

**Goal:** Una instrucción principal por mesa, con ayuda y supuestos disponibles bajo demanda.
**Architecture:** Mantener los motores y sus mensajes dinámicos; usar details/summary nativos para controles y modelo. React conserva la nota como nodo hoja del adaptador.
**Tech Stack:** React, JavaScript, CSS, Playwright.
**Spec:** Auditoría de las siete mesas aprobada en esta conversación.

## Constraints
- Conservar español, física, controles, progreso heat-lab-v1 y cambios anteriores.
- No añadir dependencias ni modificar cambios ajenos.

## Implementation
- [x] Eliminar lemas y objetivos redundantes. Mantener scene-bubble como instrucción dinámica.
- [x] Poner instrucciones alternativas en Cómo interactuar y notas en Sobre el modelo, cerrados inicialmente.
- [x] Reducir duplicación en vasos, partículas, bloques, parejas y sartén; conservar mediciones, rangos y resultados útiles.
- [x] Verificar navegación, ayudas con teclado, reinicio, móvil y simulaciones con pruebas existentes y una regresión de ayudas.
- [x] Regenerar dist y revisar capturas.

## Review focus
- Selectores de elementos retirados no deben romper el montaje.
- Reset y reduced motion conservan ayudas funcionales.
- Errores y pasos siguientes siguen anunciándose mediante role=status.
- Notas científicas completas siguen accesibles.
- Ayudas abiertas no causan desbordamiento móvil.
