export type TenantContractProfilePayload = {
  company_name: string;
  trade_name: string;
  tax_id: string;
  company_email: string;
  company_phone: string;
  fiscal_address_line_1: string;
  fiscal_address_line_2: string;
  fiscal_postal_code: string;
  fiscal_city: string;
  fiscal_province: string;
  fiscal_country: string;
  legal_representative_name: string;
  legal_representative_id: string;
  legal_representative_role: string;
  iban: string;
  contract_notes: string;
};

export type TenantContractProfileRecord = {
  tenant_person_id?: string;
  company_name?: string | null;
  trade_name?: string | null;
  tax_id?: string | null;
  company_email?: string | null;
  company_phone?: string | null;
  fiscal_address_line_1?: string | null;
  fiscal_address_line_2?: string | null;
  fiscal_postal_code?: string | null;
  fiscal_city?: string | null;
  fiscal_province?: string | null;
  fiscal_country?: string | null;
  legal_representative_name?: string | null;
  legal_representative_id?: string | null;
  legal_representative_role?: string | null;
  iban?: string | null;
  contract_notes?: string | null;
  created_at?: string;
  updated_at?: string;
};

export const createEmptyTenantContractProfilePayload = (): TenantContractProfilePayload => ({
  company_name: '',
  trade_name: '',
  tax_id: '',
  company_email: '',
  company_phone: '',
  fiscal_address_line_1: '',
  fiscal_address_line_2: '',
  fiscal_postal_code: '',
  fiscal_city: '',
  fiscal_province: '',
  fiscal_country: '',
  legal_representative_name: '',
  legal_representative_id: '',
  legal_representative_role: '',
  iban: '',
  contract_notes: ''
});
