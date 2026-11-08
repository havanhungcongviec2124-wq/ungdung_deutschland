# WortKarte — Flashcard học từ vựng

Ứng dụng React + Vite + Tailwind CSS để tạo và ôn tập flashcard. Bắt đầu với thư viện trống; thư mục, thẻ từ và tiến độ học được lưu ngay trong trình duyệt trên thiết bị, không cần tài khoản hay máy chủ.
Khi mở bản mới, ứng dụng tự bỏ các thẻ mẫu mặc định của **Tiếng Đức A2** đã lưu từ phiên bản cũ; các thẻ do bạn tự thêm vẫn được giữ lại.

## 1. Yêu cầu
- Node.js 20.19+ hoặc 22.12+

## 2. Cài đặt
```bash
npm install
```

## 3. Chạy ứng dụng
```bash
npm run dev
```
Mở URL Vite hiển thị trong terminal, thường là `http://localhost:5173`.

Build production:
```bash
npm run build
npm run preview
```

## 4. Đưa ứng dụng lên mạng để chia sẻ và cài đặt
1. Tạo bản production bằng `npm run build`.
2. Deploy toàn bộ nội dung trong thư mục `dist/` lên hosting static có HTTPS, ví dụ Netlify, Vercel hoặc Cloudflare Pages.
3. Mở đường dẫn HTTPS trên thiết bị rồi cài:
   - **iPhone/iPad:** mở bằng Safari → **Chia sẻ** → **Thêm vào Màn hình chính**.
   - **Android:** mở bằng Chrome → menu → **Cài đặt ứng dụng** / **Thêm vào màn hình chính**.
   - **Mac:** Safari → **File** → **Add to Dock**; Chrome/Edge → menu trình duyệt → cài trang web thành ứng dụng.
   - **Windows:** mở bằng Edge hoặc Chrome → biểu tượng cài đặt trên thanh địa chỉ hoặc menu → **Cài đặt WortKarte**.
4. Chia sẻ đường dẫn HTTPS đó để người khác mở và cài ứng dụng.

Ứng dụng là PWA nên không cần đăng qua App Store hoặc Play Store. Hãy mở ứng dụng bằng Internet ít nhất một lần để cài service worker và tải cache (bao gồm giao diện, mã chạy và dữ liệu OCR). Sau đó có thể mở từ màn hình chính, tạo/sửa/ôn thẻ và nhận diện ảnh mà không cần Wi-Fi hay mạng di động. Thẻ và tiến độ vẫn lưu riêng trong trình duyệt của từng thiết bị, không tự chuyển sang máy người khác. Cập nhật ứng dụng cần kết nối Internet.

## 5. Tạo ứng dụng Mac tải về
Trên macOS, chạy `npm run desktop:mac` để tạo bộ cài DMG Intel và Apple Silicon trong thư mục `release/`. Bản Mac lưu dữ liệu riêng trên máy và chạy OCR ngoại tuyến. Chia sẻ thư mục từ ứng dụng Mac sẽ tạo link mở trên website; dữ liệu không tự đồng bộ với bản web. Bản DMG chưa ký/notarize cần tài khoản Apple Developer để phân phối ngoài máy phát triển mà không hiện cảnh báo Gatekeeper.

## 6. Cách nhập dữ liệu
Dán mỗi dòng một từ theo định dạng:
```text
der Fehler | die Fehler | Lỗi, sai sót
die Prüfung | die Prüfungen | Kỳ thi
das Geschenk | die Geschenke | Món quà
stattfinden | | diễn ra
```
- Dùng `|`, dấu tab hoặc dấu `;` để tách cột.
- Có thể tải CSV với tiêu đề `front,plural,back` (có thể thêm `note`).
- Ảnh dùng OCR tiếng Đức/Anh/Việt bằng Tesseract.js. OCR có thể nhận sai cột, vì vậy luôn sửa bảng xem trước trước khi lưu.

## 7. Học tập và lưu trữ dữ liệu
- Nút **Kiểm tra** cho phép chọn lật thẻ, trắc nghiệm Đức → Việt, hoặc trắc nghiệm Việt → Đức. Trắc nghiệm cần ít nhất 2 đáp án khác nhau trong bộ thẻ.
- Nút **Lưu tất cả** lưu thẻ vào `localStorage` của trình duyệt trên máy này; thẻ và thư mục vẫn còn sau khi tải lại hoặc đóng/mở trang.
- Khi nhập, ứng dụng báo các từ đã có trong thư mục đang chọn và chỉ lưu từ mới.
- Trong từng thư mục, mục **Tổng các từ vựng** hiển thị thẻ dạng bảng, cho sửa từ/số nhiều/nghĩa, tô đỏ các từ trùng và cho phép xóa bản dư để giữ lại một thẻ cho mỗi từ.
- Mỗi thư mục có thống kê ôn tập theo ngày, mục tiêu mặc định 10 thẻ/ngày (có thể chỉnh), số câu đúng/cần ôn lại và chuỗi ngày hoàn thành mục tiêu.
- Nút loa phát âm từ tiếng Đức bằng giọng đọc có sẵn của trình duyệt/thiết bị, miễn phí và không gửi dữ liệu ra ngoài. Danh sách giọng đọc tùy thuộc vào hệ điều hành.
- Dữ liệu không được đồng bộ giữa các máy hoặc trình duyệt. Xóa dữ liệu trang web trong trình duyệt có thể xóa các thẻ đã lưu.
- Trong mục **Tổng các từ vựng**, chọn **Chia sẻ thư mục** để tạo link chứa bản sao các thẻ. Người nhận mở link, xem trước rồi thêm thư mục vào dữ liệu riêng trên máy của họ; nội dung link không tự cập nhật khi bạn sửa bộ từ. Link dùng nén dữ liệu, không mã hóa bảo mật, nên không chia sẻ thẻ có thông tin riêng tư.
- Nhận diện chữ và tách các hàng/cột của bảng ảnh thực hiện ngay trong trình duyệt bằng Tesseract OCR; ảnh không được gửi lên dịch vụ AI bên ngoài. Luôn kiểm tra bảng xem trước trước khi lưu.
- Có thể chọn nhiều ảnh cùng lúc; ứng dụng nhận diện lần lượt rồi gộp các dòng vào một bảng xem trước.
