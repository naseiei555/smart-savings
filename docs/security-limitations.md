# Security Architecture & Limitations

เอกสารบันทึกข้อจำกัดและข้อควรระวังด้านความปลอดภัยของระบบ Smart Savings Companion

## 1. Authentication & User Enumeration Limitation

1. **User Enumeration ใน Endpoint Login**:
   - ระบบลดความเสี่ยงของการโจมตีแบบ Timing Attack โดยการทำ dummy password hash comparison (`bcrypt.compare` กับค่า Dummy Hash) ในกรณีที่ไม่พบผู้ใช้ในระบบ เพื่อให้ระยะเวลาตอบสนอง (Response Time) ใกล้เคียงกันระหว่างกรณี "ไม่พบบัญชี" และ "รหัสผ่านไม่ถูกต้อง"
   - ตอบกลับด้วยข้อความเดียวกัน: `"อีเมลหรือรหัสผ่านไม่ถูกต้อง"` (HTTP Status 401)
   - **ข้อจำกัด (Limitation)**: การป้องกัน User Enumeration ยัง**ไม่สมบูรณ์ 100%** เนื่องจาก Endpoint สมัครสมาชิก (`POST /api/auth/register`) มีการตอบกลับ HTTP Status 409 (`"อีเมลนี้ถูกใช้งานแล้วในระบบ"`) ซึ่งผู้ไม่หวังดีสามารถใช้วิธีลองสมัครสมาชิกเพื่อตรวจสอบการมีอยู่ของบัญชีอีเมลได้

2. **Rate Limiting Limitation**:
   - ในปัจจุบันระบบยัง**ไม่มีการใช้ Rate Limiting หรือ Brute-force Protection** (เช่น express-rate-limit หรือ Node-RED rate limit node)
   - จึงควรบันทึกเป็นข้อจำกัดของระบบที่ต้องพิจารณาติดตั้ง Web Application Firewall (WAF) หรือ Rate Limiter เพิ่มเติมก่อนนำขึ้น Production จริง

3. **Client Token Storage (Limitation)**:
   - จัดเก็บ JWT บน `localStorage` เพื่อความสะดวกในการใช้งานแบบ SPA/PWA มีความเสี่ยงต่อ XSS จึงต้องใช้ Content Security Policy และ Sanitize Input อย่างเคร่งครัด
   - การออกจากระบบ (Logout) ทำโดยการลบ Token ฝั่ง Client โดยยังไม่มี Token Blacklist/Revocation ฝั่งเซิร์ฟเวอร์
