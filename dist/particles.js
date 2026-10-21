/* Qualitative water states at 1 atm. Temperature selects equilibrium snapshots,
   not heating time or energy. Coexisting phase proportions are illustrative. */
(function(root){
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
    const model={temperature:t,clock:0,points:Array.from({length:particleCount},(_,i)=>({x:160,y:120,weights:weightsFor(phaseAt(t),i)}))};
    return advanceMotion(model,t,0,true);
  }
  function advanceMotion(model,t,dt,snap=false){
    const phase=phaseAt(t);
    dt=Math.max(0,Math.min(.08,dt));
    const blend=snap?1:1-Math.exp(-dt/.65),follow=snap?1:1-Math.exp(-dt/.12);
    model.temperature+=(t-model.temperature)*blend;
    // Exaggerated visual speed for teaching, not a molecular speed measurement.
    model.clock+=dt*(.35+2.65*(model.temperature+20)/140);
    const time=model.clock,warm=(model.temperature+20)/140;
    model.points.forEach((point,i)=>{
      const target=weightsFor(phase,i);
      point.weights=point.weights.map((w,k)=>w+(target[k]-w)*blend);
      const ice=[76+(i%8)*24+Math.sin(time*4+i)*1.7,49+Math.floor(i/8)*17+Math.cos(time*4+i)*1.7];
      const width=204+warm*36,height=65+warm*17;
      const water=[160-width/2+reflect(i*37+time*(10+i%5*3),width),165-height+reflect(i*19+time*(5+i%3*2),height)];
      const gas=[12+reflect(i*47+time*(24+i%5*6)*(i%2?1:-1),296),12+reflect(i*31+time*(19+i%3*5),186)];
      const locations=[ice,water,gas];
      const x=locations.reduce((sum,p,k)=>sum+p[0]*point.weights[k],0);
      const y=locations.reduce((sum,p,k)=>sum+p[1]*point.weights[k],0);
      point.x+=(x-point.x)*follow;point.y+=(y-point.y)*follow;
    });
    return model;
  }
  function mount({board,q,goal,note,say,readout,animate,reduced,helpers}){
    goal('Del hielo al vapor: mueve el termómetro');
    note('Agua pura a 1 atm (presión atmosférica normal). Vista cualitativa: tamaños, distancias y velocidades no están a escala. El control elige temperatura, no cantidad de calor.');
    q('.scene-footer small').textContent='Arrastra el termómetro o usa las flechas del teclado.';
    board.innerHTML=`<div class="phase-lab">
      <div class="phase-sample"><span class="phase-eyebrow">A SIMPLE VISTA</span>
        <svg viewBox="0 0 240 210" role="img" aria-labelledby="sample-title"><title id="sample-title">Agua líquida</title>
          <ellipse cx="120" cy="192" rx="76" ry="8" fill="#c9d7c5"/>
          <path d="M51 42V178Q120 198 189 178V42" fill="#f8fcf780" stroke="#76968a" stroke-width="3"/>
          <g id="phase-liquid"><path d="M55 113Q90 107 120 113T185 113V176Q120 194 55 176Z" fill="#83bfce"/><path d="M55 113Q90 107 120 113T185 113" fill="none" stroke="#e6f9fa" stroke-width="3"/></g>
          <g id="phase-ice" fill="#c2e8f1" stroke="#71a8bc" stroke-width="2"><path d="M66 99L110 88 139 106 96 118Z"/><path d="M66 99L96 118V168L66 148Z"/><path d="M96 118L139 106V154L96 168Z"/><path d="M133 126l31-9 16 13-31 10Z"/><path d="M133 126l16 14v32l-16-12Z"/><path d="M149 140l31-10v32l-31 10Z"/></g>
          <g id="phase-vapor" fill="none" stroke="#9caea3" stroke-width="2" stroke-dasharray="4 5"><path d="M81 155Q54 130 81 102T81 49M120 165Q93 135 120 106T120 43M160 151Q133 120 160 91T160 33"/></g>
          <ellipse cx="120" cy="42" rx="69" ry="10" fill="none" stroke="#76968a" stroke-width="2"/>
        </svg><strong id="phase-name"></strong><p id="phase-caption"></p>
      </div>
      <aside class="phase-card" aria-label="Vista ampliada de las partículas"><span class="phase-eyebrow">BAJO LA LUPA · H₂O</span><h3 id="particle-heading">Cerca, pero libres de moverse</h3>
        <button id="particle-definition" class="phase-particles" aria-label="Qué representan las partículas"><svg viewBox="0 0 320 210" aria-hidden="true">${Array.from({length:particleCount},()=>'<circle r="5.5" fill="#26768d" stroke="#fffdf5" stroke-width="1.2"/>').join('')}</svg><span>¿Qué estoy viendo? ↗</span></button>
        <p id="particle-description"></p><span id="particle-motion" class="phase-motion"></span>
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
    const descriptions={
      ice:['Hielo · sólido','Conserva su forma.','Vibran en su lugar','Las moléculas forman una estructura ordenada. Vibran: no están inmóviles.'],
      melting:['Hielo + agua','A 0 °C pueden coexistir.','Una estructura que se transforma','Al fundirse, unas moléculas dejan la estructura del hielo y pueden desplazarse en el líquido. Al congelarse ocurre lo contrario.'],
      water:['Agua · líquido','Fluye y toma la forma del recipiente.','Cerca, pero libres de moverse','Las moléculas permanecen próximas y cambian de vecinas. Al subir la temperatura aumenta su agitación promedio.'],
      boiling:['Agua + vapor','A 100 °C pueden coexistir.','Del líquido al gas, o al revés','Al hervir, moléculas pasan al gas y se separan mucho. Al condensarse vuelven al líquido y liberan energía.'],
      gas:['Vapor de agua · gas','El vapor es invisible; las líneas solo lo representan.','Más separadas, por todo el espacio','Las moléculas se desplazan entre choques. Siguen siendo H₂O: no crecen ni se convierten en otra sustancia.']
    };
    const motion=createMotion(temperature);
    function paint(){
      const colors=[[42,111,146],[26,111,124],[179,78,35]];
      dots.forEach((dot,i)=>{
        const point=motion.points[i];
        const color=[0,1,2].map(channel=>Math.round(colors.reduce((sum,c,k)=>sum+c[channel]*point.weights[k],0)));
        dot.setAttribute('cx',point.x);dot.setAttribute('cy',point.y);
        dot.setAttribute('fill',`rgb(${color.join(',')})`);
      });
    }
    function update(){
      temperature=Number(q('#water-temperature').value);phase=phaseAt(temperature);
      const [name,caption,heading,description]=descriptions[phase];
      q('#water-temperature-value').textContent=temperature+' °C';q('#water-temperature').setAttribute('aria-valuetext',temperature+' grados Celsius. '+name);
      q('.phase-lab').dataset.phase=phase;q('.thermometer-range').style.setProperty('--temperature-position',((temperature+20)/140*100)+'%');
      q('#phase-name').textContent=name;q('#sample-title').textContent=name;q('#phase-caption').textContent=caption;
      q('#particle-heading').textContent=heading;q('#particle-description').textContent=description;
      q('#particle-motion').textContent=reduced?'Vista sin movimiento: observa la organización y la separación.':'Mismas 64 moléculas · distinto movimiento';
      q('#phase-ice').style.opacity=phase==='ice'||phase==='melting'?'1':'0';
      q('#phase-liquid').style.opacity=['water','melting','boiling'].includes(phase)?'1':'0';
      q('#phase-vapor').style.opacity=phase==='gas'||phase==='boiling'?'1':'0';
      q('#phase-boundary').textContent=['melting','boiling'].includes(phase)?'En este punto, la temperatura no dice cuánto ha cambiado de estado. Mostramos una mezcla ilustrativa: absorber o liberar energía cambia las proporciones sin cambiar la temperatura.':'La agrupación y la velocidad cambian suavemente. La rapidez del dibujo está exagerada para comparar: no mide velocidades ni el tiempo real del cambio de estado.';
      if(reduced)advanceMotion(motion,temperature,0,true);
      paint();
    }
    q('#water-temperature').oninput=update;
    q('#water-temperature').onchange=()=>readout(temperature+' °C · '+descriptions[phase][0]);
    q('#particle-definition').onclick=()=>helpers.openModal('Una lupa imaginaria','<p>Cada círculo representa una molécula de agua, H₂O. Conservamos las mismas 64 moléculas y su tamaño en todos los estados.</p><p>En el hielo vibran alrededor de posiciones ordenadas; en el agua se deslizan entre vecinas; en el gas recorren distancias mayores entre choques.</p><p>La energía cinética es energía de movimiento. Al aumentar la temperatura, aumenta en promedio. No todas las moléculas tienen la misma velocidad. Ni el hielo ni el agua a 0 °C tienen sus moléculas detenidas.</p><p>Es una vista esquemática, no una trayectoria molecular calculada. El hielo tiene una estructura abierta: al congelarse, el agua se expande un poco, aunque las moléculas quedan ordenadas y próximas. La gran separación ocurre al pasar a gas.</p><p>El vapor se expande mucho más de lo que cabe mostrar aquí; las moléculas no están limitadas por el recipiente abierto del dibujo.</p>');
    q('#phase-science').onclick=()=>helpers.openModal('Cambiar de estado también requiere energía','<p>Imagina hielo a 0 °C: puede recibir calor y derretirse sin subir de temperatura. Esa energía cambia cómo se organizan e interactúan sus moléculas. Se llama <b>calor latente</b>.</p><p>A presión constante de 1 atm, la fusión ocurre alrededor de 0 °C y la ebullición a 100 °C. Durante la coexistencia de las fases, la temperatura se mantiene mientras cambia la proporción de cada estado. Al congelarse o condensarse, el agua libera energía.</p><p>Este termómetro selecciona vistas a diferentes temperaturas: no mide calor ni simula cuánto tarda la transformación. Las mitades dibujadas a 0 y 100 °C son un ejemplo, no una proporción calculada.</p><p>El agua también se evapora por debajo de 100 °C. Hervir y evaporarse no son lo mismo. El vapor de agua es invisible: la nube blanca sobre una olla está formada por gotitas líquidas.</p><p><a href="https://openstax.org/books/college-physics-2e/pages/14-3-phase-change-and-latent-heat" target="_blank" rel="noopener noreferrer">Explora los cambios de estado en OpenStax (inglés) ↗</a></p>');
    say('Mueve el termómetro: hacia el azul para enfriar y hacia el naranja para calentar. Mira qué cambia bajo la lupa.');
    update();
    animate(1,t=>{const dt=t-lastTime;lastTime=t;advanceMotion(motion,temperature,dt);paint();},null,true);
  }
  const api={phaseAt,particleCount,createMotion,advanceMotion,mount};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.WaterParticles=api;
})(globalThis);
