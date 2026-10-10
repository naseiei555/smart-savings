# Security Architecture, Hardening & Audit Verification

เอกสารรายงานการตรวจสอบและยืนยันความมั่นคงปลอดภัย (Security Hardening & Audit Verification) ของระบบ **Smart Savings Companion**

---

## 1. รายการตรวจสอบความปลอดภัยหลัก (Security Checklist)

| มาตรการความปลอดภัย | ผลการตรวจสอบ | รายละเอียดเชิงเทคนิค |
|---|---|---|
| **SQL Injection Prevention** | ผ่าน 100% | ทุกคำสั่ง SQL ใน `backend/node-red/data/lib/` ใช้ Parameterized Queries (Placeholder `?`) ผ่าน `mysql2/promise` ทั้งหมด ไม่มีการต่อ String ใน Query เด็ดขาด |
| **No Leaked SQL Errors** | ผ่าน 100% | จัดการ Error ด้วย `try/catch` และตอบกลับ Client ด้วย HTTP Status (400, 401, 404, 500) และข้อความภาษาไทยทั่วไป ไม่ส่ง Stack trace หรือ SQL Syntax Error ออกไปภายนอก |
| **Password Hashing** | ผ่าน 100% | ใช้ `bcryptjs` เข้ารหัสรหัสผ่านด้วย Cost factor 10 (`bcrypt.genSalt(10)`) |
| **Password UTF-8 Byte Check** | ผ่าน 100% | ตรวจสอบความยาวรหัสผ่านระดับไบต์ `Buffer.byteLength(password, 'utf8')` ระหว่าง 8 ถึง 72 ไบต์ (รองรับข้อจำกัด 72 ไบต์ของอัลกอริทึม bcrypt) |
| **JWT Pinning & RFC 7519 Compliance** | ผ่าน 100% | กำหนด algorithms: `['HS256']` ชัดเจนใน `jwt.verify()`, ค่า `sub` ถูกแปลงและเก็บเป็น String ตามมาตรฐาน RFC 7519, และสกัด `userId` เป็น Positive Integer ที่ฝั่ง Backend |
| **Timing Attack Mitigation** | ผ่าน (พร้อมบันทึกข้อจำกัด) | เมื่อไม่พบผู้ใช้งานในระบบ (`POST /api/auth/login`) Backend ทำการรัน `bcrypt.compare` กับค่า Dummy Hash Cost 10 เพื่อให้เวลาตอบสนอง (Response Time) ใกล้เคียงกับกรณีผู้ใช้มีอยู่จริงแต่รหัสผ่านผิด |
| **Multi-tenant Data Isolation** | ผ่าน 100% | ทุกการเข้าถึงทรัพยากร (Goals, Savings, Notifications, AI Analysis, LINE Account) มีเงื่อนไข `WHERE user_id = ?` กำกับเสมอ ป้องกัน IDOR โดยสิ้นเชิง |
| **LINE Webhook Signature Verification** | ผ่าน 100% | ตรวจสอบ HMAC-SHA256 Signature ใน Header `x-line-signature` เทียบกับ Raw Body ก่อนประมวลผล Webhook Event ใด ๆ |

---

## 2. ข้อจำกัดและข้อควรระวัง (Known Limitations & Production Roadmap)

1. **User Enumeration ใน Endpoint Register (Limitation):**
   - แม้ว่าหน้า Login จะป้องกัน Timing Attack และใช้ข้อความเดียวกัน แต่หน้าสมัครสมาชิก (`POST /api/auth/register`) จะตอบกลับ HTTP 409 (`"อีเมลนี้ถูกใช้งานแล้วในระบบ"`) เมื่อมีอีเมลซ้ำ ทำให้ผู้ไม่หวังดีสามารถตรวจสอบได้ว่าอีเมลนั้นมีบัญชีอยู่ในระบบหรือไม่
   - *คำแนะนำสำหรับ Production:* สามารถปรับเป็นขั้นตอนการส่งอีเมลยืนยันตัวตน (Email Verification Link) โดยตอบ 200 เหมือนกันทุกกรณีเพื่อปิดช่องว่างนี้

2. **Rate Limiting & Brute-force Protection:**
   - ปัจจุบันระบบยังไม่ได้เปิดใช้งาน Rate Limiter ที่ระดับ Reverse Proxy หรือ Node-RED
   - *คำแนะนำสำหรับ Production:* ติดตั้ง Nginx `limit_req_zone` หรือ WAF (เช่น Cloudflare) เพื่อจำกัดจำนวน Request ต่อ IP สำหรับ Endpoint `/api/auth/login` และ `/api/line/link-code`

3. **Client-side Token Storage (JWT in localStorage):**
   - ฝั่งเว็บแอปพลิเคชันจัดเก็บ JWT ใน `localStorage` เพื่อความสะดวกในการทำงานร่วมกันระหว่าง PWA และ Capacitor Android
   - *คำแนะนำสำหรับ Production:* สามารถพิจารณาใช้ HttpOnly Cookie ร่วมกับ CSRF Token หากใช้งานเป็น Web Application เพียวๆ
