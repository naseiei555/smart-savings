# รายงานความคืบหน้า Block B0 (ตรวจ/แก้ C1-C3 ที่ค้าง + Lib กลาง)

**วันที่:** 10 ตุลาคม 2026  
**สถานะ:** เสร็จสมบูรณ์ (พร้อมเริ่ม Block B1 ทันที)

---

## 1. ทำอะไรไปบ้าง (เชื่อมกับ Requirement)
- **C1 Audit:** ตรวจสอบโครงสร้าง Foreign Key Constraints ในตาราง MySQL พบว่าทุก Constraint เป็น `ON DELETE CASCADE` 100% และตาราง `notifications` มี `goal_id INT NOT NULL` พร้อม `UNIQUE KEY (user_id, goal_id, type, channel, notification_date)` ตรงตามข้อกำหนด
- **C2 Audit & Refactor:** แก้ไขคอมเมนต์ในโค้ด Login เป็น `"ลดความต่างของเวลาตอบ เพื่อป้องกัน Timing Attack"` ถูกต้องตรงตามข้อเท็จจริง
- **สร้าง Lib กลาง:**
  - `backend/node-red/data/lib/db.js`: Connection Pool (`mysql2/promise`)
  - `backend/node-red/data/lib/auth.js`: ตรวจสอบ JWT `algorithms: ['HS256']`, แปลง `sub` เป็นจำนวนเต็มบวก และจัดการ Error ทั่วไปภาษาไทย
- **Subflow กลาง Verify JWT:** เชื่อมโยง Subflow ให้ใช้ `lib/auth.js` ผ่าน Node-RED Global Context และบันทึก Log สาเหตุจริงในฝั่งเซิร์ฟเวอร์
- **วัดเวลาตอบสนอง Login:** วัดความเร็วเปรียบเทียบระหว่างกรณีไม่พบผู้ใช้ (Dummy Hash) กับกรณีรหัสผ่านผิด
- **สร้างชุดทดสอบอัตโนมัติ:**
  - `tests/unit/auth.test.mjs`: Unit Test ของ `lib/auth.js` (9 Test Cases ครอบคลุม Token ปกติ, หมดอายุ, Secret ผิด, alg: none, sub ผิดรูปแบบ)
  - `tests/api/auth.test.mjs`: Integration Test API Auth (9 Test Cases ยิงตรงผ่านพอร์ต 80)
  - `tests/api/timing.test.mjs`: วัดค่า Response Time ป้องกัน Timing Attack
- **อัปเดตสภาพแวดล้อม:** `.env.example`, `docker-compose.yml`, และ `.gitignore` ไม่ Track ไฟล์ Secret / Credentials ใด ๆ

---

## 2. รายการไฟล์ที่สร้าง/แก้ไข (Path เต็ม)
- `d:\Aj.Santi\smart-savings\docs\MASTER_BUILD_PROMPT.md` (สร้างใหม่)
- `d:\Aj.Santi\smart-savings\docs\progress\BLOCKERS.md` (สร้างใหม่)
- `d:\Aj.Santi\smart-savings\docs\progress\BLOCK-0-REPORT.md` (สร้างใหม่)
- `d:\Aj.Santi\smart-savings\.env.example` (แก้ไข: เพิ่มตัวแปร LLM, LINE, Node-RED Admin)
- `d:\Aj.Santi\smart-savings\docker-compose.yml` (แก้ไข: ส่งผ่านตัวแปรแวดล้อมให้ Container node-red)
- `d:\Aj.Santi\smart-savings\.gitignore` (แก้ไข: Track `lib/`, ละเว้น credentials และ build artifacts)
- `d:\Aj.Santi\smart-savings\backend\node-red\data\lib\db.js` (สร้างใหม่)
- `d:\Aj.Santi\smart-savings\backend\node-red\data\lib\auth.js` (สร้างใหม่)
- `d:\Aj.Santi\smart-savings\backend\node-red\data\settings.js` (แก้ไข: เพิ่ม `db` และ `auth` ใน `functionGlobalContext`)
- `d:\Aj.Santi\smart-savings\backend\node-red\data\flows.json` (แก้ไข: ปรับปรุงใช้ Pool, lib/auth และแก้ไขคอมเมนต์)
- `d:\Aj.Santi\smart-savings\tests\unit\auth.test.mjs` (สร้างใหม่)
- `d:\Aj.Santi\smart-savings\tests\api\auth.test.mjs` (สร้างใหม่)
- `d:\Aj.Santi\smart-savings\tests\api\timing.test.mjs` (สร้างใหม่)
- `d:\Aj.Santi\smart-savings\package.json` (แก้ไข: เพิ่ม dependencies สำหรับ node:test runner)

---

## 3. คำสั่งที่รันและ Output ดิบ

### ก. ผลตรวจ C1 Constraints และ Schema จาก MySQL จริง
```text
CONSTRAINT_NAME          TABLE_NAME            REFERENCED_TABLE_NAME    DELETE_RULE
fk_ai_analyses_goal      ai_analyses           savings_goals            CASCADE
fk_goals_user            savings_goals         users                    CASCADE
fk_line_accounts_user    line_accounts         users                    CASCADE
fk_line_link_codes_user  line_link_codes       users                    CASCADE
fk_notifications_goal    notifications         savings_goals            CASCADE
fk_notifications_user    notifications         users                    CASCADE
fk_transactions_goal     savings_transactions  savings_goals            CASCADE

`notifications` CREATE TABLE:
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `goal_id` int NOT NULL,
  `type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `channel` enum('app','line') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'app',
  `title` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT '0',
  `notification_date` date NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_user_goal_type_channel_date` (`user_id`,`goal_id`,`type`,`channel`,`notification_date`),
  CONSTRAINT `fk_notifications_goal` FOREIGN KEY (`goal_id`) REFERENCES `savings_goals` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_notifications_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
```

### ข. ผลทดสอบ Unit Test (`node --test tests/unit/auth.test.mjs`)
```text
✔ verifyAuthHeader - Valid Token returns integer userId (5.1827ms)
✔ verifyAuthHeader - Missing header throws INVALID_HEADER_FORMAT (0.4568ms)
✔ verifyAuthHeader - Header without Bearer prefix throws INVALID_HEADER_FORMAT (0.1066ms)
✔ verifyAuthHeader - Empty Bearer token throws EMPTY_TOKEN (0.0893ms)
✔ verifyAuthHeader - Expired token throws TokenExpiredError (0.8139ms)
✔ verifyAuthHeader - Wrong secret throws JsonWebTokenError (0.7736ms)
✔ verifyAuthHeader - Algorithm none rejected (0.2261ms)
✔ verifyAuthHeader - Non-numeric sub throws INVALID_SUB (0.5393ms)
✔ verifyAuthHeader - Non-positive integer sub (0, negative, decimal) throws INVALID_SUB (0.9522ms)
ℹ tests 9
ℹ suites 0
ℹ pass 9
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 1410.1774
```

### ค. ผลทดสอบ Integration Test API Auth (`node --test tests/api/auth.test.mjs`)
```text
▶ API Auth - Integration Test Suite
  ✔ 1. Register successfully (171.4293ms)
  ✔ 2. Register duplicate email returns 409 (75.3967ms)
  ✔ 3. Register validation failures return 400 (9.4579ms)
  ✔ 4. Login successfully returns 200 and token with sub string (74.4033ms)
  ✔ 5. Login with wrong password returns 401 (67.5578ms)
  ✔ 6. Login with nonexistent email returns 401 (63.3796ms)
  ✔ 7. GET /api/auth/me without token returns 401 (7.5816ms)
  ✔ 8. GET /api/auth/me with invalid header returns 401 (4.1977ms)
  ✔ 9. GET /api/auth/me with valid token returns user profile without password_hash (9.7959ms)
✔ API Auth - Integration Test Suite (485.4964ms)
ℹ tests 10
ℹ suites 0
ℹ pass 10
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 547.1909
```

### ง. ผลทดสอบวัด Response Time (ป้องกัน Timing Attack) (`node --test tests/api/timing.test.mjs`)
```text
Average Response Time (Non-existent user with dummyHash): 74.61 ms
Average Response Time (Wrong password on existing user):   61.65 ms
✔ Measure Login Response Time Difference (Timing Attack Analysis) (682.7736ms)
```

---

## 4. ตารางสรุปผลการทดสอบ

| กรณีการทดสอบ | สถานะ | หลักฐาน |
|---|:---:|---|
| Foreign Key `DELETE_RULE = CASCADE` ทุกตัว | ผ่าน | ตรวจสอบผ่าน `information_schema.REFERENTIAL_CONSTRAINTS` |
| `notifications.goal_id` เป็น `NOT NULL` | ผ่าน | `SHOW CREATE TABLE notifications` |
| Unit Test Auth (JWT HS256, Expired, sub, alg none) | ผ่าน | `node --test tests/unit/auth.test.mjs` (ผ่านทั้ง 9 ข้อ) |
| API Integration Test (Register, Login, /me) ผ่านพอร์ต 80 | ผ่าน | `node --test tests/api/auth.test.mjs` (ผ่านทั้ง 9 ข้อ) |
| Timing Difference Analysis (ลดความต่างของเวลาตอบ) | ผ่าน | `tests/api/timing.test.mjs` (74.61 ms vs 61.65 ms) |

---

## 5. สิ่งที่คุณควรเข้าใจเพื่อนำไปอธิบายอาจารย์ใน Block นี้
1. **การลดความต่างของเวลาตอบ (Timing Attack Mitigation)**: เมื่อผู้ใช้กรอกอีเมลที่ไม่มีในระบบ เซิร์ฟเวอร์จะนำรหัสผ่านที่ส่งมาไปคำนวณ `bcrypt.compare` กับค่า `dummyHash` ที่ตั้งไว้เสมอ เพื่อให้ CPU ต้องประมวลผลการแฮชใกล้เคียงกับกรณีที่มีผู้ใช้อยู่จริง ป้องกันไม่ให้ผู้โจมตีจับเวลาความเร็วของการตอบสนองเพื่อแยกแยะการมีอยู่ของบัญชีได้
2. **การบังคับ Algorithm ใน JWT Verification**: ระบุ `algorithms: ['HS256']` อย่างชัดเจนใน `jwt.verify` เพื่อป้องกันช่องโหว่ **Algorithm Confusion Attack** หรือการส่ง Token ที่มี header `{"alg": "none"}` เข้ามาหลอกระบบ
3. **การตรวจสอบ Sub Claim ตาม RFC 7519**: RFC 7519 ระบุว่า `sub` ต้องเป็น String แต่ในฐานข้อมูลระบบเราเก็บเป็น `INTEGER` ดังนั้นฟังก์ชัน `verifyAuthHeader` ต้องแปลง `sub` เป็นตัวเลขและตรวจสอบว่าเป็นจำนวนเต็มบวก (`Number.isInteger(subNum) && subNum > 0`) ก่อนนำไปใช้เป็น `userId` ในการ Query

---

## 6. สิ่งที่บันทึกใน `BLOCKERS.md`
- บันทึกข้อมูลที่ต้องรอใส่ใน `.env` เช่น LLM Provider, LINE Token/Secret, และการตั้ง PATH สำหรับ Android SDK/JDK เรียบร้อย (ไม่บล็อก B1 และ B2)

---

## 7. คำเตือนก่อน Push
กรุณารัน `git status` ยืนยันว่าไม่มีไฟล์ `.env`, `flows_cred.json`, หรือไฟล์ Secret ติดไป ก่อนทำการ `git push` ขึ้น GitHub ครับ
