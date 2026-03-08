export type TenantStatus = 'ACTIVO' | 'PRÓXIMO A VENCER' | 'VENCIDO' | 'ARCHIVADO';

export type TenantWithMeta = Record<string, unknown> & {
  id?: string;
  units?: Record<string, unknown>;
  contract_start?: string;
  contract_end?: string;
  identification?: string;
  full_name?: string;
  formattedStart: string;
  formattedEnd: string;
  status: TenantStatus;
  daysLabel: string;
  signature: string;
  rawEnd: string;
};
