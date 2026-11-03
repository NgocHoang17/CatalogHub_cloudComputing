# Database CatalogHub

## Cấu trúc

`schema.sql` tạo bảng `categories` và `products` trong database đã chọn.
File không chứa CREATE DATABASE hoặc USE cố định, dùng được cho local và Railway.
Yêu cầu MySQL 8.0.16 trở lên, InnoDB và utf8mb4_unicode_ci.

| Bảng | Nội dung và ràng buộc |
|---|---|
| categories | id, slug unique, name unique, created_at |
| products | id, sku unique, category_id FK, name, description, price, image_url, timestamps |

Price là DECIMAL(12,2), không âm. SKU khớp `[A-Z0-9-]{3,32}`.
Khóa ngoại từ products tới categories sử dụng ON DELETE RESTRICT.
Index hỗ trợ category, name và price; SKU có unique index.
Tìm kiếm `%keyword%` không được đảm bảo dùng B-tree index.

## Import

Tạo database `cataloghub` trước theo [LOCAL_SETUP.md](../docs/LOCAL_SETUP.md).
Workbench: chọn **Set as Default Schema**, mở và chạy `schema.sql`, sau đó `seed.sql`.

MySQL CLI trên Windows:

```powershell
mysql -h 127.0.0.1 -P 3306 -u setup_user -p cataloghub
```

Trong CLI, thay đường dẫn bên dưới bằng thư mục repository của bạn:

```sql
SOURCE C:/path/to/cataloghub/database/schema.sql;
SOURCE C:/path/to/cataloghub/database/seed.sql;
```

macOS/Linux:

```bash
mysql -h 127.0.0.1 -P 3306 -u setup_user -p cataloghub < database/schema.sql
mysql -h 127.0.0.1 -P 3306 -u setup_user -p cataloghub < database/seed.sql
```

Node import sử dụng DB_* của file env được chọn. User phải có quyền setup:

```powershell
$env:DOTENV_CONFIG_PATH='.env.setup'
npm.cmd run db:import -- schema
npm.cmd run db:import -- seed
Remove-Item Env:DOTENV_CONFIG_PATH
```

Tạo `.env.setup` theo `.env.example`, điền credentials setup của bạn.
File này được Git ignore. Không dùng user app giới hạn quyền để chạy DDL/seed.
Không tự chạy import khi app startup hoặc build.

## Dữ liệu mẫu

Seed tạo 8 categories và 24 sản phẩm công nghệ minh họa, giá VND.
Các SKU mẫu được upsert; chạy lại không nhân bản nhưng cập nhật trường dữ liệu của SKU trùng.
Chỉ chạy seed có chủ đích trên DB được chọn. Không chứa dữ liệu kinh doanh hoặc giá bán cập nhật.
Image URL mặc định null; UI chọn SVG local theo category.

```sql
SELECT COUNT(*) FROM categories;
SELECT COUNT(*) FROM products;
```

Kết quả trên database mới là 8 và 24.
User app cần SELECT/INSERT trên products và SELECT trên categories.
User setup và user test có quyền riêng trên database tương ứng.
