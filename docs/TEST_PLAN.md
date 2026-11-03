# Kiểm thử CatalogHub

## Unit, contract và lifecycle

```powershell
npm.cmd test
```

Suite không yêu cầu MySQL đang chạy. Contract tests dùng pool thật trỏ tới cổng local đóng để kiểm tra unavailable state.
Lifecycle tests khởi động server thật, kiểm tra config và đóng HTTP/pool bằng SIGTERM event trong subprocess.
Trên Windows, SIGTERM event không chứng minh signal Linux từ Railway đã được kiểm tra.

## Chuẩn bị MySQL test

Tạo database test chuyên biệt bằng tài khoản quản lý DB:

```sql
CREATE DATABASE cataloghub_test
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'cataloghub_test'@'127.0.0.1'
  IDENTIFIED BY 'replace_with_your_test_password';
GRANT ALL PRIVILEGES ON cataloghub_test.* TO 'cataloghub_test'@'127.0.0.1';
```

Thêm vào `.env`:

```dotenv
TEST_DB_HOST=127.0.0.1
TEST_DB_PORT=3306
TEST_DB_USER=cataloghub_test
TEST_DB_PASSWORD=replace_with_your_test_password
TEST_DB_NAME=cataloghub_test
```

TEST_DB_NAME phải khác DB_NAME và kết thúc bằng `_test`.
Suite import schema/seed và giữ lại bản ghi kiểm thử, chỉ chạy trên DB chuyên biệt.
Không chạy trên DB ứng dụng hoặc database dùng chung của nhóm.
Chạy lại không cần DB trống; seed không nhân bản và SKU kiểm thử được tạo riêng mỗi lần.

## Integration

```powershell
npm.cmd run test:integration
```

Kiểm tra schema, seed lặp, categories, search, literal wildcard, injection payload, filter, sort và pagination.
Kiểm tra INSERT thật, decimal string, Location, trùng SKU và request đồng thời.
So sánh bản ghi bằng SELECT, xác minh validation không làm tăng row count.
Kiểm tra HTML escaping, web routes và write-disabled mode.
Không dùng mock repository hoặc dữ liệu trong bộ nhớ thay MySQL.

## Browser

```powershell
npm.cmd run test:browser
```

Cần Chrome cài sẵn. Dùng `$env:BROWSER_CHANNEL='msedge'` nếu dùng Edge đã cài.
Suite sử dụng TEST_DB_* và mở một HTTP server local trên cổng tạm.
Kiểm tra catalog, form và detail tại 375, 768, 1280, 1440px.
Kiểm tra search/filter, URL persistence, invalid range, empty search, pagination và retry.
Kiểm tra inline validation, submit thật, chống double-submit, reload và fallback ảnh.
Một request bị abort có chủ đích để kiểm tra lỗi mạng; không thay response bằng data giả.
Ảnh chụp thật được lưu trong `docs/screenshots/`.

## Ma trận chấp nhận

| ID | Trường hợp | Kết quả mong đợi |
|---|---|---|
| T01 | Catalog có seed | Card, ảnh, giá và bộ lọc hiển thị đúng |
| T02 | Search hoa/thường | Kết quả tương đương |
| T03 | Search SKU | Tìm đúng sản phẩm |
| T04 | Search không có kết quả | Empty state, total=0 |
| T05 | %, _, backslash | Tìm literal, không trở thành wildcard ngoài ý muốn |
| T06 | Category hợp lệ | Chỉ sản phẩm thuộc category |
| T07 | min > max | API 400, UI báo lỗi |
| T08 | price_asc | Giá tăng dần, id DESC khi bằng giá |
| T09 | Page 2 | Items không lặp trang 1, metadata đúng |
| T10 | Tạo hợp lệ | 201, Location, record tồn tại sau reload |
| T11 | Trùng SKU | 409, không nhân đôi |
| T12 | Thiếu trường bắt buộc | 422, field errors, không INSERT |
| T13 | Giá âm/SKU sai | 422 |
| T14 | HTML injection | Nội dung escaped, không thực thi |
| T15 | Detail không có | API và web 404 |
| T16 | DB không khả dụng | health 200, ready/API 503, UI retry |
| T17 | Write disabled | API 403, form disabled |
| T18 | Seed chạy lặp | Số bản ghi mẫu không tăng |
| T19 | Lockfile/start | npm ci và npm start thành công |
| T20 | Responsive | Không overflow ở 4 viewport |
| T21 | URL/reload | Bộ lọc và từ khóa được giữ |
| T22 | HOST/PORT | Server bind theo env |
| T23 | URL ảnh hỏng | SVG local fallback |
| T24 | SQL injection | Không phá truy vấn hoặc mở rộng kết quả |

## Kiểm tra thủ công

- Chạy toàn bộ quy trình setup trên máy mới theo LOCAL_SETUP.md.
- Duyệt bằng keyboard, kiểm tra focus và label.
- Thử với screen reader và điện thoại vật lý khi có thiết bị.
- Kiểm tra DB rỗng hoặc mất kết nối trên môi trường test được phép vận hành.
- Xác minh production domain, DB private, write gate và shutdown khi deploy Railway.

Không dừng database dùng chung để thử outage. Không đánh dấu đạt khi chưa thực sự kiểm tra.

## Kết quả xác minh

Ngày 03/11/2026, Windows, Node v24.21.0, MySQL 8.0.42 tại cổng 3306, Chrome headless:

| Kiểm tra | Kết quả |
|---|---|
| npm ci từ lockfile | Thành công |
| npm test | 26 đạt, 0 lỗi, 0 bỏ qua |
| npm run test:integration | 12 đạt, 0 lỗi, 0 bỏ qua, gồm test cha và 11 subtests |
| npm run test:browser | Đạt các luồng và 4 viewport, không có uncaught JS error |
| npm run db:check | Kết nối được DB app, 8 categories và 24 products |
| Kiểm tra ảnh chụp | Đã xem catalog desktop/mobile, form desktop và detail desktop |
| Git ignore và tài liệu | File riêng tư được ignore; liên kết nội bộ hợp lệ |
| npm audit sau cập nhật lockfile | Không báo vulnerability |

Kiểm thử ghi dữ liệu chỉ sử dụng database test chuyên biệt.
Kết quả local không xác nhận đã deploy Railway hoặc kiểm tra trên thiết bị di động vật lý.
