# Làm việc nhóm

## Chạy dự án

Hoàn tất [LOCAL_SETUP.md](docs/LOCAL_SETUP.md) trên máy của bạn.
Mỗi thành viên có `.env`, database app và database test riêng.
Repository chứa schema và seed, không chứa data directory hoặc mật khẩu local.

## Quy trình phát triển

1. Pull nhánh chính đã thống nhất của nhóm.
2. Tạo nhánh riêng cho một chức năng hoặc lỗi.
3. Thực hiện thay đổi theo kiến trúc dự án.
4. Chạy kiểm thử phù hợp và kiểm tra giao diện nếu sửa UI.
5. Kiểm tra `git diff` và `git status` trước khi commit.
6. Push nhánh và mở pull request để thành viên khác review.

```bash
git switch main
git pull
git switch -c feature/ten-chuc-nang
npm ci
npm test
git diff --check
git status --short
```

Thay `main` nếu nhóm dùng tên nhánh chính khác.
PR nêu hành vi thay đổi, cách kiểm thử và thay đổi schema/env nếu có.

## Quy ước code

- JavaScript CommonJS, async/await, thụt 2 spaces và UTF-8.
- SQL chỉ ở repositories; dùng placeholders, không ghép input vào SQL.
- Validation ở `src/validators/`; lỗi API theo envelope trong API.md.
- Escape dữ liệu người dùng trong EJS; JavaScript dùng textContent cho nội dung đó.
- CSS sử dụng token trong `:root`, breakpoint và focus state thống nhất.
- Không thêm credential, đường dẫn cá nhân hoặc log nhạy cảm vào source.
- Cập nhật tài liệu theo trạng thái dự án hiện hành khi đổi hợp đồng hoặc quy trình setup.

Tính năng mới thường đi theo thứ tự: schema/migration, repository, service, controller, route, UI và tests.
Nếu thay schema trên database đã có dữ liệu, cung cấp SQL migration riêng và hướng dẫn chạy.
`schema.sql` phục vụ cài đặt mới, không phải migration tự động.
Đăng nhập/phân quyền cần thiết kế và thống nhất phạm vi trước khi bổ sung.

## Dependencies

Commit cả package.json và package-lock.json khi thêm dependency.
Thành viên khác chạy `npm ci` sau khi pull. Không commit node_modules.
Không cần cài dependencies lại sau mỗi thay đổi CSS hoặc EJS.

## Chia sẻ repository

Các file `.env`, `.env.*` trừ `.env.example`, `.local/`, node_modules, log và key được ignore.
Không dùng `git add -f` để thêm các file này.
Không đưa MySQL data directory hoặc database dump chứa thông tin riêng vào Git.

Nếu thư mục chưa có Git repository, người phụ trách thực hiện tại root:

```bash
git init -b main
git add .
git diff --cached --stat
git diff --cached --check
git status --short
git commit -m "Initialize CatalogHub"
git remote add origin <URL_REPOSITORY_CUA_NHOM>
git push -u origin main
```

Trước commit, kiểm tra `.env`, `.local/` và node_modules không nằm trong danh sách staged.
Sau khi tạo remote, các thành viên clone bằng URL đó và làm theo README.
