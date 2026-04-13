export type TenantContractProfilePayload = {
  company_name: string;
  trade_name?: string | null;
  tax_id: string;
  company_email?: string | null;
  company_phone?: string | null;
  fiscal_address_line_1: string;
  fiscal_address_line_2?: string | null;
  fiscal_postal_code: string;
  fiscal_city: string;
  fiscal_province?: string | null;
  fiscal_country: string;
  legal_representative_name: string;
  legal_representative_id: string;
  legal_representative_role?: string | null;
  iban?: string | null;
  contract_notes?: string | null;
};

export type TenantContractProfileRecord = TenantContractProfilePayload & {
  tenant_person_id: string;
  created_at?: string;
  updated_at?: string;
};

export type TenantContractProfilePdfFields = {
  company_name: string | null;
  trade_name: string | null;
  tax_id: string | null;
  company_email: string | null;
  company_phone: string | null;
  fiscal_address_line_1: string | null;
  fiscal_address_line_2: string | null;
  fiscal_postal_code: string | null;
  fiscal_city: string | null;
  fiscal_province: string | null;
  fiscal_country: string | null;
  legal_representative_name: string | null;
  legal_representative_id: string | null;
  legal_representative_role: string | null;
  iban: string | null;
  contract_notes: string | null;
};

const requiredFieldLabels: Array<[keyof TenantContractProfilePayload, string]> = [
  ['company_name', 'La razón social es obligatoria'],
  ['tax_id', 'El CIF/NIF es obligatorio'],
  ['fiscal_address_line_1', 'La calle y número fiscal son obligatorios'],
  ['fiscal_postal_code', 'El código postal fiscal es obligatorio'],
  ['fiscal_city', 'La ciudad fiscal es obligatoria'],
  ['fiscal_country', 'El país fiscal es obligatorio'],
  ['legal_representative_name', 'El nombre del representante legal es obligatorio'],
  ['legal_representative_id', 'El DNI/NIE del representante legal es obligatorio']
];

const normalizeText = (value: unknown) => {
  const normalized = String(value ?? '').trim();
  return normalized || '';
};

const normalizeOptionalText = (value: unknown) => {
  const normalized = normalizeText(value);
  return normalized || null;
};

const compactIban = (value: string) => value.replace(/\s+/g, '').toUpperCase();

export const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export const isValidIban = (value: string) => {
  const normalized = compactIban(value);
  return /^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(normalized) && normalized.length >= 15 && normalized.length <= 34;
};

export function normalizeTenantContractProfilePayload(
  payload: Record<string, unknown>,
  options: { partial?: boolean } = {}
): Partial<TenantContractProfilePayload> {
  const { partial = false } = options;
  const normalized: Partial<TenantContractProfilePayload> = {};

  const assignRequired = (field: keyof TenantContractProfilePayload) => {
    if (!partial || payload[field] !== undefined) {
      normalized[field] = normalizeText(payload[field]) as never;
    }
  };

  const assignOptional = (field: keyof TenantContractProfilePayload) => {
    if (!partial || payload[field] !== undefined) {
      normalized[field] = normalizeOptionalText(payload[field]) as never;
    }
  };

  assignRequired('company_name');
  assignOptional('trade_name');
  assignRequired('tax_id');
  assignOptional('company_email');
  assignOptional('company_phone');
  assignRequired('fiscal_address_line_1');
  assignOptional('fiscal_address_line_2');
  assignRequired('fiscal_postal_code');
  assignRequired('fiscal_city');
  assignOptional('fiscal_province');
  assignRequired('fiscal_country');
  assignRequired('legal_representative_name');
  assignRequired('legal_representative_id');
  assignOptional('legal_representative_role');
  assignOptional('iban');
  assignOptional('contract_notes');

  return normalized;
}

export function validateTenantContractProfilePayload(
  payload: Partial<TenantContractProfilePayload>,
  options: { partial?: boolean } = {}
) {
  const { partial = false } = options;
  const errors: string[] = [];

  requiredFieldLabels.forEach(([field, label]) => {
    if (!partial || payload[field] !== undefined) {
      if (!normalizeText(payload[field])) {
        errors.push(label);
      }
    }
  });

  if (payload.company_email !== undefined && payload.company_email) {
    if (!isValidEmail(String(payload.company_email))) {
      errors.push('El email de empresa no es válido');
    }
  }

  if (payload.iban !== undefined && payload.iban) {
    if (!isValidIban(String(payload.iban))) {
      errors.push('El IBAN no tiene un formato válido');
    }
  }

  return errors;
}

export const hasTenantContractProfileData = (profile?: Partial<TenantContractProfilePayload> | null) => {
  if (!profile) return false;
  return Object.values(toTenantContractProfilePdfFields(profile)).some(Boolean);
};

export const toTenantContractProfilePdfFields = (
  profile?: Partial<TenantContractProfilePayload> | null
): TenantContractProfilePdfFields => ({
  company_name: normalizeOptionalText(profile?.company_name),
  trade_name: normalizeOptionalText(profile?.trade_name),
  tax_id: normalizeOptionalText(profile?.tax_id),
  company_email: normalizeOptionalText(profile?.company_email),
  company_phone: normalizeOptionalText(profile?.company_phone),
  fiscal_address_line_1: normalizeOptionalText(profile?.fiscal_address_line_1),
  fiscal_address_line_2: normalizeOptionalText(profile?.fiscal_address_line_2),
  fiscal_postal_code: normalizeOptionalText(profile?.fiscal_postal_code),
  fiscal_city: normalizeOptionalText(profile?.fiscal_city),
  fiscal_province: normalizeOptionalText(profile?.fiscal_province),
  fiscal_country: normalizeOptionalText(profile?.fiscal_country),
  legal_representative_name: normalizeOptionalText(profile?.legal_representative_name),
  legal_representative_id: normalizeOptionalText(profile?.legal_representative_id),
  legal_representative_role: normalizeOptionalText(profile?.legal_representative_role),
  iban: normalizeOptionalText(profile?.iban),
  contract_notes: normalizeOptionalText(profile?.contract_notes)
});
