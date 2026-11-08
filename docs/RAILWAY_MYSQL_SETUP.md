# 🚂 Hướng Dẫn Chi Tiết Triển Khai Backend & MySQL Database Trên Railway.app

> **Tài liệu hướng dẫn kỹ thuật toàn diện** tổng hợp từ toàn bộ quá trình trao đổi, giải quyết sự cố thực tế và các hình ảnh chụp trực tiếp từ giao diện quản trị [Railway.app](https://railway.app).
> Phục vụ cho môn học **Điện toán đám mây (Cloud Computing)** - Đề tài: **Hệ thống Quản lý Danh mục Sản phẩm CatalogHub**.

---

## 📑 Mục lục
1. [Kiến trúc đám mây & Mô hình phân tách Decoupled](#1-kiến-trúc-đám-mây--mô-hình-phân-tách-decoupled)
2. [Cấu hình Dịch vụ Cơ sở Dữ liệu MySQL 8](#2-cấu-hình-dịch-vụ-cơ-sở-dữ-liệu-mysql-8)
   * [2.1. Khởi tạo Service MySQL từ Template Image](#21-khởi-tạo-service-mysql-từ-template-image)
   * [2.2. Bảo mật mạng Zero-Trust: Private Networking vs Public Access](#22-bảo-mật-mạng-zero-trust-private-networking-vs-public-access)
   * [2.3. Cấu hình vùng triển khai & Giới hạn tài nguyên (Scale)](#23-cấu-hình-vùng-triển-khai--giới-hạn-tài-nguyên-scale)
   * [2.4. Cấu hình Deploy của MySQL: Custom Command, Serverless & Healthcheck](#24-cấu-hình-deploy-của-mysql-custom-command-serverless--healthcheck)
   * [2.5. Biến môi trường tự sinh của MySQL (Service Variables)](#25-biến-môi-trường-tự-sinh-của-mysql-service-variables)
   * [2.6. Giải đáp: Có cần chạy script SQL tạo bảng thủ công trước khi deploy không?](#26-giải-đáp-có-cần-chạy-script-sql-tạo-bảng-thủ-công-trước-khi-deploy-không)
3. [Cấu hình Dịch vụ Backend (Node.js + Express + TypeScript)](#3-cấu-hình-dịch-vụ-backend-nodejs--express--typescript)
   * [3.1. Cấu hình Source: Khắc phục sự cố Monorepo & Phân nhánh Gitflow](#31-cấu-hình-source-khắc-phục-sự-cố-monorepo--phân-nhánh-gitflow)
   * [3.2. Cấu hình Vùng máy chủ (Scale)](#32-cấu-hình-vùng-máy-chủ-scale)
   * [3.3. Cấu hình Build: Dockerfile Builder & BuildKit Context](#33-cấu-hình-build-dockerfile-builder--buildkit-context)
   * [3.4. Cấu hình Deploy: Start Command, Teardown, Cron & Healthcheck](#34-cấu-hình-deploy-start-command-teardown-cron--healthcheck)
   * [3.5. Cấu hình Config-as-code & Feature Flags (Skipped Builds)](#35-cấu-hình-config-as-code--feature-flags-skipped-builds)
   * [3.6. Cấu hình Networking: Public Domain & CDN Caching](#36-cấu-hình-networking-public-domain--cdn-caching)
4. [Liên kết Biến Môi trường (Environment Variables & Networking)](#4-liên-kết-biến-môi-trường-environment-variables--networking)
   * [4.1. Thiết lập biến môi trường qua Raw Editor](#41-thiết-lập-biến-môi-trường-qua-raw-editor)
   * [4.2. Tùy chọn quản lý biến cấp Project (Shared Variables)](#42-tùy-chọn-quản-lý-biến-cấp-project-shared-variables)
5. [Cơ chế Vòng đời Tự động hóa Cơ sở dữ liệu (Knex.js Lifecycle)](#5-cơ-chế-vòng-đời-tự-động-hóa-cơ-sở-dữ-liệu-knexjs-lifecycle)
6. [Nhật ký Build & Kiểm thử Nghiệm thu API (Verification)](#6-nhật-ký-build--kiểm-thử-nghiệm-thu-api-verification)
7. [Cẩm nang Khắc phục Sự cố Thực tế (Real-World Case Studies & Troubleshooting)](#7-cẩm-nang-khắc-phục-sự-cố-thực-tế-real-world-case-studies--troubleshooting)
   * [Case 1: Lỗi Railpack không nhận diện được dự án Monorepo](#case-1-lỗi-railpack-không-nhận-diện-được-dự-án-monorepo)
   * [Case 2: Lỗi thiếu biến môi trường do trỏ nhầm nhánh `main`](#case-2-lỗi-thiếu-biến-môi-trường-do-trỏ-nhầm-nhánh-main)
   * [Case 3: Xử lý Cold Start Timeout khi kết nối Database](#case-3-xử-lý-cold-start-timeout-khi-kết-nối-database)
   * [Case 4: Xử lý chặn Cross-Origin (CORS) từ Cloudflare Pages](#case-4-xử-lý-chặn-cross-origin-cors-từ-cloudflare-pages)

---

## 1. Kiến trúc đám mây & Mô hình phân tách Decoupled

Hệ thống được thiết kế theo mô hình kiến trúc phân tách hiện đại (**Decoupled Cloud Architecture**), tách biệt hoàn toàn giữa giao diện người dùng tĩnh và máy chủ xử lý nghiệp vụ:

```mermaid
flowchart TD
    subgraph Internet_Public ["🌐 Internet Công Cộng"]
        ClientUser["👤 Trình duyệt Khách hàng"]
        CF_CDN["⚡ Cloudflare Pages (Frontend SPA)\nReact 18 + Vite + TypeScript\nBăng thông Edge không giới hạn - 0đ"]
    end

    subgraph Railway_Project ["🚂 Railway.app Cloud Project"]
        subgraph Public_Gateway ["Cổng Truy Cập Công Khai"]
            RW_Backend["🚀 Backend Web Service (Container)\nNode.js 20 + Express + Knex.js\nPort: 5000\nDomain: catalog-cloud-computing-production.up.railway.app"]
        end

        subgraph Private_Network ["🛡️ Mạng Nội Bộ (Zero-Trust Private Mesh)"]
            RW_MySQL[("🗄️ MySQL 8 Database Container\nInternal Host: mysql.railway.internal\nPort: 3306\n(Không mở cổng ra Internet)")]
            RW_Volume[("💾 Persistent Storage Volume\n(Lưu trữ dữ liệu vĩnh viễn)")]
            RW_MySQL --- RW_Volume
        end
    end

    ClientUser -->|"HTTPS Request (HTML/JS/CSS)"| CF_CDN
    ClientUser -->|"REST API Call (/api/products)"| RW_Backend
    CF_CDN -.->|"CORS Allowed Origins"| RW_Backend
    RW_Backend -->|"TCP Socket (Băng thông nội bộ miễn phí)"| RW_MySQL
```

---

## 2. Cấu hình Dịch vụ Cơ sở Dữ liệu MySQL 8

### 2.1. Khởi tạo Service MySQL từ Template Image
1. Trong màn hình Dashboard của Railway, bấm **`+ New Project`** $\rightarrow$ chọn **`Empty Project`**.
2. Trên canvas trống, bấm **`+ Create`** (hoặc `Ctrl + K`) $\rightarrow$ chọn **`Database`** $\rightarrow$ chọn **`Add MySQL`**.
3. Railway sẽ tự động kéo Docker image chính thức `mysql:8` và khởi tạo container.
4. Kiểm tra trong **Settings** $\rightarrow$ mục **Source**: Image nguồn là `mysql:8`.

![MySQL Source Image](./images/Screenshot%202026-11-08%20030251.png)

---

### 2.2. Bảo mật mạng Zero-Trust: Private Networking vs Public Access

Trong thẻ **Settings** $\rightarrow$ mục **Networking** của MySQL, bạn sẽ thấy 2 phần:

![MySQL Public Access Warning](./images/Screenshot%202026-11-08%20030353.png)

#### 🔴 Public access:
* **Khuyến nghị:** **TUYỆT ĐỐI KHÔNG BẤM `Add Public Access`!**
* **Lý do kỹ thuật:**
  1. *Nguy cơ an ninh:* Bật Public Access sẽ gán cho MySQL một IP/cổng công khai ngoài Internet. Kẻ xấu có thể dò quét cổng (port scan) và tấn công brute-force mật khẩu.
  2. *Chi phí băng thông:* Railway cảnh báo rõ ràng *"Public traffic is billed as egress"* (mọi dung lượng truyền qua Internet công khai sẽ bị tính cước dữ liệu đi ra ngoài).

#### 🟢 Private Networking:
* **Trạng thái:** Dấu tích xanh xác nhận: `mysql.railway.internal` IPv4 & IPv6.

![MySQL Private Networking](./images/Screenshot%202026-11-08%20030401.png)

* **Lợi ích:** 
  * Đây là mạng lưới riêng ảo (Private Virtual Mesh) giữa các service trong cùng project.
  * Backend kết nối đến MySQL qua địa chỉ nội bộ `mysql.railway.internal:3306`.
  * Đường truyền nội bộ được mã hóa, bảo mật 100% và **hoàn toàn miễn phí cước băng thông** (Zero Egress Cost).
* **Outbound IPv6:** **TẮT (OFF)** vì database không cần gọi ra các server bên ngoài qua IPv6.

---

### 2.3. Cấu hình vùng triển khai & Giới hạn tài nguyên (Scale)
Trong mục **Scale** của MySQL:
* **Regions & Replicas:** Chọn **Southeast Asia (Singapore, Singapore)** để đạt độ trễ thấp nhất (ping ~25-35ms) tới Việt Nam. Số lượng bản sao: `1 Replica`.
* **Replica Limits:** Giữ mặc định gói Free/Starter: `CPU: 2 vCPU`, `Memory: 1 GB`.

![MySQL Scale Singapore](./images/Screenshot%202026-11-08%20030527.png)

---

### 2.4. Cấu hình Deploy của MySQL: Custom Command, Serverless & Healthcheck
Chuyển sang mục **Deploy** trong Settings của MySQL:

![MySQL Deploy Command](./images/Screenshot%202026-11-08%20030551.png)
![MySQL Deploy Overview](./images/Screenshot%202026-11-08%20114339.png)

| Thông số | Giá trị cấu hình | Giải thích chi tiết từ buổi thảo luận |
| :--- | :--- | :--- |
| **Custom Start Command** | `docker-entrypoint.sh mysqld --innodb-use-native-aio=0 --disable-log-bin` | **Giữ nguyên 100% mặc định của Railway**:<br>• `--innodb-use-native-aio=0`: Tắt Linux asynchronous I/O native để tránh xung đột kernel trên môi trường ảo hóa container.<br>• `--disable-log-bin`: Tắt ghi binary log để tránh phình dung lượng disk theo thời gian. |
| **Teardown** | **TẮT (OFF)** | Database cần duy trì liên tục, không bật teardown tắt ngang. |
| **Cron Schedule** | **ĐỂ TRỐNG** | Database là dịch vụ thường trực 24/7, không chạy theo lịch định kỳ. |
| **Healthcheck Path** | **ĐỂ TRỐNG** | Healthcheck Path dùng cho HTTP endpoint (ví dụ `/api/health`). MySQL là cơ sở dữ liệu lắng nghe TCP socket (port 3306), Railway tự giám sát cổng TCP này nên **bỏ trống ô này**. |
| **Serverless** | ⚠️ **TUYỆT ĐỐI TẮT (OFF)** | **Cực kỳ quan trọng**: Nếu bật Serverless, container MySQL sẽ bị hạ về 0 (ngủ đông) khi không có request. Khi Backend gọi tới, MySQL mất từ 5-30 giây để "thức dậy" (*cold start*), khiến Backend bị timeout hoặc sập kết nối ngay lập tức! |
| **Restart Policy** | `On Failure` (10 retries) | Tự động khởi động lại container tối đa 10 lần nếu gặp sự cố crash ngoài ý muốn. |
| **Skipped Builds** | **BẬT (ON 🟢)** | Tận dụng bản image đã build sẵn để triển khai nhanh nhất. |

![MySQL Healthcheck and Serverless](./images/Screenshot%202026-11-08%20030610.png)
![MySQL Serverless and Retries Detail](./images/Screenshot%202026-11-08%20114414.png)
![MySQL Skipped Builds](./images/Screenshot%202026-11-08%20114425.png)

---

### 2.5. Biến môi trường tự sinh của MySQL (Service Variables)
Khi chuyển sang tab **Variables** của service MySQL, Railway đã tự động sinh sẵn toàn bộ thông số:

![MySQL Generated Variables](./images/Screenshot%202026-11-08%20023313.png)

* `MYSQLHOST`: `mysql.railway.internal`
* `MYSQLPORT`: `3306`
* `MYSQLUSER`: `root`
* `MYSQLPASSWORD`: *(Mật khẩu an toàn ngẫu nhiên do hệ thống tạo)*
* `MYSQLDATABASE`: `railway`
* `MYSQL_URL`: Chuỗi URI kết nối hoàn chỉnh: `mysql://root:***@mysql.railway.internal:3306/railway`

---

### 2.6. Giải đáp: Có cần chạy script SQL tạo bảng thủ công trước khi deploy không?

> **Hỏi:** *Trước khi cấu hình deploy repo có cần tạo bảng hay import file `.sql` vào MySQL không?*
>
> **Đáp:** **HOÀN TOÀN KHÔNG CẦN!**
> 
> Hệ thống Backend của CatalogHub đã được tích hợp cơ chế tự động hóa cơ sở dữ liệu với **Knex.js** (tương tự như công cụ Spring Flyway). Khi Backend boot lên, đoạn mã trong [server.ts](file:///d:/My%20Folder/Cloud%20Computing/CatalogHub_cloudComputing/server/src/server.ts) sẽ:
> 1. Tự động kiểm tra và chạy `await db.migrate.latest()` để tạo bảng `products` và bảng lịch sử `knex_migrations`.
> 2. Tự động chạy `await db.seed.run()` để kiểm tra và nạp sẵn 6 sản phẩm khởi tạo nếu bảng trống.
> 
> Do đó, cơ sở dữ liệu MySQL trên đám mây sẽ **tự động hoàn chỉnh cấu trúc và dữ liệu** ngay trong lần deploy đầu tiên của Backend.

---

## 3. Cấu hình Dịch vụ Backend (Node.js + Express + TypeScript)

### 3.1. Cấu hình Source: Khắc phục sự cố Monorepo & Phân nhánh Gitflow

1. Trên Railway Canvas, bấm **`+ Create`** $\rightarrow$ chọn **`GitHub Repo`** $\rightarrow$ chọn repository `catalog-cloud-computing`.
2. Bấm vào service Backend vừa tạo $\rightarrow$ chọn tab **Settings** $\rightarrow$ mục **Source**:

![Backend Source and Root Directory](./images/Screenshot%202026-11-08%20121157.png)

#### Hai điểm cốt tử cần cấu hình:
1. **Root Directory:** Điền **/server** (bấm dấu `✓` để lưu).
   * *Vì sao:* Đây là cấu trúc **Monorepo** gồm 2 thư mục `client/` và `server/`. Nếu không điền `/server`, Railway sẽ quét tại thư mục gốc `./` và gây ra lỗi `Railpack could not determine how to build the app`.
2. **Branch connected to production:** Chọn nhánh **`develop`** (thay vì nhánh `main`).
   * *Vì sao:* Nhánh `main` cũ chứa mã nguồn monolith EJS yêu cầu các biến `DB_HOST`, `DB_USER` cũ. Nhánh `develop` mới chứa toàn bộ mã nguồn TypeScript, Knex migrations và Dockerfile đa tầng.

![Backend Root Directory /server](./images/Screenshot%202026-11-08%20023545.png)
![Backend Branch Selection](./images/Screenshot%202026-11-08%20023636.png)

---

### 3.2. Cấu hình Vùng máy chủ (Scale)
Trong mục **Scale** của Backend:
* **Region:** Chọn đồng bộ cùng vùng với MySQL: **Southeast Asia (Singapore)** để giảm độ trễ truy vấn database về mức tối thiểu (dưới 2ms).
* **Replica Limits:** Giữ mặc định: `CPU: 2 vCPU`, `Memory: 1 GB`.

![Backend Scale Singapore](./images/Screenshot%202026-11-08%20024455.png)

---

### 3.3. Cấu hình Build: Dockerfile Builder & BuildKit Context
Cuộn xuống mục **Build**:
* **Builder:** Chọn dropdown **`Dockerfile`**.
* **Dockerfile Path:** Điền **`Dockerfile`** (hoặc `/server/Dockerfile`).
* **Watch Paths:** Điền `/src/**` hoặc để trống (Railway sẽ tự lắng nghe commit mới đẩy lên nhánh `develop` để trigger build).

![Backend Build Dockerfile](./images/Screenshot%202026-11-08%20024722.png)
![Backend Build Dockerfile Path](./images/Screenshot%202026-11-08%20024530.png)

---

### 3.4. Cấu hình Deploy: Start Command, Teardown, Cron & Healthcheck
Cuộn xuống mục **Deploy**:

![Backend Custom Start Command](./images/Screenshot%202026-11-08%20025212.png)
![Backend Healthcheck Path](./images/Screenshot%202026-11-08%20025229.png)

| Mục cấu hình | Giá trị | Giải thích chi tiết từ buổi thảo luận |
| :--- | :--- | :--- |
| **Custom Start Command** | `node dist/server.js` | Khởi chạy ứng dụng TypeScript sau khi đã biên dịch ra thư mục `dist/`. |
| **Teardown** | **TẮT (OFF)** | Khi tắt Teardown, Railway sẽ thực hiện cơ chế **Zero-Downtime Deployment**: Container cũ vẫn tiếp tục phục vụ người dùng cho đến khi container mới khởi động thành công và vượt qua kiểm tra Healthcheck mới tắt bản cũ. |
| **Cron Schedule** | **ĐỂ TRỐNG** | Backend là Web API thường trực, không phải tác vụ định kỳ. |
| **Healthcheck Path** | **`/api/health`** | **Cực kỳ quan trọng**: Railway sẽ liên tục gửi request thăm dò endpoint này. Chỉ khi API trả về mã HTTP `200 OK`, Railway mới chính thức chuyển hướng lưu lượng người dùng sang container mới. |
| **Serverless** | **TẮT (OFF)** | Đảm bảo Backend luôn sẵn sàng phản hồi tức thì, không bị trễ do cold start. |
| **Restart Policy** | `On Failure` (5 retries) | Tự động phục hồi dịch vụ nếu tiến trình Node gặp lỗi unhandled rejection. |

---

### 3.5. Cấu hình Config-as-code & Feature Flags (Skipped Builds)
Cuộn xuống cuối tab **Settings**:

![Backend Config As Code and Feature Flags](./images/Screenshot%202026-11-08%20025517.png)

* **Config-as-code (`Railway Config File`):** **BỎ QUA (Không bấm `+ Add File Path`)**.
  * *Lý do:* Railway đã có thông báo chính thức *"Config as Code is deprecated"* (tính năng đọc cấu hình từ file `railway.json` bị khai tử). Toàn bộ cấu hình đã được chúng ta thiết lập trực tiếp và trực quan trên giao diện UI.
* **Feature-flags (`Skipped Builds`):** **BẬT (Gạt công tắc sang ON 🟢)**.
  * *Lý do:* Khi đẩy commit mới lên GitHub mà không làm thay đổi mã nguồn trong `/server`, Railway sẽ tự động bỏ qua bước build lại Docker image, giúp tiết kiệm thời gian triển khai và hạn ngạch tài nguyên.

![Backend Skipped Builds ON](./images/Screenshot%202026-11-08%20025659.png)

---

### 3.6. Cấu hình Networking: Public Domain & CDN Caching
Để máy khách và Frontend từ Cloudflare Pages có thể giao tiếp với Backend:

1. Trong tab **Settings** của Backend $\rightarrow$ mục **Networking**:
2. Bấm vào nút **`Generate Domain`**.

![Backend Networking Generate Domain](./images/Screenshot%202026-11-08%20023721.png)

3. Railway sẽ cấp phát một tên miền công khai chuẩn HTTPS (miễn phí trọn đời):
   `https://catalog-cloud-computing-production.up.railway.app`

![Backend Public Domain Ready](./images/Screenshot%202026-11-08%20024156.png)

4. **Edge (CDN Caching):** Giữ **TẮT (OFF)**.
   * *Lý do:* Backend trả về dữ liệu REST API có tính biến động (thêm mới sản phẩm, cập nhật giá). Không nên cache tầng Edge để đảm bảo dữ liệu hiển thị trên giao diện người dùng luôn là thời gian thực.

![Backend Edge CDN](./images/Screenshot%202026-11-08%20024234.png)

---

## 4. Liên kết Biến Môi trường (Environment Variables & Networking)

### 4.1. Thiết lập biến môi trường qua Raw Editor
Chuyển sang tab **Variables** của service Backend:
1. Bấm nút **`Raw Editor`**.
2. Dán đầy đủ danh sách cấu hình sau (thay thế mật khẩu bằng mật khẩu lấy từ service MySQL):

```env
NODE_ENV=production
PORT=5000
CLIENT_ORIGIN=*
MYSQLHOST=mysql.railway.internal
MYSQLPORT=3306
MYSQLUSER=root
MYSQLPASSWORD=iZkqyHoGtQkXLNKuvBfMemXFaujWrwPy
MYSQLDATABASE=railway
MYSQL_URL=mysql://root:iZkqyHoGtQkXLNKuvBfMemXFaujWrwPy@mysql.railway.internal:3306/railway
```

![Raw Editor Backend Variables](./images/Screenshot%202026-11-08%20114612.png)

3. Bấm **`Update Variables`**. Railway sẽ lưu lại 6 biến kết nối cơ sở dữ liệu và các biến hệ thống:

![Backend Variables List](./images/Screenshot%202026-11-08%20114618.png)

*(Mẹo: Bạn cũng có thể dùng tính năng Reference Variables của Railway bằng cách gõ `${{MySQL.MYSQL_URL}}`, Railway sẽ tự động tham chiếu động giá trị từ service MySQL sang).*

---

### 4.2. Tùy chọn quản lý biến cấp Project (Shared Variables)
Ngoài việc cấu hình riêng lẻ trong service Backend, bạn có thể thiết lập các biến này trong **Project Settings** $\rightarrow$ mục **Shared Variables** để dùng chung cho mọi môi trường:

![Project Shared Variables Raw Editor](./images/Screenshot%202026-11-08%20115411.png)
![Project Shared Variables List](./images/Screenshot%202026-11-08%20115507.png)

---

## 5. Cơ chế Vòng đời Tự động hóa Cơ sở dữ liệu (Knex.js Lifecycle)

Tệp khởi động [server.ts](file:///d:/My%20Folder/Cloud%20Computing/CatalogHub_cloudComputing/server/src/server.ts) được thiết kế theo chuẩn Enterprise Cloud-Native:

```mermaid
sequenceDiagram
    autonumber
    participant RW as 🚂 Railway Runner
    participant App as 🚀 Express Server (Node.js)
    participant Knex as 🛠️ Knex.js Engine
    participant DB as 🗄️ MySQL (mysql.railway.internal)

    RW->>App: Khởi chạy lệnh `node dist/server.js`
    activate App
    App->>Knex: Gọi assertDatabaseConnection() (Thử tối đa 5 lần)
    Knex->>DB: Gửi query: SELECT 1 + 1 AS check_status
    DB-->>Knex: Phản hồi kết nối thành công (2)
    Knex-->>App: ✅ Đã sẵn sàng kết nối DB

    App->>Knex: Gọi db.migrate.latest()
    Knex->>DB: Kiểm tra bảng `knex_migrations` & tạo bảng `products`
    DB-->>Knex: ✅ Migrations up to date

    App->>Knex: Gọi db.seed.run()
    Knex->>DB: Kiểm tra số lượng bản ghi (Nếu = 0 thì nạp 6 sản phẩm)
    DB-->>Knex: ✅ 6 Seed products inserted

    App->>RW: Mở cổng lắng nghe 0.0.0.0:5000
    RW->>App: Gửi HTTP GET /api/health (Railway Healthcheck)
    App-->>RW: Phản hồi 200 OK (Status: UP, DB: CONNECTED)
    RW->>RW: Chuyển Deployment sang trạng thái ACTIVE 🟢
    deactivate App
```

---

## 6. Nhật ký Build & Kiểm thử Nghiệm thu API (Verification)

### 6.1. Giám sát Build Logs
Vào tab **Deployments** $\rightarrow$ bấm vào bản deploy đang chạy $\rightarrow$ chọn **Build Logs**:

![Railway Deployment Build Logs](./images/Screenshot%202026-11-08%20114834.png)

Hệ thống sẽ thực hiện quá trình BuildKit:
1. `npm ci` cài đặt đầy đủ dependencies.
2. `npm run build` biên dịch mã nguồn TypeScript (`tsc`) sang JavaScript tối ưu trong thư mục `dist/`.
3. Khởi tạo runner bảo mật chạy bằng unprivileged user (`node`).

---

### 6.2. Kiểm tra Nghiệm thu Endpoint Healthcheck
Mở trình duyệt hoặc dùng Postman/cURL truy cập:
```bash
curl -X GET https://catalog-cloud-computing-production.up.railway.app/api/health
```

**Kết quả phản hồi HTTP 200 OK:**
```json
{
  "status": "UP",
  "uptimeSeconds": 128,
  "database": {
    "status": "CONNECTED",
    "latencyMs": 2,
    "totalProducts": 6
  },
  "cloudPlatform": "Railway.app"
}
```

---

### 6.3. Kiểm tra Nghiệm thu Danh sách Sản phẩm
```bash
curl -X GET https://catalog-cloud-computing-production.up.railway.app/api/products
```

**Kết quả phản hồi HTTP 200 OK:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Dell XPS 15",
      "category": "Laptops",
      "price": "35000000.00",
      "stock": 10,
      "description": "Laptop cao cấp cho lập trình viên và thiết kế đồ họa",
      "created_at": "2026-11-08T02:00:00.000Z"
    },
    ... (toàn bộ 6 sản phẩm mẫu)
  ]
}
```

---

## 7. Cẩm nang Khắc phục Sự cố Thực tế (Real-World Case Studies & Troubleshooting)

Dưới đây là các sự cố kỹ thuật thực tế phát sinh trong quá trình trao đổi và cách giải quyết chuẩn xác:

---

### Case 1: Lỗi Railpack không nhận diện được dự án Monorepo

#### ❌ Thông báo lỗi thực tế:
```text
⚠ Script start.sh not found
  → Add a `.dockerignore` file to exclude files from the build
  ✖ Railpack could not determine how to build the app.
  The app contents that Railpack analyzed contains:
  ./
  ├── .github/
  ├── client/
  ├── docs/
  ├── server/
  ├── .gitignore
  ├── AGENTS.md
  ├── README.md
  └── docker-compose.yml
railpack process exited with an error
```

#### 🔍 Nguyên nhân cốt lõi:
Dự án được cấu trúc theo dạng **Monorepo** (chia thành `client/` và `server/`). Khi kết nối repo với Railway, mặc định **Root Directory** là thư mục gốc `./`. Tại thư mục gốc không có file `package.json` hay `Dockerfile`, khiến công cụ Railpack tự động của Railway không tìm thấy công nghệ nào để build.

#### ✅ Cách khắc phục:
1. Vào service **Backend** $\rightarrow$ chọn tab **Settings**.
2. Tại mục **General** $\rightarrow$ ô **Root Directory**: Điền **/server** rồi bấm dấu `✓` để lưu.
3. Tại mục **Build** $\rightarrow$ ô **Builder**: Chọn **`Dockerfile`**.
4. Bấm **Redeploy**. Railway sẽ chuyển trực tiếp vào thư mục `/server` để tìm `server/Dockerfile` và `server/package.json`.

---

### Case 2: Lỗi thiếu biến môi trường do trỏ nhầm nhánh `main`

#### ❌ Thông báo lỗi thực tế:
```text
Missing required environment variables: DB_HOST, DB_USER, DB_PASSWORD, DB_NAME
npm warn config production Use `--omit=dev` instead.
```

#### 🔍 Nguyên nhân cốt lõi:
Khi kết nối GitHub repo, Railway mặc định chọn nhánh **`main`**. Nhánh `main` cũ chứa mã nguồn monolith EJS trước đây, trong đó file `src/config/env.js` có đoạn code kiểm tra bắt buộc 4 biến `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`. Trong khi đó, toàn bộ kiến trúc mới (TypeScript, Knex, Dockerfile đa tầng) đang nằm ở nhánh **`develop`**.

#### ✅ Cách khắc phục:
1. Vào service **Backend** $\rightarrow$ chọn tab **Settings**.
2. Tại mục **Source** $\rightarrow$ ô **Branch connected to production**: Bấm vào dropdown và chọn nhánh **`develop`**.
3. Railway sẽ tự động kích hoạt tiến trình build mới từ nhánh `develop`.

---

### Case 3: Xử lý Cold Start Timeout khi kết nối Database

#### 🔍 Nguy cơ:
Trên nền tảng Cloud container, thời gian khởi động của container Backend có thể nhanh hơn thời gian MySQL nạp xong dữ liệu và mở port 3306. Nếu Backend chỉ thử kết nối 1 lần duy nhất, container sẽ lập tức crash với lỗi `ECONNREFUSED`.

#### ✅ Giải pháp đã tích hợp trong mã nguồn:
Trong tệp [database.ts](file:///d:/My%20Folder/Cloud%20Computing/CatalogHub_cloudComputing/server/src/config/database.ts), hệ thống triển khai thuật toán **Exponential Backoff Retry**:
```typescript
export async function assertDatabaseConnection(maxRetries = 5, delayMs = 3000): Promise<void> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await db.raw('SELECT 1 + 1 AS check_status');
      console.log('✅ [Database] Knex connection established successfully.');
      return;
    } catch (err: any) {
      console.warn(`⚠️ [Database] Connection attempt ${attempt}/${maxRetries} failed: ${err.message}`);
      if (attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, delayMs));
      } else {
        throw new Error(`Failed to connect to MySQL after ${maxRetries} attempts: ${err.message}`);
      }
    }
  }
}
```
*Đồng thời luôn giữ tùy chọn **Serverless: OFF** ở service MySQL.*

---

### Case 4: Xử lý chặn Cross-Origin (CORS) từ Cloudflare Pages

#### 🔍 Nguy cơ:
Khi Frontend được deploy lên Cloudflare Pages (`https://cataloghub-client.pages.dev`), các request gọi REST API sang Railway sẽ bị trình duyệt chặn nếu Backend chưa cấu hình CORS cho phép origin này.

#### ✅ Giải pháp:
1. Trong tab **Variables** của Backend trên Railway, đặt:
   ```env
   CLIENT_ORIGIN=https://cataloghub-client.pages.dev
   ```
2. Mã nguồn Express trong [app.ts](file:///d:/My%20Folder/Cloud%20Computing/CatalogHub_cloudComputing/server/src/app.ts) đã được cấu hình tự động chấp nhận cả nguồn phát triển cục bộ và mọi domain kết thúc bằng `.pages.dev`:
   ```typescript
   app.use(cors({
     origin: (origin, callback) => {
       if (!origin || origin.endsWith('.pages.dev') || origin === env.CLIENT_ORIGIN || origin.includes('localhost')) {
         return callback(null, true);
       }
       callback(new Error('Blocked by CORS policy'));
     },
     credentials: true
   }));
   ```
