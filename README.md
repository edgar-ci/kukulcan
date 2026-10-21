# Laboratorio del calor

Aplicación estática en español para estudiantes de 12 años. Siete misiones, experimentos SVG, diccionario, retos, cuaderno de consulta y evaluación final.

## Abrir y editar

Abrir `dist/index.html` directamente o servir `dist` con cualquier servidor estático. Para vista previa: `python3 -m http.server 4173 --directory dist`.

- `dist/content.js`: contenido educativo, preguntas y valores del libro.
- `dist/app.js`: navegación, simulaciones y ejercicios.
- `dist/style.css`: diseño adaptable y movimiento reducido.

No requiere instalación, cuentas ni backend. El progreso se guarda en localStorage; si no está disponible, se conserva en memoria durante la sesión. Los enlaces externos y la fuente tipográfica requieren conexión; hay tipografías de respaldo.

## Criterios científicos

Fuente principal: imagen facilitada, Conexiones Física 2.º, lectura 15, pp. 68–69. Las simulaciones son modelos educativos sin escala temporal física. En equilibrio se usan bloques de igual capacidad térmica y sin pérdidas. Para calorías se usa la aproximación del libro (4.187 J/cal), indicando la convención de 4.184 J/cal. La tabla reproduce los ocho materiales y sus valores, normalizando unidades.

Se aclara la diferencia entre cerrado y aislado, entre temperatura y energía total y entre conducción y aislamiento. Referencia de apoyo: https://openstax.org/books/university-physics-volume-2/pages/1-4-heat-transfer-specific-heat-and-calorimetry

Exploración: https://phet.colorado.edu/es/simulations/energy-forms-and-changes

## Mesas interactivas (segunda versión)

`dist/scenes.js` contiene las siete escenas. Los objetos son botones HTML con dibujos SVG; las combinaciones aceptan selección seguida de destino, teclado y arrastre con Pointer Events. Una sola burbuja guía cada actividad. Se separan los estados de selección, observación y resultado; las animaciones usan requestAnimationFrame sobre elementos persistentes y se cancelan al salir.

El progreso de las misiones mantiene la clave original `heat-lab-v1`. Los juegos no marcan misiones como completadas: eso sigue dependiendo del reto conceptual.

Se mantienen los ocho materiales, el conversor, el cuaderno y el diccionario. Los rangos de termómetros del minijuego son ejemplos ficticios y están identificados como tales.

### Verificación de la segunda versión

Probado en el navegador integrado en escritorio y anchura móvil: selección y arrastre de objetos, emparejamiento correcto e incorrecto, bloques a 30 y 50 °C, funda en ambos recipientes, tres encargos, sartén con acero/cobre y mango correcto/incorrecto, conversor, arrastre fuera del destino, teclado y emulación de movimiento reducido. El progreso anterior se conserva. Comprobación sintáctica de los archivos JavaScript completada. La revisión de accesibilidad incluyó el árbol accesible y navegación por teclado; no fue una auditoría con lector de pantalla externo.
