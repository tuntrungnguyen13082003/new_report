- Ứng Dụng hổ trợ giám sát hiện trường (Web App)
Tài liệu này hướng dẫn chi tiết cách triển khai (Deploy) ứng dụng từ mã nguồn trên GitHub ra trang web thực tế, bao gồm cả phần Backend (Google Drive) và Frontend (Giao diện Web).

- Cấu Trúc Dự Án:
Dự án này gồm 2 phần chính:
Report/: Chứa code giao diện trang web (ReactJS/Vite).
backend_script/: Chứa code xử lý việc lưu file vào Google Drive (Google Apps Script).

+ PHẦN 1: Cấu Hình Backend (Google Apps Script)
Mục đích: Tạo nơi để web gửi ảnh về và lưu vào Google Drive.
Truy cập script.google.com và bấm "Dự án mới".
Mở file backend_script/Code.js trong GitHub, copy toàn bộ nội dung.
Dán đè vào trang Google Script vừa mở.
QUAN TRỌNG: Tìm dòng DriveApp.getFolderById("...") và thay bằng ID Thư mục Drive của bạn.
Bấm nút Lưu (hình đĩa mềm).
Bấm nút Triển khai (Deploy) (màu xanh góc phải) => Tùy chọn triển khai mới.
Loại: Ứng dụng web (Web app).
Mô tả: (Tùy ý).
Thực hiện dưới tư cách: Tôi (Me).
Ai có quyền truy cập: Bất kỳ ai (Anyone).
Bấm Triển khai. Cấp quyền truy cập cho Google.
Copy đường link URL của "Ứng dụng Web".

+ PHẦN 2: Kết Nối Backend vào Frontend
Mục đích: Giúp trang web biết phải gửi báo cáo đi đâu.
Trên GitHub, vào thư mục: Report/src/.
Mở file App.jsx.
Bấm biểu tượng cây bút chì (Edit) để sửa file.
Tìm dòng: const GOOGLE_SCRIPT_URL = "...".
Dán đường link URL bạn vừa copy ở Phần 1 vào giữa hai dấu ngoặc kép.
Bấm Commit changes để lưu lại.

+ PHẦN 3: Cấu Hình Tên Dự Án
Mục đích: Để web hiển thị đúng, không bị trắng trang.
Kiểm tra tên Repository hiện tại của bạn trên thanh địa chỉ (Ví dụ: /new_report).
Vào thư mục Report/, mở file vite.config.js.
Sửa dòng base:
base: '/TEN_REPO_CUA_BAN/', // Ví dụ: base: '/new_report/',
Vào file package.json (trong thư mục Report/), sửa dòng homepage:
"homepage": "https://TEN_NICK_GITHUB.github.io/TEN_REPO_CUA_BAN",
Commit changes để lưu lại các thay đổi.

+ PHẦN 4: Kích Hoạt Robot Tự Động (GitHub Actions)
Mục đích: Tự động đóng gói và xuất bản web mỗi khi có code mới.
Tại trang chủ Repository, bấm Add file => Create new file.
Đặt tên file chính xác là: .github/workflows/deploy.yml
Dán nội dung sau vào:
"""""""""""""""""""""""""""""""""""""""""""""""""""""""
name: Deploy Web
on:
  push:
    branches: ["main"]
  workflow_dispatch:
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: "pages"
  cancel-in-progress: true
jobs:
  build:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./Report  # QUAN TRỌNG: Trỏ đúng vào thư mục chứa code React
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Set up Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
          cache-dependency-path: Report/package-lock.json
      - name: Install dependencies
        run: npm install
      - name: Build
        run: npm run build
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './Report/dist'
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        uses: actions/deploy-pages@v4
"""""""""""""""""""""""""""""""""""""""""""""""""""""""
Bấm Commit changes.

+ PHẦN 5: Bật Web (GitHub Pages)
Bước cuối cùng để lấy link web.
Vào tab Settings (Cài đặt) của Repository.
Chọn mục Pages (cột bên trái).
Tại phần Build and deployment Source: Chọn GitHub Actions.
Chờ khoảng 2-3 phút.
Vào tab Actions trên menu để xem tiến trình chạy. Khi nào hiện dấu tick màu xanh lá cây là xong.

Quay lại Settings => Pages, bạn sẽ thấy đường link trang web hiện ra ở đầu trang.

Hoàn tất! Web của bạn đã sẵn sàng sử dụng.
