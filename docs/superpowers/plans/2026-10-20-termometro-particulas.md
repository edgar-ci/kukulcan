# Termómetro y estados del agua
Implementar en esta sesión, conservando navegación y retos.
1. Crear dist/particles.js: phaseAt(temperature) clasifica hielo, coexistencia a 0 °C, líquido, coexistencia a 100 °C y vapor a 1 atm; mount(context) dibuja recipiente, range nativo y tarjeta de partículas. La temperatura selecciona un estado ilustrativo; no calcula energía ni fracciones durante las transiciones.
2. Sustituir solo la escena 2 en dist/scenes.js, cargar el módulo en index.html y añadir estilos adaptables a style.css. Mantener pausa, navegación y movimiento reducido. Los círculos no cambian de número ni tamaño; actualizarlos sin reconstruir el DOM.
3. Verificar límites -20/0/100/120, teclado, enfriamiento inverso, pausa, cambio de misión y móvil; ejecutar tests/mixing.test.cjs como regresión. Publicar con Sites al mismo público privado.
