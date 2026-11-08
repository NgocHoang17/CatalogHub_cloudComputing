# 📑 KHUNG ĐỀ CƯƠNG BÁO CÁO CHUẨN (REFERENCE FRAMEWORK)
> **Tài liệu khung tham khảo hướng dẫn viết báo cáo và chuẩn bị thuyết trình đồ án môn Điện toán đám mây (Cloud Computing).**

---

## 🏛️ TRANG BÌA & LỜI MỞ ĐẦU
* **Tên đề tài gốc (English):**  
  *Building and deploying a NodeJS + MySQL application on Railway.app featuring product addition and search capabilities. Include detailed documentation on the deployment process and MySQL connection setup.*
* **Tên đề tài tiếng Việt:**  
  *Nghiên cứu, Xây dựng và Triển khai Hệ thống Quản lý Danh mục Sản phẩm (CatalogHub) trên Nền tảng Điện toán Đám mây Railway.app và Cloudflare Pages.*
* **Giảng viên hướng dẫn & Sinh viên thực hiện:**  
  * *Học phần:* Điện toán đám mây (Cloud Computing)  
  * *Sinh viên thực hiện:* Nguyễn Như Huy (GitHub: [@nhuhuy05](https://github.com/nhuhuy05))

---

## CHƯƠNG 1: TỔNG QUAN ĐỀ TÀI & CÔNG NGHỆ CLOUD (Lý thuyết nền tảng)

### 1. Đặt vấn đề & Mục tiêu đề tài:
* **Ứng dụng:** Xây dựng web service có 2 chức năng cốt lõi:
  * Thêm mới sản phẩm (validation schema chặt chẽ, ghi vào database).
  * Tìm kiếm sản phẩm thời gian thực (real-time filtering, phân trang, lọc theo danh mục).
* **Cơ sở dữ liệu:** Lưu trữ dữ liệu an toàn trên MySQL 8.
* **Triển khai Cloud:** Triển khai toàn bộ hệ thống lên môi trường Cloud Native với chi phí **0 VNĐ** nhưng đảm bảo độ tin cậy và bảo mật cao.
* **Sản phẩm bàn giao (Deliverable):** Bộ tài liệu hướng dẫn chi tiết từng bước (*step-by-step*) về quy trình deploy lên Railway và cách thiết lập kết nối an toàn với MySQL.

### 2. Phân loại mô hình dịch vụ đám mây áp dụng (NIST Standards):
* **PaaS (Platform as a Service):** Dịch vụ Railway.app quản lý runtime Node.js, tự động build từ Git repository.
* **DBaaS (Database as a Service):** Cơ sở dữ liệu MySQL 8 quản lý trên Railway với volume lưu trữ độc lập.
* **Edge CDN / Jamstack:** Cloudflare Pages phân phối Frontend tĩnh tới hơn 300 trung tâm dữ liệu toàn cầu với băng thông không giới hạn (0đ).

### 3. Công nghệ phát triển (Tech Stack):
* **Backend:** Node.js 20, Express, TypeScript, Knex.js (Query Builder & Migration), Zod (Validation).
* **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons.
* **DevOps:** Docker (Multi-stage build), GitHub Actions (CI), Railway, Cloudflare.

---

## CHƯƠNG 2: THIẾT KẾ KIẾN TRÚC HỆ THỐNG & BẢO MẬT (Điểm nhấn ăn điểm)

### 1. Kiến trúc phân tách Decoupled Multi-Cloud:
* **Lý do thiết kế:** Giải thích tại sao không deploy dạng Monolith gộp chung: Tách Frontend ra Cloudflare Pages giúp giảm tải 100% băng thông tĩnh cho Railway, tránh hao hụt giới hạn tài khoản miễn phí.
* **Sơ đồ kiến trúc luồng dữ liệu ngang:**  
  `Khách hàng` $\rightarrow$ `Cloudflare Pages (catalog.nhuhuy.id.vn)` $\rightarrow$ `Railway Node API` $\rightarrow$ `Railway MySQL (Private Mesh)`.

### 2. Mô hình bảo mật Zero-Trust Private Network:
* Database MySQL **không mở cổng public** (không Public IP, không TCP Proxy).
* Giao tiếp giữa Backend và Database diễn ra qua mạng riêng ảo nội bộ `mysql.railway.internal:3306` (mã hóa WireGuard, độ trễ < 2ms, miễn phí egress).

### 3. Thiết kế Cơ sở dữ liệu & Tự động hóa Migration (Knex.js Lifecycle):
* Thiết kế bảng `products` (id, name, category, price, stock, description, created_at).
* Cơ chế tự động chạy `db.migrate.latest()` và `db.seed.run()` khi server khởi động (tương tự Spring Boot Flyway) $\rightarrow$ Không cần thao tác gõ SQL thủ công trên Production.

---

## CHƯƠNG 3: QUY TRÌNH TRIỂN KHAI THỰC TẾ STEP-BY-STEP (Trọng tâm đề bài)
*(Sử dụng toàn bộ ảnh chụp từ thư mục `docs/images/` làm minh chứng)*

### Phần 1: Thiết lập Cơ sở dữ liệu MySQL trên Railway
* Khởi tạo service từ Docker image `mysql:8`.
* Cấu hình Zero-Trust Networking (giữ Private, từ chối Public Access).
* Cấu hình Deploy: Giữ lệnh tối ưu mặc định, **tắt Serverless** để chống lỗi Cold Start Timeout, cấu hình Restart Policy.
* Trích xuất các biến kết nối nội bộ: `MYSQLHOST`, `MYSQLUSER`, `MYSQLPASSWORD`, `MYSQLDATABASE`, `MYSQL_URL`.

### Phần 2: Triển khai Backend Node.js / TypeScript trên Railway
* Kết nối repo GitHub, chọn đúng nhánh `develop`.
* Xử lý kiến trúc Monorepo: Cấu hình **Root Directory: `/server`**.
* Cấu hình Build: Chọn **Dockerfile** đa tầng (Multi-stage build).
* Cấu hình Deploy & Healthcheck: Cấu hình start command `node dist/server.js`, endpoint thăm dò `/api/health`, bật tính năng *Skipped Builds*.
* Cấp phát tên miền công khai API qua tính năng `Generate Domain`.
* Liên kết biến môi trường từ MySQL sang Backend qua Raw Editor.

### Phần 3: Triển khai Frontend lên Cloudflare Pages & Gắn Custom Domain
* Kết nối repo, chọn nhánh `develop`, Root directory `/client`, Framework preset `Vite`.
* Cấu hình biến môi trường `VITE_API_BASE_URL` trỏ về API Railway.
* Chuyển quyền quản trị DNS từ nhà đăng ký iNET sang Cloudflare Nameserver (`gene.ns.cloudflare.com`, `harlan.ns.cloudflare.com`).
* Gắn Subdomain **`catalog.nhuhuy.id.vn`**, nhận bản ghi CNAME và chứng chỉ Universal SSL tự động.
* Cấu hình file `_redirects` chống lỗi 404 cho Single Page Application (SPA).
* Cập nhật biến `CLIENT_ORIGIN=https://catalog.nhuhuy.id.vn` trên Railway để bảo mật CORS.

---

## CHƯƠNG 4: THỬ NGHIỆM NGHIỆM THU & ĐÁNH GIÁ HIỆU NĂNG

### 1. Kiểm thử 2 chức năng nghiệp vụ cốt lõi:
* **Chức năng Thêm mới sản phẩm:** Form nhập liệu có validation (Zod), gửi POST request, lưu vào MySQL và phản hồi ngay lập tức.
* **Chức năng Tìm kiếm & Lọc sản phẩm:** Thanh tìm kiếm thời gian thực (real-time filtering), phân trang, lọc theo danh mục.

### 2. Kiểm thử độ tin cậy và phục hồi (Fault-Tolerance):
* Endpoint `/api/health` trả về trạng thái Database CONNECTED, latency 2ms.
* Cơ chế tự động Retry 5 lần khi kết nối DB lúc khởi động.

### 3. Đánh giá tối ưu hóa chi phí (Cost Analysis):
* **Chi phí vận hành:** **0 VNĐ / tháng**.
* **Băng thông Cloudflare Pages:** Không giới hạn, miễn phí.
* **Tài nguyên Railway:** Nằm trọn trong gói miễn phí nhờ tách frontend tĩnh.

---

## 🎯 3 ĐIỂM CẦN CHUẨN BỊ KHI THUYẾT TRÌNH / BÁO CÁO

1. **Demo trực tiếp (Live Demo):**
   * Mở website chính thức: [https://catalog.nhuhuy.id.vn](https://catalog.nhuhuy.id.vn)
   * Mở endpoint kiểm tra sức khỏe: [https://catalog-cloud-computing-production.up.railway.app/api/health](https://catalog-cloud-computing-production.up.railway.app/api/health)
   * Thao tác trực tiếp: Tìm kiếm sản phẩm $\rightarrow$ Thêm 1 sản phẩm mới $\rightarrow$ Hiển thị ngay lên màn hình.
2. **Show mã nguồn & Tài liệu bàn giao:**
   * Mở file tài liệu [RAILWAY_MYSQL_SETUP.md](./RAILWAY_MYSQL_SETUP.md) và [CLOUDFLARE_PAGES_DEPLOY.md](./CLOUDFLARE_PAGES_DEPLOY.md) trong repo để chứng minh bạn đã hoàn thành đầy đủ Deliverable theo đúng yêu cầu đề tài.
3. **Nhấn mạnh sự vượt trội so với đề bài:**
   * Đề bài chỉ yêu cầu deploy lên Railway, nhưng nhóm đã chủ động nâng cấp lên mô hình **Decoupled Architecture (Cloudflare + Railway)** kết hợp **Custom Domain riêng**, biến một bài tập môn học thành một sản phẩm Cloud cấp Production!

