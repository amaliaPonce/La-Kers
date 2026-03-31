import { landlordConfig, type LandlordConfig } from '../config/landlordConfig';

export type UnitContractLandlordFields = {
  contract_landlord_name?: string | null;
  contract_landlord_identification?: string | null;
  contract_landlord_address?: string | null;
};

const normalizeText = (value?: string | null) => {
  const normalized = String(value ?? '').trim();
  return normalized || null;
};

export const hasCustomContractLandlordProfile = (unit?: UnitContractLandlordFields | null) => {
  return Boolean(
    normalizeText(unit?.contract_landlord_name) &&
      normalizeText(unit?.contract_landlord_identification) &&
      normalizeText(unit?.contract_landlord_address)
  );
};

export const resolveContractLandlordProfile = (
  unit?: UnitContractLandlordFields | null,
  fallback: LandlordConfig = landlordConfig
): LandlordConfig => {
  return {
    name: normalizeText(unit?.contract_landlord_name) ?? fallback.name,
    identification: normalizeText(unit?.contract_landlord_identification) ?? fallback.identification,
    address: normalizeText(unit?.contract_landlord_address) ?? fallback.address
  };
};
