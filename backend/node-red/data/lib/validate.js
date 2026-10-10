/**
 * Input validators for Goals, Savings, and Auth
 */

/**
 * Validates a YYYY-MM-DD date string
 * Rejects invalid dates like 2026-02-30
 * @param {string} dateStr
 * @returns {boolean}
 */
function isValidDateString(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return false;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (!match) return false;

  const y = Number(match[1]);
  const m = Number(match[2]);
  const d = Number(match[3]);

  if (m < 1 || m > 12 || d < 1 || d > 31) return false;

  const date = new Date(Date.UTC(y, m - 1, d));
  return (
    date.getUTCFullYear() === y &&
    date.getUTCMonth() === m - 1 &&
    date.getUTCDate() === d
  );
}

/**
 * Validates Goal payload
 * @param {object} body
 * @returns {{ valid: boolean, error?: string, sanitized?: object }}
 */
function validateGoalPayload(body) {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'ข้อมูลคำขอไม่ถูกต้อง' };
  }

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  if (!name || name.length > 150) {
    return { valid: false, error: 'กรุณากรอกชื่อเป้าหมาย (ความยาว 1-150 ตัวอักษร)' };
  }

  const targetAmount = Number(body.target_amount);
  if (
    isNaN(targetAmount) ||
    targetAmount <= 0 ||
    targetAmount > 10000000 ||
    !/^\d+(\.\d{1,2})?$/.test(String(body.target_amount))
  ) {
    return { valid: false, error: 'จำนวนเงินเป้าหมายต้องมากกว่า 0 และไม่เกิน 10,000,000 บาท (ทศนิยมไม่เกิน 2 ตำแหน่ง)' };
  }

  const initialAmount = body.initial_amount !== undefined ? Number(body.initial_amount) : 0;
  if (isNaN(initialAmount) || initialAmount < 0 || initialAmount > 10000000) {
    return { valid: false, error: 'เงินตั้งต้นต้องมีค่าไม่น้อยกว่า 0 และไม่เกิน 10,000,000 บาท' };
  }

  const income = body.income !== undefined ? Number(body.income) : 0;
  if (isNaN(income) || income < 0 || income > 10000000) {
    return { valid: false, error: 'รายได้ต้องมีค่าไม่น้อยกว่า 0 และไม่เกิน 10,000,000 บาท' };
  }

  const expense = body.expense !== undefined ? Number(body.expense) : 0;
  if (isNaN(expense) || expense < 0 || expense > 10000000) {
    return { valid: false, error: 'รายจ่ายต้องมีค่าไม่น้อยกว่า 0 และไม่เกิน 10,000,000 บาท' };
  }

  let savingCapacity = body.saving_capacity !== undefined ? Number(body.saving_capacity) : null;
  if (savingCapacity === null || isNaN(savingCapacity)) {
    savingCapacity = Math.max(income - expense, 0);
  } else if (savingCapacity < 0 || savingCapacity > 10000000) {
    return { valid: false, error: 'ความสามารถในการออมต้องไม่ติดลบและไม่เกิน 10,000,000 บาท' };
  }

  let startDate = body.start_date;
  if (!startDate) {
    // Default to today in Bangkok timezone
    const now = new Date();
    startDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok' }).format(now);
  }

  const targetDate = body.target_date;

  if (!isValidDateString(startDate)) {
    return { valid: false, error: 'วันที่เริ่มต้นไม่ถูกต้องตามปฏิทิน (รูปแบบ YYYY-MM-DD)' };
  }

  if (!isValidDateString(targetDate)) {
    return { valid: false, error: 'วันที่เป้าหมายไม่ถูกต้องตามปฏิทิน (รูปแบบ YYYY-MM-DD)' };
  }

  if (targetDate < startDate) {
    return { valid: false, error: 'วันที่เป้าหมายต้องไม่เกิดขึ้นก่อนวันที่เริ่มต้น' };
  }

  return {
    valid: true,
    sanitized: {
      name,
      target_amount: Math.round(targetAmount * 100) / 100,
      initial_amount: Math.round(initialAmount * 100) / 100,
      income: Math.round(income * 100) / 100,
      expense: Math.round(expense * 100) / 100,
      saving_capacity: Math.round(savingCapacity * 100) / 100,
      start_date: startDate,
      target_date: targetDate
    }
  };
}

/**
 * Validates Savings Transaction payload
 * @param {object} body
 * @param {string} goalStartDate - YYYY-MM-DD
 * @param {string} todayBangkok - YYYY-MM-DD
 * @returns {{ valid: boolean, error?: string, sanitized?: object }}
 */
function validateSavingPayload(body, goalStartDate, todayBangkok) {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'ข้อมูลคำขอไม่ถูกต้อง' };
  }

  const amount = Number(body.amount);
  if (
    isNaN(amount) ||
    amount <= 0 ||
    amount > 10000000 ||
    !/^\d+(\.\d{1,2})?$/.test(String(body.amount))
  ) {
    return { valid: false, error: 'จำนวนเงินออมต้องมากกว่า 0 และไม่เกิน 10,000,000 บาท (ทศนิยมไม่เกิน 2 ตำแหน่ง)' };
  }

  const savingDate = body.saving_date;
  if (!isValidDateString(savingDate)) {
    return { valid: false, error: 'วันที่บันทึกการออมไม่ถูกต้องตามปฏิทิน (รูปแบบ YYYY-MM-DD)' };
  }

  if (goalStartDate && savingDate < goalStartDate) {
    return { valid: false, error: 'วันที่บันทึกการออมต้องไม่เกิดขึ้นก่อนวันเริ่มต้นเป้าหมาย' };
  }

  if (todayBangkok && savingDate > todayBangkok) {
    return { valid: false, error: 'ไม่สามารถบันทึกการออมล่วงหน้าในอนาคตได้' };
  }

  const note = typeof body.note === 'string' ? body.note.trim() : '';
  if (note.length > 255) {
    return { valid: false, error: 'หมายเหตุต้องมีความยาวไม่เกิน 255 ตัวอักษร' };
  }

  return {
    valid: true,
    sanitized: {
      amount: Math.round(amount * 100) / 100,
      saving_date: savingDate,
      note: note || null
    }
  };
}

module.exports = {
  isValidDateString,
  validateGoalPayload,
  validateSavingPayload
};
