/* Ideal liquid-water mixing: constant specific heat, no heat loss or phase change.
   Mass is in grams. Temperature is in Celsius. Empty vessels have null temperature. */
(function (root) {
  const capacity = 250;
  const portion = 25;
  function initial() {
    return [{mass:100,temperature:70},{mass:100,temperature:25},{mass:100,temperature:10}];
  }
  function pour(vessels, source, destination, amount=portion) {
    if (!Array.isArray(vessels) || vessels.length!==3 || !Number.isInteger(source) || !Number.isInteger(destination) || source<0 || source>2 || destination<0 || destination>2 || source===destination) throw new Error('Elige dos vasos diferentes.');
    if (!Number.isFinite(amount) || amount<=0) throw new Error('La cantidad debe ser positiva.');
    vessels.forEach(v=>{if(!Number.isFinite(v.mass)||v.mass<0||v.mass>capacity||(v.mass>0&&(!Number.isFinite(v.temperature)||v.temperature<0||v.temperature>=100)))throw new Error('Estado de agua no válido.');});
    const a=vessels[source], b=vessels[destination];
    if(a.mass===0)throw new Error('Este vaso está vacío. Elige otro origen.');
    if(b.mass===capacity)throw new Error('Este vaso está lleno. Elige otro destino.');
    const moved=Math.min(amount,a.mass,capacity-b.mass);
    const temperature=b.mass===0?a.temperature:(b.mass*b.temperature+moved*a.temperature)/(b.mass+moved);
    const next=vessels.map(v=>({...v}));
    next[source]={mass:a.mass-moved,temperature:a.mass===moved?null:a.temperature};
    next[destination]={mass:b.mass+moved,temperature};
    return {vessels:next,moved,temperature};
  }
  const api={initial,pour,capacity,portion};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  else root.WaterMix=api;
})(globalThis);
