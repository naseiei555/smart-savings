# รายงานความคืบหน้า Block B2: Calculation Engine, Goals, Savings & Dashboard APIs

**วันที่:** 10 ตุลาคม 2026  
**สถานะ:** สำเร็จตามเกณฑ์ทั้งหมด (49/49 Tests ผ่าน 100%)

---

## 1. วัตถุประสงค์และผลการดำเนินงาน

1. **Calculation Engine (Pure System Logic):**
   - พัฒนาโมดูล `calc.js` และ `dates.js` รองรับการคำนวณแบบ Pure JavaScript System Logic โดยไม่มีการพึ่งพา LLM ในการคำนวณตัวเลข
   - จัดการ Timezone `Asia/Bangkok` และปฏิทิน UTC เที่ยงคืนเพื่อป้องกันข้อผิดพลาดจาก Daylight Saving Time (DST)
   - คำนวณสถานะ 4 ระดับ: `completed`, `on_track` (ratio >= 0.8), `at_risk` (0.5 <= ratio < 0.8), `behind` (ratio < 0.5) หรือ `overdue` (เลยกำหนด)
   - สร้างชุดข้อมูลกราฟรายสัปดาห์ (Planned Linear vs Actual Cumulative) บน RAM โดยไม่บันทึกซ้ำซ้อนในฐานข้อมูล

2. **Validation Layer:**
   - พัฒนา `validate.js` ตรวจสอบความถูกต้องของ Input ก่อนเข้าฐานข้อมูล
   - ป้องกันวันที่ผิดปฏิทิน (เช่น 2026-02-30) ด้วย Date.UTC validation
   - จำกัดความยาวชื่อเป้าหมาย 1-150 ตัวอักษร, ยอดเงิน 0.01 - 10,000,000 บาท

3. **REST APIs & Multi-tenant Isolation:**
   - `GET /api/goals`: แสดงรายการเป้าหมายของผู้ใช้ พร้อมสถานะคำนวณล่าสุด
   - `POST /api/goals`: สร้างเป้าหมายใหม่
   - `GET /api/goals/:id`: ดูรายละเอียดเป้าหมายเดี่ยว
   - `PUT /api/goals/:id`: แก้ไขเป้าหมาย และประเมินสถานะ `active`/`completed` ใหม่
   - `DELETE /api/goals/:id`: ลบเป้าหมาย (Foreign Key `ON DELETE CASCADE` ลบรายการออมที่เกี่ยวข้องอัตโนมัติ)
   - `GET /api/goals/:id/savings`: ดูประวัติการออมของเป้าหมาย
   - `POST /api/goals/:id/savings`: บันทึกการออม พร้อมปรับสถานะเป้าหมายเป็น `completed` และสร้าง Notification เมื่อครบยอด
   - `DELETE /api/savings/:id`: ลบรายการออม พร้อมคำนวณยอดคงเหลือใหม่ หากไม่ครบยอดจะคืนสถานะเป็น `active` ทันที
   - `GET /api/dashboard`: สรุปข้อมูลภาพรวมการออม เป้าหมายที่ใกล้ถึงกำหนด และจำนวนแจ้งเตือนที่ยังไม่ได้อ่าน
   - `GET /api/goals/:id/analysis`: ส่งออก Metrics และข้อมูลกราฟ Planned vs Actual รายสัปดาห์
   - ทุก Endpoint ตรวจสอบ `user_id` จาก JWT Token ที่ตรวจสอบผ่าน HS256 ป้องกันการเข้าถึงข้ามบัญชี (ตอบ 404 เมื่อพยายามเข้าถึงข้อมูลของผู้อื่น)

---

## 2. ผลการรันชุดทดสอบ (Raw Test Output)

```text
▶ API Auth - Integration Test Suite
  ✔ 1. Register successfully (176.7796ms)
  ✔ 2. Register duplicate email returns 409 (177.8558ms)
  ✔ 3. Register validation failures return 400 (71.2028ms)
  ✔ 4. Login successfully returns 200 and token with sub string (74.9813ms)
  ✔ 5. Login with wrong password returns 401 (83.8855ms)
  ✔ 6. Login with nonexistent email returns 401 (69.008ms)
  ✔ 7. GET /api/auth/me without token returns 401 (5.8329ms)
  ✔ 8. GET /api/auth/me with invalid header returns 401 (4.7716ms)
  ✔ 9. GET /api/auth/me with valid token returns user profile without password_hash (11.2704ms)
✔ API Auth - Integration Test Suite (677.8454ms)
▶ Block B2 API Tests - Goals & Savings
  ▶ 1. Goal Validation and CRUD
    ✔ rejects POST /api/goals with invalid inputs (157.1114ms)
    ✔ creates a valid goal via POST /api/goals (8.7815ms)
    ✔ lists goals via GET /api/goals with computed metrics (64.6965ms)
    ✔ retrieves single goal via GET /api/goals/:id (16.7423ms)
    ✔ updates a goal via PUT /api/goals/:id (18.5031ms)
  ✔ 1. Goal Validation and CRUD (266.6197ms)
  ▶ 2. Multi-tenant Authorization Enforcement
    ✔ creates a goal for User B (12.9496ms)
    ✔ User B CANNOT access User A goal (returns 404) (6.8236ms)
    ✔ User B CANNOT update User A goal (returns 404) (20.9676ms)
    ✔ User B CANNOT add saving to User A goal (returns 404) (16.5037ms)
  ✔ 2. Multi-tenant Authorization Enforcement (57.7722ms)
  ▶ 3. Savings Transactions & Current Amount Recalculation
    ✔ adds saving deposit via POST /api/goals/:id/savings (9.8169ms)
    ✔ lists savings via GET /api/goals/:id/savings (6.144ms)
    ✔ recalculates goal status to completed when target is met (9.0285ms)
    ✔ deleting a saving rolls back goal status to active (35.0528ms)
    ✔ User B CANNOT delete User A saving (returns 404) (15.2078ms)
  ✔ 3. Savings Transactions & Current Amount Recalculation (75.6002ms)
  ▶ 4. Dashboard and Analysis Endpoints
    ✔ GET /api/dashboard returns aggregated summary and active goals (16.281ms)
    ✔ GET /api/goals/:id/analysis returns chart series and metrics (5.8826ms)
  ✔ 4. Dashboard and Analysis Endpoints (22.4051ms)
  ▶ 5. Goal Deletion
    ✔ deletes goal via DELETE /api/goals/:id and cascades savings (25.2371ms)
  ✔ 5. Goal Deletion (25.4045ms)
✔ Block B2 API Tests - Goals & Savings (858.9417ms)
✔ verifyAuthHeader - Valid Token returns integer userId (3.2732ms)
✔ verifyAuthHeader - Missing header throws INVALID_HEADER_FORMAT (0.3052ms)
✔ verifyAuthHeader - Header without Bearer prefix throws INVALID_HEADER_FORMAT (0.0954ms)
✔ verifyAuthHeader - Empty Bearer token throws EMPTY_TOKEN (0.1342ms)
✔ verifyAuthHeader - Expired token throws TokenExpiredError (1.0892ms)
✔ verifyAuthHeader - Wrong secret throws JsonWebTokenError (0.9083ms)
✔ verifyAuthHeader - Algorithm none rejected (0.2ms)
✔ verifyAuthHeader - Non-numeric sub throws INVALID_SUB (0.3624ms)
✔ verifyAuthHeader - Non-positive integer sub (0, negative, decimal) throws INVALID_SUB (0.8549ms)
✔ Calculation Engine - Test Vector A (Initial 5000, Target 30000, No Tx) (1.5326ms)
✔ Calculation Engine - Test Vector B (With Tx 2500) (0.2579ms)
✔ Calculation Engine - Test Vector C (Target Reached / Completed) (0.3408ms)
✔ Calculation Engine - Test Vector D (Overdue with remaining > 0) (0.3747ms)
✔ Calculation Engine - Test Vector E (start = target = today, total_days = 0) (0.2558ms)
✔ Calculation Engine - Test Vector F (Threshold boundary tests: on_track, at_risk, behind) (0.3094ms)
✔ Calculation Engine - Test Vector G (planned_to_date = 0 on day 1 -> ratio = 1) (0.2114ms)
✔ Calculation Engine - Test Vector H (current > target, over_amount) (0.2396ms)
✔ Calculation Engine - buildChartSeries generates weekly points and null for future (11.423ms)
✔ validateGoalPayload - Valid payload returns sanitized data (0.8842ms)
✔ validateGoalPayload - Rejects invalid dates (e.g. 2026-02-30) and target before start (0.2444ms)
✔ validateGoalPayload - Rejects target <= 0, > 10M, NaN, negative amounts (0.1292ms)
✔ validateSavingPayload - Validates amount, date bounds, and note (1.1649ms)
ℹ tests 49
ℹ suites 6
ℹ pass 49
ℹ fail 0
```

---

## 3. ขั้นตอนถัดไป: เข้าสู่ Block B3 (UI/UX - Day 2)
- พัฒนา Mascot SVG Component (Capybara/Bear แสดง 6 อารมณ์)
- พัฒนา Shared Components: `StatusBadge`, `MoneyPipe`, `ThaiDatePipe`
- พัฒนา Goals Module: Goals List, Goal Detail, Goal Form (พร้อม Live Saving Plan Preview), Add Saving Modal, Savings History
- พัฒนา Dashboard พร้อม Chart.js / ng2-charts (Planned vs Actual & Category/Summary)
- Build Angular ตรวจสอบและเชื่อมต่อ Nginx Container
