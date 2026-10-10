# รายงานความคืบหน้า Block B1 (Angular Auth + โครงสร้าง UI)

**วันที่:** 10 ตุลาคม 2026  
**สถานะ:** เสร็จสมบูรณ์ (พร้อมเริ่ม Block B2 ทันที)

---

## 1. ทำอะไรไปบ้าง (เชื่อมกับ Requirement B1)
- **สถาปัตยกรรม Angular 22 Core Services & Interceptors:**
  - สร้าง [`AuthService`](file:///d:/Aj.Santi/smart-savings/frontend/src/app/core/services/auth.service.ts): จัดการ Register, Login, Fetch `/api/auth/me`, และ Logout พร้อม Reactive Signals (`currentUser`, `isAuthenticated`) และตรวจสอบสถานะ JWT หมดอายุอัตโนมัติ
  - สร้าง [`jwtInterceptor`](file:///d:/Aj.Santi/smart-savings/frontend/src/app/core/interceptors/jwt.interceptor.ts): แนบ `Authorization: Bearer <token>` ไปยังคำขอที่ขึ้นต้นด้วย `/api` และตรวจดักจับกรณี 401 เพื่อสั่งเคลียร์ token และพาผู้ใช้กลับไปหน้า Login
  - สร้าง [`authGuard`](file:///d:/Aj.Santi/smart-savings/frontend/src/app/core/guards/auth.guard.ts): ป้องกัน Route สำคัญ (เช่น `/dashboard`) หากไม่ได้ล็อกอินจะ redirect ไปหน้า `/login`
- **โครงสร้าง Environments:**
  - `src/environments/environment.ts` (dev: `/api`)
  - `src/environments/environment.prod.ts` (`/api`)
  - `src/environments/environment.android.ts` (เตรียมการสำหรับ APK ใน B6)
- **สร้างหน้า UI แบบ Standalone Components:**
  - `LandingComponent` (`/`): หน้าต้อนรับพร้อม Mascot Welcome และปุ่มเริ่มใช้งาน
  - `RegisterComponent` (`/register`): Reactive Form พร้อม Client-side Validation (ชื่อ $\le 100$, อีเมล $\le 191$, รหัสผ่านตรวจสอบขนาด UTF-8 ไบต์ $8 - 72$ ไบต์ด้วย `TextEncoder` ตรงกับ Backend 100%)
  - `LoginComponent` (`/login`): Reactive Form เข้าสู่ระบบ จัดการ Error Alert ภาษาไทยที่เป็นมิตร
  - `DashboardComponent` (`/dashboard`): หน้า Dashboard ที่ได้รับการปกป้องด้วย `authGuard` แสดงชื่อผู้ใช้ และปุ่ม Logout
- **การคอมไพล์และ Deploy บน Nginx:**
  - รัน `npm run build` จริง สำเร็จ (`Exit 0`)
  - Build Image และ Recreate คอนเทนเนอร์ `ss-frontend` จริง ทดสอบเรียกเปิดหน้าเว็บและ fallback routes ได้ถูกต้อง

---

## 2. รายการไฟล์ที่สร้าง/แก้ไข (Path เต็ม)
- `d:\Aj.Santi\smart-savings\frontend\src\environments\environment.ts` (สร้างใหม่)
- `d:\Aj.Santi\smart-savings\frontend\src\environments\environment.prod.ts` (สร้างใหม่)
- `d:\Aj.Santi\smart-savings\frontend\src\environments\environment.android.ts` (สร้างใหม่)
- `d:\Aj.Santi\smart-savings\frontend\src\app\core\models\auth.models.ts` (สร้างใหม่)
- `d:\Aj.Santi\smart-savings\frontend\src\app\core\services\auth.service.ts` (สร้างใหม่)
- `d:\Aj.Santi\smart-savings\frontend\src\app\core\interceptors\jwt.interceptor.ts` (สร้างใหม่)
- `d:\Aj.Santi\smart-savings\frontend\src\app\core\guards\auth.guard.ts` (สร้างใหม่)
- `d:\Aj.Santi\smart-savings\frontend\src\app\features\landing\landing.component.ts` (สร้างใหม่)
- `d:\Aj.Santi\smart-savings\frontend\src\app\features\auth\register.component.ts` (สร้างใหม่)
- `d:\Aj.Santi\smart-savings\frontend\src\app\features\auth\login.component.ts` (สร้างใหม่)
- `d:\Aj.Santi\smart-savings\frontend\src\app\features\dashboard\dashboard.component.ts` (สร้างใหม่)
- `d:\Aj.Santi\smart-savings\frontend\src\app\app.routes.ts` (แก้ไข: เพิ่ม routing landing, register, login, dashboard)
- `d:\Aj.Santi\smart-savings\frontend\src\app\app.config.ts` (แก้ไข: ติดตั้ง provideHttpClient พร้อม jwtInterceptor)
- `d:\Aj.Santi\smart-savings\frontend\src\app\app.html` (แก้ไข: แสดง `<router-outlet></router-outlet>`)
- `d:\Aj.Santi\smart-savings\docs\progress\BLOCK-1-REPORT.md` (สร้างใหม่)

---

## 3. คำสั่งที่รันและ Output ดิบ

### ก. ผลการ Build Angular Frontend (`npm run build`)
```text
Application bundle generation complete. [7.121 seconds] - 2026-10-10T07:45:15.509Z
Output location: D:\Aj.Santi\smart-savings\frontend\dist\frontend
Initial chunk files | Names   | Raw size  | Estimated transfer size
main-IJRG4WOE.js    | main    | 298.24 kB | 77.41 kB
styles-JG7EAGFK.css | styles  | 230.85 kB | 22.46 kB
```

### ข. ผลการเปิดหน้าเว็บผ่าน Nginx คอนเทนเนอร์จริง (`curl.exe -i http://localhost/login`)
```text
HTTP/1.1 200 OK
Server: nginx/1.31.6
Date: Sat, 10 Oct 2026 07:46:16 GMT
Content-Type: text/html
Content-Length: 5155
Last-Modified: Sat, 10 Oct 2026 07:45:31 GMT
Connection: keep-alive
ETag: "6ac9ed1b-1423"

<app-root></app-root>
<script src="main-IJRG4WOE.js" type="module"></script>
```

### ค. ผลการรัน Regression Test Suite (`tests/api/auth.test.mjs`)
```text
▶ API Auth - Integration Test Suite
  ✔ 1. Register successfully (156.0901ms)
  ✔ 2. Register duplicate email returns 409 (69.4085ms)
  ✔ 3. Register validation failures return 400 (28.7015ms)
  ✔ 4. Login successfully returns 200 and token with sub string (79.0158ms)
  ✔ 5. Login with wrong password returns 401 (71.0993ms)
  ✔ 6. Login with nonexistent email returns 401 (68.1737ms)
  ✔ 7. GET /api/auth/me without token returns 401 (9.4935ms)
  ✔ 8. GET /api/auth/me with invalid header returns 401 (20.2884ms)
  ✔ 9. GET /api/auth/me with valid token returns user profile without password_hash (18.4647ms)
✔ API Auth - Integration Test Suite (522.8498ms)
ℹ tests 10
ℹ pass 10
ℹ fail 0
```

---

## 4. ตารางสรุปผลการทดสอบ

| กรณีการทดสอบ | สถานะ | หลักฐาน |
|---|:---:|---|
| Angular Standalone Build (`ng build`) | ผ่าน | bundle build สำเร็จและ serve บน Nginx |
| Frontend Fallback Routing (`/login`, `/dashboard`) | ผ่าน | Nginx ตอบ 200 index.html เพื่อให้ Client Router ทำงาน |
| API Regression Test Auth | ผ่าน | `node --test tests/api/auth.test.mjs` (ผ่าน 10/10) |
| Unit Test Auth | ผ่าน | `node --test tests/unit/auth.test.mjs` (ผ่าน 9/9) |

---

## 5. สิ่งที่คุณควรเข้าใจเพื่อนำไปอธิบายอาจารย์ใน Block นี้
1. **การทำงานของ Functional Interceptor (`HttpInterceptorFn`)**: ใน Angular เวอร์ชันใหม่ เราใช้ฟังก์ชัน `jwtInterceptor` แทน Class Interceptor เพื่อลด boilerplate โค้ดจะดักจับ request ทุกตัว และหากปลายทางขึ้นต้นด้วย `/api` จะนำ Token จาก `localStorage` ไปแนบใน `Authorization: Bearer` โดยอัตโนมัติ
2. **การป้องกันหน้า Dashboard ด้วย `CanActivateFn`**: Route `/dashboard` ถูกผูกด้วย `canActivate: [authGuard]` ฟังก์ชัน Guard จะตรวจสอบสถานะ `isAuthenticated()` หากไม่มี Token หรือ Token หมดอายุ จะยกเลิกการเข้าถึงและ Redirect ไปยัง `/login` ทันที
3. **การตรวจสอบขนาดรหัสผ่าน 8-72 ไบต์บนฝั่ง Client**: ใช้ `new TextEncoder().encode(password).length` บน TypeScript เพื่อตรวจสอบขนาดไบต์จริงของ UTF-8 ให้สอดคล้องกับข้อจำกัดของอัลกอริทึม bcrypt ใน Backend ก่อนส่งข้อมูลข้ามเครือข่าย

---

## 6. คำเตือนก่อน Push
กรุณารัน `git status` ยืนยันว่าไม่มีไฟล์ `.env`, `flows_cred.json`, หรือไฟล์ Secret ติดไป ก่อนทำการ `git push` ขึ้น GitHub ครับ
