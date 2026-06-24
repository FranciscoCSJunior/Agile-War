// Gera src/data/worldMap.ts: mapa-múndi COMPLETO (todos os países), agrupados
// em 7 continentes (= métodos ágeis). Cada continente é dividido em 4
// territórios por agrupamento geográfico (k-means) de países vizinhos, então
// os continentes ficam inteiros, sem buracos.
//
// Fontes (baixadas em .tmp e copiadas para scripts/):
//   - scripts/countries.geojson  (geometrias dos países, id = ISO alpha-3)
//   - scripts/iso-regions.json   (país -> region / intermediate-region)
const fs = require('fs');

const gj = JSON.parse(fs.readFileSync('scripts/countries.geojson', 'utf8'));
const iso = JSON.parse(fs.readFileSync('scripts/iso-regions.json', 'utf8'));
const byA3 = {};
for (const c of iso) byA3[c['alpha-3']] = c;

const ORDER = ['xp', 'scrum', 'lean', 'kanban', 'fdd', 'less', 'safe'];
// continentId -> nome real do continente (rótulo geográfico) — apenas referência
// territórios por continente (ordem de mapData.ts CONTINENT_SEEDS)
const TERR = {
  xp:     ['xp-pair', 'xp-tdd', 'xp-ci', 'xp-refactor'],
  scrum:  ['scrum-product-backlog', 'scrum-sprint-backlog', 'scrum-daily', 'scrum-master'],
  lean:   ['lean-waste', 'lean-deliver-fast', 'lean-empower', 'lean-whole'],
  kanban: ['kanban-board', 'kanban-wip', 'kanban-flow', 'kanban-kaizen'],
  fdd:    ['fdd-domain-model', 'fdd-chief-architect', 'fdd-chief-programmer', 'fdd-feature-list'],
  less:   ['less-po', 'less-backlog', 'less-teams', 'less-simplicity'],
  safe:   ['safe-team', 'safe-program', 'safe-large-solution', 'safe-portfolio'],
};

// overrides por nome (features com id "-99" ou ISO não-padrão)
const NAME_OVERRIDE = {
  'Kosovo': 'scrum',
  'Northern Cyprus': 'safe',
  'Somaliland': 'fdd',
};

// classifica um país (continentId) ou null para ignorar (ex.: Antártida)
function classify(feature) {
  const name = feature.properties.name;
  if (NAME_OVERRIDE[name]) return NAME_OVERRIDE[name];
  const c = byA3[feature.id];
  if (!c || !c.region) return null;
  const region = c.region, sub = c['sub-region'], inter = c['intermediate-region'];
  if (region === 'Africa') return 'fdd';
  if (region === 'Europe') return 'scrum';
  if (region === 'Oceania') return 'less';
  if (region === 'Americas') return inter === 'South America' ? 'kanban' : 'xp';
  if (region === 'Asia') return sub === 'Western Asia' ? 'safe' : 'lean';
  return null;
}

// ---- coleta geometrias e classifica ----
function polysOf(feature) {
  const g = feature.geometry, polys = [];
  if (!g) return polys;
  if (g.type === 'Polygon') polys.push(g.coordinates[0]);
  else if (g.type === 'MultiPolygon') for (const p of g.coordinates) polys.push(p[0]);
  return polys;
}
const ringArea = (r) => {
  let a = 0;
  for (let i = 0; i < r.length; i++) {
    const [x1, y1] = r[i], [x2, y2] = r[(i + 1) % r.length];
    a += x1 * y2 - x2 * y1;
  }
  return Math.abs(a) / 2;
};

const byCont = {}; // continentId -> [{name, rings(lonlat), cx, cy}]
ORDER.forEach((c) => (byCont[c] = []));
let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
for (const f of gj.features) {
  const cont = classify(f);
  if (!cont) continue;
  let polys = polysOf(f).map((ring) => ring.map(([lon, lat]) => [lon, -lat]));
  if (!polys.length) continue;
  const areas = polys.map(ringArea);
  const maxA = Math.max(...areas);
  polys = polys.filter((_, i) => areas[i] >= maxA * 0.04); // descarta ilhotas
  let big = polys[0];
  for (const r of polys) if (ringArea(r) > ringArea(big)) big = r;
  const cx = big.reduce((s, p) => s + p[0], 0) / big.length;
  const cy = big.reduce((s, p) => s + p[1], 0) / big.length;
  byCont[cont].push({ name: f.properties.name, rings: polys, cx, cy });
  for (const ring of polys) for (const [x, y] of ring) {
    if (x < minX) minX = x; if (x > maxX) maxX = x;
    if (y < minY) minY = y; if (y > maxY) maxY = y;
  }
}

// ---- projeção/normalização para viewBox ----
const PAD = 16, VW = 1200;
const scale = (VW - 2 * PAD) / (maxX - minX);
const VH = Math.round((maxY - minY) * scale + 2 * PAD);
const px = ([x, y]) => [
  Math.round(PAD + (x - minX) * scale),
  Math.round(PAD + (y - minY) * scale),
];

// ---- k-means (k=4) sobre os centróides dos países de cada continente ----
function kmeans(points, k) {
  // points: [{cx,cy, ...}]
  if (points.length <= k) return points.map((_, i) => i % k); // degenerado
  const sorted = [...points].map((p, i) => ({ i, key: p.cx * 1000 + p.cy }))
    .sort((a, b) => a.key - b.key);
  let cent = [0, 1, 2, 3].map((q) => {
    const p = points[sorted[Math.floor(((q + 0.5) / k) * points.length)].i];
    return [p.cx, p.cy];
  });
  const assign = new Array(points.length).fill(0);
  for (let iter = 0; iter < 30; iter++) {
    for (let i = 0; i < points.length; i++) {
      let best = 0, bd = Infinity;
      for (let c = 0; c < k; c++) {
        const dx = points[i].cx - cent[c][0], dy = points[i].cy - cent[c][1];
        const d = dx * dx + dy * dy;
        if (d < bd) { bd = d; best = c; }
      }
      assign[i] = best;
    }
    // recalcula
    const sum = Array.from({ length: k }, () => [0, 0, 0]);
    for (let i = 0; i < points.length; i++) {
      sum[assign[i]][0] += points[i].cx; sum[assign[i]][1] += points[i].cy; sum[assign[i]][2]++;
    }
    // clusters vazios: rouba o ponto mais distante do seu centróide
    for (let c = 0; c < k; c++) {
      if (sum[c][2] === 0) {
        let far = 0, fd = -1;
        for (let i = 0; i < points.length; i++) {
          const cc = assign[i];
          const dx = points[i].cx - cent[cc][0], dy = points[i].cy - cent[cc][1];
          const d = dx * dx + dy * dy;
          if (d > fd) { fd = d; far = i; }
        }
        assign[far] = c;
        sum[c] = [points[far].cx, points[far].cy, 1];
      }
    }
    for (let c = 0; c < k; c++) if (sum[c][2]) cent[c] = [sum[c][0] / sum[c][2], sum[c][1] / sum[c][2]];
  }
  return assign;
}

// Calcula o perímetro externo de um território (half-edge: remove bordas internas
// compartilhadas entre países do mesmo território, sobram só as bordas externas).
function buildBoundaryPath(allProjRings) {
  const fwd = new Set();
  const edges = [];
  for (const ring of allProjRings) {
    const n = ring.length;
    for (let i = 0; i < n; i++) {
      const v = ring[i], w = ring[(i + 1) % n];
      const vk = v[0] + ',' + v[1], wk = w[0] + ',' + w[1];
      if (vk === wk) continue;
      fwd.add(vk + '|' + wk);
      edges.push({ v, w, vk, wk });
    }
  }
  const boundary = edges.filter(e => !fwd.has(e.wk + '|' + e.vk));
  if (!boundary.length) return '';

  const adj = new Map();
  for (const e of boundary) {
    if (!adj.has(e.vk)) adj.set(e.vk, []);
    adj.get(e.vk).push(e);
  }
  const used = new Set();
  const chains = [];
  for (const start of boundary) {
    const sid = start.vk + '|' + start.wk;
    if (used.has(sid)) continue;
    const pts = [start.v];
    let cur = start;
    used.add(sid);
    for (let step = 0; step < boundary.length; step++) {
      const nexts = (adj.get(cur.wk) || []).filter(e => !used.has(e.vk + '|' + e.wk));
      if (!nexts.length) break;
      cur = nexts[0];
      used.add(cur.vk + '|' + cur.wk);
      if (cur.vk === start.vk) break;
      pts.push(cur.v);
    }
    if (pts.length >= 3) chains.push('M ' + pts.map(p => p[0] + ',' + p[1]).join(' L ') + ' Z');
  }
  return chains.join(' ');
}

const TERRITORY_PATHS = {};
const TERRITORY_BOUNDARY_PATHS = {};
const TERRITORY_CENTERS = {};
const CONTINENT_PATHS = {};
const CONTINENT_CENTERS = {};
const countryTerr = {}; // país(name) -> territoryId
const countryVset = {}; // país(name) -> Set("x,y") (vértices projetados arredondados)

for (const cid of ORDER) {
  const list = byCont[cid];
  const assign = kmeans(list, 4);
  // agrupa países por cluster
  const clusters = [[], [], [], []];
  list.forEach((p, i) => clusters[assign[i]].push(p));
  // ordena clusters por centróide (x depois y) para atribuição determinística
  const cinfo = clusters.map((cs, idx) => {
    const cx = cs.reduce((s, p) => s + p.cx, 0) / (cs.length || 1);
    const cy = cs.reduce((s, p) => s + p.cy, 0) / (cs.length || 1);
    return { idx, cx, cy, cs };
  }).sort((a, b) => a.cx - b.cx || a.cy - b.cy);

  cinfo.forEach((ci, slot) => {
    const tid = TERR[cid][slot];
    const dParts = [];
    const allProjRings = [];
    let sumx = 0, sumy = 0, n = 0;
    for (const country of ci.cs) {
      const vs = new Set();
      for (const ring of country.rings) {
        const proj = ring.map(px);
        dParts.push('M ' + proj.map((p) => p[0] + ',' + p[1]).join(' L ') + ' Z');
        allProjRings.push(proj);
        for (const p of proj) vs.add(p[0] + ',' + p[1]);
      }
      countryVset[country.name] = vs;
      countryTerr[country.name] = tid;
      const c = px([country.cx, country.cy]);
      sumx += c[0]; sumy += c[1]; n++;
    }
    TERRITORY_PATHS[tid] = dParts.join(' ');
    TERRITORY_BOUNDARY_PATHS[tid] = buildBoundaryPath(allProjRings);
    TERRITORY_CENTERS[tid] = { x: Math.round(sumx / n), y: Math.round(sumy / n) };
  });

  // contorno do continente = todos os países do continente
  CONTINENT_PATHS[cid] = list.flatMap((country) =>
    country.rings.map((ring) => {
      const proj = ring.map(px);
      return 'M ' + proj.map((p) => p[0] + ',' + p[1]).join(' L ') + ' Z';
    })
  ).join(' ');
  const allc = list.map((p) => px([p.cx, p.cy]));
  CONTINENT_CENTERS[cid] = {
    x: Math.round(allc.reduce((s, p) => s + p[0], 0) / allc.length),
    y: Math.round(allc.reduce((s, p) => s + p[1], 0) / allc.length),
  };
}

// ---- adjacência terrestre real entre territórios ----
const adj = {};
const add = (a, b) => {
  if (!a || !b || a === b) return;
  (adj[a] = adj[a] || new Set()).add(b);
  (adj[b] = adj[b] || new Set()).add(a);
};
const names = Object.keys(countryVset);
function shared2(a, b) {
  let n = 0;
  const A = countryVset[a], B = countryVset[b];
  const [S, L] = A.size < B.size ? [A, B] : [B, A];
  for (const v of S) if (L.has(v)) { if (++n >= 2) return true; }
  return false;
}
for (let i = 0; i < names.length; i++)
  for (let j = i + 1; j < names.length; j++)
    if (shared2(names[i], names[j])) add(countryTerr[names[i]], countryTerr[names[j]]);

const tc = TERRITORY_CENTERS;
const dist = (a, b) => Math.hypot(tc[a].x - tc[b].x, tc[a].y - tc[b].y);

// garante cada continente internamente conexo
function comps(ids) {
  const out = [], seen = new Set();
  for (const id of ids) {
    if (seen.has(id)) continue;
    const comp = [], q = [id]; seen.add(id);
    while (q.length) { const c = q.shift(); comp.push(c); for (const n of adj[c] || []) if (ids.includes(n) && !seen.has(n)) { seen.add(n); q.push(n); } }
    out.push(comp);
  }
  return out;
}
for (const cid of ORDER) {
  let cc = comps(TERR[cid]);
  while (cc.length > 1) {
    let best = null;
    for (let a = 0; a < cc.length; a++) for (let b = a + 1; b < cc.length; b++)
      for (const x of cc[a]) for (const y of cc[b]) { const d = dist(x, y); if (!best || d < best.d) best = { x, y, d }; }
    add(best.x, best.y);
    cc = comps(TERR[cid]);
  }
}

// rotas marítimas entre continentes (par de territórios mais próximo)
const REGION_PAIRS = [
  ['xp', 'kanban'], ['xp', 'scrum'], ['kanban', 'fdd'], ['scrum', 'fdd'],
  ['scrum', 'safe'], ['fdd', 'safe'], ['safe', 'lean'], ['lean', 'less'], ['scrum', 'lean'],
];
const SEA_ROUTES = [];
for (const [r1, r2] of REGION_PAIRS) {
  let best = null;
  for (const x of TERR[r1]) for (const y of TERR[r2]) { const d = dist(x, y); if (!best || d < best.d) best = { x, y, d }; }
  add(best.x, best.y);
  SEA_ROUTES.push([best.x, best.y]);
}

// conectividade global + conserto
const allT = Object.keys(TERRITORY_PATHS);
const connected = () => {
  const seen = new Set([allT[0]]), q = [allT[0]];
  while (q.length) { const c = q.shift(); for (const n of adj[c] || []) if (!seen.has(n)) { seen.add(n); q.push(n); } }
  return seen;
};
let seen = connected();
for (const t of allT) {
  if (seen.has(t)) continue;
  let best = null;
  for (const u of allT) if (seen.has(u)) { const d = dist(t, u); if (!best || d < best.d) best = { u, d }; }
  add(t, best.u); SEA_ROUTES.push([t, best.u]); seen = connected();
}

const GEO_ADJACENCY = {};
for (const t of allT) GEO_ADJACENCY[t] = Array.from(adj[t] || []);

// validação
const degs = allT.map((t) => adj[t].size);
const counts = ORDER.map((c) => c + ':' + byCont[c].length).join(' ');
console.log('países usados por continente:', counts);
console.log('territórios:', allT.length, '| conectividade:', connected().size + '/' + allT.length);
console.log('grau min/méd/max:', Math.min(...degs), (degs.reduce((a, b) => a + b, 0) / degs.length).toFixed(1), Math.max(...degs));
console.log('viewBox:', VW, 'x', VH);
if (allT.length !== 28) throw new Error('esperado 28 territórios, obtido ' + allT.length);
if (connected().size !== 28) throw new Error('grafo desconexo');

const out = `// GERADO por scripts/gen-world.cjs — NÃO edite à mão.
// Mapa-múndi completo: todos os países agrupados em 7 continentes (= métodos),
// cada continente dividido em 4 territórios (clusters de países).
import type { ContinentId } from '../types';

export const MAP_VIEWBOX_WIDTH = ${VW};
export const MAP_VIEWBOX_HEIGHT = ${VH};

export const TERRITORY_PATHS: Record<string, string> = ${JSON.stringify(TERRITORY_PATHS)};

export const TERRITORY_BOUNDARY_PATHS: Record<string, string> = ${JSON.stringify(TERRITORY_BOUNDARY_PATHS)};

export const CONTINENT_PATHS: Record<ContinentId, string> = ${JSON.stringify(CONTINENT_PATHS)} as Record<ContinentId, string>;

export const TERRITORY_CENTERS: Record<string, { x: number; y: number }> = ${JSON.stringify(TERRITORY_CENTERS)};

export const CONTINENT_CENTERS: Record<ContinentId, { x: number; y: number }> = ${JSON.stringify(CONTINENT_CENTERS)} as Record<ContinentId, { x: number; y: number }>;

export const GEO_ADJACENCY: Record<string, string[]> = ${JSON.stringify(GEO_ADJACENCY)};

export const SEA_ROUTES: [string, string][] = ${JSON.stringify(SEA_ROUTES)};
`;
fs.writeFileSync('src/data/worldMap.ts', out);
console.log('>> src/data/worldMap.ts escrito (' + out.length + ' bytes)');
