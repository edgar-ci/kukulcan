// Dedicated artwork for exercise 06. SVGs stay decorative; cards supply accessible labels.
const drawings = {
  clinical: `
    <g transform="rotate(-28 100 83)">
      <path d="M24 74h48v17H24q-12-8 0-17Z" fill="#b6c6c6" stroke="#47636b" stroke-width="2"/>
      <path d="M27 77h40" stroke="#f7ffff" stroke-width="3"/>
      <path d="M59 63h99q20 0 20 20t-20 20H59q-13 0-13-20t13-20Z" fill="url(#clinical-shell)" stroke="#47636b" stroke-width="2"/>
      <path d="M151 64h7q20 0 20 19t-20 20h-7Z" fill="#5c9291"/>
      <rect x="71" y="71" width="65" height="24" rx="4" fill="#b9cec2" stroke="#718f82"/>
      <text x="78" y="88" font-size="17" fill="#284e48" font-family="monospace">36.5<tspan font-size="9">°C</tspan></text>
      <circle cx="157" cy="83" r="6" fill="#eff7ee" stroke="#3f7375"/>
      <path d="M157 79v4m-3-2a4 4 0 1 0 6 0" stroke="#3f7375" fill="none" stroke-width="1.2"/>
    </g>`,
  liquid: `
    <g transform="rotate(16 100 80)">
      <path d="M88 111V24a12 12 0 0 1 24 0v87a23 23 0 1 1-24 0Z" fill="#e3f1ef" stroke="#557782" stroke-width="2"/>
      <path d="M94 108V26" stroke="white" stroke-width="4" stroke-linecap="round"/>
      <path d="M100 123V56" stroke="#cf6650" stroke-width="6" stroke-linecap="round"/>
      <circle cx="100" cy="130" r="15" fill="#cf6650"/>
      <path d="M90 127a11 11 0 0 1 7-8" stroke="#f6b39b" stroke-width="3" fill="none" stroke-linecap="round"/>
      <g stroke="#557782" stroke-width="1.5"><path d="M105 32h8m-8 12h5m-5 12h8m-8 12h5m-5 12h8m-8 12h5m-5 12h8"/></g>
      <text x="120" y="35" font-size="10" fill="#47636b">°C</text>
    </g>`,
  probe: `
    <path d="M100 139c0 19-63 15-64-10V80" fill="none" stroke="#3b5358" stroke-width="4"/>
    <path d="M36 81V38" stroke="#637e85" stroke-width="6" stroke-linecap="round"/>
    <path d="M35 66V39" stroke="#eef8f5" stroke-width="2"/>
    <rect x="28" y="72" width="16" height="30" rx="5" fill="#4c696c"/>
    <rect x="75" y="20" width="91" height="122" rx="17" fill="#3d656b" stroke="#304d55" stroke-width="2"/>
    <rect x="82" y="26" width="77" height="108" rx="11" fill="#739a99"/>
    <rect x="88" y="39" width="65" height="44" rx="5" fill="#294e53"/>
    <rect x="92" y="43" width="57" height="36" rx="3" fill="#d7e4be"/>
    <text x="99" y="66" font-size="20" font-family="monospace" fill="#314f43">180</text>
    <text x="137" y="51" font-size="7" fill="#314f43">°C</text>
    <circle cx="120" cy="107" r="11" fill="#f0bc7c" stroke="#385c60" stroke-width="2"/>
    <path d="M120 100v7m-4-4a6 6 0 1 0 8 0" stroke="#385c60" stroke-width="1.6" fill="none"/>
    <path d="M94 126h13m6 0h13m6 0h13" stroke="#42696d" stroke-width="2"/>`,
  body: `
    <path d="M47 148v-16q0-27 31-34h44q31 7 31 34v16" fill="#78a4a0" stroke="#4b7376" stroke-width="2"/>
    <path d="M86 86v17q14 16 28 0V86" fill="#d99b79" stroke="#976b58" stroke-width="2"/>
    <path d="M70 52q0-29 30-29t30 29v17q0 31-30 31T70 69Z" fill="#efc3a0" stroke="#976b58" stroke-width="2"/>
    <path d="M69 60q-9-35 17-39 36-14 47 18l-3 20-7-15q-23 3-39-8L76 61Z" fill="#5f5147"/>
    <path d="M82 65h5m26 0h5m-23 19q6 4 12 0" fill="none" stroke="#77574a" stroke-width="2" stroke-linecap="round"/>
    <path d="M98 67l-3 10h6" stroke="#be876d" fill="none" stroke-width="1.5"/>
    <path d="M78 101l22 22 22-22M66 148v-21m68 21v-21" stroke="#d9e7de" fill="none" stroke-width="3"/>
    <path d="M46 59h13m-17 12h14m-9 12h12" stroke="#d19165" stroke-width="2" stroke-linecap="round"/>`,
  beaker: `
    <path d="M55 32h92l-10 12v91q0 12-39 12t-39-12V43Z" fill="#e8f3ee" fill-opacity=".6" stroke="#587d86" stroke-width="2"/>
    <path d="M64 81q34 10 68 0v52q0 9-34 9t-34-9Z" fill="#91c5cf"/>
    <ellipse cx="98" cy="81" rx="34" ry="7" fill="#c1e1e5" stroke="#6aa4b4"/>
    <path d="M69 46v81" stroke="white" stroke-width="4" stroke-linecap="round" opacity=".85"/>
    <path d="M116 52h15m-10 15h10m-15 15h15m-10 15h10m-15 15h15m-10 15h10" stroke="#476e7a" stroke-width="2"/>
    <text x="82" y="61" font-size="10" fill="#476e7a">mL</text>
    <path d="M83 23q-7-9 0-17m17 17q-7-9 0-17m17 17q-7-9 0-17" fill="none" stroke="#9baca4" stroke-width="2" stroke-linecap="round"/>
    <path d="M52 149h94" stroke="#78918b" stroke-width="3" stroke-linecap="round"/>`,
  industry: `
    <path d="M31 48V29h36m66 0h36v57h-19" fill="none" stroke="#64858b" stroke-width="14" stroke-linejoin="round"/>
    <path d="M31 46V29h36m68 0h34v54" fill="none" stroke="#bad0cd" stroke-width="4" stroke-linejoin="round"/>
    <path d="M63 53q0-19 37-19t37 19v64q0 18-37 18t-37-18Z" fill="url(#industry-shell)" stroke="#496b74" stroke-width="2"/>
    <ellipse cx="100" cy="53" rx="37" ry="13" fill="#d8e6df" stroke="#496b74" stroke-width="2"/>
    <path d="M72 127v20m56-20v20" stroke="#496b74" stroke-width="7"/>
    <rect x="80" y="75" width="40" height="34" rx="5" fill="#557d83"/>
    <path d="M88 98q-5-5 0-10m12 10q-5-5 0-10m12 10q-5-5 0-10" fill="none" stroke="#f4ce8f" stroke-width="2" stroke-linecap="round"/>
    <path d="M100 34V22" stroke="#496b74" stroke-width="5"/>
    <circle cx="100" cy="19" r="13" fill="#fff9e9" stroke="#496b74" stroke-width="2"/>
    <path d="M100 19l6-6" stroke="#c97651" stroke-width="2" stroke-linecap="round"/>
    <circle cx="100" cy="19" r="2" fill="#496b74"/>
    <path d="M22 60h18m119 38h20" stroke="#42636b" stroke-width="4"/>
    <path d="M62 150h76" stroke="#78918b" stroke-width="3" stroke-linecap="round"/>`,
};

export function instrumentPicture(kind) {
  return `<svg viewBox="0 0 200 170" aria-hidden="true" focusable="false">
    <defs><linearGradient id="${kind}-shell" x1="0" x2="1"><stop stop-color="#f7faf1"/><stop offset=".5" stop-color="#e1ece5"/><stop offset="1" stop-color="#9ebbb9"/></linearGradient></defs>
    <ellipse cx="100" cy="154" rx="65" ry="6" fill="#52716a" opacity=".1"/>
    ${drawings[kind]}
  </svg>`;
}
