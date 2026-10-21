// Static conceptual sketches, independent from the simulation and its values.
export default function LessonIllustration({ index }) {
  const sketches = [
    <g><path d="M22 38h44l-4 65H26Z" fill="#f6c4a5" /><path d="M134 38h44l-4 65h-36Z" fill="#c9e3e4" /><path d="M26 65h36M138 65h36" /><path d="M79 70h42m-9-8 9 8-9 8" stroke="#ad4b26" /><path d="M36 28c-8-9 8-10 0-19m17 19c-8-9 8-10 0-19" stroke="#ad4b26" /></g>,
    <g>{[[37,40],[83,29],[146,43],[54,91],[112,83],[165,99]].map(([x,y],i) => <g key={x}><path d={`M${x-18} ${y+8}l-9 5`} stroke="#6f9590" /><circle cx={x} cy={y} r="9" fill={i%2 ? '#efb88f' : '#a9cfcb'} /></g>)}</g>,
    <g><rect x="29" y="31" width="69" height="70" rx="5" fill="#f6c4a5" /><rect x="98" y="31" width="69" height="70" rx="5" fill="#c9e3e4" /><path d="M69 66h57m-9-8 9 8-9 8" stroke="#ad4b26" /><path d="M26 108h144" stroke="#8fa69a" /></g>,
    <g><rect x="18" y="38" width="61" height="57" rx="8" fill="#f6c4a5" /><rect x="121" y="38" width="61" height="57" rx="8" fill="#c9e3e4" /><path d="M91 60h18m-18 12h18" /><text x="48" y="75" textAnchor="middle" stroke="none" fill="#183638" fontSize="24">cal</text><text x="151" y="75" textAnchor="middle" stroke="none" fill="#183638" fontSize="24">J</text></g>,
    <g><rect x="64" y="29" width="72" height="83" rx="16" fill="#c9e3e4" /><rect x="74" y="37" width="52" height="65" rx="10" fill="#f6c4a5" /><path d="M76 18h48v18H76Z" fill="#73968a" /><path d="M143 67h26m-7-6 7 6-7 6M55 67H29m7-6-7 6 7 6" stroke="#ad4b26" strokeDasharray="3 5" /></g>,
    <g><path d="M87 80V27a13 13 0 0 1 26 0v53a24 24 0 1 1-26 0Z" fill="#fffdf5" /><path d="M100 93V42" stroke="#bb5631" strokeWidth="7" /><circle cx="100" cy="99" r="13" fill="#e99f79" /><path d="M121 33h14m-14 15h9m-9 15h14" /></g>,
    <g><path d="M20 57h109l-10 35H33Z" fill="#e6ab83" /><rect x="129" y="57" width="55" height="12" rx="6" fill="#87a69b" /><path d="M48 114V97m-6 7 6-7 6 7m25 10V97m-6 7 6-7 6 7m25 10V97m-6 7 6-7 6 7" stroke="#ad4b26" /><path d="M25 51h101" /></g>,
  ];
  return <svg viewBox="0 0 200 135" aria-hidden="true" focusable="false" fill="none" stroke="#385b55" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{sketches[index]}</svg>;
}
