# Kiến trúc CatalogHub

## Thành phần

```text
Browser
  | GET pages / fetch API
Express application
  | Routes -> Controllers -> Product service -> Repositories
  | EJS views + public assets
MySQL pool -> MySQL Server
```

`src/app.js` dựng app và các middleware, không tự listen để tests có thể gọi trực tiếp.
`src/server.js` đọc config, tạo pool, listen HOST/PORT và xử lý shutdown.
EJS render catalog lần đầu từ database; JS tăng cường search, sort, filter và pagination qua API.
API và frontend cùng origin, không cần frontend service hoặc CORS riêng.

## Tổ chức source

| Thư mục/file | Trách nhiệm |
|---|---|
| config/env.js | Nạp dotenv và validate biến môi trường |
| config/database.js | Pool mysql2, UTC session, timeout và connection limit |
| routes/ | Web routes và API endpoints |
| controllers/ | Đọc dữ liệu đã validate và tạo response |
| services/product.service.js | Kiểm tra category, detail tồn tại, phân trang và lỗi SKU |
| repositories/ | SELECT/INSERT và ánh xạ record sang Product |
| validators/ | Zod schema cho product, query và ID |
| middleware/ | Validation, not-found và error handler |
| utils/ | AppError/response và format giá, ngày, image fallback |
| views/ | Trang EJS và shared partials |
| public/ | CSS, JS thuần, SVG local |

Category API đọc qua category controller/repository.
Product list dùng COUNT và SELECT trong cùng transaction để metadata nhất quán.
Sort mapping whitelist, tie-break id DESC; keyword LIKE được escape và parameterized.

## Dữ liệu

Một category có nhiều products; product tham chiếu category bằng khóa ngoại.
Giá lưu DECIMAL(12,2), API giữ decimal string để tránh mất độ chính xác khi lưu.
Timestamps tạo và đọc dưới UTC; UI hiển thị ngày theo vi-VN, UTC+7.
Không seed trong build/start. Dữ liệu rỗng và lỗi DB có trạng thái UI riêng.

## Giao diện

Thiết kế theo tỷ lệ thị giác 60/30/10:

| Vai trò | Màu | Ứng dụng |
|---|---|---|
| 60% chủ đạo | Navy `#0D1B30` | Nền, header, hero, footer và khung bố cục |
| 30% hỗ trợ | White `#FFFFFF` | Thẻ sản phẩm, form và bộ lọc |
| 10% điểm nhấn | Gold `#F3C65B` | CTA, logo, active state và điểm nhấn tiêu đề |

Đây là tỷ lệ định hướng phân bố màu, không phải phép đo pixel cố định trên mọi viewport.
Token nằm trong `public/css/styles.css`; màu phụ hỗ trợ border, text và trạng thái lỗi/thành công.
Grid 4/3/2/1 cột theo viewport, form/detail chuyển một cột trên mobile.
Logo và 8 minh họa SVG nằm local, không cần CDN.
JS xử lý fallback ảnh lỗi, skeleton, retry, thông báo form và chống double-submit.

## Cấu hình và bảo vệ

Đọc DB_* từ env; không hardcode credentials hoặc tên service Railway vào repository.
Helmet thiết lập security headers, body JSON giới hạn 100 KB.
POST có rate limit 20/phút/IP và gate ENABLE_PRODUCT_WRITE.
Gate áp dụng toàn app, chưa có đăng nhập/phân quyền theo người dùng.
Production mặc định tắt ghi nếu không đặt biến này.
Lỗi DB trả thông báo an toàn, không lộ SQL hoặc stack trace.
`/health` không query DB; `/ready` thực hiện SELECT 1.
Shutdown đóng HTTP server và pool, có timeout để process kết thúc.

Package overrides cố định minimatch ở nhánh 11.0.1 trở lên cho các dependency gián tiếp.
Phiên bản này đáp ứng bản vá [GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249).
Node 24 là runtime chung để các dependency và API JSON reviver hoạt động nhất quán.

## Mở rộng

Giữ logic nghiệp vụ trong service, SQL trong repository và HTTP trong controller/route.
Nếu bổ sung auth, bảo vệ cả API lẫn trang chức năng bằng kiểm tra quyền server-side.
Không dựa riêng vào ẩn nút trên UI để kiểm soát quyền.
Mọi thay đổi API phải cập nhật API.md và có test tương ứng.
