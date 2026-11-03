# Yêu cầu sản phẩm CatalogHub

## Mục tiêu

CatalogHub là ứng dụng giới thiệu và quản lý danh mục sản phẩm công nghệ cho dự án học phần Cloud Computing.
Người dùng tra cứu sản phẩm; chức năng thêm sản phẩm được bật theo cấu hình của deployment.
Ứng dụng sử dụng Node.js, MySQL và có cấu hình triển khai Railway.

## Phạm vi

Bao gồm catalog, tìm kiếm, lọc danh mục/giá, sắp xếp, phân trang, trang chi tiết, form tạo sản phẩm, API và SQL setup.
Không bao gồm thanh toán, giỏ hàng, đơn hàng, upload tệp, sửa/xóa sản phẩm hoặc quản lý tồn kho.
Đăng nhập và phân quyền theo người dùng chưa được triển khai.
Chức năng tạo sản phẩm không phải khu vực quản trị có authentication.

## Công nghệ

Node.js 24, Express, JavaScript CommonJS, EJS, HTML/CSS và JavaScript thuần.
MySQL 8 với mysql2/promise; Zod kiểm tra dữ liệu, Helmet và rate limiting bảo vệ cơ bản.
SQL dùng placeholders, truy vấn chỉ đặt trong repository.
Source, lockfile, SQL và tài liệu phải đủ để thành viên setup bằng Git trên máy riêng.
Secrets và dữ liệu MySQL local không nằm trong repository.

## Giao diện

Navy `#0D1B30`, trắng `#FFFFFF` và vàng `#F3C65B` theo nguyên tắc 60/30/10.
Navy tạo nền/khung, trắng tạo bề mặt nội dung, vàng làm điểm nhấn thao tác.
Header có logo, Products và Add Product; active navigation rõ ràng.
Footer có thương hiệu, liên kết catalog và copyright.
Hero giới thiệu bộ sưu tập bằng minh họa local và CTA tới danh sách.
Không hiển thị thông tin hạ tầng triển khai trong giao diện catalog.

Catalog có search bar, category, min/max price, sort, nút reset, product grid và pagination.
Card có ảnh, category, SKU, tên tối đa hai dòng, giá VND và liên kết chi tiết.
Có loading, empty state, invalid filter, failed load và retry.
Trạng thái tìm kiếm/bộ lọc/trang giữ trên query string, hỗ trợ reload và chia sẻ URL.
Form thêm sản phẩm có inline errors, trạng thái gửi, chống double-submit, xác nhận thành công và link xem sản phẩm.
Trang chi tiết có breadcrumb, ảnh, tên, SKU, category, giá, mô tả và thời điểm thêm.
404 và lỗi không hiển thị stack trace.

Responsive tại 375, 768, 1280 và 1440px, không tràn ngang.
Điều khiển có label, focus nhìn thấy, touch target phù hợp và aria-live cho kết quả.
Tôn trọng prefers-reduced-motion. 8 SVG local theo category và image fallback không phụ thuộc CDN.

## Dữ liệu và quy tắc

Categories có id, slug unique, name unique và created_at.
Products có id, SKU unique, category_id FK, name, description, price, image_url và timestamps.
Sử dụng InnoDB, utf8mb4_unicode_ci và foreign key RESTRICT.
Schema/seed chạy bằng tài khoản setup, không tự chạy trong build hoặc startup.
Seed có 8 categories, ít nhất 24 sản phẩm mẫu, chạy lặp không nhân bản SKU.

| Trường | Quy tắc |
|---|---|
| Name | Trim, 3..160 ký tự Unicode |
| SKU | Trim, uppercase, `[A-Z0-9-]{3,32}`, duy nhất |
| Category | Phải tồn tại |
| Price | 0..9999999999.99, tối đa 2 chữ số lẻ, không exponent hoặc dấu nhóm số |
| Description | Optional, trim, tối đa 2000 ký tự; rỗng thành null |
| Image URL | Optional, http/https, tối đa 2048 ký tự; server không tải URL |
| Search | Trim, tối đa 100 ký tự; tên/SKU/mô tả, không phân biệt hoa thường |
| Min/max price | Không âm, min <= max |
| Pagination | Page >=1; limit 1..24, mặc định 12 |
| Sort | newest, price_asc, price_desc, name_asc; tie-break id DESC |

Price lưu DECIMAL(12,2), JSON là string decimal, UI định dạng VND.
Datetime DB/API dùng UTC; UI hiển thị UTC+7.
Escape `%`, `_` và backslash trong keyword để coi là literal.
Page vượt cuối trả danh sách rỗng với metadata đúng.
Trùng SKU trả 409, gồm cả request đồng thời.
Không thay dữ liệu DB bằng dữ liệu mock khi truy vấn lỗi.

## Hợp đồng và vận hành

Web routes: `/`, `/products/new`, `/products/:id`.
API v1: GET categories, GET products, GET product theo ID và POST product.
Hợp đồng chi tiết, envelope, validation và mã lỗi nằm trong [API.md](API.md).
`ENABLE_PRODUCT_WRITE=false` phải vô hiệu hóa form và POST trả 403.
Đây là cấu hình toàn ứng dụng, không thay thế phân quyền người dùng.

`/health` xác minh process, `/ready` kiểm tra SELECT 1 thật.
App bind HOST/PORT từ env, mặc định 0.0.0.0:3000.
Thiếu env phải fail-fast không in secret. Shutdown đóng HTTP server và pool.
Railway sử dụng một web service và một MySQL service, DB kết nối private.
Public deployment mặc định tắt ghi. Cấu hình production không yêu cầu thay source.

## Tiêu chí nghiệm thu

- Setup được trên máy thành viên theo LOCAL_SETUP.md, dùng lockfile và SQL trong repository.
- Tất cả chức năng đọc/ghi hoạt động với MySQL thật, phản hồi đúng API.md.
- Validation phía server bảo vệ dữ liệu; lỗi không làm lộ thông tin nội bộ.
- Kiểm tra responsive, loading/error/empty state và tính bền vững dữ liệu sau reload.
- Unit/contract, integration và browser tests có kết quả chạy thực tế.
- Tài liệu kiến trúc, phát triển nhóm, setup, kiểm thử và Railway thống nhất với code.
- Xác minh deployment cloud qua domain/health/readiness khi thực hiện triển khai.
