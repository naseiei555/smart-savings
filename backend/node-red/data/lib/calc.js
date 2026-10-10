/**
 * Calculation Engine for Smart Savings Companion
 * Pure deterministic calculation logic.
 */
const { diffDays } = require('./dates.js');

function round2(num) {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

/**
 * Computes all financial metrics and Lifecycle/Performance status for a goal
 * @param {object} goal
 * @param {number|string} [transactionsSum=0]
 * @param {string} todayStr - 'YYYY-MM-DD'
 */
function computeGoalMetrics(goal, transactionsSum = 0, todayStr) {
  const targetAmount = Number(goal.target_amount) || 0;
  const initialAmount = Number(goal.initial_amount) || 0;
  const txSum = Number(transactionsSum) || 0;
  const current = round2(initialAmount + txSum);
  const remaining = round2(Math.max(targetAmount - current, 0));
  const overAmount = round2(Math.max(current - targetAmount, 0));

  const startDate = goal.start_date;
  const targetDate = goal.target_date;

  const totalDays = diffDays(startDate, targetDate);
  const elapsedDays = clamp(diffDays(startDate, todayStr), 0, Math.max(totalDays, 0));
  const daysLeft = diffDays(todayStr, targetDate);

  const plannedTotal = targetAmount - initialAmount;
  let plannedToDate = 0;
  if (totalDays <= 0) {
    plannedToDate = diffDays(startDate, todayStr) >= 0 ? Math.max(plannedTotal, 0) : 0;
  } else if (plannedTotal <= 0) {
    plannedToDate = 0;
  } else {
    plannedToDate = clamp((plannedTotal * elapsedDays) / totalDays, 0, plannedTotal);
  }
  plannedToDate = round2(plannedToDate);

  const actualSaved = round2(current - initialAmount);

  // Ratio calculation: If planned_to_date = 0, ratio = 1 (Requirement Decision #2)
  let ratio = 1;
  if (plannedToDate > 0) {
    ratio = round2(actualSaved / plannedToDate);
  }

  // Progress
  const progress = targetAmount > 0 ? round2(Math.min((current / targetAmount) * 100, 100)) : 0;

  // Rates
  let daily = 0;
  let weekly = 0;
  let monthly = 0;
  const overdue = daysLeft <= 0 && remaining > 0;
  const nearDeadline = daysLeft > 0 && daysLeft <= 7;

  if (remaining === 0) {
    daily = 0;
    weekly = 0;
    monthly = 0;
  } else if (daysLeft <= 0) {
    daily = remaining;
    weekly = remaining;
    monthly = remaining;
  } else {
    daily = round2(remaining / daysLeft);
    weekly = round2(daily * 7);
    monthly = round2(remaining / Math.max(daysLeft / 30, 1));
  }

  // Status computation: Developer-defined thresholds
  let status = 'on_track';
  if (current >= targetAmount) {
    status = 'completed';
  } else if (overdue) {
    status = 'behind';
  } else if (ratio >= 0.95) {
    status = 'on_track';
  } else if (ratio >= 0.75) {
    status = 'at_risk';
  } else {
    status = 'behind';
  }

  return {
    current,
    remaining,
    days_left: daysLeft,
    daily,
    weekly,
    monthly,
    progress,
    planned_to_date: plannedToDate,
    actual_saved: actualSaved,
    ratio,
    status,
    overdue,
    near_deadline: nearDeadline,
    over_amount: overAmount
  };
}

/**
 * Builds weekly Planned vs Actual chart data series
 * @param {object} goal
 * @param {Array<{ amount: number, saving_date: string }>} transactions
 * @param {string} todayStr
 */
function buildChartSeries(goal, transactions = [], todayStr) {
  const startDate = goal.start_date;
  const targetDate = goal.target_date;
  const targetAmount = Number(goal.target_amount) || 0;
  const initialAmount = Number(goal.initial_amount) || 0;

  const totalDays = Math.max(diffDays(startDate, targetDate), 1);
  let stepDays = 7;
  if (totalDays > 420) {
    stepDays = 14;
  }

  const labels = [];
  const planned = [];
  const actual = [];

  const sortedTx = [...transactions].sort((a, b) => a.saving_date.localeCompare(b.saving_date));

  let currentDayOffset = 0;
  const { parseDateUtcMs } = require('./dates.js');
  const startMs = parseDateUtcMs(startDate);

  while (currentDayOffset <= totalDays) {
    const pointMs = startMs + currentDayOffset * 86400000;
    const pointDateStr = new Date(pointMs).toISOString().split('T')[0];

    labels.push(pointDateStr);

    // Planned: linear progression from initial to target
    const pVal = initialAmount + ((targetAmount - initialAmount) * currentDayOffset) / totalDays;
    planned.push(round2(pVal));

    // Actual: transactions up to pointDateStr
    if (pointDateStr <= todayStr) {
      let actVal = initialAmount;
      for (const tx of sortedTx) {
        if (tx.saving_date <= pointDateStr) {
          actVal += Number(tx.amount) || 0;
        }
      }
      actual.push(round2(actVal));
    } else {
      actual.push(null);
    }

    if (currentDayOffset === totalDays) break;
    currentDayOffset = Math.min(currentDayOffset + stepDays, totalDays);
  }

  return { labels, planned, actual };
}

module.exports = {
  round2,
  computeGoalMetrics,
  buildChartSeries
};
