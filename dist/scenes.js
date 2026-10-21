/* Interactive scenes: all actions support touch selection and keyboard.
   Combining objects also supports pointer dragging, including touch screens. */
(() => {
  let cleanup = () => {};
  const icons = {
    cup: '<path d="M107 58h17c35 0 35 46 0 46h-17" fill="none" stroke="#bb7652" stroke-width="11"/><path d="M35 56h80l-6 65q-34 17-68 0Z" fill="#e9a379" stroke="#a76e4c" stroke-width="2"/><ellipse cx="75" cy="56" rx="40" ry="10" fill="#705345"/><g fill="none" stroke="#899c91" stroke-width="3"><path d="M62 37q-8-8 0-17t0-16M85 37q-8-8 0-17t0-16"/></g>',
    ice: '<path d="M39 38h76l-9 96H48Z" fill="#a3d5df" stroke="#528a99" stroke-width="3"/><path d="M44 77h66l-5 54H49Z" fill="#70b4ca"/><g fill="#effdff" stroke="#79b5c5"><rect x="54" y="66" width="24" height="24" rx="5" transform="rotate(-12 66 78)"/><rect x="77" y="83" width="25" height="25" rx="5" transform="rotate(14 90 96)"/></g>',
    hand: '<path d="M45 108L24 75q-6-12 5-15 7-2 17 15V39q0-15 12-15t12 15v29h3V22q0-15 11-15t11 15v46h3V30q0-14 11-14t11 14v38h3V47q0-13 11-13t11 13v57q0 42-48 42-34 0-52-38Z" fill="#efc09c" stroke="#ac866d" stroke-width="2"/>',
    block: '<path d="M30 48l27-22h87l-27 22Z" fill="#f3c5a2"/><path d="M117 48l27-22v89l-27 22Z" fill="#ad755b"/><rect x="30" y="48" width="87" height="89" rx="4" fill="#e69b79"/>',
    coldBlock: '<path d="M30 48l27-22h87l-27 22Z" fill="#c3e5e5"/><path d="M117 48l27-22v89l-27 22Z" fill="#5f939b"/><rect x="30" y="48" width="87" height="89" rx="4" fill="#86bdc8"/>',
    jar: '<path d="M48 26h66v22l13 19v70q-46 20-92 0V67l13-19Z" fill="#d6e9df" stroke="#658f89" stroke-width="3"/><path d="M39 87h84v47q-42 17-84 0Z" fill="#8dc6d3"/><path d="M44 23h74" stroke="#698e82" stroke-width="9" stroke-linecap="round"/>',
    coat: '<path d="M32 49q50-28 100 0v82q-50 25-100 0Z" fill="#b5c7a1" stroke="#637e59" stroke-width="3"/><path d="M46 47v91m20-96v102m20-102v102m20-96v91m18-82v71" stroke="#e9eddd" stroke-width="5"/><ellipse cx="82" cy="48" rx="47" ry="13" fill="#e9eddd" stroke="#637e59" stroke-width="3"/>',
    clock: '<circle cx="80" cy="80" r="53" fill="#fffaf0" stroke="#557c73" stroke-width="7"/><path d="M80 43v39l23 15" fill="none" stroke="#e17846" stroke-width="6" stroke-linecap="round"/><circle cx="80" cy="80" r="5" fill="#557c73"/>',
    clinical: '<g transform="rotate(-25 80 80)"><path d="M20 80h30" stroke="#7d9e9c" stroke-width="10" stroke-linecap="round"/><rect x="45" y="57" width="100" height="46" rx="22" fill="#fffdf0" stroke="#73978e" stroke-width="3"/><rect x="65" y="67" width="50" height="25" rx="3" fill="#c8d8ae"/><text x="90" y="85" text-anchor="middle" font-size="14" fill="#294b43">36.5</text><circle cx="130" cy="80" r="6" fill="#e17846"/></g>',
    liquid: '<rect x="67" y="17" width="26" height="103" rx="13" fill="#fffdf0" stroke="#76918a" stroke-width="3"/><circle cx="80" cy="125" r="19" fill="#df865b"/><path d="M80 121V55" stroke="#df865b" stroke-width="9"/><path d="M86 35h15m-15 20h15m-15 20h15m-15 20h15" stroke="#76918a" stroke-width="2"/>',
    probe: '<path d="M65 103q-60 20-40-50" fill="none" stroke="#577e78" stroke-width="4"/><rect x="46" y="25" width="91" height="113" rx="13" fill="#577e78"/><rect x="59" y="43" width="64" height="39" rx="4" fill="#cedeb8"/><text x="91" y="69" text-anchor="middle" font-size="20" fill="#294b43">180°</text><circle cx="91" cy="110" r="10" fill="#e3a27a"/>',
    pan: '<path d="M20 67q47 22 94 0l-10 41q-37 23-74 0Z" fill="#c18d69" stroke="#8a634c" stroke-width="3"/><ellipse cx="67" cy="67" rx="47" ry="16" fill="#ebc7a8" stroke="#8a634c" stroke-width="3"/><path d="M114 80h37" stroke="#8c7056" stroke-width="12" stroke-linecap="round"/>',
    handle: '<path d="M26 92l112-36" stroke="#927456" stroke-width="22" stroke-linecap="round"/><path d="M39 92l85-27m-79 17l77-24" stroke="#b79b76" stroke-width="2"/>',
    stove: '<ellipse cx="80" cy="115" rx="58" ry="17" fill="#ccd5c4"/><ellipse cx="80" cy="102" rx="57" ry="18" fill="none" stroke="#6e8077" stroke-width="7"/><path d="M52 90q-12-17 3-34 2 13 9 16-5-26 16-43-2 25 13 35 7-7 9-17 20 28 3 43" fill="#e6874d"/><path d="M68 89q-4-18 13-30 0 15 12 30" fill="#f5c465"/>',
    calorimeter: '<path d="M35 50v79q45 23 90 0V50" fill="#bad1bd" stroke="#537f74" stroke-width="4"/><ellipse cx="80" cy="50" rx="45" ry="14" fill="#e5ebdf" stroke="#537f74" stroke-width="3"/><path d="M72 16v75" stroke="#faf9f4" stroke-width="12"/><path d="M72 35v57" stroke="#d88154" stroke-width="4"/><path d="M100 22v63l12 9" fill="none" stroke="#537f74" stroke-width="4"/>',
    stir: '<path d="M70 20v92l25 20" fill="none" stroke="#587e74" stroke-width="8" stroke-linecap="round"/><ellipse cx="95" cy="130" rx="17" ry="7" fill="#9bb4a4"/>',
    token: '<rect x="27" y="31" width="106" height="98" rx="17" fill="#f8e8cf" stroke="#b69b74" stroke-width="3"/><path d="M57 80h46m-23-23v46" stroke="#d7b37d" stroke-width="4"/>'
  };
  const picture = kind => `<svg viewBox="0 0 165 160" aria-hidden="true" focusable="false">${icons[kind] || icons.token}</svg>`;
  window.HeatScenes = {
    destroy() { cleanup(); cleanup = () => {}; },
    mount(index, helpers) {
      this.destroy();
      const stage = document.getElementById('stage');
      stage.className = 'stage play-stage';
      const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
      let selected = null, busy = false, frame = 0, paused = false, alive = true;
      let replayAction = null, suppressClick = false, drag = null, elapsed = 0, last = 0;
      const disposers = [];
      stage.innerHTML = `<div class="scene-goal"><span>EXPLORA CON LAS MANOS</span><strong id="scene-goal"></strong></div><div class="scene-bubble" id="scene-bubble" role="status" aria-live="polite"></div><div class="scene-board" id="scene-board"></div><div class="scene-readout" id="scene-readout" aria-live="polite"></div><div class="scene-footer"><small>Toca un objeto y su destino, o arrástralo.</small><button id="scene-pause" class="text-button" hidden>Ⅱ Pausar</button><button id="scene-replay" class="text-button" hidden>↺ Volver a probar</button></div>`;
      const q = s => stage.querySelector(s), board = q('#scene-board');
      const goal = msg => q('#scene-goal').textContent = msg;
      const say = msg => q('#scene-bubble').textContent = msg;
      const readout = msg => q('#scene-readout').textContent = msg;
      const note = msg => document.getElementById('model-note').textContent = msg;
      const cue = id => { stage.querySelectorAll('.object-cue').forEach(e=>e.classList.remove('object-cue')); q(`[data-object="${id}"]`)?.classList.add('object-cue'); };
      function object(id, label, kind, sub = '', extra = '') {
        return `<button type="button" class="lab-object ${extra}" data-object="${id}" aria-label="${label}${sub?'. '+sub:''}">${picture(kind)}<strong>${label}</strong><span class="object-sub">${sub}</span></button>`;
      }
      const item = id => q(`[data-object="${id}"]`);
      function choose(id, message) {
        selected = id;
        stage.querySelectorAll('[data-object]').forEach(e => {const active=e.dataset.object===id;e.classList.toggle('object-selected',active);if(e.classList.contains('draggable'))e.setAttribute('aria-pressed',String(active));});
        say(message);
      }
      function unselect() { selected=null;stage.querySelectorAll('.object-selected').forEach(e=>{e.classList.remove('object-selected');e.setAttribute('aria-pressed','false')}); }
      function replay(fn) { replayAction=fn;q('#scene-replay').hidden=false;if(document.activeElement?.disabled)q('#scene-replay').focus({preventScroll:true}); }
      q('#scene-replay').onclick=()=>{if(!busy&&replayAction){q('#scene-replay').hidden=true;unselect();readout('');replayAction();q('.object-cue')?.focus({preventScroll:true});}};
      function attach(id, onClick, canDrag=false, onDragStart=onClick) {
        const el=item(id);
        el.onclick=()=>{if(suppressClick){suppressClick=false;return}if(!busy)onClick()};
        if(!canDrag)return;
        el.classList.add('draggable');el.setAttribute('aria-pressed','false');
        el.onpointerdown=e=>{if(busy||e.button!==0)return;drag={el,id,x:e.clientX,y:e.clientY,moved:false};el.setPointerCapture(e.pointerId)};
        el.onpointermove=e=>{if(!drag||drag.el!==el)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.hypot(dx,dy)>8){if(!drag.moved){onDragStart();drag.moved=true;el.classList.add('is-dragging')}el.style.transform=`translate(${dx}px,${dy}px)`}};
        el.onpointerup=e=>{if(!drag||drag.el!==el)return;const moved=drag.moved;el.style.transform='';el.classList.remove('is-dragging');drag=null;if(!moved)return;suppressClick=true;const target=document.elementsFromPoint(e.clientX,e.clientY).map(n=>n.closest?.('[data-object]')).find(n=>n&&n!==el&&stage.contains(n));if(target){if(target.dataset.combinable)target.dispatchEvent(new CustomEvent('objectdrop',{detail:{source:id}}));else target.click();}else say('El objeto volvió a su lugar. Toca un destino o vuelve a arrastrarlo.');setTimeout(()=>{suppressClick=false},0)};
        el.onpointercancel=()=>{el.style.transform='';el.classList.remove('is-dragging');drag=null;unselect();say('Movimiento cancelado. Puedes tocar el objeto y después su destino.')};
      }
      // Cancel propagation suppression only for the click synthesized after a drag,
      // never for the destination activation itself.
      function allowDestination(id, fn) { const el=item(id);el.onclick=()=>{if(!busy)fn()}; }
      let animationTick=null;
      function animate(duration, update, done, loop=false) {
        if(busy)return;
        busy=true;paused=false;elapsed=0;last=0;
        stage.classList.add('scene-running');q('#scene-pause').hidden=reduced;q('#scene-pause').textContent='Ⅱ Pausar';
        if(reduced){update(loop?0:1);busy=false;stage.classList.remove('scene-running');done?.();return;}
        animationTick=t=>{if(!alive)return;if(!last)last=t;if(!paused){elapsed+=Math.min(t-last,80);update(loop?elapsed/1000:Math.min(1,elapsed/duration))}last=t;if(!loop&&elapsed>=duration){busy=false;q('#scene-pause').hidden=true;stage.classList.remove('scene-running');done?.();return}frame=requestAnimationFrame(animationTick)};
        frame=requestAnimationFrame(animationTick);
      }
      q('#scene-pause').onclick=()=>{paused=!paused;q('#scene-pause').textContent=paused?'▶ Continuar':'Ⅱ Pausar';stage.classList.toggle('scene-paused',paused)};
      const visibility=()=>{if(document.hidden&&busy){paused=true;q('#scene-pause').textContent='▶ Continuar';stage.classList.add('scene-paused')}};
      document.addEventListener('visibilitychange',visibility);
      cleanup=()=>{alive=false;cancelAnimationFrame(frame);document.removeEventListener('visibilitychange',visibility);disposers.forEach(fn=>fn());};
            function transfer(from,to,done) {
        const a=item(from), b=item(to);a.classList.add('transferring');b.classList.add('receiving');
        animate(2400,p=>{q('.energy-path')?.style.setProperty('--travel',String(p));},()=>{a.classList.remove('transferring');b.classList.remove('receiving');done()});
      }
      const namesObserver=new MutationObserver(()=>{stage.querySelectorAll('[data-object]').forEach(el=>el.setAttribute('aria-label',[el.querySelector('strong')?.textContent,el.querySelector('.mix-temperature')?.textContent,el.querySelector('.object-sub')?.textContent].filter(Boolean).join('. ')))});namesObserver.observe(board,{childList:true,subtree:true,characterData:true});disposers.push(()=>namesObserver.disconnect());
      const paths='<div class="energy-path" aria-hidden="true"><span>●</span><span>●</span><span>●</span><b>→</b></div>';
      function assembly() {
        board.innerHTML='<div class="object-shelf" id="shelf"></div><div class="workbench" id="workbench"></div>';
        return {shelf:q('#shelf'),bench:q('#workbench')};
      }
      if(index===0) {
        goal('Mezcla agua y descubre su nueva temperatura');
        note('Solo en pantalla. Agua líquida, sin hielo. Modelo sin pérdidas al ambiente ni a los vasos; mezcla uniforme. Los colores indican temperatura.');
        const labels=['A · Caliente al inicio','B · Ambiente al inicio','C · Frío al inicio'];
        const initials=[70,25,10];
        const fmt=n=>Number(n.toFixed(1)).toLocaleString('es-MX');
        let vessels=WaterMix.initial(), lastMix=null;
        const waterColor=t=>t===null?'#91bec5':`hsl(${200-(t-10)/60*181} 58% 63%)`;
        function glass(i) {
          return `<svg class="mix-glass" viewBox="0 0 160 200" preserveAspectRatio="none" aria-hidden="true"><defs><clipPath id="glass-clip-${i}"><path d="M38 40H122L114 175Q80 187 46 175Z"/></clipPath></defs><ellipse cx="80" cy="185" rx="49" ry="6" fill="#cbd7c4"/><g clip-path="url(#glass-clip-${i})"><rect x="35" y="40" width="90" height="140" fill="#ffffff85"/><path class="glass-water" fill="#89bdca"/><ellipse class="glass-surface" cx="80" cy="120" rx="46" ry="5" fill="#c9e0e3"/></g><path d="M38 40L46 175Q80 187 114 175L122 40" fill="none" stroke="#668e89" stroke-width="2.5"/><ellipse cx="80" cy="40" rx="42" ry="7" fill="none" stroke="#668e89" stroke-width="2"/><g stroke="#688a80" stroke-width="1.5"><path d="M104 70h12M102 98h12M100 126h12M98 154h12"/></g></svg>`;
        }
        // Approximate a horizontal liquid surface in the tilted vessel.
        // This is visual geometry, separate from the energy-conserving mixing model.
        function liquidShape(mass,capacity,angle=0) {
          if(mass<=0)return '';
          const polygon=[[38,40],[122,40],[114,175],[80,182],[46,175]];
          const radians=angle*Math.PI/180,nx=Math.sin(radians),ny=Math.cos(radians);
          const level=p=>nx*p[0]+ny*p[1];
          const area=points=>Math.abs(points.reduce((sum,p,i)=>{const next=points[(i+1)%points.length];return sum+p[0]*next[1]-next[0]*p[1]},0))/2;
          function clip(threshold){const out=[];polygon.forEach((a,i)=>{const b=polygon[(i+1)%polygon.length],da=level(a)-threshold,db=level(b)-threshold;if(da>=0)out.push(a);if((da>=0)!==(db>=0)){const t=da/(da-db);out.push([a[0]+t*(b[0]-a[0]),a[1]+t*(b[1]-a[1])]);}});return out;}
          const desired=area(polygon)*mass/capacity;
          let low=Math.min(...polygon.map(level)),high=Math.max(...polygon.map(level));
          for(let step=0;step<24;step++){const middle=(low+high)/2;if(area(clip(middle))>desired)low=middle;else high=middle;}
          return clip((low+high)/2).map((p,i)=>(i?'L':'M')+p.join(' ')).join(' ')+'Z';
        }
        function draw(i,mass,temperature,announce=true,angle=0) {
          const el=item('water'+i),height=mass/WaterMix.capacities[i]*135,y=178-height;
          el.querySelector('.glass-water').setAttribute('d',liquidShape(mass,WaterMix.capacities[i],angle));
          el.querySelector('.glass-water').setAttribute('fill',waterColor(temperature));
          el.querySelector('.glass-surface').setAttribute('cy',y);
          el.querySelector('.glass-surface').setAttribute('fill',waterColor(temperature));
          el.querySelector('.glass-surface').style.opacity='0';
          el.querySelector('.mix-temperature').textContent=mass>0?fmt(temperature)+' °C':'Vacío';
          el.querySelector('.object-sub').textContent=fmt(mass)+' g de agua';
          if(announce)el.setAttribute('aria-label',`${labels[i]}. ${mass>0?fmt(temperature)+' grados Celsius':'Vacío'}. ${fmt(mass)} gramos de agua.`);
        }
        function selectSource(i) {
          if(!vessels[i].mass){say('Este vaso está vacío. Puedes llenarlo desde otro vaso.');return;}
          choose('water'+i,`Origen: vaso ${'ABC'[i]}, a ${fmt(vessels[i].temperature)} °C. Toca otro vaso para verter hasta 25 g. ¿Su agua se calentará o se enfriará?`);
          cue('');item('water'+i).classList.add('object-selected');
        }
        function mix(source,destination) {
          if(busy)return;
          if(source===destination){unselect();say('Selección cancelada. Elige un vaso de origen y otro distinto como destino.');return;}
          let result;
          try{result=WaterMix.pour(vessels,source,destination);}catch(error){say(error.message);return;}
          const a={...vessels[source]},b={...vessels[destination]};
          lastMix={source,destination,a,b,...result};
          unselect();cue('');readout('');q('#mix-calculation').hidden=true;
          say(`Vertemos ${fmt(result.moved)} g del vaso ${'ABC'[source]} al ${'ABC'[destination]}. Observa los niveles y la temperatura de la mezcla.`);
          const donor=item('water'+source).querySelector('svg'),receiver=item('water'+destination).querySelector('svg');
          const donorRect=donor.getBoundingClientRect(),targetRect=receiver.getBoundingClientRect();
          const direction=destination>source?1:-1;
          const dx=targetRect.x+targetRect.width/2-donorRect.x-donorRect.width/2-direction*targetRect.width*.32;
          donor.classList.add('pouring-glass');
          const overlay=q('#mix-stream'),stream=q('#mix-stream path');
          function streamPath(){
            const start=new DOMPoint(direction>0?122:38,40).matrixTransform(donor.getScreenCTM());
            const end=new DOMPoint(80,65).matrixTransform(receiver.getScreenCTM());
            const r=overlay.getBoundingClientRect();
            overlay.setAttribute('viewBox',`0 0 ${r.width} ${r.height}`);
            const x1=start.x-r.x,y1=start.y-r.y,x2=end.x-r.x,y2=end.y-r.y;
            stream.setAttribute('d',`M${x1} ${y1} C${x1} ${y1+30},${x2} ${y2-30},${x2} ${y2}`);
            stream.setAttribute('stroke',waterColor(a.temperature));
          }
          animate(3600,p=>{
            const tilt=p<.2?p/.2:p>.8?(1-p)/.2:1;
            donor.style.transform=`translate(${dx*tilt}px,${-65*tilt}px) rotate(${direction*105*tilt}deg)`;
            const fraction=Math.max(0,Math.min(1,(p-.2)/.6)),moved=result.moved*fraction;
            const targetTemperature=b.mass===0?a.temperature:(b.mass*b.temperature+moved*a.temperature)/(b.mass+moved);
            draw(source,a.mass-moved,a.temperature,false,direction*105*tilt);
            draw(destination,b.mass+moved,targetTemperature,false);
            overlay.style.opacity=p>.2&&p<.8?'1':'0';
            if(p>.2&&p<.8)streamPath();
          },()=>{
            donor.style.transform='';donor.classList.remove('pouring-glass');overlay.style.opacity='0';
            vessels=result.vessels;vessels.forEach((v,i)=>draw(i,v.mass,v.temperature));
            const original=b.mass?`antes ${fmt(b.temperature)} °C`:'antes vacío';
            readout(`Vaso ${'ABC'[destination]}: ${fmt(result.temperature)} °C · ${fmt(vessels[destination].mass)} g (${original}).`);
            if(!b.mass)say('El vaso estaba vacío. El agua vertida conserva su temperatura: no había otra porción de agua con la que intercambiar calor.');
            else if(Math.abs(a.temperature-b.temperature)<1e-9)say('Las dos porciones estaban a la misma temperatura. Aumenta la cantidad de agua, pero su temperatura no cambia.');
            else say(`La porción más caliente cede energía a la más fría. La mezcla queda a ${fmt(result.temperature)} °C; la porción más grande influye más. ${vessels[source].mass?'El agua que queda en el origen sigue a '+fmt(a.temperature)+' °C.':'El vaso de origen quedó vacío.'}`);
            q('#mix-calculation').hidden=false;replay(reset);q('#scene-replay').textContent='↺ Recuperar los tres vasos iniciales';
          });
        }
        function reset(){
          vessels=WaterMix.initial();lastMix=null;
          board.innerHTML=`<div class="mix-row">${labels.map((label,i)=>`<button type="button" class="lab-object mix-object" data-object="water${i}" data-combinable="true">${glass(i)}<strong>${label}</strong><span class="mix-temperature">${initials[i]} °C</span><span class="object-sub">100 g de agua</span></button>`).join('')}<svg id="mix-stream" aria-hidden="true"><path fill="none" stroke-width="5" stroke-linecap="round"/></svg></div><div class="mix-support"><span>100 g al inicio en cada vaso · Centro: capacidad de 300 g · Laterales: 250 g · Hasta 25 g por vertido</span><button class="text-button" id="mix-calculation" hidden>¿De dónde sale esa temperatura? ↗</button><button class="text-button" id="mix-model">Cómo funciona este modelo ↗</button></div>`;
          vessels.forEach((v,i)=>{
            draw(i,v.mass,v.temperature);
            attach('water'+i,()=>{if(selected===null)selectSource(i);else mix(Number(selected.slice(5)),i);},true,()=>selectSource(i));
            item('water'+i).addEventListener('objectdrop',e=>{if(!busy&&e.detail.source.startsWith('water'))mix(Number(e.detail.source.slice(5)),i)});
          });
          say('Toca un vaso lateral y después el central para verter agua. En el centro caben los 300 g de los tres vasos.');cue('water0');
          q('#mix-calculation').onclick=()=>{
            if(!lastMix)return;const {a,b,moved,temperature,source,destination}=lastMix;
            helpers.openModal('La cantidad de agua también importa',`<p>Vertiste <b>${fmt(moved)} g a ${fmt(a.temperature)} °C</b> en el vaso ${'ABC'[destination]}, que tenía <b>${fmt(b.mass)} g${b.mass?' a '+fmt(b.temperature)+' °C':''}</b>.</p><p>Para agua líquida con el mismo calor específico, sin pérdidas:</p><p class="mix-formula">Temperatura final = (masa inicial × temperatura inicial + masa añadida × temperatura añadida) ÷ masa total</p><p><b>(${fmt(b.mass)} × ${fmt(b.mass?b.temperature:0)} + ${fmt(moved)} × ${fmt(a.temperature)}) ÷ ${fmt(b.mass+moved)} ≈ ${fmt(temperature)} °C</b></p><p>Solo sería el promedio sencillo de las dos temperaturas si las dos porciones tuvieran la misma masa. Los cálculos conservan todos los decimales; la pantalla redondea a uno.</p><p>El agua restante del vaso ${'ABC'[source]} no se mezcló. Por eso no cambia de temperatura en este modelo.</p>`);
          };
          q('#mix-model').onclick=()=>helpers.openModal('Un experimento con fundamento',`<p>El libro explica que el calor se transfiere de lo más caliente a lo más frío hasta el equilibrio. Aquí aplicamos esa idea a una mezcla de agua líquida.</p><p><b>Conservación de energía:</b> la energía que cede la porción más caliente la recibe la más fría. Usamos Q = m · c · ΔT, con el mismo calor específico constante para toda el agua.</p><p><b>Supuestos:</b> agua líquida entre 10 y 70 °C, sin hielo ni evaporación; mezcla uniforme; vasos de capacidad térmica despreciable; sin intercambio de calor con el ambiente. En una cocina real, esas condiciones no se cumplen exactamente.</p><p>Los tres vasos empiezan con 100 g de agua. El central es más grande: admite 300 g, así que puede recibir toda el agua de los laterales sin desbordarse. El vaso B empieza a 25 °C, nuestra temperatura ambiente de referencia. No se mantiene automáticamente a 25 °C después de mezclar.</p><p>Verter mueve materia y su energía. El intercambio de calor ocurre entre las porciones a distinta temperatura al mezclarse. No confundas la dirección del chorro con la dirección de transferencia de calor.</p><p>La animación es ilustrativa: su duración no es tiempo físico medido. El color representa temperatura; el agua real no cambia de color.</p><p><a href="https://openstax.org/books/university-physics-volume-2/pages/1-4-heat-transfer-specific-heat-and-calorimetry" target="_blank" rel="noopener noreferrer">Fundamento: calorimetría y conservación de energía, OpenStax (inglés) ↗</a></p>`);
        }
        reset();
      }
      if(index===1) {
        WaterParticles.mount({board,q,goal,note,say,readout,animate,reduced,helpers});
      }
      if(index===2) {
        goal('Encuentra la pareja que llegue a 50 °C');note('Bloques con igual capacidad térmica, sin pérdidas. La temperatura final es el promedio.');
        function scene(){const {shelf,bench}=assembly();shelf.innerHTML=[40,60,80].map(t=>object('b'+t,'Bloque a '+t+' °C','block','Elige una pareja')).join('');bench.innerHTML=`${object('target','Bloque a 20 °C','coldBlock','Destino','destination')}<div class="pair-result"><span id="pair-hot">¿?</span><span>⇄</span><span id="pair-cold">20 °C</span></div>`;say('Elige un bloque. Después tócalo con el bloque azul. ¿Cuál llegará a 50 °C?');cue('b40');[40,60,80].forEach(t=>attach('b'+t,()=>{choose('b'+t,`Elegiste ${t} °C. Toca el bloque azul para unirlos.`);cue('target')},true));allowDestination('target',()=>{if(!selected){say('Elige primero uno de los tres bloques de arriba.');return}const t=Number(selected.slice(1)),mean=(t+20)/2;unselect();cue('');say('Se están acercando a una misma temperatura…');animate(2600,p=>{q('#pair-hot').textContent=(t+(mean-t)*p).toFixed(1)+' °C';q('#pair-cold').textContent=(20+(mean-20)*p).toFixed(1)+' °C'},()=>{const win=mean===50;readout(`${win?'✓ Objetivo conseguido.':'Esta pareja llega a '+mean+' °C.'} (${t} + 20) ÷ 2 = ${mean} °C`);say(win?'Ambos están a 50 °C: ya no hay transferencia neta de calor.':'La energía se conserva. Prueba con otra pareja para llegar a 50 °C.');replay(scene)});});}scene();
      }
      if(index===3) {
        goal('Encuentra tres parejas de energía');note('Se usa la aproximación del libro: 1 cal ≈ 4.187 J.');
        const pairs=[['1 kcal','1 000 cal','1 × 1 000 = 1 000 cal.'],['2 kcal','2 000 cal','2 × 1 000 = 2 000 cal.'],['1 cal','≈ 4.187 J','Una caloría equivale aproximadamente a 4.187 joules.']];
        function scene(){let matched=new Set();board.innerHTML=`<div class="matching-grid"><div class="matching-column">${pairs.map((p,i)=>object('unit'+i,p[0],'token','Selecciona')).join('')}</div><div class="matching-column">${[2,0,1].map(i=>object('match'+i,pairs[i][1],'token','Su equivalente','destination')).join('')}</div></div><div class="secondary-tools"><button id="explore-calorimeter" class="illustrated-tool">${picture('calorimeter')}<span>Explora el calorímetro ↗</span></button><button id="converter" class="text-button">Abrir conversor ↗</button></div>`;say('Toca 1 kcal y busca la ficha que representa la misma energía.');cue('unit0');pairs.forEach((p,i)=>{attach('unit'+i,()=>{if(matched.has(i))return;choose('unit'+i,`${p[0]}: toca o arrastra hacia su equivalente.`);cue('')},true);allowDestination('match'+i,()=>{if(!selected){say('Selecciona primero una ficha de la izquierda.');return}const chosen=+selected.slice(4);if(chosen!==i){say('Todavía no coinciden. Recuerda: 1 kcal = 1 000 cal y 1 cal ≈ 4.187 J.');return}matched.add(i);unselect();item('unit'+i).disabled=true;item('match'+i).disabled=true;item('unit'+i).classList.add('matched');item('match'+i).classList.add('matched');say(p[2]);readout(`${matched.size} de 3 parejas encontradas`);if(matched.size===3){say('¡Las tres parejas representan la misma energía con distintas unidades!');replay(scene)}else cue('unit'+[0,1,2].find(n=>!matched.has(n)));});});q('#converter').onclick=()=>{helpers.openModal('Conversor de energía','<label>Energía <input id="energy" type="number" min="0" max="1000000" step="any" value="1"></label> <label>Unidad <select id="unit"><option>cal</option><option>kcal</option><option>J</option></select></label><p id="conversion-result" role="status"></p><p>Usamos 4.187 J/cal, la aproximación del libro.</p>');const update=()=>{const input=document.getElementById('energy'),n=Number(input.value),unit=document.getElementById('unit').value,out=document.getElementById('conversion-result');if(!input.value||!Number.isFinite(n)||n<0||n>1e6){out.textContent='Escribe un número entre 0 y 1 000 000.';return}const cal=unit==='J'?n/4.187:unit==='kcal'?n*1000:n;const fmt=x=>x.toLocaleString('es-MX',{maximumFractionDigits:4});out.textContent=`${fmt(cal)} cal = ${fmt(cal/1000)} kcal ≈ ${fmt(cal*4.187)} J`};document.getElementById('energy').oninput=update;document.getElementById('unit').onchange=update;update()};q('#explore-calorimeter').onclick=()=>{helpers.openModal('Explora el calorímetro',`<div class="calorimeter-explorer">${['Recipiente aislante','Termómetro','Agitador'].map((n,i)=>`<button class="lab-object" data-part="${i}">${picture(['calorimeter','liquid','stir'][i])}<strong>${n}</strong></button>`).join('')}</div><p id="part-description" role="status">Toca una parte para descubrir su función.</p>`);document.querySelectorAll('[data-part]').forEach(b=>b.onclick=()=>document.getElementById('part-description').textContent=['El recipiente reduce el intercambio de calor con el exterior.','El termómetro registra cambios de temperatura. Con la cantidad de materia y sus propiedades, podemos determinar la energía intercambiada.','El agitador ayuda a distribuir la temperatura dentro del recipiente.'][+b.dataset.part])};}scene();
      }
      if(index===4) {
        goal('Protege uno y compara qué ocurre');note('Ambiente a 20 °C. Comparación ilustrativa, sin tiempo físico real. El aislamiento reduce pérdidas.');
        let covered=null,finished=false;
        function scene(){finished=false;covered=null;const {shelf,bench}=assembly();shelf.innerHTML=object('coat','Funda aislante','coat','Colócala en un recipiente');bench.innerHTML=`${object('left','Recipiente A','jar','80 °C','destination')}${object('clock','Observar el paso del tiempo','clock','Primero coloca la funda')}${object('right','Recipiente B','jar','80 °C','destination')}`;say('Toca la funda y el recipiente que quieres proteger.');cue('coat');attach('coat',()=>{choose('coat','Toca el recipiente A o B. ¿Cuál conservará mejor su temperatura?');cue('')},true);['left','right'].forEach(id=>allowDestination(id,()=>{if(selected!=='coat'){say('Selecciona la funda antes de tocar un recipiente.');return}covered=id;finished=false;unselect();['left','right'].forEach(n=>{item(n).classList.toggle('insulated',n===id);item(n).querySelector('.object-sub').textContent='80 °C'});readout('');say('La funda está colocada. Toca el reloj para comparar.');cue('clock')}));attach('clock',()=>{if(!covered){say('Primero coloca la funda en uno de los recipientes.');return}if(finished){say('Mueve la funda al otro recipiente para repetir.');return}unselect();cue('');say('Los dos se enfrían. Observa cuál pierde energía más lentamente.');animate(3600,p=>{['left','right'].forEach(id=>item(id).querySelector('.object-sub').textContent=(20+60*Math.exp(-p*(id===covered?1.4:6))).toFixed(1)+' °C')},()=>{finished=true;readout('Con funda: 34.8 °C · Sin funda: 20.1 °C');say('El aislamiento frena la pérdida de energía. Mueve la funda al otro recipiente para comprobarlo.');replay(scene)});});}scene();
      }
      if(index===5) {
        goal('Elige el instrumento para cada encargo');note('Rangos ficticios de estos instrumentos didácticos. En la realidad, consulta el fabricante.');
        const jobs=[['Temperatura corporal','Necesitas medir 37 °C con un instrumento de uso corporal.','clinical'],['Agua de laboratorio','Necesitas medir agua a 70 °C con un termómetro de inmersión.','liquid'],['Proceso industrial','Necesitas medir un proceso a 180 °C.','probe']];
        const tools=[['clinical','Clínico digital','Uso corporal · 32 a 43 °C'],['liquid','Líquido en tubo','Inmersión · 0 a 100 °C'],['probe','Sonda industrial','Proceso industrial · 0 a 300 °C']];let job=0;
        function scene(){const {shelf,bench}=assembly();shelf.innerHTML=tools.map(t=>object(t[0],t[1],t[0],t[2])).join('');bench.innerHTML=object('job',jobs[job][0],['hand','jar','stove'][job],jobs[job][1],'destination job-target');say(`Encargo ${job+1} de 3. Toca un instrumento para conocer su uso y rango.`);cue(tools[0][0]);tools.forEach(t=>attach(t[0],()=>{choose(t[0],`${t[1]}: ${t[2]}. Colócalo sobre el encargo si es adecuado.`);cue('job')},true));allowDestination('job',()=>{if(!selected){say('Primero toca un instrumento para ver su rango y su uso.');return}if(selected!==jobs[job][2]){say('Revisa tanto el rango como el uso previsto. Este encargo necesita otro instrumento.');return}unselect();cue('');readout(`✓ Encargo ${job+1} resuelto: ${tools[job][1]}.`);say(job===2?'Elegiste los tres instrumentos según su uso y rango.':'Ese instrumento es adecuado por su uso y rango. Vamos al siguiente encargo.');stage.querySelectorAll('[data-object]').forEach(b=>b.disabled=true);replay(()=>{job=(job+1)%3;scene()});q('#scene-replay').textContent=job===2?'↺ Volver a probar':'Siguiente encargo →';});}scene();
      }
      if(index===6) {
        goal('Construye una sartén que cocine y proteja');note('Modelo cualitativo. El cobre conduce más que el acero; la madera dificulta que el calor llegue a la mano.');
        let body=null,handle=null,finished=false;
        function scene(){body=null;handle=null;finished=false;const {shelf,bench}=assembly();shelf.innerHTML=object('copper-body','Cuerpo de cobre','pan','Buen conductor')+object('steel-body','Cuerpo de acero','pan','Conductor')+object('wood-handle','Mango de madera','handle','Baja conductividad')+object('copper-handle','Mango de cobre','handle','Alta conductividad');bench.innerHTML=`${object('body','Coloca el cuerpo','pan','Destino','destination')}${object('handle','Coloca el mango','handle','Destino','destination')}${object('stove','Probar en el fogón','stove','Completa tu sartén')}`;board.insertAdjacentHTML('beforeend','<button class="text-button" id="compare-materials">Consultar los ocho materiales ↗</button>');q('#compare-materials').onclick=helpers.materialsModal;say('Toca un cuerpo y colócalo en su silueta. Luego elige un mango.');cue('copper-body');['copper-body','steel-body','wood-handle','copper-handle'].forEach(id=>attach(id,()=>{choose(id,id.endsWith('body')?'Coloca esta pieza en la silueta del cuerpo.':'Coloca esta pieza en la silueta del mango.');cue(id.endsWith('body')?'body':'handle')},true));['body','handle'].forEach(dest=>allowDestination(dest,()=>{if(!selected||!selected.endsWith(dest)){say(`Elige una pieza para el ${dest==='body'?'cuerpo':'mango'} y colócala aquí.`);return}if(dest==='body')body=selected;else handle=selected;item(dest).querySelector('strong').textContent=item(selected).querySelector('strong').textContent;item(dest).querySelector('.object-sub').textContent='Pieza colocada ✓';item(dest).classList.add('assembled');item(dest).classList.toggle('copper',selected.startsWith('copper'));item(dest).classList.toggle('steel',selected.startsWith('steel'));unselect();finished=false;['body','handle'].forEach(n=>{item(n).classList.remove('heating');item(n).style.removeProperty('--heat')});readout('');say(body&&handle?'La sartén está lista. Toca el fogón para probarla.':'Ahora elige la pieza que falta.');cue(body&&handle?'stove':body?'wood-handle':'copper-body')}));attach('stove',()=>{if(!body||!handle){say('Completa el cuerpo y el mango antes de probar.');return}if(finished){say('Puedes cambiar una pieza o volver a probar.');return}cue('');say('La energía pasa del fogón al cuerpo y de ahí hacia el mango.');animate(2600,p=>{item('body').style.setProperty('--heat',p);item('handle').style.setProperty('--heat',handle==='copper-handle'?p:p*.12);item('body').classList.add('heating');item('handle').classList.add('heating')},()=>{finished=true;const good=handle==='wood-handle';readout(good?'✓ El cuerpo conduce y el mango dificulta el paso del calor.':'El mango de cobre también se calienta: prueba uno de madera.');say(good?(body==='copper-body'?'El cobre conduce muy bien. La madera reduce el paso de energía hacia la mano.':'El acero también sirve para el cuerpo, aunque conduce menos que el cobre. La madera dificulta que el calor llegue a la mano.'):'Conducir bien ayuda a cocinar, pero no protege la mano. Cambia el mango.');replay(scene)});});}scene();
      }
    }
  };
})();
