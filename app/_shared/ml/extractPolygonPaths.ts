/**
 * Separa um array linear de índices em sub-caminhos.
 * Um sub-caminho é encerrado quando o índice atual repete o primeiro índice
 * do sub-caminho corrente (convenção FacePipe para polígonos fechados).
 *
 * Ex.: [A, B, C, A, D, E, D] → [[A, B, C], [D, E]]
 * Perioral: [outer_start, ..., outer_start, labial_start, ..., labial_start]
 *   → [[outer], [labial_hole]]
 */
export function extractPolygonPaths(indices: number[]): number[][] {
  const paths: number[][] = [];
  if (indices.length === 0) return paths;

  let start = 0;
  let i = 1;

  while (i < indices.length) {
    if (indices[i] === indices[start]) {
      paths.push(indices.slice(start, i));
      start = i + 1;
      i = start + 1;
    } else {
      i++;
    }
  }

  if (start < indices.length) {
    const tail = indices.slice(start);
    if (tail.length > 1 && tail[tail.length - 1] === tail[0]) {
      tail.pop();
    }
    paths.push(tail);
  }

  return paths;
}
