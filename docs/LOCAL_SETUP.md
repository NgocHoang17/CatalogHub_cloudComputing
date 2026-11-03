# Cài đặt và chạy local

## 1. Chuẩn bị

Cài Git, Node.js major 24 và MySQL Server 8.0.16 trở lên.
MySQL Workbench là tùy chọn để thao tác SQL bằng giao diện.
MySQL Server phải đang chạy; chỉ mở Workbench không tự bảo đảm server đã chạy.

```powershell
git --version
node -v
npm.cmd -v
mysql --version
```

Nếu dùng Workbench mà không có `mysql` trong PATH, vẫn có thể thực hiện toàn bộ bước tạo DB bằng Workbench.
Windows có thể kiểm tra service trong Services hoặc chạy `Get-Service '*mysql*'`.
Tên service tùy cách cài MySQL, thường là `MySQL80`.

## 2. Lấy mã nguồn và dependencies

```powershell
git clone <URL_REPOSITORY_CUA_NHOM>
cd <THU_MUC_REPOSITORY>
npm.cmd ci
Copy-Item .env.example .env
```

Thay các giá trị trong dấu `<...>` bằng URL và thư mục thực tế.
Không sao chép template nếu bạn đã có `.env`.
Trên macOS/Linux dùng `npm ci` và `cp .env.example .env`.

## 3. Tạo database bằng Workbench

1. Mở connection tới MySQL trên máy bạn, thông thường `127.0.0.1:3306`.
2. Đăng nhập bằng tài khoản quản lý DB của bạn.
3. Chạy câu lệnh tạo database mới dưới đây.
4. Nhấn Refresh trong Schemas.
5. Nhấn chuột phải `cataloghub`, chọn **Set as Default Schema**.
6. Mở file `database/schema.sql` trong repository, chạy toàn bộ file.
7. Mở file `database/seed.sql`, chạy toàn bộ file nếu cần dữ liệu mẫu.

```sql
CREATE DATABASE cataloghub
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Nếu `cataloghub` đã tồn tại, kiểm tra nội dung trước khi import.
Schema dành cho cài đặt mới, không tự nâng cấp cấu trúc bảng có sẵn.
Seed cập nhật các SKU mẫu trùng; không import tùy tiện vào dữ liệu đang sử dụng.

Kiểm tra kết quả trong Workbench:

```sql
USE cataloghub;
SELECT COUNT(*) AS categories FROM categories;
SELECT COUNT(*) AS products FROM products;
```

Database mới có 8 categories và 24 products.

## 4. Tài khoản ứng dụng

Tạo user app bằng tài khoản quản lý DB. Thay mật khẩu minh họa bằng mật khẩu riêng.

```sql
CREATE USER 'cataloghub_app'@'127.0.0.1'
  IDENTIFIED BY 'replace_with_your_app_password';
GRANT SELECT, INSERT ON cataloghub.products TO 'cataloghub_app'@'127.0.0.1';
GRANT SELECT ON cataloghub.categories TO 'cataloghub_app'@'127.0.0.1';
```

Nếu MySQL nhận kết nối dưới host `localhost`, cấu hình tài khoản cho đúng host đó.
User app không cần CREATE, DROP, UPDATE hoặc DELETE.
Schema/seed dùng tài khoản setup có quyền tương ứng.
Bạn có thể dùng tài khoản MySQL local đã có để thử kết nối, nhưng cấu hình chia sẻ không chứa tài khoản thật.

## 5. Điền `.env`

```dotenv
NODE_ENV=development
PORT=3000
HOST=0.0.0.0
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=cataloghub_app
DB_PASSWORD=replace_with_your_app_password
DB_NAME=cataloghub
DB_CONNECTION_LIMIT=10
ENABLE_PRODUCT_WRITE=true
TRUST_PROXY=0
```

DB_HOST, DB_PORT và tài khoản phải khớp MySQL Server trên máy bạn.
DB_NAME là tên schema đã import, không phải tên connection trong Workbench.
Không ghi credential vào source. `.env` được Git ignore.
Environment của process ưu tiên hơn file `.env`.
Nếu có `DOTENV_CONFIG_PATH`, ứng dụng đọc file được chỉ định thay `.env`.

## 6. Chạy và thử chức năng

```powershell
npm.cmd run db:check
npm.cmd run dev
```

Mở <http://localhost:3000>.
`db:check` phải báo kết nối thành công, database đúng và số bản ghi hợp lý.
Thử tìm `Logitech`, lọc category, giá, đổi thứ tự và chuyển trang.
Thêm sản phẩm với SKU mới, mở chi tiết rồi tải lại để kiểm tra dữ liệu được lưu.
Nhấn **Ctrl+C** tại terminal để dừng app.
Sau khi đổi `.env`, dừng và khởi động lại app để áp dụng cấu hình.

Hai endpoint phục vụ kiểm tra:

```powershell
Invoke-RestMethod http://localhost:3000/health
Invoke-RestMethod http://localhost:3000/ready
```

`/health` xác nhận process; `/ready` xác nhận truy vấn MySQL thành công.
Không cần build frontend hoặc chạy seed mỗi lần mở app.
Lần chạy tiếp theo chỉ cần MySQL đang hoạt động và `npm.cmd run dev`.

## 7. Kiểm thử

```powershell
npm.cmd test
```

Integration/browser cần database và tài khoản test riêng.
Thực hiện theo [TEST_PLAN.md](TEST_PLAN.md) trước khi chạy hai suite đó.
Không trỏ TEST_DB_NAME tới DB app hoặc DB dùng chung.

## Lỗi thường gặp

| Lỗi | Kiểm tra và xử lý |
|---|---|
| npm.ps1 bị chặn | Dùng `npm.cmd` trong PowerShell |
| ECONNREFUSED | Bật MySQL Server; kiểm tra DB_HOST và DB_PORT |
| ER_ACCESS_DENIED_ERROR | Kiểm tra user, password và host của tài khoản |
| ER_BAD_DB_ERROR | Tạo schema, kiểm tra DB_NAME |
| ER_NO_SUCH_TABLE | Chọn đúng schema và chạy schema.sql |
| Database có 0 products | Import seed nếu muốn dữ liệu mẫu, hoặc thêm sản phẩm qua form |
| Cổng 3000 đang dùng | Mở app đã chạy hoặc đổi PORT trong `.env`, rồi restart |
| API 403 | Kiểm tra ENABLE_PRODUCT_WRITE |
| API 409 | Đổi SKU, mã đã tồn tại |
| API 422 | Sửa các field được đánh dấu; giá dùng dấu chấm thập phân |
| Đổi env nhưng chưa có tác dụng | Restart app, kiểm tra env của terminal và DOTENV_CONFIG_PATH |

Nếu báo lỗi, gửi mã lỗi, lệnh và phiên bản Node/MySQL cho nhóm. Không gửi mật khẩu hoặc toàn bộ `.env`.
