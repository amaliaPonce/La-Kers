export type LandlordConfig = {
  name: string;
  identification: string;
  address: string;
};

export const landlordConfig: LandlordConfig = {
  name: process.env.LANDLORD_NAME?.trim() || 'Apartamentos La Kers, S.L.',
  identification: process.env.LANDLORD_IDENTIFICATION?.trim() || 'B12345678',
  address: process.env.LANDLORD_ADDRESS?.trim() || 'C/ Mayor 1, 28013 Madrid, España'
};
