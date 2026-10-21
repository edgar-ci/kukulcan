import { sampleMarkup, createSample, advanceSample, createSamplePainter } from './phaseSample.js';

/* Qualitative water states at 1 atm. Temperature selects equilibrium snapshots,
   not heating time or energy. Coexisting phase proportions are illustrative. */
  function phaseAt(t){
    if(!Number.isFinite(t)||t < -20||t > 120)throw new RangeError('Temperatura fuera del modelo.');
    return t<0?'ice':t===0?'melting':t<100?'water':t===100?'boiling':'gas';
  }
  const particleCount=64;
  const reflect=(x,span)=>{const n=((x%(2*span))+2*span)%(2*span);return n<=span?n:2*span-n;};
  function weightsFor(phase,i){
    const kind=phase==='melting'?(i%2?'ice':'water'):phase==='boiling'?(i%2?'water':'gas'):phase;
    return ['ice','water','gas'].map(name=>Number(name===kind));
  }
  function createMotion(t){
    const model={temperature:t,clock:0,points:Array.from({length:particleCount},(_,i)=>({x:160,y:120,previousX:160,previousY:120,weights:weightsFor(phaseAt(t),i)}))};
    return advanceMotion(model,t,0,true);
  }
  function advanceMotion(model,t,dt,snap=false){
    const phase=phaseAt(t);
    dt=Math.max(0,Math.min(.08,dt));
    const blend=snap?1:1-Math.exp(-dt/.65),follow=snap?1:1-Math.exp(-dt/.12);
    model.temperature+=(t-model.temperature)*blend;
    // Exaggerated visual speed for teaching, not a molecular speed measurement.
    model.clock+=dt*(.35+2.65*(model.temperature+20)/140);
    const time=model.clock;
    model.points.forEach((point,i)=>{
      if(dt>0){point.previousX=point.x;point.previousY=point.y;}
      const target=weightsFor(phase,i);
      point.weights=point.weights.map((w,k)=>w+(target[k]-w)*blend);
      const row=Math.floor(i/8);
      const ice=[71+(i%8)*24+(row%2)*12+Math.sin(time*4+i)*1.2,35+row*20+Math.cos(time*4+i)*1.2];
      const width=228;
      const water=[46+reflect((i%8)*29+(row%2)*14+time*(7+row%3*2)*(row%2?1:-1),width),100+row*10+Math.sin(time*1.3+i*2.4)*4+Math.cos(time*.7+i)*2];
      const gas=[12+reflect(((.5+i*.754877666)%1)*296+time*(24+i%5*6)*(i%2?1:-1),296),12+reflect(((.5+i*.569840296)%1)*186+time*(19+i%3*5),186)];
      const locations=[ice,water,gas];
      const x=locations.reduce((sum,p,k)=>sum+p[0]*point.weights[k],0);
      const y=locations.reduce((sum,p,k)=>sum+p[1]*point.weights[k],0);
      point.x+=(x-point.x)*follow;point.y+=(y-point.y)*follow;
    });
    // Gentle visual separation keeps nearby liquid/gas spheres readable. This is
    // not a molecular collision solver; solid sites stay anchored to their lattice.
    if(dt>0||snap){
      for(let pass=0;pass<2;pass++){
        for(let i=0;i<particleCount;i++)for(let j=i+1;j<particleCount;j++){
          const a=model.points[i],b=model.points[j];
          const dx=b.x-a.x,dy=b.y-a.y,distance=Math.hypot(dx,dy);
          if(distance>=12)continue;
          const mobilityA=1-a.weights[0],mobilityB=1-b.weights[0];
          const total=mobilityA+mobilityB;
          if(total<.001)continue;
          const nx=distance>.001?dx/distance:Math.cos(i+j);
          const ny=distance>.001?dy/distance:Math.sin(i+j);
          const push=(12-distance)*.7;
          a.x-=nx*push*mobilityA/total;a.y-=ny*push*mobilityA/total;
          b.x+=nx*push*mobilityB/total;b.y+=ny*push*mobilityB/total;
        }
        model.points.forEach(point=>{
          point.x=Math.max(12,Math.min(308,point.x));
          point.y=Math.max(12,Math.min(198,point.y));
        });
      }
    }
    if(snap)model.points.forEach(point=>{point.previousX=point.x;point.previousY=point.y;});
    return model;
  }
  const latticeEdges=Array.from({length:particleCount},(_,i)=>[
    ...(i%8<7?[[i,i+1]]:[]),...(i<56?[[i,i+8]]:[])
  ]).flat();
  // Display colors encode temperature, not a change in the water's substance.
  function temperaturePalette(temperature){
    const stops=[[-20,[43,107,191]],[25,[32,139,159]],[60,[185,132,33]],[100,[210,79,34]],[120,[180,48,49]]];
    const t=Math.max(-20,Math.min(120,temperature));
    const upper=stops.findIndex(stop=>stop[0]>=t);
    const [end,colorB]=stops[upper];
    const [start,colorA]=stops[Math.max(0,upper-1)];
    const ratio=end===start?0:(t-start)/(end-start);
    const base=colorA.map((value,i)=>value+(colorB[i]-value)*ratio);
    const tint=(amount,target=255)=>`rgb(${base.map(value=>Math.round(value+(target-value)*amount)).join(',')})`;
    return { highlight:tint(.82),light:tint(.4),body:tint(0),edge:tint(.32,0),background:tint(.86),glow:tint(.97),border:tint(.6) };
  }
  function mount({board,q,goal,note,say,readout,animate,reduced,helpers}){
    goal('Del hielo al vapor: mueve el termómetro');
    note('Agua a 1 atm (presión atmosférica normal). Vista cualitativa: tamaños, distancias y velocidades no están a escala. El control elige temperatura, no cantidad de calor.');
    q('.scene-footer small').textContent='Arrastra el termómetro o usa las flechas del teclado.';
    board.innerHTML=`<div class="phase-lab">
      <div class="phase-sample"><span class="phase-eyebrow">A SIMPLE VISTA</span>
        ${sampleMarkup}<strong id="phase-name"></strong><p id="phase-caption"></p>
      </div>
      <aside class="phase-card" aria-label="Vista ampliada de las partículas"><span class="phase-eyebrow">BAJO LA LUPA · H₂O</span><h3 id="particle-heading">Cerca, pero libres de moverse</h3>
        <button id="particle-definition" class="phase-particles" aria-label="Qué representan las partículas"><svg viewBox="0 0 320 210" aria-hidden="true"><defs><radialGradient id="molecule-sphere" cx="30%" cy="25%" r="75%"><stop stop-color="var(--particle-highlight)"/><stop offset=".3" stop-color="var(--particle-light)"/><stop offset=".72" stop-color="var(--particle-body)"/><stop offset="1" stop-color="var(--particle-edge)"/></radialGradient></defs>
          <g class="particle-lattice" stroke="var(--particle-body)" stroke-width=".8">${latticeEdges.map(()=>'<path/>').join('')}</g>
          <g class="particle-trails" fill="none" stroke="var(--particle-body)" stroke-width="2" stroke-linecap="round">${Array.from({length:particleCount},()=>'<path/>').join('')}</g>
          <g class="particle-spheres">${Array.from({length:particleCount},()=>'<circle r="5.5" fill="url(#molecule-sphere)" stroke="var(--particle-edge)" stroke-opacity=".45" stroke-width=".6"/>').join('')}</g></svg><span>¿Qué estoy viendo? ↗</span></button>
        <p id="particle-description"></p>
      </aside>
      <div class="phase-control"><div class="phase-control-heading"><label for="water-temperature">Desliza la temperatura</label><output id="water-temperature-value" for="water-temperature">25 °C</output></div>
        <div class="thermometer-range"><span class="thermometer-bulb" aria-hidden="true"></span><input type="range" id="water-temperature" min="-20" max="120" step="1" value="25" aria-describedby="temperature-help phase-boundary"></div>
        <div class="temperature-ticks" aria-hidden="true"><span style="left:0">−20 °C</span><span style="left:14.2857%">0 °C</span><span style="left:85.7143%">100 °C</span><span style="left:100%">120 °C</span></div>
        <div class="temperature-ends"><span>❄ Frío</span><span>Caliente ☀</span></div>
        <p id="temperature-help">Prueba por debajo de 0 °C y por encima de 100 °C. Después vuelve a enfriar.</p>
        <p id="phase-boundary"></p><button class="text-button" id="phase-science">¿Por qué a veces el calor no sube la temperatura? ↗</button>
      </div></div>`;
    let temperature=25,phase=phaseAt(temperature),lastTime=0;
    const dots=[...q('.phase-particles').querySelectorAll('circle')];
    const links=[...q('.particle-lattice').querySelectorAll('path')];
    const trails=[...q('.particle-trails').querySelectorAll('path')];
    const descriptions={
      ice:['Hielo · sólido','Conserva su forma.','Vibran en su lugar','Las moléculas forman una estructura ordenada. Vibran: no están inmóviles.'],
      melting:['Hielo + agua','A 0 °C pueden coexistir.','Una estructura que se transforma','Al fundirse, unas moléculas dejan la estructura del hielo y pueden desplazarse en el líquido. Al congelarse ocurre lo contrario.'],
      water:['Agua · líquido','Fluye y toma la forma del recipiente.','Cerca, pero libres de moverse','Las moléculas permanecen próximas y cambian de vecinas. Al subir la temperatura aumenta su agitación promedio.'],
      boiling:['Agua + vapor','A 100 °C pueden coexistir.','Del líquido al gas, o al revés','Al hervir, moléculas pasan al gas y se separan mucho. Al condensarse vuelven al líquido y liberan energía.'],
      gas:['Vapor de agua · gas','Nube ilustrativa: el vapor de agua es invisible.','Más separadas, por todo el espacio','Las moléculas se desplazan entre choques. Siguen siendo H₂O: no crecen ni se convierten en otra sustancia.']
    };
    const particlePanel=q('.phase-particles');
    let paintedTemperature=null;
    const motion=createMotion(temperature);
    const sample=createSample(phase,temperature);
    const paintSample=createSamplePainter(q('.phase-glass'));
    function paint(){
      paintSample(sample,reduced);
      const colorTemperature=Math.round(motion.temperature*10)/10;
      if(colorTemperature!==paintedTemperature){
        const palette=temperaturePalette(colorTemperature);
        Object.entries(palette).forEach(([name,color])=>particlePanel.style.setProperty(`--particle-${name}`,color));
        paintedTemperature=colorTemperature;
      }
      dots.forEach((dot,i)=>{
        const point=motion.points[i];
        dot.setAttribute('cx',point.x);dot.setAttribute('cy',point.y);
        const dx=point.x-point.previousX,dy=point.y-point.previousY;
        const distance=Math.hypot(dx,dy),length=Math.min(11,distance*4);
        const scale=distance>.001?length/distance:0;
        trails[i].setAttribute('d',`M${point.x-dx*scale} ${point.y-dy*scale}L${point.x} ${point.y}`);
        trails[i].setAttribute('opacity',reduced?0:point.weights[2]*.28);
      });
      links.forEach((link,i)=>{
        const [a,b]=latticeEdges[i].map(index=>motion.points[index]);
        link.setAttribute('d',`M${a.x} ${a.y}L${b.x} ${b.y}`);
        link.setAttribute('opacity',Math.min(a.weights[0],b.weights[0])*.32);
      });
    }

    function update(){
      temperature=Number(q('#water-temperature').value);phase=phaseAt(temperature);
      const [name,caption,heading,description]=descriptions[phase];
      q('#water-temperature-value').textContent=temperature+' °C';q('#water-temperature').setAttribute('aria-valuetext',temperature+' grados Celsius. '+name);
      q('.phase-lab').dataset.phase=phase;q('.thermometer-range').style.setProperty('--temperature-position',((temperature+20)/140*100)+'%');
      q('#phase-name').textContent=name;q('#sample-title').textContent=name;q('#phase-caption').textContent=phase==='water'&&temperature>40?'Burbujas de aire disuelto: todavía no hierve.':caption;
      q('#particle-heading').textContent=heading;q('#particle-description').textContent=description;
      q('#phase-boundary').textContent=['melting','boiling'].includes(phase)?'En este punto, la temperatura no dice cuánto ha cambiado de estado. Mostramos una mezcla ilustrativa: absorber o liberar energía cambia las proporciones sin cambiar la temperatura.':'La agrupación y la velocidad cambian suavemente. La rapidez del dibujo está exagerada para comparar: no mide velocidades ni el tiempo real del cambio de estado.';
      advanceSample(sample,phase,0,reduced,temperature);
      if(reduced)advanceMotion(motion,temperature,0,true);
      paint();
    }
    q('#water-temperature').oninput=update;
    const explored = new Set();
    q('#water-temperature').onchange = () => {
      readout(temperature+' °C · '+descriptions[phase][0]);
      if (temperature < 0) explored.add('ice');
      if (temperature > 100) explored.add('steam');
      if (explored.size === 2) helpers.onSuccess?.();
    };
    q('#particle-definition').onclick=()=>helpers.openModal('Una lupa imaginaria','<p>Cada círculo representa una molécula de agua, H₂O. Conservamos las mismas 64 moléculas y su tamaño en todos los estados.</p><p>En el hielo vibran alrededor de posiciones ordenadas; en el agua se deslizan entre vecinas; en el gas recorren distancias mayores entre choques.</p><p>La energía cinética es energía de movimiento. Al aumentar la temperatura, aumenta en promedio. No todas las moléculas tienen la misma velocidad. Ni el hielo ni el agua a 0 °C tienen sus moléculas detenidas.</p><p>Las líneas del hielo ayudan a reconocer el orden; no representan enlaces calculados. Las estelas cortas del gas ayudan a seguir el movimiento. El azul representa temperaturas bajas; los tonos ámbar, naranja y rojo representan temperaturas más altas. El fondo sigue la misma escala. Son colores didácticos: el agua no cambia de color por calentarse. El tamaño de las moléculas se mantiene al cambiar de estado.</p><p>Es una vista esquemática, no una trayectoria molecular calculada. El hielo tiene una estructura abierta: al congelarse, el agua se expande un poco, aunque las moléculas quedan ordenadas y próximas. La gran separación ocurre al pasar a gas.</p><p>El vapor se expande mucho más de lo que cabe mostrar aquí; las moléculas no están limitadas por el recipiente abierto del dibujo.</p>');
    q('#phase-science').onclick=()=>helpers.openModal('Cambiar de estado también requiere energía','<p>Imagina hielo a 0 °C: puede recibir calor y derretirse sin subir de temperatura. Esa energía cambia cómo se organizan e interactúan sus moléculas. Se llama <b>calor latente</b>.</p><p>A presión constante de 1 atm, la fusión ocurre alrededor de 0 °C y la ebullición a 100 °C. Durante la coexistencia de las fases, la temperatura se mantiene mientras cambia la proporción de cada estado. Al congelarse o condensarse, el agua libera energía.</p><p>Este termómetro selecciona vistas a diferentes temperaturas: no mide calor ni simula cuánto tarda la transformación. Las proporciones dibujadas a 0 y 100 °C son ilustrativas, no calculadas. La duración de la animación tampoco representa el tiempo físico de transformación.</p><p>Antes de hervir pueden aparecer pequeñas burbujas de aire disuelto que sale del agua al calentarse. No hay una temperatura universal de aparición: influyen el gas disuelto, el recipiente y las condiciones de calentamiento. Aquí empiezan gradualmente por encima de 40 °C como recurso ilustrativo, no como umbral físico. Al acercarse a 100 °C aumentamos el burbujeo para mostrar la progresión hacia la ebullición; a 100 °C las burbujas representan vapor de agua. La lupa sigue mostrando solo moléculas de agua, no el aire disuelto.</p><p>El agua también se evapora por debajo de 100 °C. Hervir y evaporarse no son lo mismo. El vapor de agua es invisible: la nube blanca sobre una olla está formada por gotitas líquidas.</p><p><a href="https://openstax.org/books/college-physics-2e/pages/14-3-phase-change-and-latent-heat" target="_blank" rel="noopener noreferrer">Explora los cambios de estado en OpenStax (inglés) ↗</a></p><p><a href="https://smallscience.hbcse.tifr.res.in/wp-content/uploads/2016/05/C4EnglishTeachersBook.pdf" target="_blank" rel="noopener noreferrer">Burbujas de aire antes de hervir: Small Science, TIFR (inglés, PDF) ↗</a></p>');
    say('Mueve el termómetro: hacia el azul para enfriar y hacia el naranja para calentar. Mira qué cambia bajo la lupa.');
    update();
    animate(1,t=>{const dt=t-lastTime;lastTime=t;advanceMotion(motion,temperature,dt);advanceSample(sample,phase,dt,false,temperature);paint();},null,true);
  }
export { phaseAt,particleCount,createMotion,advanceMotion,temperaturePalette,mount };
