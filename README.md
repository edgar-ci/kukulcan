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
