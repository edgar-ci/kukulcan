# Bloques apilables

Implementar en esta sesión la mejora solicitada de la misión 3.

- [x] Crear un modelo de intercambio entre vecinos de igual capacidad térmica que conserve la suma de temperaturas; probar límites, equilibrio y orden.
- [x] Sustituir la escena por cuatro bloques apilables mediante arrastre o selección y destino, con temperaturas y colores continuos, pausa, retirada y reinicio.
- [x] Ajustar el contenido para explicar pilas de varios bloques y tiempo ilustrativo.
- [x] Verificar arrastre real, teclado, movimiento reducido, cambios durante el intercambio y móvil; compilar `dist`.

Archivos: `src/simulations/thermal-stack.js`, `src/simulations/blocks.js`, integración en `scenes.js`, estilos, contenido y pruebas. Sin nuevas dependencias.

Validación: 9 pruebas de Node y 8 pruebas de navegador aprobadas. Verificación adicional de las 3 pruebas de apilado aprobada con toques reales de Playwright y navegación durante el intercambio. Compilación de producción completada; capturas de escritorio y móvil revisadas.
