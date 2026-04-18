import { describe, it, expect, vi, beforeEach } from 'vitest';

// vi.hoisted garante que as vars estão disponíveis quando vi.mock é içado para o topo
const { mockDetect, mockCreateFromOptions, mockForVisionTasks } = vi.hoisted(() => ({
  mockDetect: vi.fn(),
  mockCreateFromOptions: vi.fn(),
  mockForVisionTasks: vi.fn(),
}));

vi.mock('@mediapipe/tasks-vision', () => ({
  FilesetResolver: { forVisionTasks: mockForVisionTasks },
  FaceLandmarker: { createFromOptions: mockCreateFromOptions },
}));

import { detect, _resetInstance } from './faceLandmarker';

// 478 landmarks sintéticos em posições espalhadas
const MOCK_LANDMARKS = Array.from({ length: 478 }, (_, i) => ({
  x: 0.2 + (i % 20) * 0.03,
  y: 0.1 + Math.floor(i / 20) * 0.04,
  z: 0,
}));

const IDENTITY_MATRIX = [
  1, 0, 0, 0,
  0, 1, 0, 0,
  0, 0, 1, 0,
  0, 0, 0, 1,
];

function makeResult(faces: typeof MOCK_LANDMARKS[]) {
  return {
    faceLandmarks: faces,
    facialTransformationMatrixes: faces.length === 1
      ? [{ data: IDENTITY_MATRIX }]
      : [],
    faceBlendshapes: [],
  };
}

beforeEach(() => {
  _resetInstance();
  vi.clearAllMocks();
  mockForVisionTasks.mockResolvedValue({});
  mockCreateFromOptions.mockResolvedValue({ detect: mockDetect });
  // fetch falha → cai para modelo local (sem rede em testes)
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('no network')));
});

describe('faceLandmarker — detect()', () => {
  it('retorna estrutura correta com 1 face detectada', async () => {
    mockDetect.mockReturnValue(makeResult([MOCK_LANDMARKS]));

    const result = await detect({} as HTMLCanvasElement);

    expect(result.faceCount).toBe(1);
    expect(result.landmarks).toHaveLength(478);
    expect(result.landmarks[0]).toMatchObject({ x: expect.any(Number), y: expect.any(Number), z: expect.any(Number) });
    expect(result.rotation).toBeDefined();
    expect(result.rotation).toMatchObject({
      yaw: expect.any(Number),
      pitch: expect.any(Number),
      roll: expect.any(Number),
    });
  });

  it('lança erro quando nenhuma face é detectada', async () => {
    mockDetect.mockReturnValue(makeResult([]));
    await expect(detect({} as HTMLCanvasElement)).rejects.toThrow('Nenhuma face');
  });

  it('lança erro com faceCount quando múltiplas faces são detectadas', async () => {
    mockDetect.mockReturnValue(makeResult([MOCK_LANDMARKS, MOCK_LANDMARKS]));
    await expect(detect({} as HTMLCanvasElement)).rejects.toMatchObject({ faceCount: 2 });
  });

  it('rotation é undefined quando matrix não é fornecida', async () => {
    mockDetect.mockReturnValue({
      faceLandmarks: [MOCK_LANDMARKS],
      facialTransformationMatrixes: undefined,
      faceBlendshapes: [],
    });
    const result = await detect({} as HTMLCanvasElement);
    expect(result.rotation).toBeUndefined();
  });
});

describe('faceLandmarker — singleton', () => {
  it('createFromOptions é chamado apenas uma vez (singleton)', async () => {
    mockDetect.mockReturnValue(makeResult([MOCK_LANDMARKS]));

    await detect({} as HTMLCanvasElement);
    await detect({} as HTMLCanvasElement);
    await detect({} as HTMLCanvasElement);

    expect(mockCreateFromOptions).toHaveBeenCalledTimes(1);
  });

  it('_resetInstance() força reinicialização', async () => {
    mockDetect.mockReturnValue(makeResult([MOCK_LANDMARKS]));

    await detect({} as HTMLCanvasElement);
    _resetInstance();
    await detect({} as HTMLCanvasElement);

    expect(mockCreateFromOptions).toHaveBeenCalledTimes(2);
  });
});
