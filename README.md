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
1. Tạo bản production bằng `npm run build`. Giao diện nằm trong `dist/client/`, Worker API nằm trong `worker/`.
2. Với Cloudflare Workers, chạy `npm run deploy`. Nếu dùng hosting static khác, tải toàn bộ nội dung trong `dist/client/` lên hosting có HTTPS, ví dụ Netlify, Vercel hoặc Cloudflare Pages; khi đó link chia sẻ ngắn cần thêm Worker API riêng.
3. Mở đường dẫn HTTPS trên thiết bị rồi cài:
   - **iPhone/iPad:** mở bằng Safari → **Chia sẻ** → **Thêm vào Màn hình chính**.
   - **Android:** mở bằng Chrome → menu → **Cài đặt ứng dụng** / **Thêm vào màn hình chính**.
   - **Mac:** Safari → **File** → **Add to Dock**; Chrome/Edge → menu trình duyệt → cài trang web thành ứng dụng.
   - **Windows:** mở bằng Edge hoặc Chrome → biểu tượng cài đặt trên thanh địa chỉ hoặc menu → **Cài đặt WortKarte**.
4. Chia sẻ đường dẫn HTTPS đó để người khác mở và cài ứng dụng.

Link chia sẻ thư mục dạng ngắn cần một KV namespace trên Cloudflare. Repo đã cấu hình sẵn binding `SHARE_KV` trong `wrangler.jsonc`; nếu dùng tài khoản Cloudflare khác, tạo namespace mới rồi cập nhật lại `id`:
```bash
npx wrangler kv namespace create SHARE_KV
npm run deploy
```

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
- Nút **Kiểm tra** cho phép chọn lật thẻ, trắc nghiệm Đức → Việt, trắc nghiệm Việt → Đức hoặc **Đặt câu với AI**. Trắc nghiệm cần ít nhất 2 đáp án khác nhau trong bộ thẻ; có thể nhập số thẻ muốn làm, thẻ được chọn ngẫu nhiên và không trùng nhau. Khi chọn **Đặt câu với AI**, ứng dụng hỏi trình độ tiếng Đức hiện tại (A1.1, A1.2, A2.1, A2.2, B1.1, B1.2, B2.1, B2.2) trước khi bắt đầu; lựa chọn lần trước được nhớ trên thiết bị. Sau đó bạn gõ câu tự do hoặc xếp từ, AI tạo câu mẫu, chấm đúng trình độ và giải thích bằng tiếng Việt (xem mục 8).
- Nút **Lưu tất cả** lưu thẻ vào `localStorage` của trình duyệt trên máy này; thẻ và thư mục vẫn còn sau khi tải lại hoặc đóng/mở trang.
- Khi nhập, ứng dụng báo các từ đã có trong thư mục đang chọn và chỉ lưu từ mới.
- Trong từng thư mục, mục **Tổng các từ vựng** hiển thị thẻ dạng bảng, cho sửa từ/số nhiều/nghĩa, tô đỏ các từ trùng và cho phép xóa bản dư để giữ lại một thẻ cho mỗi từ.
- Mỗi thư mục có thống kê ôn tập theo ngày, mục tiêu mặc định 10 thẻ/ngày (có thể chỉnh), số câu đúng/cần ôn lại và chuỗi ngày hoàn thành mục tiêu.
- Nút loa phát âm từ tiếng Đức bằng giọng đọc có sẵn của trình duyệt/thiết bị, miễn phí và không gửi dữ liệu ra ngoài. Danh sách giọng đọc tùy thuộc vào hệ điều hành.
- Dữ liệu không được đồng bộ giữa các máy hoặc trình duyệt. Xóa dữ liệu trang web trong trình duyệt có thể xóa các thẻ đã lưu.
- Trong mục **Tổng các từ vựng**, chọn **Chia sẻ thư mục** để tạo link chứa bản sao các thẻ. Người nhận mở link, xem trước rồi thêm thư mục vào dữ liệu riêng trên máy của họ; nội dung link không tự cập nhật khi bạn sửa bộ từ. Dữ liệu được nén và lưu trong Cloudflare KV, link tạo ra chỉ còn một mã ngắn dạng `.../#s=abc123XYZ`. Nếu chưa cấu hình KV hoặc đang ngoại tuyến, ứng dụng tự quay về link dài chứa dữ liệu. Link không mã hóa bảo mật, nên không chia sẻ thẻ có thông tin riêng tư.
- Nhận diện chữ và tách các hàng/cột của bảng ảnh thực hiện ngay trong trình duyệt bằng Tesseract OCR; ảnh không được gửi lên dịch vụ AI bên ngoài. Luôn kiểm tra bảng xem trước trước khi lưu.
- Có thể chọn nhiều ảnh cùng lúc; ứng dụng nhận diện lần lượt rồi gộp các dòng vào một bảng xem trước.

## 8. Luyện đặt câu và hỏi – đáp bằng AI miễn phí (Google Gemini)
Cả hai chế độ **Đặt câu với AI** và **Hỏi – đáp với AI** gửi từ vựng, trình độ bạn đã chọn và câu của bạn tới Gemini (free tier) qua Worker của ứng dụng. Trình độ (A1.1 đến B2.2) được dùng cho cả câu mẫu lẫn phần chấm điểm: AI chỉ bắt lỗi các cấu trúc phù hợp, không trừ điểm vì bạn chưa dùng cấu trúc cao hơn. AI trả về đúng/sai, câu đã sửa và giải thích ngắn bằng tiếng Việt. Có hai cách làm bài: gõ câu tự do hoặc xếp các từ đã xáo trộn theo thứ tự đúng. Sau khi AI chấm, bạn có thể chuyển sang tab kia để làm lại cùng một từ, hoặc bấm **Câu tiếp theo** nếu không muốn làm nữa; chỉ kết quả gần nhất của mỗi từ được tính vào thống kê. Trình độ chọn lần trước được lưu trên thiết bị để lần sau không phải chọn lại, nhưng bạn luôn có thể đổi trong bước trước khi bắt đầu.

Ở chế độ **Hỏi – đáp với AI**, AI tạo một câu hỏi tiếng Đức từ từng thẻ (kể cả thẻ là từ hỏi như *wer*), bạn trả lời bằng tiếng Đức rồi AI chấm và giải thích bằng tiếng Việt. Câu trả lời đúng ý, tự nhiên được chấp nhận dù dài hơn hoặc khác cấu trúc đáp án mẫu (ví dụ *Bách ist mein bester Freund.* vẫn đúng dù mẫu là *Das ist Bách.*); với từ hỏi, AI không bắt bạn lặp lại chính từ hỏi đó. Có hai cách xem câu hỏi: **Đọc câu hỏi** (có nút **Nghe lại**; bản dịch và gợi ý tiếng Việt được ẩn sẵn, chỉ hiện khi bấm nút **Dịch và gợi ý**) hoặc **Nghe, không hiện chữ** — câu hỏi chỉ được đọc bằng giọng Đức có sẵn trên thiết bị (Web Speech API), bạn bấm **Nghe lại** nếu cần và có thể bấm **Hiện câu hỏi** khi muốn đối chiếu. Câu hỏi được tải ngầm ngay khi vào thẻ. Giống như chế độ đặt câu, bạn chọn trình độ A1.1 đến B2.2 trước khi bắt đầu, kết quả mỗi thẻ được tính một lần vào thống kê.

Chuẩn bị key (miễn phí):
1. Truy cập https://aistudio.google.com/app/apikey → đăng nhập Google → **Create API key**.
2. Tạo file `.dev.vars` ở thư mục gốc dự án (file này đã được `.gitignore`, không bao giờ commit key):
   ```text
   GEMINI_API_KEY=key_cua_ban
   GEMINI_MODEL=gemini-3.8-flash
   ```
   Có thể copy từ `.dev.vars.example`. Dòng `GEMINI_MODEL` là tùy chọn; nếu bỏ trống Worker dùng `gemini-3.8-flash`. Khi Google đổi tên model, Worker tự thử thêm `gemini-flash-latest` và `gemini-3.5-flash`, với thời gian chờ tối đa 7 giây. Nếu Gemini không dùng được (ví dụ Google chặn region của Cloudflare), Worker tự chuyển sang Cloudflare Workers AI (model mặc định `@cf/mistralai/mistral-small-3.1-24b-instruct`, đổi được bằng secret `WORKERS_AI_MODEL`).

 Để phản hồi nhanh hơn: câu mẫu được tải ngầm ngay khi vào thẻ (trong lúc bạn gõ câu), nên khi bấm sang **Xếp từ thành câu** thường đã có sẵn. Worker còn lưu kết quả đã chấm vào KV theo nội dung (30 ngày): học lại cùng một từ, thử lại cùng một câu hoặc bấm qua lại giữa hai tab sẽ gần như tức thì và không tốn lượt AI. Lần đầu cho một từ hoặc câu mới vẫn cần ~3 giây để gọi AI.
3. Khởi động lại `npm run dev`. Nếu quên khởi động lại, Worker sẽ báo “AI chưa được cấu hình”.

Khi deploy lên Cloudflare (để bản web và ứng dụng Mac dùng được):
```bash
npx wrangler secret put GEMINI_API_KEY
npx wrangler secret put GEMINI_MODEL   # tùy chọn
npm run deploy
```

Lưu ý:
- API key được giữ ở phía Worker, không nhúng vào giao diện hay localStorage. Không đặt key vào biến `VITE_*` vì trình duyệt có thể đọc được.
- Chế độ này **cần Internet**. Các chế độ lật thẻ, trắc nghiệm và OCR vẫn dùng được ngoại tuyến. Nếu AI chấm lỗi nhưng câu mẫu đã được tạo, chế độ xếp từ vẫn tự so khớp câu để tiếp tục bài.
- Free tier có giới hạn số yêu cầu/phút và số yêu cầu/ngày; Worker giới hạn 15 yêu cầu/phút mỗi địa chỉ IP. Khi quá tải, ứng dụng sẽ báo bạn đợi một chút.
- Nội dung câu và từ vựng được gửi tới Google (hoặc Cloudflare Workers AI nếu Gemini bị chặn) để chấm. Đừng dùng chế độ này với dữ liệu riêng tư.
- Nếu bạn từng dán key vào nơi công khai (ví dụ trò chuyện, screenshot), hãy xóa key đó trong Google AI Studio và tạo key mới.

