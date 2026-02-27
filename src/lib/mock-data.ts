export type InstrumentStatus = 'ativo' | 'inativo' | 'manutencao';
export type CalibrationResult = 'aprovado' | 'reprovado';
export type UserRole = 'admin' | 'tecnico' | 'visualizador';

export interface Instrument {
  id: string;
  codigo: string;
  serie: string;
  descricao: string;
  fabricante: string;
  modelo: string;
  setor: string;
  responsavel: string;
  dataAquisicao: string;
  periodicidadeDias: number;
  status: InstrumentStatus;
  ultimaCalibracao?: string;
  proximaCalibracao?: string;
}

export interface Calibration {
  id: string;
  instrumentoId: string;
  dataCalibracao: string;
  resultado: CalibrationResult;
  erroMedido: number;
  tolerancia: number;
  tecnicoId: string;
  tecnicoNome: string;
  certificadoUrl?: string;
  proximaCalibracao: string;
}

export const mockInstruments: Instrument[] = [
  { id: '1', codigo: 'PAQ-001', serie: 'SN-2024-001', descricao: 'Paquímetro Digital 150mm', fabricante: 'Mitutoyo', modelo: 'CD-6"CSX', setor: 'Usinagem', responsavel: 'Carlos Silva', dataAquisicao: '2023-01-15', periodicidadeDias: 180, status: 'ativo', ultimaCalibracao: '2025-08-10', proximaCalibracao: '2026-02-06' },
  { id: '2', codigo: 'MIC-002', serie: 'SN-2024-002', descricao: 'Micrômetro Externo 0-25mm', fabricante: 'Mitutoyo', modelo: 'MDC-25SX', setor: 'Qualidade', responsavel: 'Ana Santos', dataAquisicao: '2023-03-20', periodicidadeDias: 365, status: 'ativo', ultimaCalibracao: '2025-06-15', proximaCalibracao: '2026-06-15' },
  { id: '3', codigo: 'TRQ-003', serie: 'SN-2024-003', descricao: 'Torquímetro 10-100 Nm', fabricante: 'Gedore', modelo: 'DREMOMETER BN', setor: 'Montagem', responsavel: 'Pedro Oliveira', dataAquisicao: '2022-11-01', periodicidadeDias: 365, status: 'ativo', ultimaCalibracao: '2025-03-01', proximaCalibracao: '2026-03-01' },
  { id: '4', codigo: 'MUL-004', serie: 'SN-2024-004', descricao: 'Multímetro Digital', fabricante: 'Fluke', modelo: '87V', setor: 'Elétrica', responsavel: 'Roberto Lima', dataAquisicao: '2023-06-10', periodicidadeDias: 365, status: 'ativo', ultimaCalibracao: '2025-01-20', proximaCalibracao: '2026-01-20' },
  { id: '5', codigo: 'MAN-005', serie: 'SN-2024-005', descricao: 'Manômetro 0-10 bar', fabricante: 'WIKA', modelo: '213.53', setor: 'Utilidades', responsavel: 'Fernanda Costa', dataAquisicao: '2022-08-15', periodicidadeDias: 180, status: 'inativo', ultimaCalibracao: '2025-05-10', proximaCalibracao: '2025-11-06' },
  { id: '6', codigo: 'REL-006', serie: 'SN-2024-006', descricao: 'Relógio Comparador 0-10mm', fabricante: 'Mitutoyo', modelo: '2046S', setor: 'Qualidade', responsavel: 'Ana Santos', dataAquisicao: '2023-09-01', periodicidadeDias: 365, status: 'manutencao', ultimaCalibracao: '2025-09-01', proximaCalibracao: '2026-09-01' },
  { id: '7', codigo: 'TRM-007', serie: 'SN-2024-007', descricao: 'Termômetro Digital', fabricante: 'Incoterm', modelo: 'ST-50', setor: 'Laboratório', responsavel: 'Maria Souza', dataAquisicao: '2024-01-10', periodicidadeDias: 180, status: 'ativo', ultimaCalibracao: '2025-12-01', proximaCalibracao: '2026-05-30' },
  { id: '8', codigo: 'BAL-008', serie: 'SN-2024-008', descricao: 'Balança Analítica 0.001g', fabricante: 'Shimadzu', modelo: 'AUW220D', setor: 'Laboratório', responsavel: 'Maria Souza', dataAquisicao: '2023-04-15', periodicidadeDias: 365, status: 'ativo', ultimaCalibracao: '2025-04-15', proximaCalibracao: '2026-04-15' },
];

export const mockCalibrations: Calibration[] = [
  { id: '1', instrumentoId: '1', dataCalibracao: '2025-08-10', resultado: 'aprovado', erroMedido: 0.02, tolerancia: 0.05, tecnicoId: 't1', tecnicoNome: 'João Pereira', proximaCalibracao: '2026-02-06' },
  { id: '2', instrumentoId: '2', dataCalibracao: '2025-06-15', resultado: 'aprovado', erroMedido: 0.001, tolerancia: 0.003, tecnicoId: 't1', tecnicoNome: 'João Pereira', proximaCalibracao: '2026-06-15' },
  { id: '3', instrumentoId: '4', dataCalibracao: '2025-01-20', resultado: 'reprovado', erroMedido: 2.5, tolerancia: 1.0, tecnicoId: 't2', tecnicoNome: 'Lucas Martins', proximaCalibracao: '2026-01-20' },
  { id: '4', instrumentoId: '3', dataCalibracao: '2025-03-01', resultado: 'aprovado', erroMedido: 0.5, tolerancia: 2.0, tecnicoId: 't2', tecnicoNome: 'Lucas Martins', proximaCalibracao: '2026-03-01' },
];

export function getInstrumentStats(instruments: Instrument[]) {
  const today = new Date();
  const in30Days = new Date(today);
  in30Days.setDate(in30Days.getDate() + 30);

  const total = instruments.length;
  const ativos = instruments.filter(i => i.status === 'ativo').length;
  const inativos = instruments.filter(i => i.status === 'inativo').length;
  const manutencao = instruments.filter(i => i.status === 'manutencao').length;

  const vencidos = instruments.filter(i => {
    if (!i.proximaCalibracao) return false;
    return new Date(i.proximaCalibracao) < today;
  }).length;

  const aVencer30 = instruments.filter(i => {
    if (!i.proximaCalibracao) return false;
    const prox = new Date(i.proximaCalibracao);
    return prox >= today && prox <= in30Days;
  }).length;

  const emDia = instruments.filter(i => {
    if (!i.proximaCalibracao) return false;
    return new Date(i.proximaCalibracao) > in30Days;
  }).length;

  const taxaConformidade = total > 0 ? Math.round(((total - vencidos) / total) * 100) : 0;

  return { total, ativos, inativos, manutencao, vencidos, aVencer30, emDia, taxaConformidade };
}

export function getSetores(instruments: Instrument[]): string[] {
  return [...new Set(instruments.map(i => i.setor))];
}
