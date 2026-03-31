import test from 'node:test';
import assert from 'node:assert/strict';
import {
  hasCustomContractLandlordProfile,
  resolveContractLandlordProfile
} from '../utils/contractLandlordProfile';

test('resolveContractLandlordProfile uses apartment contract data when fully configured', () => {
  const resolved = resolveContractLandlordProfile(
    {
      contract_landlord_name: 'Marina López',
      contract_landlord_identification: '12345678Z',
      contract_landlord_address: 'Calle Real 10, Córdoba'
    },
    {
      name: 'Fallback Owner',
      identification: 'B00000000',
      address: 'Fallback Street 1'
    }
  );

  assert.deepEqual(resolved, {
    name: 'Marina López',
    identification: '12345678Z',
    address: 'Calle Real 10, Córdoba'
  });
});

test('resolveContractLandlordProfile falls back to global config when apartment data is empty', () => {
  const resolved = resolveContractLandlordProfile(
    {
      contract_landlord_name: ' ',
      contract_landlord_identification: null,
      contract_landlord_address: ''
    },
    {
      name: 'Fallback Owner',
      identification: 'B00000000',
      address: 'Fallback Street 1'
    }
  );

  assert.deepEqual(resolved, {
    name: 'Fallback Owner',
    identification: 'B00000000',
    address: 'Fallback Street 1'
  });
});

test('hasCustomContractLandlordProfile only returns true when the apartment profile is complete', () => {
  assert.equal(
    hasCustomContractLandlordProfile({
      contract_landlord_name: 'Marina López',
      contract_landlord_identification: '12345678Z',
      contract_landlord_address: 'Calle Real 10, Córdoba'
    }),
    true
  );

  assert.equal(
    hasCustomContractLandlordProfile({
      contract_landlord_name: 'Marina López',
      contract_landlord_identification: '',
      contract_landlord_address: 'Calle Real 10, Córdoba'
    }),
    false
  );
});
