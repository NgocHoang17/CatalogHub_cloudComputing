# Triển khai Railway

## Điều kiện

Repository đã push lên GitHub, có package-lock.json, `.nvmrc` và railway.json.
Người triển khai có tài khoản Railway và quyền quản lý project.
Chạy `npm ci` và `npm test` trước khi triển khai.
Không đưa `.env`, credentials, node_modules hoặc data directory MySQL vào repository.

## 1. Tạo service

1. Tạo Railway project.
2. Thêm MySQL service, chọn MySQL 8.x tương thích schema.
3. Tạo web service từ GitHub repository của nhóm.
4. Chọn root directory chứa package.json.
5. Đặt hai service trong cùng project/environment.

[Railway Express guide](https://railway.com/guides/express) hướng dẫn kết nối GitHub và tạo deployment.
[Railway MySQL](https://docs.railway.com/databases/mysql) mô tả biến kết nối và thao tác database service.

## 2. Biến môi trường web service

```text
NODE_ENV=production
HOST=0.0.0.0
ENABLE_PRODUCT_WRITE=false
TRUST_PROXY=1
DB_HOST=${{MySQL.MYSQLHOST}}
DB_PORT=${{MySQL.MYSQLPORT}}
DB_USER=${{MySQL.MYSQLUSER}}
DB_PASSWORD=${{MySQL.MYSQLPASSWORD}}
DB_NAME=${{MySQL.MYSQLDATABASE}}
DB_CONNECTION_LIMIT=10
```

Thay namespace `MySQL` bằng tên service thật.
Reference syntax đặt trong Railway Variables, không dán literal vào `.env` local.
Xác minh DB_HOST là endpoint private của service trong cùng environment.
Xem [variables reference](https://docs.railway.com/variables/reference) và [private networking](https://docs.railway.com/networking/private-networking).

Để Railway cấp PORT, không cố định 3000.
TRUST_PROXY=1 áp dụng khi app đứng sau đúng một reverse proxy được tin cậy.
Kiểm tra lại số proxy nếu thay topology để rate limit nhận đúng IP.
Không cấu hình TEST_DB_* trên production web service.

Tài khoản app chỉ cần SELECT/INSERT trên products, SELECT trên categories.
Nếu biến Railway cung cấp user setup, tạo user app giới hạn quyền sau import rồi cập nhật DB_USER/DB_PASSWORD.

## 3. Build và start

`railway.json` cấu hình build `npm ci`, start `npm start`, healthcheck `/health`.
Node major 24 được chỉ định trong engines và `.nvmrc`.
Frontend được phục vụ cùng backend; không cần build frontend hoặc service riêng.
Không chạy schema hoặc seed trong build/start.

## 4. Import database

1. Lấy host/port và database của MySQL service.
2. Dùng MySQL client qua đường kết nối private được cấp quyền.
3. Nếu import từ máy local, mở Public Access/TCP Proxy tạm trên MySQL service.
4. Kết nối bằng `mysql -h <HOST> -P <PORT> -u <SETUP_USER> -p <DATABASE>`.
5. Chạy schema.sql vào database đã chọn.
6. Chạy seed.sql nếu cần dữ liệu minh họa trên DB mới.
7. Kiểm tra số bảng và bản ghi.
8. Tắt public proxy sau khi import nếu không cần truy cập ngoài.

Trong MySQL CLI, thay đường dẫn bằng repository local:

```sql
SOURCE C:/path/to/cataloghub/database/schema.sql;
SOURCE C:/path/to/cataloghub/database/seed.sql;
SELECT COUNT(*) FROM categories;
SELECT COUNT(*) FROM products;
```

Schema không chứa CREATE DATABASE/USE cố định.
Seed upsert SKU mẫu, chỉ chạy có chủ đích. Không seed lại theo mỗi deployment.
Public TCP Proxy có thể phát sinh egress; kiểm tra [kết nối ngoài của Railway MySQL](https://docs.railway.com/databases/mysql#connecting-externally).

## 5. Domain và xác minh

1. Tạo public domain cho web service trong Networking.
2. Chờ deployment thành công và kiểm tra logs.
3. Gọi `/health`, kỳ vọng 200 và status=ok.
4. Gọi `/ready`, kỳ vọng 200 và database=connected.
5. Thử catalog, search, category, giá, sort, pagination và detail.
6. Xác minh POST trả 403 khi write disabled.
7. Chỉ bật ghi trong buổi demo có kiểm soát, thử INSERT và reload.
8. Tắt ghi sau demo.

`/health` kiểm tra process độc lập với DB; `/ready` chạy SELECT 1 thật.
Healthcheck xanh không chứng minh schema đã import hoặc đọc catalog được.
Ghi lại commit, domain, thời điểm và kết quả kiểm chứng.
Ảnh bằng chứng gồm service topology, variables đã che secret, logs và trang web thực tế.

## Xử lý lỗi

| Hiện tượng | Kiểm tra |
|---|---|
| Missing env | Tên biến, reference namespace, environment |
| Access denied | Tài khoản, password, host và quyền schema |
| ECONNREFUSED | MySQL service, host và port |
| ETIMEDOUT/ENOTFOUND | Private endpoint, DNS và environment |
| ready 200, catalog 503 | Table đã import, user có SELECT |
| Build fail | Node 24, lockfile, npm ci và build logs |
| App failed to respond | HOST=0.0.0.0, PORT platform cấp và start command |
| POST 403 | ENABLE_PRODUCT_WRITE |
| POST 429 cho nhiều khách | Proxy topology và TRUST_PROXY |

Tham khảo [application failed to respond](https://docs.railway.com/networking/troubleshooting/application-failed-to-respond).
