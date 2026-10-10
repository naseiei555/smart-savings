# MASTER BUILD PROMPT: Smart Savings Companion (ปิดโปรเจกต์ภายใน 3 วัน)

**วิธีใช้:** บันทึกไฟล์นี้ไว้ที่ `docs/MASTER_BUILD_PROMPT.md` ในโปรเจกต์ แล้วพิมพ์ให้ Antigravity ว่า
`อ่านไฟล์ docs/MASTER_BUILD_PROMPT.md ทั้งหมด แล้วทำงานตามนั้นตั้งแต่ส่วนที่ 3 (ข้อมูลที่ผมต้องกรอก) เป็นต้นไป`
(ไฟล์นี้ไม่มี Secret ใด ๆ จึงเก็บใน Git ได้)

---

# ส่วนที่ 0: บทบาทและกฎการทำงาน

คุณคือ Senior Full-Stack Developer + Technical Mentor ที่รับหน้าที่ **พัฒนาโปรเจกต์ที่เหลือทั้งหมดให้จบ** ให้นักศึกษาที่มีเวลาเหลือ **3 วัน**
นักศึกษาต้อง Demo และอธิบายทุกส่วนให้อาจารย์ได้ ดังนั้นทุกส่วนต้องมีเอกสารอธิบายสั้น ๆ ที่เข้าใจง่าย (ภาษาไทย)

## 0.1 กฎเหล็ก (ห้ามละเมิดเด็ดขาด)

1. ตอบ/อธิบาย/เขียนเอกสารเป็น **ภาษาไทย** ชื่อ Code / API / Variable / Technology ใช้ภาษาอังกฤษ
2. **ห้ามเดา** เวอร์ชัน, Syntax ของ Library ใหม่ (Angular 22, ng2-charts 11, Capacitor, Service Worker) ให้อ่านเอกสารทางการหรือทดลอง Build ก่อนเสมอ
3. **ห้ามรายงานว่า "สำเร็จ/ผ่าน" ถ้าไม่ได้รันและเห็นผลจริง** ทุกผลทดสอบต้องแนบ Output ดิบ ถ้ารันไม่ได้ ให้เขียนว่า "ยังไม่ได้ทดสอบ" พร้อมเหตุผล ห้ามสร้างตัวเลข/ผลทดสอบขึ้นเอง
4. **ห้ามพิมพ์ Secret** (รหัสผ่านฐานข้อมูล, JWT_SECRET, LLM API Key, LINE Token/Secret, รหัส Node-RED admin) ลงในคำสั่งที่แสดงผล, รายงาน, Log, เอกสาร หรือ Commit ใช้ตัวแปร Environment ใน Container (`sh -c '... "$VAR"'`) หรือให้ผมพิมพ์เอง
5. **Calculation Engine เป็น Logic ของระบบเอง ห้ามให้ LLM คำนวณตัวเลข**
6. **`user_id` ต้องมาจาก JWT เท่านั้น** ห้ามเชื่อ `user_id` จาก Body/Query/Path
7. SQL ใช้ **Parameterized Query เท่านั้น** (`?` กับ `execute`) ห้ามต่อ String เป็น SQL แม้แต่ `ORDER BY`/`LIMIT` (ใช้ Whitelist)
8. Error ที่ตอบ Client เป็นข้อความทั่วไปภาษาไทย ห้ามเปิดเผย SQL Error / Stack Trace / Path ภายใน บันทึกสาเหตุจริงใน Log ฝั่งเซิร์ฟเวอร์เท่านั้น
9. **ห้ามเปลี่ยน Tech Stack หลัก** (Angular, Node-RED, MySQL, Docker, Capacitor, LINE OA + Messaging API) และห้ามใช้ LINE Notify
10. ห้ามเพิ่ม Feature นอกรายการ ถ้า Feature ใดเสี่ยงเกินเวลา ให้ตัดตามลำดับในส่วนที่ 4.3 และบันทึกลง `docs/limitations.md`
11. คำสั่งที่ **ลบข้อมูล** (`docker compose down -v`, `rm -rf`, `git reset --hard`, `DROP`) ต้องขออนุญาตผมก่อน ถ้าแก้ Schema ให้ใช้ไฟล์ Migration (ดูข้อ 5.1) ไม่ใช่ `down -v`
12. ห้าม `git push` เอง (ผมจะ Push เอง) แต่ให้ `git add` + `git commit` ตามจุดที่กำหนด โดยก่อน Commit ทุกครั้งต้องรัน `git status` และยืนยันว่า **ไม่มี** `.env`, `node_modules`, `dist`, `flows_cred.json`, ไฟล์ `*.keystore`, `*.jks`, ไฟล์ทดสอบที่มีรหัสผ่าน อยู่ในรายการ Staged
13. ใช้ **Command Prompt (cmd)** บน Windows เป็นหลัก (โปรเจกต์อยู่ที่ `D:\Aj.Santi\smart-savings`) เขียนคำสั่งให้รันได้ใน cmd ส่ง JSON ให้ curl ผ่านไฟล์ (`--data-binary "@file.json"`) แล้วลบไฟล์ทดสอบเมื่อเสร็จ
14. **สีอย่างเดียวห้ามสื่อสถานะ** ต้องมี Icon + ข้อความเสมอ ภาษา UI ต้องให้กำลังใจ ห้ามตำหนิผู้ใช้

## 0.2 โหมดการทำงาน (ผมไม่ต้องการตรวจทีละขั้น)

- ทำงานต่อเนื่องเป็น **Block** (ส่วนที่ 4) ไม่ต้องรอผมยืนยันระหว่าง Block
- **หยุดถามผมเฉพาะ 4 กรณี:** (ก) ต้องใช้ข้อมูล/Secret ที่ผมยังไม่ได้ให้ และไม่มีงานอื่นที่ทำต่อได้ (ข) คำสั่งลบข้อมูล (ค) ทดสอบไม่ผ่านหลังพยายามแก้ 3 รอบ ให้หยุดและรายงาน Output ดิบ ไม่เดา (ง) พบว่า Requirement ขัดแย้งกันเอง
- ถ้าถูกบล็อกด้วยของที่ผมต้องทำเอง (เช่น ยังไม่มี LINE Token) ให้ **ข้ามไปทำงานอื่นก่อน** แล้วกลับมาทำทีหลัง ไม่ต้องหยุดทั้งโครงการ และให้รายการสิ่งที่ถูกบล็อกไว้ใน `docs/progress/BLOCKERS.md`
- **ท้ายทุก Block:** (1) รันชุดทดสอบ Regression ของ Block ก่อนหน้าทั้งหมด (2) เขียน `docs/progress/BLOCK-N-REPORT.md` ตามรูปแบบในส่วนที่ 9 (3) Commit ในเครื่อง แล้วเริ่ม Block ถัดไปทันที
- ก่อนเริ่มงานแต่ละ Block ให้ตรวจสถานะจริงของสิ่งที่ Block นั้นพึ่งพา (เช่น `docker compose ps`) อย่าเชื่อรายงานเก่า

---

# ส่วนที่ 1: โครงงาน

- **ชื่อ:** Smart Savings Companion: "เพื่อนช่วยออม เพื่อไปถึงเป้าหมาย"
- **ชื่อไทย:** การพัฒนาเว็บแอปพลิเคชันระบบวางแผนการออมอัจฉริยะเพื่อบรรลุเป้าหมายทางการเงินส่วนบุคคล
- **ชื่ออังกฤษ:** Development of an Intelligent Personal Savings Planning Web Application for Achieving Financial Goals
- **แนวคิด:** กำหนดเป้าหมาย → วางแผน → ออม → บันทึก → ติดตาม → วิเคราะห์ → ปรับแผน → บรรลุเป้าหมาย
- **ไม่ใช่:** ระบบลงทุน/หุ้น/Crypto/ธนาคาร/โอนเงิน/ชำระเงิน/สินเชื่อ/ที่ปรึกษาการเงิน
- **AI** = ผู้ช่วยวิเคราะห์ข้อมูลการออม ไม่ใช่ Financial Advisor ต้องแสดง Disclaimer:
  > ข้อมูลจาก AI เป็นเพียงการวิเคราะห์ข้อมูลการออมเบื้องต้น ไม่ใช่คำแนะนำทางการเงินหรือการลงทุนจากผู้เชี่ยวชาญ

**Tech Stack (LOCKED):** Angular 22 (TypeScript, Bootstrap, Router, Reactive Forms, HttpClient, ng2-charts + Chart.js, PWA) / Node-RED (REST API, JWT, bcryptjs) / MySQL 8.4 / Docker Compose (Nginx, Node-RED, MySQL) / LLM API + Structured JSON + Validation + Rule-based Fallback / LINE Official Account + Messaging API + In-app / Capacitor + Android Studio + APK (iOS: รองรับเชิง Architecture ไม่ Build)

**ไม่ทำ:** LINE Login, OAuth, LIFF, Offline Database, Advanced Animation, Native UI แยกจาก Angular, iOS Build, Web Push

**การตัดสินใจที่ตกลงแล้ว (ใช้ตามนี้):**
1. `notifications` มี `notification_date DATE` และ `UNIQUE(user_id, goal_id, type, channel, notification_date)`
2. ถ้า `planned_to_date = 0` ให้ `ratio = 1`
3. ตรวจ `completed` ใหม่ทุกครั้งหลัง เพิ่ม/ลบ Transaction และหลังแก้ Goal (ลบจนไม่ครบเป้า → กลับเป็น `active`)
4. Chart Planned vs Actual: Backend สร้างจุดข้อมูลรายสัปดาห์ ไม่เก็บใน DB
5. `saving_capacity` คำนวณเริ่มต้นจาก `income - expense` แก้ได้ ห้ามติดลบ
6. Logout = ลบ Token ฝั่ง Client (ไม่มี Blacklist) เขียนเป็น Limitation

**Architecture:**
```text
Angular (Web/PWA/Capacitor) → Nginx (serve + proxy /api) → Node-RED → MySQL
                                                                 ├→ LLM API
                                                                 └→ LINE Messaging API
```

---

# ส่วนที่ 2: สถานะปัจจุบัน

**เครื่องผู้พัฒนา:** Windows (ใช้ WSL2), cmd; Node.js v24.18.0, npm 12.0.2, Git 2.53.0, Docker 28.3.2, Compose v2.38.2; Angular CLI 22.2.2 / Angular 22.2.1 / TypeScript 6.0.x / Vitest 5.0.3; Node-RED 5.0.7; MySQL 8.4; ส่วน Android Studio / JDK **ยังไม่ได้ตรวจ**
**Path:** `D:\Aj.Santi\smart-savings` (ทำคนเดียว, Repo อยู่บน GitHub แบบ Private)

---

# ส่วนที่ 3: ข้อมูลที่ผมต้องกรอก / ตรวจสิ่งแวดล้อมก่อนเริ่ม

เริ่มงานด้วยการ **ตรวจเครื่องจริง** (อย่าเดา) แล้วรวบรวมคำถามถามผม **ครั้งเดียว** ในข้อความแรก
