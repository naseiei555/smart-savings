const crypto = require('crypto');

/**
 * Validates LINE Webhook signature using HMAC-SHA256
 * @param {string|Buffer} bodyRaw
 * @param {string} signature - Base64 string from 'x-line-signature'
 * @param {string} channelSecret
 * @returns {boolean}
 */
function verifyLineSignature(bodyRaw, signature, channelSecret) {
  if (!signature || !channelSecret) return false;
  try {
    const hash = crypto
      .createHmac('SHA256', channelSecret)
      .update(bodyRaw)
      .digest('base64');
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature));
  } catch (err) {
    return false;
  }
}

/**
 * Generates a cryptographically random 6-digit numeric OTP code for LINE Account Linking
 * @returns {string} 6-digit string
 */
function generateLinkCode() {
  const num = crypto.randomInt(100000, 999999);
  return String(num);
}

/**
 * Sends push message to a LINE user via Messaging API
 * In Mock Mode (when accessToken is empty), logs to console and returns mock success
 * @param {string} lineUserId
 * @param {Array<object>} messages
 * @param {string} accessToken
 * @returns {Promise<{ success: boolean, mock?: boolean, error?: string }>}
 */
async function sendLinePushMessage(lineUserId, messages, accessToken) {
  if (!lineUserId || !messages || messages.length === 0) {
    return { success: false, error: 'Invalid parameters' };
  }

  if (!accessToken) {
    // Mock Mode
    return {
      success: true,
      mock: true,
      recipient: lineUserId,
      message_count: messages.length
    };
  }

  try {
    const res = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        to: lineUserId,
        messages: messages
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      return { success: false, error: `LINE API responded with ${res.status}: ${errText}` };
    }

    return { success: true, mock: false };
  } catch (err) {
    return { success: false, error: err.message || String(err) };
  }
}

/**
 * Builds a Flex Message or Text message for Daily Savings Summary
 * @param {object} summaryData
 * @returns {object}
 */
function buildDailySummaryMessage(summaryData) {
  const { total_saved, today_target, active_goals, mascot_mood } = summaryData;
  const moodIcon = mascot_mood === 'celebrating' ? '🎉' : mascot_mood === 'cheering' ? '💪' : '🌱';

  return {
    type: 'text',
    text: `${moodIcon} [Smart Savings] สรุปการออมประจำวัน\n\n💰 ยอดออมสะสมรวม: ${Number(total_saved).toLocaleString('th-TH')} บาท\n📅 ยอดควรออมวันนี้: ${Number(today_target).toLocaleString('th-TH')} บาท\n🎯 เป้าหมายที่กำลังทำ: ${active_goals} รายการ\n\nหยอดกระปุกหรือโอนเข้าบัญชีออมเพื่อเป้าหมายของคุณกันนะครับ ✨`
  };
}

module.exports = {
  verifyLineSignature,
  generateLinkCode,
  sendLinePushMessage,
  buildDailySummaryMessage
};
