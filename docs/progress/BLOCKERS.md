# Smart Savings Companion - Blockers & Pending External Items

รายการสิ่งที่ต้องใช้จากภายนอกหรือสิ่งที่ผู้ใช้ต้องเตรียมใน `.env` เมื่อพร้อมใช้งาน (ไม่บล็อกการทำงานส่วนอื่น ระบบจะใช้ Fallback หรือข้ามไปทำส่วนที่ไม่ถูกบล็อกก่อน):

| หัวข้อ | สถานะปัจจุบัน | ผลกระทบ | วิธีการทำงานปัจจุบัน (Workaround / Fallback) |
|---|---|---|---|
| **LLM API Configuration** (`LLM_PROVIDER`, `LLM_MODEL`, `LLM_API_KEY`) | ยังไม่ได้ระบุใน `.env` | การวิเคราะห์ของ AI จะเข้าสู่เงื่อนไข Fallback | ใน Block B4 ระบบทดสอบ Rule-based Fallback เต็มรูปแบบ (และรองรับการสลับไปใช้ LLM ทันทีเมื่อผู้ใช้ใส่ Key) |
| **LINE Official Account & Token** (`LINE_CHANNEL_ACCESS_TOKEN`, `LINE_CHANNEL_SECRET`) | ยังไม่ได้ระบุใน `.env` | การยิง LINE Push Message จริงไปยัง Messaging API จะยังไม่สำเร็จ | ใน Block B5 เตรียมโครงสร้าง Endpoint, Webhook Signature Check, และ Scheduler พร้อมระบบจำลอง/บันทึก Log และรองรับส่งจริงเมื่อมี Token |
| **LINE Demo User ID** (`LINE_DEMO_USER_ID`) | ยังไม่ได้ระบุใน `.env` | การทดสอบ Push หาผู้ใช้รายบุคคลเจาะจง | รองรับ Account Linking ผ่าน Verification code เมื่อมี Tunnel |
| **Android Environment Paths & Build** | **แก้ปัญหาเรียบร้อยใน Block B6** | - | ติดตั้ง Capacitor v8.5.3, ตั้งค่า JDK 21 (`.jdks/jbr-21.0.11`) และ Android SDK (`AppData/Local/Android/Sdk`) คอมไพล์ได้ `app-debug.apk` สำเร็จ (ขนาด ~4.18 MB) |
