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

## Mesa 1: mezcla de tres vasos

Los vasos comienzan con 100 g de agua líquida a 70, 25 y 10 °C. Cada acción vierte hasta 25 g, limitada por el agua restante y la capacidad de 250 g del destino. Se pueden encadenar mezclas; las etiquetas conservan la referencia inicial y muestran la temperatura actual por separado.

`dist/mixing.js` calcula por conservación de energía, con calor específico constante e igual para ambas porciones: T final = (m destino × T destino + m vertida × T origen) / (m destino + m vertida). El origen pierde masa pero conserva la temperatura de su agua restante; los vasos vacíos no tienen temperatura de agua asignada. El modelo excluye pérdidas al ambiente, capacidad térmica del recipiente y cambios de fase. El vertido transporta materia y energía; el calor se intercambia entre las porciones a distinta temperatura al mezclarse. La animación de inclinación, superficie y chorro es ilustrativa, no un cálculo de dinámica de fluidos.

Fuente: OpenStax, University Physics Volume 2, sección 1.4, Heat Transfer, Specific Heat, and Calorimetry: https://openstax.org/books/university-physics-volume-2/pages/1-4-heat-transfer-specific-heat-and-calorimetry

Pruebas: `node tests/mixing.test.cjs`. Incluyen 22 °C al agregar 25 g a 70 °C a 100 g a 10 °C; mezcla inversa a 58 °C; vaso ambiente a 34 °C; igualdad de temperaturas; vaciado, rellenado, límite de capacidad y conservación de masa y energía durante una secuencia de 400 vertidos. Verificados en navegador el vertido, su pausa, explicación del cálculo, teclado, arrastre, movimiento reducido y distribución móvil/escritorio.

El vaso central se dibuja más ancho y admite 300 g; los laterales admiten 250 g. Los tres empiezan con 100 g (70, 25 y 10 °C). Al vaciar ambos laterales en el centro, quedan 300 g a 35 °C bajo los supuestos del modelo. Las pruebas comprueban tres órdenes de vertido y conservación de masa y energía.

Misión 2: termómetro range de −20 a 120 °C y tarjeta de 24 moléculas. Estados de agua pura a 1 atm; coexistencia ilustrativa a 0 y 100 °C, explicación de calor latente y evaporación. El control selecciona vistas de equilibrio, no integra calor o tiempo. Validación: node tests/particles.test.cjs.
