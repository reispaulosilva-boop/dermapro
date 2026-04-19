import { describe, it, expect } from 'vitest';
import { extractPolygonPaths } from './extractPolygonPaths';
import topographicIndices from './topographicIndices.json';

describe('extractPolygonPaths', () => {
  it('array vazio → []', () => {
    expect(extractPolygonPaths([])).toEqual([]);
  });

  it('[A, B, C] sem fechamento → [[A, B, C]]', () => {
    expect(extractPolygonPaths([1, 2, 3])).toEqual([[1, 2, 3]]);
  });

  it('[A, B, C, A] com fechamento → [[A, B, C]]', () => {
    expect(extractPolygonPaths([1, 2, 3, 1])).toEqual([[1, 2, 3]]);
  });

  it('[A, B, C, A, D, E, D] → [[A, B, C], [D, E]]', () => {
    expect(extractPolygonPaths([1, 2, 3, 1, 4, 5, 4])).toEqual([[1, 2, 3], [4, 5]]);
  });

  it('perioral real do JSON → 2 sub-caminhos', () => {
    const paths = extractPolygonPaths(topographicIndices.perioral);
    expect(paths).toHaveLength(2);
    expect(paths[0]!.length).toBeGreaterThan(2);
    expect(paths[1]!.length).toBeGreaterThan(2);
  });

  it('frontal (1 polígono fechado) → 1 sub-caminho', () => {
    const paths = extractPolygonPaths(topographicIndices.frontal);
    expect(paths).toHaveLength(1);
    expect(paths[0]!.length).toBeGreaterThan(2);
  });

  it('fechamento removido: [A,B,C,A] produz path de comprimento 3, não 4', () => {
    const paths = extractPolygonPaths([10, 20, 30, 10]);
    // O índice de fechamento (10 repetido) não deve duplicar o elemento inicial
    expect(paths[0]).toHaveLength(3);
    expect(paths[0]).toEqual([10, 20, 30]);
  });
});
