import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isValidEmail,
  isValidIban,
  toTenantContractProfilePdfFields,
  validateTenantContractProfilePayload
} from '../utils/tenantContractProfile';

test('validateTenantContractProfilePayload requires the core contract fields', () => {
  const errors = validateTenantContractProfilePayload({
    company_name: '',
    tax_id: '',
    fiscal_address_line_1: '',
    fiscal_postal_code: '',
    fiscal_city: '',
    fiscal_country: '',
    legal_representative_name: '',
    legal_representative_id: ''
  });

  assert.deepEqual(errors, [
    'La razón social es obligatoria',
    'El CIF/NIF es obligatorio',
    'La calle y número fiscal son obligatorios',
    'El código postal fiscal es obligatorio',
    'La ciudad fiscal es obligatoria',
    'El país fiscal es obligatorio',
    'El nombre del representante legal es obligatorio',
    'El DNI/NIE del representante legal es obligatorio'
  ]);
});

test('validateTenantContractProfilePayload validates optional email and iban formats when informed', () => {
  const errors = validateTenantContractProfilePayload({
    company_name: 'ACME S.L.',
    tax_id: 'B12345678',
    company_email: 'correo-invalido',
    iban: 'ES12',
    fiscal_address_line_1: 'Calle Mayor 1',
    fiscal_postal_code: '28001',
    fiscal_city: 'Madrid',
    fiscal_country: 'España',
    legal_representative_name: 'Ana Pérez',
    legal_representative_id: '12345678A'
  });

  assert.deepEqual(errors, [
    'El email de empresa no es válido',
    'El IBAN no tiene un formato válido'
  ]);
});

test('isValidEmail and isValidIban accept basic valid values', () => {
  assert.equal(isValidEmail('legal@empresa.es'), true);
  assert.equal(isValidIban('ES91 2100 0418 4502 0005 1332'), true);
});

test('toTenantContractProfilePdfFields returns a stable mapping for future PDF consumption', () => {
  assert.deepEqual(
    toTenantContractProfilePdfFields({
      company_name: 'Inversiones Centro S.L.',
      trade_name: 'Centro Living',
      tax_id: 'B12345678',
      company_email: 'info@centro.es',
      company_phone: '600123123',
      fiscal_address_line_1: 'Calle Real 10',
      fiscal_address_line_2: '3A',
      fiscal_postal_code: '14001',
      fiscal_city: 'Córdoba',
      fiscal_province: 'Córdoba',
      fiscal_country: 'España',
      legal_representative_name: 'María López',
      legal_representative_id: '12345678Z',
      legal_representative_role: 'Administradora',
      iban: 'ES9121000418450200051332',
      contract_notes: 'Firmará con sello.'
    }),
    {
      company_name: 'Inversiones Centro S.L.',
      trade_name: 'Centro Living',
      tax_id: 'B12345678',
      company_email: 'info@centro.es',
      company_phone: '600123123',
      fiscal_address_line_1: 'Calle Real 10',
      fiscal_address_line_2: '3A',
      fiscal_postal_code: '14001',
      fiscal_city: 'Córdoba',
      fiscal_province: 'Córdoba',
      fiscal_country: 'España',
      legal_representative_name: 'María López',
      legal_representative_id: '12345678Z',
      legal_representative_role: 'Administradora',
      iban: 'ES9121000418450200051332',
      contract_notes: 'Firmará con sello.'
    }
  );
});
