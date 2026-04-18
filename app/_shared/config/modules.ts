/**
 * DermaPro — Registro Central de Módulos
 *
 * Source of truth para todos os módulos do hub.
 * Alterar `enabled` aqui ativa/desativa o módulo em toda a aplicação.
 *
 * Referência canônica: docs/00-MASTER.md seção 3.2.
 */

export type ModuleConfig = {
  id: string;
  enabled: boolean;
  name: string;
  description: string;
  href: string;
  icon: string;
  order: number;
  badge?: 'beta' | 'em-breve' | null;
};

export const MODULES: ModuleConfig[] = [
  {
    id: 'acne',
    enabled: true,
    name: 'Análise de Acne',
    description: 'Detecção e contagem de lesões acneiformes.',
    href: '/acne',
    icon: 'Target',
    order: 1,
    badge: 'beta',
  },
  {
    id: 'melasma',
    enabled: true,
    name: 'Análise de Melasma',
    description: 'Avaliação de hiperpigmentação por região facial.',
    href: '/melasma',
    icon: 'Sun',
    order: 2,
    badge: 'beta',
  },
  {
    id: 'textura',
    enabled: true,
    name: 'Análise de Textura',
    description: 'Poros e oleosidade por região da Zona T.',
    href: '/textura',
    icon: 'Sparkles',
    order: 3,
    badge: 'beta',
  },
  {
    id: 'linhas',
    enabled: true,
    name: 'Análise de Sinais de Expressão',
    description: 'Linhas faciais por região anatômica.',
    href: '/linhas',
    icon: 'LineChart',
    order: 4,
    badge: 'beta',
  },
  {
    id: 'rosacea',
    enabled: false,
    name: 'Análise de Rosácea',
    description: 'Vermelhidão e teleangiectasias.',
    href: '/rosacea',
    icon: 'Flame',
    order: 5,
    badge: 'em-breve',
  },
  {
    id: 'estrutura-facial',
    enabled: false,
    name: 'Análise de Estrutura Facial',
    description: 'Proporções e harmonia via MediaPipe FaceMesh.',
    href: '/estrutura-facial',
    icon: 'Grid3x3',
    order: 6,
    badge: 'em-breve',
  },
];

export const getEnabledModules = () =>
  MODULES.filter(m => m.enabled).sort((a, b) => a.order - b.order);

export const getAllModules = () =>
  [...MODULES].sort((a, b) => a.order - b.order);

export const getModuleById = (id: string) =>
  MODULES.find(m => m.id === id);
