# Paso 02: vaso y cambios de estado

## Objetivo y decisiones aprobadas

Mejorar el vaso con un estilo ilustrado con volumen: vidrio transparente,
hielos con caras y reflejos, agua con profundidad y vapor representado con
trazos ascendentes. Mantener el termómetro y las 64 moléculas.

## Implementación

- [x] Separar el SVG y su estado visual en `src/simulations/phaseSample.js`.
- [x] Integrar el dibujo con el ciclo existente de animación, pausa y limpieza.
- [x] Interpolar tamaño, contorno, nivel y transparencia durante 1,2 segundos;
  invertir desde el estado visible cuando cambia el destino.
- [x] Añadir ondas, burbujas de ebullición y vapor esquemático; mostrar una vista
  estática con movimiento reducido.
- [x] Ampliar el vaso en móvil sin alterar las demás misiones.
- [x] Mantener los estados a 0 y 100 °C como mezclas ilustrativas. Documentar
  que la duración de la animación no es tiempo físico.

## Validación

- Pruebas unitarias de convergencia, inversión y movimiento reducido.
- Pruebas de navegador de los cinco estados a 1200, 390 y 320 px, pausa,
  inversión durante la pausa, navegación y conservación de las 64 partículas.
- Capturas de estados finales y de una transición; revisión visual de vidrio,
  agua, hielo, vapor y disposición móvil.
- Ejecutar `npm test` y `npm run e2e`; este último regenera `dist/` mediante Vite.

## Restricciones

SVG propio sin dependencias nuevas. Conservar `heat-lab-v1`, el control por
teclado y las APIs públicas. No editar los bundles de `dist/` a mano.
