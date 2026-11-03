# CatalogHub API v1

Base URL local: `http://localhost:3000/api/v1`.
Mọi response API dùng JSON UTF-8. Không có authentication trong MVP.

## Envelope

Thành công: `{ "success": true, "data": ..., "meta": ... }`.
`meta` chỉ có ở danh sách products.

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Please correct the highlighted fields.",
    "details": [{"field":"name","message":"Product name must contain 3–160 characters."}]
  }
}
```

## Endpoint

| Method / path | Thành công | Mô tả |
|---|---|---|
| GET `/categories` | 200 | `{id, slug, name}[]`, name ASC |
| GET `/products` | 200 | Product[], meta phân trang |
| GET `/products/:id` | 200 | Một Product |
| POST `/products` | 201 | Product đã lưu; Location `/api/v1/products/<id>` |

Product:

```json
{
  "id": 1,
  "sku": "LAP-001",
  "name": "ASUS Zenbook 14 OLED",
  "description": "Lightweight laptop with a vivid OLED display for focused work.",
  "price": "24990000.00",
  "imageUrl": null,
  "category": {"id":1,"slug":"laptops","name":"Laptops"},
  "createdAt": "2026-10-27T00:00:00.000Z",
  "updatedAt": "2026-10-27T00:00:00.000Z"
}
```

Ví dụ minh họa; ID và thời điểm tùy database thực tế.
Giá luôn là string decimal. Thời gian ISO UTC, kết thúc `Z`.

## Query danh sách

| Tham số | Quy tắc | Mặc định |
|---|---|---|
| q | Trim, tối đa 100 ký tự; tìm tên, SKU, mô tả; literal `%`, `_`, `\` | rỗng |
| category | Slug có thật, không phải category ID | không lọc |
| minPrice / maxPrice | Decimal không âm, tối đa 2 chữ số lẻ, min <= max | không lọc |
| sort | newest, price_asc, price_desc, name_asc | newest |
| page | Số nguyên >=1; giới hạn để offset vẫn là safe integer | 1 |
| limit | Số nguyên 1..24 | 12 |

Sort luôn tie-break bằng id DESC.
Không nhận tham số lặp, giá dạng exponent hoặc key không có trong hợp đồng.
Không có kết quả: data `[]`, total `0`, totalPages `0`.
Page vượt cuối: data `[]`, total giữ nguyên; hasPrevPage = page > 1.

```json
{"page":1,"limit":12,"total":24,"totalPages":2,"hasNextPage":true,"hasPrevPage":false}
```

## Tạo sản phẩm

Content-Type bắt buộc `application/json`; body tối đa 100 KB.
Ví dụ Bash/macOS/Linux:

```bash
curl -i -X POST http://localhost:3000/api/v1/products \
  -H 'Content-Type: application/json' \
  -d '{"name":"Mechanical Keyboard K100","sku":"KB-100","categoryId":4,"price":"1290000.00","description":"Compact mechanical keyboard","imageUrl":null}'
```

PowerShell:

```powershell
$body = @{name='Mechanical Keyboard K100'; sku='KB-100'; categoryId=4; price='1290000.00'; description='Compact mechanical keyboard'; imageUrl=$null} | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri http://localhost:3000/api/v1/products -ContentType 'application/json' -Body $body
```

Lấy categoryId thật từ `/categories`; không giả định ID cố định ở database đã có dữ liệu.
Name trim 3..160 ký tự Unicode. SKU trim, uppercase, `[A-Z0-9-]{3,32}`.
Category phải tồn tại. Price nhận JSON number hoặc decimal string từ 0 đến 9999999999.99.
Exponent bị từ chối ngay cả khi là JSON numeric token `1e3`.
Description optional, trim, tối đa 2000 ký tự, rỗng thành null.
Image URL optional, tối đa 2048 ký tự, chỉ http/https; server không tải URL.
Không có upload, edit, delete, cart hoặc tài khoản.

## Mã lỗi

| HTTP | Code | Khi nào |
|---|---|---|
| 400 | INVALID_QUERY | Bộ lọc sai, query lặp hoặc key không hợp lệ |
| 400 | CATEGORY_NOT_FOUND | Slug không tồn tại |
| 400 | INVALID_ID | ID không phải số nguyên dương an toàn |
| 400 | INVALID_JSON | JSON không hợp lệ |
| 403 | WRITE_DISABLED | ENABLE_PRODUCT_WRITE=false |
| 404 | PRODUCT_NOT_FOUND | Không tìm được ID hợp lệ |
| 404 | NOT_FOUND | API route không tồn tại |
| 409 | SKU_ALREADY_EXISTS | Trùng SKU, kể cả hai request đồng thời |
| 413 | BODY_TOO_LARGE | Body quá 100 KB |
| 415 | UNSUPPORTED_MEDIA_TYPE | Không phải JSON hoặc charset/encoding không hỗ trợ |
| 422 | VALIDATION_ERROR | Field body không hợp lệ hoặc categoryId không có thật |
| 429 | RATE_LIMITED | Quá 20 POST/phút trên mỗi IP |
| 503 | DATABASE_UNAVAILABLE | Mất kết nối hoặc schema không sẵn sàng |
| 500 | INTERNAL_ERROR | Lỗi ngoài dự kiến, không lộ SQL/stack/secret |

## Ví dụ đọc

```bash
curl 'http://localhost:3000/api/v1/products?q=logitech&category=mice&maxPrice=3000000&sort=price_asc&page=1&limit=12'
curl 'http://localhost:3000/api/v1/categories'
curl 'http://localhost:3000/api/v1/products/1'
curl 'http://localhost:3000/health'
curl 'http://localhost:3000/ready'
```

`GET /health`: 200 `{"status":"ok"}`, không gọi DB.
`GET /ready`: SELECT 1 thật; 200 `{"status":"ready","database":"connected"}` hoặc 503 `{"status":"not_ready","database":"unavailable"}`.
Web routes: `/`, `/products/new`, `/products/:id`; route web không tồn tại trả HTML 404.
