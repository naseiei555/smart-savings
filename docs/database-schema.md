# Database Architecture & Entity Relationship Diagram (ERD)

เอกสารอธิบายโครงสร้างฐานข้อมูลของระบบ Smart Savings Companion

## 1. Entity Relationship Diagram (Mermaid)

```mermaid
erDiagram
    users ||--o{ savings_goals : "owns"
    users ||--o{ notifications : "receives"
    users ||--o| line_accounts : "links"
    users ||--o{ line_link_codes : "generates"
    savings_goals ||--o{ savings_transactions : "contains"
    savings_goals ||--o{ ai_analyses : "has"
    savings_goals ||--o{ notifications : "triggers"

    users {
        int id PK
        varchar(100) name
        varchar(191) email UK
        varchar(255) password_hash
        boolean notify_enabled
        datetime created_at
        datetime updated_at
    }

    savings_goals {
        int id PK
        int user_id FK
        varchar(150) name
        decimal(12_2) target_amount
        decimal(12_2) initial_amount
        decimal(12_2) income
        decimal(12_2) expense
        decimal(12_2) saving_capacity
        date start_date
        date target_date
        enum status "active, completed"
        datetime created_at
        datetime updated_at
    }

    savings_transactions {
        int id PK
        int goal_id FK
        decimal(12_2) amount
        date saving_date
        varchar(255) note
        datetime created_at
    }

    ai_analyses {
        int id PK
        int goal_id FK
        varchar(50) status
        varchar(50) risk_level
        text summary
        text recommendation
        datetime created_at
    }

    notifications {
        int id PK
        int user_id FK
        int goal_id FK, NOT NULL
        varchar(50) type
        enum channel "app, line"
        varchar(150) title
        text message
        boolean is_read
        date notification_date
        datetime created_at
    }

    line_accounts {
        int id PK
        int user_id FK, UK
        varchar(100) line_user_id UK
        boolean is_connected
        datetime created_at
        datetime updated_at
    }

    line_link_codes {
        varchar(64) code PK
        int user_id FK
        datetime expires_at
    }
```

## 2. คำอธิบายตารางและความสัมพันธ์

1. **users**: จัดเก็บข้อมูลผู้ใช้งานบัญชีหลัก
   - รหัสผ่านเก็บเป็น `password_hash` ผ่าน bcrypt (cost 10)
   - `email` กำหนด `UNIQUE` เพื่อป้องกันการสมัครซ้ำ
2. **savings_goals**: เป้าหมายการออมของผู้ใช้
   - ผูกกับ `users(id)` แบบ `ON DELETE CASCADE` เมื่อลบผู้ใช้ ข้อมูลเป้าหมายจะถูกลบอัตโนมัติ
   - จำนวนเงินใช้ชนิดข้อมูล `DECIMAL(12,2)`
   - สถานะเก็บเฉพาะ `active` และ `completed` (สถานะ On Track / At Risk / Behind คำนวณสดใน Application Logic)
3. **savings_transactions**: รายการบันทึกการออมเงินในแต่ละเป้าหมาย
   - ผูกกับ `savings_goals(id)` แบบ `ON DELETE CASCADE`
4. **ai_analyses**: ผลการประเมินความเสี่ยงและคำแนะนำจาก AI
   - ผูกกับ `savings_goals(id)` แบบ `ON DELETE CASCADE`
5. **notifications**: ประวัติการแจ้งเตือน
   - มีข้อกำหนด `UNIQUE KEY (user_id, goal_id, type, channel, notification_date)` เพื่อป้องกันการส่งแจ้งเตือนซ้ำในวันเดียวกัน
6. **line_accounts**: การผูกบัญชี LINE Messaging API เข้ากับระบบ Smart Savings
   - `user_id` และ `line_user_id` เป็น 1-to-1 และ `UNIQUE`
7. **line_link_codes**: โค้ด OTP ชั่วคราวสำหรับการยืนยันการผูกบัญชี LINE มีอายุใช้งานตาม `expires_at`

## 3. ดัชนี (Indexes) และเหตุผลการออกแบบ

- **`email VARCHAR(191) UNIQUE`**: เป็นค่าที่ใช้ตามธรรมเนียม ไม่ใช่ข้อจำกัดของ MySQL 8.4 (เนื่องจาก MySQL 8.4 รองรับ Index ได้สูงสุด 3072 ไบต์) แต่กำหนดไว้ 191 ตัวอักษรเพื่อให้เข้ากันได้ตามธรรมเนียมปฏิบัติและเพียงพอต่อที่อยู่อีเมลจริง
- **`idx_goals_user_id` / `idx_notifications_user_date`**: รองรับการ Query ข้อมูลตามผู้ใช้งานที่กำลัง Login อยู่ได้อย่างรวดเร็ว (Query ค้นหาตาม `user_id`)
- **`idx_tx_goal_id` / `idx_tx_saving_date`**: เร่งความเร็วการสรุปยอดเงินและสร้างข้อมูลกราฟประวัติการออมตามช่วงเวลา
- **`idx_line_user_id`**: ค้นหาผู้ใช้จาก Webhook Event ของ LINE Messaging API ได้ทันที
- **`idx_link_expires`**: รองรับการตรวจสอบและกวาดล้าง (cleanup) โค้ดที่หมดอายุ

