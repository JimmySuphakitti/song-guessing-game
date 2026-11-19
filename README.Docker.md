# Docker Configuration for Thai Song Quiz

โปรเจกต์นี้ได้รับการตั้งค่าสภาพแวดล้อม Docker สำหรับรัน PHP 8.2 + Apache + SQLite3 ไว้อย่างสมบูรณ์แบบเรียบร้อยแล้ว

## ไฟล์คอนฟิกของ Docker ในโปรเจกต์นี้

1. **`Dockerfile`**:
   - Base Image: `php:8.2-apache`
   - Extension: `pdo_sqlite`, `sqlite3`
   - DocumentRoot: `/var/www/html/public`
   - Apache Module: เปิดใช้งาน `mod_rewrite` และรองรับ `.htaccess`
   - Upload Limit: เพิ่มขนาดอัปโหลดสูงสุด 50MB เพื่อรองรับไฟล์เสียงเพลง
   - Entrypoint: ตรวจสอบและตั้งสิทธิ์ไดเรกทอรี `database/` และ `public/assets/audio/songs/` อัตโนมัติ

2. **`compose.yaml` / `docker-compose.yml`**:
   - Service: `web`
   - Container Name: `thai_song_guess_app`
   - Port Mapping: `8080:80` (เปิดเข้าเล่นผ่าน http://localhost:8080)
   - Volume: ซิงก์โฟลเดอร์ปัจจุบันเข้าไปยัง `/var/www/html`

3. **`.dockerignore`**:
   - กรองไฟล์ที่ไม่จำเป็นต่อการ build ออก

---

## วิธีการเริ่มรันระบบ (Run the Application)

ก่อนรันคำสั่ง ตรวจสอบว่าโปรแกรม **Docker Desktop** เปิดทำงานอยู่ จากนั้นรัน:

```bash
docker-compose up -d --build
```
*(หรือ `docker compose up -d --build`)*

เมื่อคอนเทนเนอร์ทำงานแล้ว เข้าใช้งานได้ที่:
- **หน้าเล่นเกม**: [http://localhost:8080](http://localhost:8080)
- **หน้าระบบคลังเพลง**: [http://localhost:8080/admin.php](http://localhost:8080/admin.php)

---

## คำสั่งควบคุมอื่นๆ

- **หยุดการทำงาน**:
  ```bash
  docker-compose down
  ```
- **ดู Log การทำงาน**:
  ```bash
  docker-compose logs -f
  ```
- **เข้าสู่ Shell ของ Container**:
  ```bash
  docker exec -it thai_song_guess_app bash
  ```
