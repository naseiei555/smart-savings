# รายงานความคืบหน้า Block B5: LINE Official Account Integration & Daily Scheduler

**วันที่:** 10 ตุลาคม 2026  
**สถานะ:** สำเร็จตามเกณฑ์ทั้งหมด (62/62 Tests ผ่าน 100%, Angular 22 Build ผ่าน)

---

## 1. วัตถุประสงค์และผลการดำเนินงาน

1. **LINE Account Linking Architecture:**
   - พัฒนาโมดูล [`backend/node-red/data/lib/line.js`](file:///d:/Aj.Santi/smart-savings/backend/node-red/data/lib/line.js):
     - `generateLinkCode()`: สร้างรหัสยืนยัน OTP ตัวเลข 6 หลักแบบสุ่มด้วย `crypto.randomInt`
     - `verifyLineSignature()`: ตรวจสอบความถูกต้องของ Header `X-Line-Signature` ด้วย HMAC-SHA256 แบบ Constant-time (`crypto.timingSafeEqual`)
     - `sendLinePushMessage()`: ส่งข้อความผ่าน LINE Messaging API (`/v2/bot/message/push`) โดยมี Mock Dispatcher Mode ในกรณีที่ยังไม่ได้ระบุ Access Token ใน `.env`
     - `buildDailySummaryMessage()`: สร้างข้อความแจ้งเตือนสรุปยอดการออมประจำวันพร้อมอีโมจิ Mascot
   - Endpoint `POST /api/line/link-code`: สร้างรหัสยืนยัน 6 หลัก มีอายุ 15 นาที และบันทึกลงตาราง `line_link_codes`
   - Endpoint `GET /api/line/status`: ตรวจสอบสถานะการผูกบัญชี LINE ของผู้ใช้งาน
   - Endpoint `POST /api/line/disconnect`: ยกเลิกการเชื่อมต่อบัญชี LINE
   - Endpoint `POST /api/line/webhook`: รับ Webhook Events จาก LINE Messaging API
     - หากได้รับรหัสตัวเลข 6 หลักตรงกับโค้ดที่ยังไม่หมดอายุ จะทำการผูก `line_user_id` เข้ากับบัญชีผู้ใช้ในตาราง `line_accounts` ทันที พร้อมลบรหัส OTP ทิ้ง และส่งข้อความตอบกลับยืนยันความสำเร็จ
     - รองรับคำสั่งข้อความ "สรุป" เพื่อตอบกลับยอดเงินออมรวมและจำนวนเป้าหมายที่กำลังดำเนินการ

2. **Daily Scheduler (09:00 AM Cron & Manual Trigger):**
   - Inject Node ใน Node-RED ตั้งเวลาทำงานอัตโนมัติทุกวันเวลา 09:00 น. (`crontab: 0 9 * * *`)
   - Endpoint `POST /api/scheduler/run-daily`: รองรับการเรียก Trigger งานประจำวันแบบ Manual
   - การทำงานของ Scheduler:
     - ค้นหาเป้าหมายที่กำลังดำเนินการ (`active`) ของผู้ใช้ทุกคน
     - สร้างการแจ้งเตือน In-app (`daily_reminder`) ประจำวัน
     - หากผู้ใช้มีการเชื่อมต่อ LINE Official Account ไว้อย่างถูกต้อง จะจัดส่งข้อความสรุปยอดเงินออมรวมและเป้าหมายที่ต้องออมวันนี้ไปยัง LINE Messaging API โดยอัตโนมัติ

3. **Frontend Integration:**
   - พัฒนา [`LineConnectComponent`](file:///d:/Aj.Santi/smart-savings/frontend/src/app/features/line/line-connect.component.ts) รองรับการแสดงสถานะ, ปุ่มขอรับรหัส OTP 6 หลัก และปุ่มยกเลิกการเชื่อมต่อ
   - เพิ่มเมนู "💬 LINE" บน [`NavbarComponent`](file:///d:/Aj.Santi/smart-savings/frontend/src/app/shared/components/navbar.component.ts)
   - ลงทะเบียน Route `/line` ภายใต้ `authGuard` ใน [`app.routes.ts`](file:///d:/Aj.Santi/smart-savings/frontend/src/app/app.routes.ts)
   - Angular 22 `npm run build` สำเร็จ 100%

---

## 2. ผลการรันชุดทดสอบ (Raw Test Output)

```text
▶ Block B5 API Tests - LINE Linking & Daily Scheduler
  ▶ 1. LINE Account Linking Flow
    ✔ GET /api/line/status returns is_connected false initially (12.6498ms)
    ✔ POST /api/line/link-code generates a 6-digit OTP code (28.3569ms)
    ✔ Simulate LINE Webhook with linking code to connect account (22.9173ms)
    ✔ GET /api/line/status reflects connected status after linking (9.3509ms)
    ✔ POST /api/line/disconnect unlinks account successfully (17.8093ms)
  ✔ 1. LINE Account Linking Flow (92.1099ms)
  ▶ 2. Daily Scheduler Trigger
    ✔ POST /api/scheduler/run-daily processes active goals and dispatches reminders (102.2136ms)
  ✔ 2. Daily Scheduler Trigger (102.4213ms)
✔ Block B5 API Tests - LINE Linking & Daily Scheduler (1274.8461ms)
▶ Block B4 API Tests - AI Analysis & Notifications (7/7 passed)
▶ API Auth - Integration Test Suite (9/9 passed)
▶ Block B2 API Tests - Goals & Savings (17/17 passed)
✔ verifyAuthHeader (9/9 passed)
✔ Calculation Engine (9/9 passed)
✔ validateGoalPayload & validateSavingPayload (4/4 passed)
ℹ tests 62
ℹ suites 12
ℹ pass 62
ℹ fail 0
```

---

## 3. ขั้นตอนถัดไป: เข้าสู่ Block B6 (PWA + Capacitor Android Setup & APK Build Verification)
- ติดตั้งและตั้งค่า PWA Manifest, App Icons, Service Worker ใน Angular
- ตั้งค่า Capacitor config (`capacitor.config.ts`), Android project sync
- ตั้งค่าสภาพแวดล้อม JDK (OpenJDK ใน Android Studio JBR) และ Android SDK
- Build PWA และทดสอบ Build APK ในเครื่องของผู้ใช้
