# คู่มือการนำเสนอและการทำงานของระบบ (Project Walkthrough & Presentation Guide)
## โครงการ: Smart Savings Companion ("เพื่อนช่วยออม เพื่อไปถึงเป้าหมาย")

เอกสารนี้สรุปแนวคิด สถาปัตยกรรม ขั้นตอนการทดสอบ และแนวทางการตอบคำถามอาจารย์ สำหรับนักศึกษาใช้ในการสอบหรือนำเสนอโครงงาน

---

## 1. ภาพรวมโครงการ (System Architecture)

ระบบประกอบด้วย 3 ส่วนหลัก (3-Tier Architecture Containerized):
1. **Frontend (Angular 22 Standalone Components + Capacitor 8 Android):**
   - พัฒนาด้วย Angular 22 ที่ใช้ Standalone Components 100% (ไม่มี NgModule)
   - มีระบบ Reactive State ผ่าน Signals/Observables และ Interceptor แนบ Bearer Token
   - รองรับทั้ง Web Responsive และคอมไพล์เป็น Android Native APK ผ่าน Capacitor
   - มีระบบ Mascot น้องกระปุกออมสินแบบ SVG ปรับเปลี่ยนอารมณ์ได้ 6 สถานะตามความคืบหน้าการออม

2. **Backend (Node-RED Low-Code + Custom Node.js ES Modules):**
   - ทำหน้าที่เป็น REST API Server และ Scheduler Engine
   - แยก Logic ซับซ้อนออกเป็น Custom Modules ใน `backend/node-red/data/lib/` ได้แก่:
     - `auth.js`: ตรวจสอบและออก JWT Token, Hash รหัสผ่านด้วย bcrypt cost 10
     - `calc.js`: คำนวณความคืบหน้า แผนการออม รายวัน/สัปดาห์/เดือน, สถานะ on_track / at_risk / behind
     - `dates.js`: จัดการวันที่ตาม Timezone กรุงเทพฯ (Asia/Bangkok)
     - `validate.js`: ตรวจสอบและ Sanitize ข้อมูลอินพุต
     - `ai.js`: AI Assistant วิเคราะห์และให้คำแนะนำการออม พร้อมระบบ Rule-based Fallback
     - `line.js`: จัดการ LINE Messaging API, Webhook HMAC-SHA256, และระบบยืนยันรหัส OTP 6 หลัก
   - ประมวลผล Flow ต่างๆ ผ่าน Node-RED Flows

3. **Database (MySQL 8.4 LTS):**
   - ตารางความสัมพันธ์ 6 ตารางหลัก: `users`, `savings_goals`, `savings_transactions`, `ai_analyses`, `notifications`, `line_accounts`, `line_link_codes`
   - มี Foreign Key พร้อม `ON DELETE CASCADE` ทุกจุด
   - กำหนด Unique Constraint ป้องกันการบันทึกข้อมูลและส่งแจ้งเตือนซ้ำ

---

## 2. ขั้นตอนการสาธิตระบบ (Demo Script)

### ขั้นตอนที่ 1: การเข้าสู่ระบบและการยืนยันตัวตน
1. เปิดบราวเซอร์ไปที่ `http://localhost/` หรือเปิดผ่านแอปพลิเคชันบน Android
2. แสดงหน้า Landing Page พร้อม Mascot น้องกระปุกออมสิน
3. ทดลองสมัครสมาชิก (`Register`) ด้วยอีเมลและรหัสผ่าน
4. เข้าสู่ระบบ (`Login`) ระบบจะได้รับ JWT Token ที่มีมาตรฐาน `sub` เป็น String ตาม RFC 7519

### ขั้นตอนที่ 2: การสร้างเป้าหมายและการคำนวณแผนการออม (Live Preview)
1. ไปที่เมนู "สร้างเป้าหมาย"
2. ใส่ชื่อเป้าหมาย (เช่น "ซื้อ iPad สำหรับการเรียน"), กำหนดเป้าหมาย 30,000 บาท, เงินเริ่มต้น 5,000 บาท, วันเริ่มต้น และวันสิ้นสุด
3. อธิบายอาจารย์: ระบบมี **Live Plan Preview** แสดงผลทันทีว่าจะต้องออมวันละกี่บาท สัปดาห์ละกี่บาท หรือเดือนละกี่บาท พร้อมประเมินว่าเกินกำลังเงินออมรายเดือน (Saving Capacity) หรือไม่
4. กดบันทึกเป้าหมาย

### ขั้นตอนที่ 3: การบันทึกเงินออมและกราฟเปรียบเทียบ (Planned vs Actual)
1. เปิดดูรายละเอียดเป้าหมาย
2. บันทึกยอดเงินออม (เช่น ออมเพิ่ม 2,500 บาท)
3. ระบบจะคำนวณยอดเงินสะสม เปอร์เซ็นต์ และสถานะความคืบหน้าใหม่ทันที
4. ชี้ให้อาจารย์ดูกราฟ: เส้นสีฟ้าคือ "แผนที่ควรสะสม (Planned)" เทียบกับแท่งสีเขียว "ยอดที่ออมได้จริง (Actual)"

### ขั้นตอนที่ 4: การทำงานของ AI วิเคราะห์การออม (AI Assistant & Disclaimer)
1. กดปุ่ม "ขอคำแนะนำจาก AI"
2. ระบบจะทำการวิเคราะห์แนวโน้มการออม ความเร็วในการออม และประเมินความเสี่ยง
3. ชี้ให้เห็นว่าระบบแสดงข้อความเตือน (Disclaimer) ตามกฎหมายการเงินชัดเจน และในกรณีที่ไม่มี LLM API Key ระบบจะใช้ Deterministic Rule-based Fallback ทำงานได้ต่อเนื่อง 100% ไม่พัง

### ขั้นตอนที่ 5: การแจ้งเตือน และการเชื่อมต่อ LINE
1. แสดงกระดิ่งแจ้งเตือน In-App ที่มุมขวาบน แสดงรายการแจ้งเตือนเตือนให้ออมเงิน
2. ไปที่เมนู "เชื่อมต่อ LINE" กดปุ่มขอรหัส OTP 6 หลัก
3. อธิบายว่าเมื่อนำรหัสนี้นำไปพิมพ์ใน LINE Official Account ระบบจะผูกบัญชีผ่าน Webhook ที่มีการตรวจความปลอดภัย HMAC-SHA256 Signature และส่งข้อความเตือนผ่าน Daily Scheduler ทุกเช้า 09:00 น.

---

## 3. แนวทางการตอบคำถามเชิงเทคนิค (Q&A Cheatsheet)

- **ถาม: ทำไมถึงเลือกใช้ Node-RED แทน Express หรือ NestJS?**
  - **ตอบ:** Node-RED ช่วยให้การพัฒนา API และตัวประมวลผล Event-driven (เช่น Webhook และ Cron Scheduler) ทำได้อย่างรวดเร็ว มี Visual Workflow ที่ตรวจสอบสถานะข้อมูลได้แบบเรียลไทม์ และเราได้ทำการแยก Business Logic สำคัญ เช่น การคำนวณการเงิน, การตรวจสอบสิทธิ์, และการเข้ารหัส ออกมาเป็น Node.js Modules เพื่อให้สามารถทำ Automated Unit Test ได้ 100%

- **ถาม: ระบบป้องกัน SQL Injection และความปลอดภัยอย่างไร?**
  - **ตอบ:** 
    1. ทุกคำสั่ง SQL ใช้ Parameterized Queries (เครื่องหมาย `?`) ผ่าน Library `mysql2/promise` ทั้งหมด ไม่มีการต่อสตริงเด็ดขาด
    2. รหัสผ่านถูก Hash ด้วย `bcryptjs` Cost Factor 10 และจำกัดขนาดไม่เกิน 72 ไบต์
    3. ตรวจสอบสิทธิ์แบบ Multi-tenant ด้วย `WHERE user_id = ?` ในทุก Endpoint ป้องกันปัญหา IDOR
    4. JWT Token บังคับใช้อัลกอริทึม `HS256` เท่านั้น ป้องกันการโจมตีแบบ `alg: none`
    5. มี Dummy Hash Comparison ในหน้า Login เพื่อลดความเสี่ยงของการโจมตีแบบ Timing Attack

- **ถาม: ทำไมตัวแปรอีเมลถึงใช้ `VARCHAR(191)`?**
  - **ตอบ:** เป็นขนาดที่นิยมใช้ตามธรรมเนียมปฏิบัติของการจัดเก็บอีเมลในระบบฐานข้อมูล MySQL เพื่อรองรับมาตรฐาน utf8mb4 โดยใน MySQL 8.4 นั้นรองรับ Index สูงสุดถึง 3,072 ไบต์แล้ว จึงทำงานร่วมกันได้อย่างมีประสิทธิภาพ

- **ถาม: แอปพลิเคชันบน Android ทำงานอย่างไร?**
  - **ตอบ:** เราใช้ **Capacitor 8** ห่อหุ้ม Web Application (Angular) ให้เป็น Native Android Application ซึ่งสามารถคอมไพล์ผ่าน Gradle ด้วย OpenJDK 21 LTS ได้ไฟล์ `app-debug.apk` สามารถติดตั้งและทำงานบนอุปกรณ์ Android จริงได้
