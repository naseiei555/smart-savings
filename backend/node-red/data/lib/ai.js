/**
 * Rule-based fallback analysis generator
 * Used when LLM API Key is missing, request times out, or fails schema validation.
 * DISCLAIMER: ข้อมูลจาก AI เป็นเพียงการวิเคราะห์ข้อมูลการออมเบื้องต้น ไม่ใช่คำแนะนำทางการเงินหรือการลงทุนจากผู้เชี่ยวชาญ
 */

/**
 * Generates rule-based analysis based on deterministic metrics
 * @param {object} goal - Goal record
 * @param {object} metrics - Goal metrics calculated by calc.js
 * @returns {{ status: string, risk_level: string, summary: string, recommendation: string, is_fallback: boolean }}
 */
function generateRuleBasedAnalysis(goal, metrics) {
  let status = metrics.status || 'on_track';
  let riskLevel = 'low';
  let summary = '';
  let recommendation = '';

  const goalName = goal.name || 'เป้าหมายของคุณ';
  const remaining = Number(metrics.remaining) || 0;
  const daysLeft = Number(metrics.days_left) || 0;
  const daily = Number(metrics.daily) || 0;
  const weekly = Number(metrics.weekly) || 0;
  const progress = Number(metrics.progress) || 0;
  const ratio = Number(metrics.ratio) || 1;

  if (metrics.overdue || status === 'overdue') {
    status = 'overdue';
    riskLevel = 'high';
    summary = `เป้าหมาย "${goalName}" เลยกำหนดเวลามาแล้ว โดยยังคงมียอดเงินที่ต้องออมเพิ่มอีก ${remaining.toLocaleString('th-TH')} บาท`;
    recommendation = `แนะนำให้พิจารณาขยายกรอบเวลาเป้าหมายออกไปตามความเหมาะสม หรือจัดสรรเงินออมส่วนเกินจากรายรับพิเศษเพื่อปิดยอดเป้าหมายนี้`;
  } else if (metrics.status === 'completed' || remaining <= 0) {
    status = 'completed';
    riskLevel = 'none';
    summary = `ยินดีด้วยอย่างยิ่ง! คุณได้บรรลุเป้าหมาย "${goalName}" เรียบร้อยแล้วด้วยยอดเงินสะสม ${Number(metrics.current).toLocaleString('th-TH')} บาท`;
    recommendation = `คุณสามารถสรุปและปิดเป้าหมายนี้เพื่อเก็บเป็นสถิติความสำเร็จ หรือเริ่มตั้งเป้าหมายทางการเงินใหม่เพื่อต่อยอดการออมอย่างยั่งยืน`;
  } else if (ratio < 0.5 || status === 'behind') {
    status = 'behind';
    riskLevel = 'high';
    summary = `การออมสำหรับเป้าหมาย "${goalName}" มีความคืบหน้าอยู่ที่ ${progress}% ซึ่งยังช้ากว่าแผนงานที่กำหนดไว้อย่างมีนัยสำคัญ`;
    recommendation = `เพื่อให้บรรลุเป้าหมายภายในกำหนด คุณควรออมเงินวันละ ${daily.toLocaleString('th-TH')} บาท (ประมาณ ${weekly.toLocaleString('th-TH')} บาทต่อสัปดาห์) แนะนำให้ตรวจสอบและลดค่าใช้จ่ายฟุ่มเฟือย หรือพิจารณาขยายระยะเวลาของเป้าหมาย`;
  } else if (ratio < 0.8 || status === 'at_risk') {
    status = 'at_risk';
    riskLevel = 'medium';
    summary = `เป้าหมาย "${goalName}" มียอดออมสะสมแล้ว ${progress}% เริ่มมีความล่าช้ากว่าแผนเล็กน้อย คงเหลือเวลาอีก ${daysLeft} วัน`;
    recommendation = `ควรรักษาวินัยการออมอย่างต่อเนื่องที่ ${daily.toLocaleString('th-TH')} บาทต่อวัน การทยอยเก็บเศษเงินทอนหรือรายได้เสริมเข้ามาสมทบจะช่วยให้กลับเข้าสู่แผนได้เร็วยิ่งขึ้น`;
  } else {
    // on_track
    status = 'on_track';
    riskLevel = 'low';
    summary = `ยอดเยี่ยมมาก! เป้าหมาย "${goalName}" ดำเนินการไปได้ด้วยดี มีความคืบหน้า ${progress}% เป็นไปตามแผนการออมที่วางไว้`;
    recommendation = `ควรรักษาวินัยการออมวันละ ${daily.toLocaleString('th-TH')} บาทอย่างสม่ำเสมอ คุณกำลังเข้าใกล้เป้าหมายสำเร็จในอีก ${daysLeft} วันข้างหน้า`;
  }

  return {
    status,
    risk_level: riskLevel,
    summary,
    recommendation,
    is_fallback: true
  };
}

/**
 * Validates AI analysis output structure
 * @param {any} data
 * @returns {boolean}
 */
function isValidAnalysisPayload(data) {
  if (!data || typeof data !== 'object') return false;
  const validStatus = ['completed', 'on_track', 'at_risk', 'behind', 'overdue'];
  const validRisk = ['none', 'low', 'medium', 'high'];

  return (
    typeof data.summary === 'string' &&
    data.summary.trim().length > 0 &&
    typeof data.recommendation === 'string' &&
    data.recommendation.trim().length > 0 &&
    validStatus.includes(data.status) &&
    validRisk.includes(data.risk_level)
  );
}

module.exports = {
  generateRuleBasedAnalysis,
  isValidAnalysisPayload
};
