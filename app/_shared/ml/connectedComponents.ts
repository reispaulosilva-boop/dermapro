/**
 * DermaPro — Rotulação de Componentes Conectados
 *
 * Algoritmo two-pass (Rosenfeld & Pfaltz 1966) com Union-Find (path-halving compression).
 * Suporta conectividade 4 (N/S/L/O) e 8 (inclui diagonais).
 */

// ─── TIPOS ────────────────────────────────────────────────────────────────────

export type ConnectedComponent = {
  id: number;
  pixels: number[];          // índices lineares no array de entrada
  area: number;
  bbox: { x1: number; y1: number; x2: number; y2: number };
  centroid: { x: number; y: number };
};

// ─── UNION-FIND ───────────────────────────────────────────────────────────────

class UnionFind {
  private parent: Int32Array;

  constructor(maxSize: number) {
    this.parent = Int32Array.from({ length: maxSize }, (_, i) => i);
  }

  /** Find com path-halving (compressão parcial — O(α)). */
  find(x: number): number {
    while (this.parent[x]! !== x) {
      this.parent[x] = this.parent[this.parent[x]!]!;
      x = this.parent[x]!;
    }
    return x;
  }

  union(x: number, y: number): void {
    const rx = this.find(x);
    const ry = this.find(y);
    if (rx !== ry) this.parent[rx] = ry;
  }
}

// ─── ROTULAÇÃO ────────────────────────────────────────────────────────────────

/**
 * Rotula componentes conectados em imagem binária.
 *
 * @param binary Imagem binária (0 = background, >0 = foreground).
 * @param connectivity 4 (N/S/L/O) ou 8 (inclui diagonais).
 */
export function connectedComponents(
  binary: Uint8Array,
  width: number,
  height: number,
  connectivity: 4 | 8 = 8,
): ConnectedComponent[] {
  const labels = new Int32Array(binary.length);
  const uf = new UnionFind(binary.length + 1);
  let nextLabel = 1;

  // ── Primeira passagem: atribuir e fundir labels ───────────────────────────
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (!binary[idx]) continue;

      const nl: number[] = [];
      if (y > 0 && binary[(y - 1) * width + x])     nl.push(labels[(y - 1) * width + x]!);
      if (x > 0 && binary[y * width + x - 1])        nl.push(labels[y * width + x - 1]!);
      if (connectivity === 8) {
        if (y > 0 && x > 0     && binary[(y-1)*width+x-1]) nl.push(labels[(y-1)*width+x-1]!);
        if (y > 0 && x < width-1 && binary[(y-1)*width+x+1]) nl.push(labels[(y-1)*width+x+1]!);
      }

      const valid = nl.filter(l => l > 0);
      if (valid.length === 0) {
        labels[idx] = nextLabel++;
      } else {
        const root = valid.reduce((min, l) => {
          const r = uf.find(l);
          return r < uf.find(min) ? r : uf.find(min);
        }, valid[0]!);
        labels[idx] = root;
        for (const l of valid) uf.union(root, l);
      }
    }
  }

  // ── Segunda passagem: agrupar pixels por raiz ─────────────────────────────
  const groups = new Map<number, number[]>();
  for (let i = 0; i < binary.length; i++) {
    if (!labels[i]) continue;
    const root = uf.find(labels[i]!);
    let arr = groups.get(root);
    if (!arr) { arr = []; groups.set(root, arr); }
    arr.push(i);
  }

  // ── Construir componentes ─────────────────────────────────────────────────
  const components: ConnectedComponent[] = [];
  let id = 1;
  for (const [, pixels] of groups) {
    let x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity;
    let sumX = 0, sumY = 0;
    for (const idx of pixels) {
      const px = idx % width;
      const py = Math.floor(idx / width);
      if (px < x1) x1 = px; if (px > x2) x2 = px;
      if (py < y1) y1 = py; if (py > y2) y2 = py;
      sumX += px; sumY += py;
    }
    components.push({
      id: id++, pixels,
      area: pixels.length,
      bbox: { x1, y1, x2, y2 },
      centroid: { x: sumX / pixels.length, y: sumY / pixels.length },
    });
  }
  return components;
}

// ─── ANÁLISE DE FORMA ────────────────────────────────────────────────────────

/**
 * Excentricidade baseada nos momentos de segunda ordem.
 * 0 = círculo perfeito, 1 = linha reta.
 */
export function calculateEccentricity(pixels: number[], width: number): number {
  if (pixels.length < 3) return 0;
  const n = pixels.length;
  let sumX = 0, sumY = 0;
  for (const idx of pixels) { sumX += idx % width; sumY += Math.floor(idx / width); }
  const cx = sumX / n, cy = sumY / n;

  let mu20 = 0, mu02 = 0, mu11 = 0;
  for (const idx of pixels) {
    const dx = (idx % width) - cx;
    const dy = Math.floor(idx / width) - cy;
    mu20 += dx * dx; mu02 += dy * dy; mu11 += dx * dy;
  }
  mu20 /= n; mu02 /= n; mu11 /= n;

  const trace = mu20 + mu02;
  const disc  = Math.max(0, (trace / 2) ** 2 - (mu20 * mu02 - mu11 * mu11));
  const lambdaMajor = trace / 2 + Math.sqrt(disc);
  const lambdaMinor = trace / 2 - Math.sqrt(disc);
  if (lambdaMajor <= 0) return 0;
  return Math.sqrt(Math.max(0, 1 - lambdaMinor / lambdaMajor));
}

/**
 * Orientação do eixo maior em graus (0 = horizontal, 90 = vertical).
 */
export function calculateOrientation(pixels: number[], width: number): number {
  if (pixels.length < 3) return 0;
  const n = pixels.length;
  let sumX = 0, sumY = 0;
  for (const idx of pixels) { sumX += idx % width; sumY += Math.floor(idx / width); }
  const cx = sumX / n, cy = sumY / n;

  let mu20 = 0, mu02 = 0, mu11 = 0;
  for (const idx of pixels) {
    const dx = (idx % width) - cx;
    const dy = Math.floor(idx / width) - cy;
    mu20 += dx * dx; mu02 += dy * dy; mu11 += dx * dy;
  }
  return 0.5 * Math.atan2(2 * mu11, mu20 - mu02) * (180 / Math.PI);
}

// ─── FILTRO ───────────────────────────────────────────────────────────────────

/**
 * Filtra componentes por critérios de forma e tamanho.
 *
 * @param width Necessário para calcular excentricidade (decodifica índices lineares).
 */
export function filterComponents(
  components: ConnectedComponent[],
  width: number,
  opts: {
    minArea?: number;
    maxArea?: number;
    maxEccentricity?: number;
    minFillRatio?: number;
  },
): ConnectedComponent[] {
  return components.filter(c => {
    if (opts.minArea !== undefined && c.area < opts.minArea) return false;
    if (opts.maxArea !== undefined && c.area > opts.maxArea) return false;
    if (opts.maxEccentricity !== undefined) {
      if (calculateEccentricity(c.pixels, width) > opts.maxEccentricity) return false;
    }
    if (opts.minFillRatio !== undefined) {
      const bboxArea = (c.bbox.x2 - c.bbox.x1 + 1) * (c.bbox.y2 - c.bbox.y1 + 1);
      if (bboxArea > 0 && c.area / bboxArea < opts.minFillRatio) return false;
    }
    return true;
  });
}
