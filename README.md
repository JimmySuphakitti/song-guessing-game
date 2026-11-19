# 🇹🇭 เกมทายเพลงไทย (Thai Song Quiz - iTunes API Edition)

เว็บแอปพลิเคชันเกมทายเพลงไทย พัฒนาด้วย **HTML5, CSS3, JavaScript (Frontend)** และ **PHP 8.2 (Backend)** ขับเคลื่อนด้วยข้อมูลเพลงจริงและสตรีมมิ่งความยาว 30 วินาทีผ่าน **Apple Music / iTunes Search API** พร้อมระบบควบคุมผ่าน **Docker**

---

## 🌟 ฟีเจอร์หลักใหม่ 4 ส่วน (New Major Features)

### 1. ระบบป้องกันเพลงและศิลปินซ้ำ (Anti-Repetition Logic)
- **เงื่อนไขเพลงซ้ำ**: บันทึกประวัติรหัสเพลง (`trackId`) ที่เคยสุ่มเล่นไปแล้ว และห้ามสุ่มเพลงเดิมมาออกซ้ำในเซสชันเดียวกันอย่างเด็ดขาด
- **เงื่อนไขศิลปินซ้ำ**: หากศิลปินคนใดถูกสุ่มมาออกเป็นโจทย์แล้วครบ 2 เพลง ระบบจะตัดชื่อศิลปินคนนั้นออกจากการเป็นโจทย์ชั่วคราวทันที และบังคับสุ่มไปหาศิลปินคนอื่น เพื่อความหลากหลายและท้าทาย

### 2. ระบบเลือกหมวดหมู่แนวเพลงแบบหลายตัวเลือก (Multi-Select Genre)
- สามารถคลิกเลือกแนวเพลงหลายหมวดพร้อมกันได้ (เช่น เลือก **Pop + Rock + Hip-Hop + Indie** พร้อมกันได้)
- หรือกดปุ่ม **"เลือกทุกหมวด"** เพื่อสุ่มรวมทุกแนวเพลง
- มีตัวนับ Badge แสดงจำนวนแนวเพลงที่เลือกแบบเรียลไทม์
- หมวดหมู่ที่รองรับ:
  - 💖 **ป็อป & T-Pop** (4EVE, BNK48, NONT TANONT, Three Man Down, Tilly Birds, Bowkylion, ฯลฯ)
  - 🎸 **ร็อกไทย** (Bodyslam, Paper Planes, Cocktail, Potato, Silly Fools, Loso, ฯลฯ)
  - 🎤 **ฮิปฮอป & แร็ปไทย** (F.HERO, URBOYTJ, YOUNGOHM, D GERRARD, MILLI, SPRITE, ฯลฯ)
  - 🎧 **อินดี้ & อัลเทอร์เนทีฟ** (Polycat, Safeplanet, Dept, Anatomy Rabbit, TaitosmitH, ฯลฯ)
  - 📻 **ยุค 90s - 2000s** (Modern Dog, พงษ์พัฒน์, อัสนี วสันต์, ไมโคร, D2B, แร็พเตอร์, ฯลฯ)
  - 🌾 **เพื่อชีวิต & ลูกทุ่ง** (คาราบาว, โจอี้ ภูวศิษฐ์, มนต์แคน แก่นคูน, ไผ่ พงศธร, ฯลฯ)

### 3. หน้าต่างดูรายชื่อเพลงและอัลบั้มแยกตามหมวดหมู่ (Song & Album Explorer)
- กดปุ่ม **📂 คลังเพลง** ที่แถบด้านบน เพื่อเปิดหน้าต่างดูรายชื่อเพลงทั้งหมดในระบบ
- จัดกลุ่มตามแท็บหมวดหมู่แนวเพลง พร้อมช่องค้นหาเพลง/ศิลปิน/อัลบั้มแบบเรียลไทม์
- แต่ละรายการแสดงข้อมูลครบถ้วน:
  - ภาพปกอัลบั้ม (Artwork Thumbnail)
  - ชื่อเพลง (`trackName`)
  - ชื่อศิลปิน (`artistName`)
  - ชื่ออัลบั้ม (`collectionName`) และปีที่ปล่อยเพลง
  - ปุ่มกดทดลองฟังตัวอย่างเสียง 30 วินาที (`▶️`) ได้โดยตรงในหน้าต่างคลังเพลง

### 4. ระบบบันทึก Session อัตโนมัติ & กู้คืนสถานะ (Auto-Save Session & Recovery)
- บันทึกสถานะการเล่นแบบเรียลไทม์ทั้งใน **PHP Session (`api/session.php`)** และ **Client `localStorage`**:
  - ข้อที่กำลังเล่นค้างอยู่
  - คะแนนสะสมและ Streak คอมโบ
  - แนวเพลงและคำค้นหาที่เลือกไว้
  - ประวัติเพลงที่เล่นไปแล้ว (`playedTrackIds`)
  - สถิติจำนวนครั้งของศิลปินที่ออกไปแล้ว (`artistCounts`)
- **กรณีเผลอปิดแท็บ หรือกดรีเฟรช**: เมื่อเปิดหน้าเว็บกลับมา ระบบจะแจ้งเตือนแถบสีม่วงพร้อมปุ่ม **"▶️ เล่นต่อทันที"** กู้คืนสถานะกลับมาเล่นต่อจากข้อเดิมได้ทันที 100%
- **ปุ่มเริ่มเกมใหม่ (Reset Session)**: สามารถกดปุ่ม **"🔄"** ที่แถบเมนูหรือแถบแจ้งเตือน เพื่อล้างเซสชันและเริ่มนับหนึ่งใหม่ได้ตลอดเวลา

---

## 📂 โครงสร้างการแยกไฟล์ (Project File Structure)

```text
c:\basic\
├── Dockerfile                      # ตั้งค่า PHP 8.2-Apache + curl + SQLite
├── compose.yaml / docker-compose   # รันคอนเทนเนอร์บนพอร์ต 8080:80
├── README.md                       # เอกสารอธิบายโปรเจกต์
│
├── cache/                          # แคชผลลัพธ์จาก iTunes API เพื่อความเร็ว
├── database/                       # จัดการฐานข้อมูลคะแนน
│   └── schema.sql                  # ตารางสถิติผู้เล่น (scores)
│
├── src/                            # Backend OOP Services
│   ├── ItunesService.php           # Anti-Repetition, Multi-Genre Query, Explorer Catalog
│   ├── Database.php                # จัดการเชื่อมต่อ SQLite
│   └── ScoreRepository.php         # บันทึกคะแนนและดึงอันดับ Leaderboard
│
├── public/                         # Web Document Root
│   ├── index.php                   # หน้าเว็บหลัก (Start, Game, Results, Explorer, Modals)
│   │
│   ├── api/                        # RESTful API Backend
│   │   ├── session.php             # Endpoint บันทึก/อ่าน/รีเซ็ต PHP Session
│   │   ├── songs.php               # Endpoint ข้อสอบ (Multi-Genre + Anti-Repetition + Explorer)
│   │   ├── check.php               # Endpoint ตรวจคำตอบ (HMAC-SHA256 Token)
│   │   └── leaderboard.php         # Endpoint บันทึก/อ่าน Leaderboard
│   │
│   └── assets/                     # Frontend Assets
│       ├── css/
│       │   ├── style.css           # สไตล์ชีตระบบ Dark/Music UI, Explorer, Session Banner
│       │   └── animations.css      # แอนิเมชันแผ่นเสียง, คลื่นเสียง, เปลวไฟคอมโบ
│       │
│       ├── js/
│       │   ├── api.js              # โมดูล REST API Client
│       │   ├── audio-player.js     # ควบคุม Audio Stream & Sound FX
│       │   ├── ui.js               # จัดการหน้าจอ, โมดอล และ Confetti
│       │   └── game.js             # ควบคุมลูปเกม, Anti-Repetition, Session Auto-Save
│       │
│       └── audio/sfx/              # ไฟล์เสียงเอฟเฟกต์ (correct.wav, wrong.wav, tick.wav)
```

---

## 🚀 วิธีการรันด้วย Docker

1. **เปิดโปรแกรม Docker Desktop** บนคอมพิวเตอร์ของคุณ
2. **รันคำสั่ง**:
   ```bash
   docker-compose up -d --build
   ```
   *(หรือ `docker compose up -d --build`)*
3. **เปิดเล่นเกมที่**: [http://localhost:8080](http://localhost:8080)
