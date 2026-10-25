/* Money Quest SG – denominations, formatting & original "play money" SVG art */
'use strict';

// All amounts are whole cents to avoid floating-point errors.
const DENOMS = [
  { v: 10000, type: 'note', label: '$100', name: 'one hundred dollars', color: '#f0a33a', light: '#ffd9a0', dark: '#8a4f0c' },
  { v: 5000,  type: 'note', label: '$50',  name: 'fifty dollars',       color: '#3f8fd6', light: '#b5dbff', dark: '#174a80' },
  { v: 1000,  type: 'note', label: '$10',  name: 'ten dollars',         color: '#e0525c', light: '#ffc2c6', dark: '#8a1c27' },
  { v: 500,   type: 'note', label: '$5',   name: 'five dollars',        color: '#4cae6a', light: '#c4f0cf', dark: '#1d6436' },
  { v: 200,   type: 'note', label: '$2',   name: 'two dollars',         color: '#9a6ad1', light: '#e3d0fa', dark: '#4d2a80' },
  { v: 100,   type: 'coin', label: '$1',   name: 'one dollar',          color: '#c9a227', light: '#fff1b0', dark: '#6e5508', size: 66 },
  { v: 50,    type: 'coin', label: '50¢',  name: 'fifty cents',         color: '#d4ad3b', light: '#fff4c4', dark: '#6e5508', size: 60 },
  { v: 20,    type: 'coin', label: '20¢',  name: 'twenty cents',        color: '#d9b54a', light: '#fff6cf', dark: '#6e5508', size: 54 },
  { v: 10,    type: 'coin', label: '10¢',  name: 'ten cents',           color: '#ddbd5a', light: '#fff8da', dark: '#6e5508', size: 48 },
  { v: 5,     type: 'coin', label: '5¢',   name: 'five cents',          color: '#e2c56b', light: '#fffae4', dark: '#6e5508', size: 44 }
];

const denom = v => DENOMS.find(d => d.v === v);
const sum = arr => arr.reduce((a, b) => a + b, 0);

function fmt(cents) { return '$' + (cents / 100).toFixed(2); }

function words(c) {
  const d = Math.floor(c / 100), ct = c % 100, p = [];
  if (d) p.push(d + (d === 1 ? ' dollar' : ' dollars'));
  if (ct) p.push(ct + (ct === 1 ? ' cent' : ' cents'));
  return p.join(' and ') || 'zero dollars';
}

// Accepts "12.50", "$12.5", "12", "45c", "45¢", "45 cents". Returns cents or null.
function parseMoney(str) {
  const s = String(str == null ? '' : str).trim().toLowerCase().replace(/[$,\s]/g, '');
  const m = s.match(/^(\d+)(c|¢|cents?)$/);
  if (m) return +m[1];
  if (!/^(\d+(\.\d{0,2})?|\.\d{1,2})$/.test(s)) return null;
  return Math.round(parseFloat(s) * 100);
}

// Fewest pieces using the given denominations (greedy works for SGD).
function breakdown(c, set = DENOMS.map(d => d.v)) {
  const out = [];
  for (const v of [...set].sort((a, b) => b - a)) while (c >= v) { out.push(v); c -= v; }
  return out;
}

function noteSVG(d) {
  const petals = [0, 72, 144, 216, 288]
    .map(a => `<ellipse cx="116" cy="27" rx="6" ry="11" transform="rotate(${a} 116 38)" fill="#fff" fill-opacity=".55"/>`).join('');
  return `<svg viewBox="0 0 160 80" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
<defs><linearGradient id="n${d.v}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${d.light}"/><stop offset="1" stop-color="${d.color}"/></linearGradient></defs>
<rect x="2" y="2" width="156" height="76" rx="9" fill="url(#n${d.v})" stroke="${d.dark}" stroke-width="3"/>
<rect x="9" y="9" width="142" height="62" rx="6" fill="none" stroke="${d.dark}" stroke-opacity=".35" stroke-dasharray="5 3"/>
<circle cx="116" cy="38" r="24" fill="#fff" fill-opacity=".25"/>${petals}
<circle cx="116" cy="38" r="6" fill="${d.dark}" fill-opacity=".7"/>
<text x="16" y="38" font-family="Arial Rounded MT Bold,Arial,sans-serif" font-size="24" font-weight="800" fill="${d.dark}">${d.label}</text>
<text x="16" y="62" font-family="Arial,sans-serif" font-size="8" font-weight="700" fill="${d.dark}" letter-spacing="1.2">PLAY MONEY • SG</text>
<text x="146" y="69" text-anchor="end" font-family="Arial,sans-serif" font-size="10" font-weight="800" fill="${d.dark}">${d.v / 100}</text>
</svg>`;
}

function coinSVG(d) {
  const bimetal = d.v === 100;
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
<defs><radialGradient id="c${d.v}" cx=".35" cy=".3" r=".85"><stop offset="0" stop-color="${d.light}"/><stop offset="1" stop-color="${d.color}"/></radialGradient></defs>
<circle cx="50" cy="50" r="47" fill="url(#c${d.v})" stroke="${d.dark}" stroke-width="3"/>
${bimetal ? '<circle cx="50" cy="50" r="33" fill="#e8e6df" stroke="#8a8a80" stroke-width="2"/>' : ''}
<circle cx="50" cy="50" r="41" fill="none" stroke="${d.dark}" stroke-opacity=".45" stroke-width="1.5" stroke-dasharray="2 3"/>
<text x="50" y="52" text-anchor="middle" dominant-baseline="middle" font-family="Arial Rounded MT Bold,Arial,sans-serif" font-size="${d.label.length > 2 ? 28 : 32}" font-weight="800" fill="${d.dark}">${d.label}</text>
<path d="M28 74 Q50 84 72 74" fill="none" stroke="${d.dark}" stroke-opacity=".4" stroke-width="2"/>
</svg>`;
}

// opts: { scale, button, id, cls }
function moneyHTML(v, o = {}) {
  const d = denom(v), s = o.scale || 1;
  const w = Math.round((d.type === 'note' ? 128 : d.size) * s);
  const tag = o.button ? 'button' : 'span';
  const attrs = o.button ? 'type="button"' : 'role="img"';
  const idAttr = o.id != null ? ` data-i="${o.id}"` : '';
  return `<${tag} ${attrs} class="money ${d.type} ${o.cls || ''}" data-v="${v}"${idAttr} style="width:${w}px" aria-label="${d.label} ${d.type}">${d.type === 'note' ? noteSVG(d) : coinSVG(d)}</${tag}>`;
}

if (typeof module !== 'undefined') module.exports = { DENOMS, denom, sum, fmt, words, parseMoney, breakdown };