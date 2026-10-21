# Laboratorio del calor

Aplicación estática en español para estudiantes de 12 años. Siete misiones, experimentos SVG, diccionario, retos, cuaderno de consulta y evaluación final.

## Desarrollo con React y Vite

Requiere Node.js 22.12 o posterior y npm.

```sh
npm ci
npm run dev
```

Vite muestra la dirección local en la terminal. Para producción:

```sh
npm run build
npm run preview
```

`dist/` es la salida generada para el hosting existente; se conserva versionada como en el proyecto original. No editar esos archivos: regenerarlos con `npm run build`. Servir el resultado por HTTP; ya no se abre mediante `file://`.

- `src/App.jsx`: navegación y progreso.
- `src/components/`: misiones, retos, diálogos y adaptador de experimentos.
- `src/data/content.js`: contenido educativo, preguntas y valores del libro.
- `src/simulations/`: modelos físicos y motor SVG, con módulos ES.
- `src/style.css`: diseño adaptable y movimiento reducido.
- `tests/`: regresiones físicas, almacenamiento y pruebas de navegador.

React gestiona la interfaz con estado y componentes. `Experiment` monta el motor SVG existente dentro de nodos propios y limpia animaciones, observadores y eventos al desmontarse. Los modelos numéricos conservan su comportamiento; no se han reescrito los dibujos como JSX.

No requiere cuentas ni backend. El progreso conserva la clave `heat-lab-v1` de localStorage; si no está disponible, se conserva en memoria durante la sesión. Los datos anteriores se recuperan al servir desde el mismo origen (protocolo, dominio y puerto). Los enlaces externos y la fuente tipográfica requieren conexión; hay tipografías de respaldo.

## Publicar en GitHub Pages

El workflow `.github/workflows/deploy-pages.yml` instala las dependencias, ejecuta las pruebas, compila y publica `dist/` cada vez que subes cambios a `main`. Usa acciones oficiales de GitHub y el token automático; no necesitas crear secretos.

1. Crea en GitHub un repositorio público vacío llamado `laboratorio-calor`, sin README ni licencia inicial.
2. En la terminal, desde esta carpeta, ejecuta lo siguiente sustituyendo `TU_USUARIO` por tu usuario de GitHub. `git add .` incluye los cambios actuales del proyecto; puedes revisarlos antes con `git status`.

   ```sh
   git add .
   git commit -m "Preparar laboratorio para GitHub Pages"
   git remote add origin https://github.com/TU_USUARIO/laboratorio-calor.git
   git push -u origin main
   ```

3. En el repositorio, abre **Settings → Pages → Build and deployment → Source** y selecciona **GitHub Actions**.
4. Abre **Actions → Publicar en GitHub Pages → Run workflow**, selecciona `main` y ejecútalo. Esto permite repetir el primer despliegue si arrancó antes de activar Pages.
5. Cuando termine en verde, abre la URL del despliegue. Normalmente será `https://TU_USUARIO.github.io/laboratorio-calor/`.

Para actualizaciones posteriores basta con guardar un commit y hacer `git push`. Si usas otro nombre de repositorio, cámbialo en el comando del remoto y en la URL. El workflow espera la rama `main`.

Vite ya utiliza `base: './'`: los recursos compilados tienen rutas relativas y funcionan dentro de la subcarpeta de Pages. El workflow recompila desde el código fuente; no depende de que `dist/` esté actualizado en Git. El progreso local no se transfiere al nuevo dominio.

Referencia: [guía oficial de Vite para GitHub Pages](https://vite.dev/guide/static-deploy#github-pages).

## Pruebas

```sh
npm test
npx playwright install chromium  # Solo la primera vez
npm run e2e
```

`npm test` ejecuta las pruebas con Node. `npm run e2e` compila y arranca una vista previa en el puerto 4173 para comprobar misiones, progreso, diálogos, teclado, movimiento reducido y diseño móvil con Chromium.

## Criterios científicos

Fuente principal: imagen facilitada, Conexiones Física 2.º, lectura 15, pp. 68–69. Las simulaciones son modelos educativos sin escala temporal física. En equilibrio se usan bloques de igual capacidad térmica y sin pérdidas. Para calorías se usa la aproximación del libro (4.187 J/cal), indicando la convención de 4.184 J/cal. La tabla reproduce los ocho materiales y sus valores, normalizando unidades.

Se aclara la diferencia entre cerrado y aislado, entre temperatura y energía total y entre conducción y aislamiento. Referencia de apoyo: https://openstax.org/books/university-physics-volume-2/pages/1-4-heat-transfer-specific-heat-and-calorimetry

Exploración: https://phet.colorado.edu/es/simulations/energy-forms-and-changes

## Mesas interactivas (segunda versión)

`src/simulations/scenes.js` contiene las siete escenas. Los objetos son botones HTML con dibujos SVG; las combinaciones aceptan selección seguida de destino, teclado y arrastre con Pointer Events. Una sola burbuja guía cada actividad. Se separan los estados de selección, observación y resultado; las animaciones usan requestAnimationFrame sobre elementos persistentes y se cancelan al salir.

El progreso de las misiones mantiene la clave original `heat-lab-v1`. Los juegos no marcan misiones como completadas: eso sigue dependiendo del reto conceptual.

Se mantienen los ocho materiales, el conversor, el cuaderno y el diccionario. Los rangos de termómetros del minijuego son ejemplos ficticios y están identificados como tales.

### Verificación de la segunda versión

Probado en el navegador integrado en escritorio y anchura móvil: selección y arrastre de objetos, emparejamiento correcto e incorrecto, bloques a 30 y 50 °C, funda en ambos recipientes, tres encargos, sartén con acero/cobre y mango correcto/incorrecto, conversor, arrastre fuera del destino, teclado y emulación de movimiento reducido. El progreso anterior se conserva. Comprobación sintáctica de los archivos JavaScript completada. La revisión de accesibilidad incluyó el árbol accesible y navegación por teclado; no fue una auditoría con lector de pantalla externo.

## Mesa 1: mezcla de tres vasos

Los vasos comienzan con 100 g de agua líquida a 70, 25 y 10 °C. Cada acción vierte hasta 25 g, limitada por el agua restante y la capacidad de 250 g del destino. Se pueden encadenar mezclas; las etiquetas conservan la referencia inicial y muestran la temperatura actual por separado.

`src/simulations/mixing.js` calcula por conservación de energía, con calor específico constante e igual para ambas porciones: T final = (m destino × T destino + m vertida × T origen) / (m destino + m vertida). El origen pierde masa pero conserva la temperatura de su agua restante; los vasos vacíos no tienen temperatura de agua asignada. El modelo excluye pérdidas al ambiente, capacidad térmica del recipiente y cambios de fase. El vertido transporta materia y energía; el calor se intercambia entre las porciones a distinta temperatura al mezclarse. La animación de inclinación, superficie y chorro es ilustrativa, no un cálculo de dinámica de fluidos.

Fuente: OpenStax, University Physics Volume 2, sección 1.4, Heat Transfer, Specific Heat, and Calorimetry: https://openstax.org/books/university-physics-volume-2/pages/1-4-heat-transfer-specific-heat-and-calorimetry

Pruebas: `node tests/mixing.test.js`. Incluyen 22 °C al agregar 25 g a 70 °C a 100 g a 10 °C; mezcla inversa a 58 °C; vaso ambiente a 34 °C; igualdad de temperaturas; vaciado, rellenado, límite de capacidad y conservación de masa y energía durante una secuencia de 400 vertidos. Verificados en navegador el vertido, su pausa, explicación del cálculo, teclado, arrastre, movimiento reducido y distribución móvil/escritorio.

El vaso central se dibuja más ancho y admite 300 g; los laterales admiten 250 g. Los tres empiezan con 100 g (70, 25 y 10 °C). Al vaciar ambos laterales en el centro, quedan 300 g a 35 °C bajo los supuestos del modelo. Las pruebas comprueban tres órdenes de vertido y conservación de masa y energía.

Misión 2: termómetro range de −20 a 120 °C y tarjeta de 64 moléculas. Estados de agua pura a 1 atm; coexistencia ilustrativa a 0 y 100 °C, explicación de calor latente y evaporación. El control selecciona vistas de equilibrio, no integra calor o tiempo. Validación: node tests/particles.test.js.

Las posiciones, la distribución y la velocidad de las 64 partículas se interpolan conservando su identidad. Cambiar de temperatura durante una transición retoma el estado visual actual; pausa y movimiento reducido siguen disponibles. La velocidad se exagera con fines didácticos.

## Misión 3: bloques apilables

Cuatro bloques iguales empiezan a 20, 40, 60 y 80 °C. Arrastra uno sobre otro para formar una pila, o selecciona un bloque y toca su destino. Puedes añadir bloques mientras intercambian calor, pausar, retirar el de arriba y reiniciar. Un bloque retirado conserva su temperatura actual.

`src/simulations/thermal-stack.js` calcula intercambios entre vecinos con igual capacidad térmica y sin pérdidas al ambiente. Cada intercambio conserva la suma de temperaturas, proporcional a la energía en este modelo. El equilibrio final es su promedio; el orden modifica la evolución, no el promedio. Cada bloque se aproxima como una temperatura uniforme; el tiempo no representa una medición física.

`src/simulations/blocks.js` muestra la pila y actualiza las caras SVG con una escala continua azul–naranja. Los valores numéricos acompañan al color. Con movimiento reducido se muestra directamente el equilibrio. Las pruebas cubren conservación, vecindad, teclado, arrastre, pausa, añadir y retirar bloques, reinicio y móvil.
