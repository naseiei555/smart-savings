/**
 * Date utilities with Asia/Bangkok timezone
 */
const TIMEZONE = 'Asia/Bangkok';

/**
 * Returns today date string in 'YYYY-MM-DD' formatted in Asia/Bangkok
 * @param {Date} [dateObj=new Date()]
 * @returns {string}
 */
function getTodayBangkok(dateObj = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  return formatter.format(dateObj);
}

/**
 * Parses YYYY-MM-DD to UTC timestamp (midnight) to prevent timezone/DST skews
 * @param {string} dateStr
 * @returns {number}
 */
function parseDateUtcMs(dateVal) {
  if (dateVal instanceof Date) {
    return Date.UTC(dateVal.getFullYear(), dateVal.getMonth(), dateVal.getDate());
  }
  const dateStr = String(dateVal).slice(0, 10);
  const [y, m, d] = dateStr.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}

/**
 * Computes difference in calendar days: (date2 - date1)
 * @param {string} dateStr1
 * @param {string} dateStr2
 * @returns {number}
 */
function diffDays(dateStr1, dateStr2) {
  const ms1 = parseDateUtcMs(dateStr1);
  const ms2 = parseDateUtcMs(dateStr2);
  const MS_PER_DAY = 86400000;
  return Math.round((ms2 - ms1) / MS_PER_DAY);
}

module.exports = {
  TIMEZONE,
  getTodayBangkok,
  parseDateUtcMs,
  diffDays
};
