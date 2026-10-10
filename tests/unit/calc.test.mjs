import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { computeGoalMetrics, buildChartSeries } = require('../../backend/node-red/data/lib/calc.js');

test('Calculation Engine - Test Vector A (Initial 5000, Target 30000, No Tx)', () => {
  const goal = {
    target_amount: 30000,
    initial_amount: 5000,
    start_date: '2026-10-01',
    target_date: '2027-01-29'
  };
  const today = '2026-10-11';
  const res = computeGoalMetrics(goal, 0, today);

  assert.equal(res.current, 5000);
  assert.equal(res.remaining, 25000);
  assert.equal(res.days_left, 110);
  assert.equal(res.daily, 227.27);
  assert.equal(res.weekly, 1590.89);
  assert.equal(res.monthly, 6818.18);
  assert.equal(res.progress, 16.67);
  assert.equal(res.planned_to_date, 2083.33);
  assert.equal(res.actual_saved, 0);
  assert.equal(res.ratio, 0);
  assert.equal(res.status, 'behind');
  assert.equal(res.overdue, false);
});

test('Calculation Engine - Test Vector B (With Tx 2500)', () => {
  const goal = {
    target_amount: 30000,
    initial_amount: 5000,
    start_date: '2026-10-01',
    target_date: '2027-01-29'
  };
  const today = '2026-10-11';
  const res = computeGoalMetrics(goal, 2500, today);

  assert.equal(res.current, 7500);
  assert.equal(res.remaining, 22500);
  assert.equal(res.daily, 204.55);
  assert.equal(res.progress, 25.00);
  assert.equal(res.actual_saved, 2500);
  assert.equal(res.ratio, 1.2);
  assert.equal(res.status, 'on_track');
});

test('Calculation Engine - Test Vector C (Target Reached / Completed)', () => {
  const goal = {
    target_amount: 30000,
    initial_amount: 5000,
    start_date: '2026-10-01',
    target_date: '2027-01-29'
  };
  const today = '2026-10-11';
  const res = computeGoalMetrics(goal, 25000, today);

  assert.equal(res.status, 'completed');
  assert.equal(res.remaining, 0);
  assert.equal(res.progress, 100);
  assert.equal(res.daily, 0);
  assert.equal(res.weekly, 0);
  assert.equal(res.monthly, 0);
});

test('Calculation Engine - Test Vector D (Overdue with remaining > 0)', () => {
  const goal = {
    target_amount: 30000,
    initial_amount: 5000,
    start_date: '2026-10-01',
    target_date: '2027-01-29'
  };
  const today = '2027-02-05';
  const res = computeGoalMetrics(goal, 0, today);

  assert.equal(res.overdue, true);
  assert.ok(res.days_left < 0);
  assert.equal(res.daily, 25000);
  assert.equal(res.status, 'behind');
});

test('Calculation Engine - Test Vector E (start = target = today, total_days = 0)', () => {
  const goal = {
    target_amount: 10000,
    initial_amount: 2000,
    start_date: '2026-10-10',
    target_date: '2026-10-10'
  };
  const today = '2026-10-10';
  const res = computeGoalMetrics(goal, 0, today);

  assert.equal(res.planned_to_date, 8000);
  assert.equal(res.overdue, true);
  assert.equal(res.daily, 8000);
});

test('Calculation Engine - Test Vector F (Threshold boundary tests: on_track, at_risk, behind)', () => {
  const goal = {
    target_amount: 10000,
    initial_amount: 0,
    start_date: '2026-10-01',
    target_date: '2026-10-21'
  };
  const today = '2026-10-11'; // total_days = 20, elapsed = 10 -> planned_to_date = 5000

  // ratio = actual / 5000
  // actual = 4750 -> ratio = 0.95 -> on_track
  const res1 = computeGoalMetrics(goal, 4750, today);
  assert.equal(res1.ratio, 0.95);
  assert.equal(res1.status, 'on_track');

  // actual = 4700 -> ratio = 0.94 -> at_risk
  const res2 = computeGoalMetrics(goal, 4700, today);
  assert.equal(res2.ratio, 0.94);
  assert.equal(res2.status, 'at_risk');

  // actual = 3750 -> ratio = 0.75 -> at_risk
  const res3 = computeGoalMetrics(goal, 3750, today);
  assert.equal(res3.ratio, 0.75);
  assert.equal(res3.status, 'at_risk');

  // actual = 3700 -> ratio = 0.74 -> behind
  const res4 = computeGoalMetrics(goal, 3700, today);
  assert.equal(res4.ratio, 0.74);
  assert.equal(res4.status, 'behind');
});

test('Calculation Engine - Test Vector G (planned_to_date = 0 on day 1 -> ratio = 1)', () => {
  const goal = {
    target_amount: 10000,
    initial_amount: 0,
    start_date: '2026-10-10',
    target_date: '2026-10-20'
  };
  const today = '2026-10-10'; // day 1, elapsed = 0
  const res = computeGoalMetrics(goal, 0, today);

  assert.equal(res.planned_to_date, 0);
  assert.equal(res.ratio, 1);
  assert.equal(res.status, 'on_track');
});

test('Calculation Engine - Test Vector H (current > target, over_amount)', () => {
  const goal = {
    target_amount: 5000,
    initial_amount: 1000,
    start_date: '2026-10-01',
    target_date: '2026-10-20'
  };
  const today = '2026-10-10';
  const res = computeGoalMetrics(goal, 6000, today); // total 7000 > 5000

  assert.equal(res.current, 7000);
  assert.equal(res.remaining, 0);
  assert.equal(res.progress, 100);
  assert.equal(res.over_amount, 2000);
  assert.equal(res.status, 'completed');
});

test('Calculation Engine - buildChartSeries generates weekly points and null for future', () => {
  const goal = {
    target_amount: 10000,
    initial_amount: 2000,
    start_date: '2026-10-01',
    target_date: '2026-10-29'
  };
  const transactions = [
    { amount: 1000, saving_date: '2026-10-05' },
    { amount: 2000, saving_date: '2026-10-12' }
  ];
  const today = '2026-10-10';
  const series = buildChartSeries(goal, transactions, today);

  assert.ok(series.labels.length > 0);
  assert.equal(series.planned[0], 2000);
  assert.equal(series.actual[0], 2000);
  // Future dates after today have null in actual
  const lastIndex = series.labels.length - 1;
  assert.equal(series.actual[lastIndex], null);
});
