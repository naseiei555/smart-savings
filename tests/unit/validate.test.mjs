import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { validateGoalPayload, validateSavingPayload, isValidDateString } = require('../../backend/node-red/data/lib/validate.js');

test('validateGoalPayload - Valid payload returns sanitized data', () => {
  const body = {
    name: ' ซื้อ iPhone ',
    target_amount: 35000,
    initial_amount: 5000,
    income: 25000,
    expense: 15000,
    start_date: '2026-10-01',
    target_date: '2027-01-31'
  };
  const res = validateGoalPayload(body);
  assert.equal(res.valid, true);
  assert.equal(res.sanitized.name, 'ซื้อ iPhone');
  assert.equal(res.sanitized.saving_capacity, 10000); // 25000 - 15000
});

test('validateGoalPayload - Rejects invalid dates (e.g. 2026-02-30) and target before start', () => {
  const badDate = validateGoalPayload({
    name: 'Goal',
    target_amount: 1000,
    start_date: '2026-02-30',
    target_date: '2026-05-01'
  });
  assert.equal(badDate.valid, false);

  const inverted = validateGoalPayload({
    name: 'Goal',
    target_amount: 1000,
    start_date: '2026-05-01',
    target_date: '2026-04-01'
  });
  assert.equal(inverted.valid, false);
});

test('validateGoalPayload - Rejects target <= 0, > 10M, NaN, negative amounts', () => {
  assert.equal(validateGoalPayload({ name: 'G', target_amount: 0, start_date: '2026-01-01', target_date: '2026-02-01' }).valid, false);
  assert.equal(validateGoalPayload({ name: 'G', target_amount: -500, start_date: '2026-01-01', target_date: '2026-02-01' }).valid, false);
  assert.equal(validateGoalPayload({ name: 'G', target_amount: 15000000, start_date: '2026-01-01', target_date: '2026-02-01' }).valid, false);
  assert.equal(validateGoalPayload({ name: 'G', target_amount: 'invalid', start_date: '2026-01-01', target_date: '2026-02-01' }).valid, false);
});

test('validateSavingPayload - Validates amount, date bounds, and note', () => {
  const valid = validateSavingPayload(
    { amount: 500, saving_date: '2026-10-05', note: 'ฝากเพิ่ม' },
    '2026-10-01',
    '2026-10-10'
  );
  assert.equal(valid.valid, true);
  assert.equal(valid.sanitized.amount, 500);

  // Before goal start
  assert.equal(
    validateSavingPayload({ amount: 500, saving_date: '2026-09-30' }, '2026-10-01', '2026-10-10').valid,
    false
  );

  // Future date after today
  assert.equal(
    validateSavingPayload({ amount: 500, saving_date: '2026-10-15' }, '2026-10-01', '2026-10-10').valid,
    false
  );
});
