import 'dotenv/config';

export type LandlordConfig = {
  name: string;
  identification: string;
  address: string;
};

function resolveLandlordValue(envKey: string, fallback: string) {
  const value = process.env[envKey]?.trim();
  if (value) {
    return value;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error(`Missing required environment variable: ${envKey}`);
  }

  return fallback;
}

export const landlordConfig: LandlordConfig = {
  name: resolveLandlordValue('LANDLORD_NAME', 'Apartamentos La Kers, S.L.'),
  identification: resolveLandlordValue('LANDLORD_IDENTIFICATION', 'B12345678'),
  address: resolveLandlordValue('LANDLORD_ADDRESS', 'C/ Mayor 1, 28013 Madrid, España')
};
