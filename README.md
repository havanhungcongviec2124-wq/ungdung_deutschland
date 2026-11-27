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

Logo dùng chung cho thanh bên, favicon và icon cài đặt được lấy từ `img/logo.png`. Mỗi lần nội dung file logo đổi, bản build tự tạo mã phiên bản mới cho toàn bộ đường dẫn logo/icon. Nút **Cập nhật ứng dụng** sẽ dọn cache cũ, tải lại trang và nhờ đó logo trên web lẫn icon link/install đều đổi theo ngay mà không cần sửa tay hay xóa dữ liệu.

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
- Trên tablet và điện thoại (màn hình ≤1366px, gồm cả iPad Pro ngang), mọi chữ hiển thị — kể cả nhãn như **KHÔNG GIAN HỌC TẬP**, ghi chú, nút và bảng — đều có cỡ tối thiểu 14px để dễ đọc.

## 8. Luyện đặt câu, hỏi – đáp, luyện nói và luyện viết bằng AI miễn phí (Google Gemini)
Cả hai chế độ **Đặt câu với AI** và **Hỏi – đáp với AI** gửi từ vựng, trình độ bạn đã chọn và câu của bạn tới Gemini (free tier) qua Worker của ứng dụng. Trình độ (A1.1 đến B2.2) được dùng cho cả câu mẫu lẫn phần chấm điểm: AI chỉ bắt lỗi các cấu trúc phù hợp, không trừ điểm vì bạn chưa dùng cấu trúc cao hơn. AI trả về đúng/sai, câu đã sửa và giải thích ngắn bằng tiếng Việt. Khoảng trắng thừa trước dấu câu (như `machen ?` thay vì `machen?`) chỉ được coi là lỗi định dạng nhỏ, không làm câu bị chấm sai; phần “Câu đúng” sẽ hiện bản đã bỏ dấu cách thừa. Có hai cách làm bài: gõ câu tự do hoặc xếp các từ đã xáo trộn theo thứ tự đúng. Sau khi AI chấm, bạn có thể chuyển sang tab kia để làm lại cùng một từ, hoặc bấm **Câu tiếp theo** nếu không muốn làm nữa; chỉ kết quả gần nhất của mỗi từ được tính vào thống kê. Trình độ chọn lần trước được lưu trên thiết bị để lần sau không phải chọn lại, nhưng bạn luôn có thể đổi trong bước trước khi bắt đầu.

Ở chế độ **Hỏi – đáp với AI**, AI tạo một câu hỏi tiếng Đức từ từng thẻ (kể cả thẻ là từ hỏi như *wer*), bạn trả lời bằng tiếng Đức rồi AI chấm và giải thích bằng tiếng Việt. Câu trả lời đúng ý, tự nhiên được chấp nhận dù dài hơn hoặc khác cấu trúc đáp án mẫu (ví dụ *Bách ist mein bester Freund.* vẫn đúng dù mẫu là *Das ist Bách.*); với từ hỏi, AI không bắt bạn lặp lại chính từ hỏi đó. Có hai cách xem câu hỏi: **Đọc câu hỏi** (có nút **Nghe lại**; bản dịch và gợi ý tiếng Việt được ẩn sẵn, chỉ hiện khi bấm nút **Dịch và gợi ý**) hoặc **Nghe, không hiện chữ** — câu hỏi chỉ được đọc bằng giọng Đức có sẵn trên thiết bị (Web Speech API), bạn bấm **Nghe lại** nếu cần và có thể bấm **Hiện câu hỏi** khi muốn đối chiếu. Câu hỏi được tải ngầm ngay khi vào thẻ. Giống như chế độ đặt câu, bạn chọn trình độ A1.1 đến B2.2 trước khi bắt đầu, kết quả mỗi thẻ được tính một lần vào thống kê.

Ở mục **Luyện nói** trên thanh điều hướng, 49 chủ đề **Goethe-Zertifikat A2 Sprechen Teil 2** (trích từ file PDF đính kèm) được hiển thị sẵn trong danh sách, tối đa **20 đề tài mỗi trang** (có nút chọn trang/trang trước/trang sau); bạn bấm vào đề bất kỳ là luyện ngay; nút **Kiểm tra random** chọn ngẫu nhiên một đề trong toàn bộ danh sách (kể cả đề tự thêm). Nút **Thêm đề tài** chỉ dùng để tự nhập câu hỏi và các gợi ý, hoặc bấm **Từ PDF / Word** để đọc đề tài trực tiếp từ tệp `.pdf`, `.docx`, `.txt` trên thiết bị (tệp không được gửi lên máy chủ; danh sách tách được xem lại và sửa từng đề tài trước khi thêm). Đề tài lưu tại `wortkarte.speaking.v1`; mọi thẻ đề đều có nút xóa và luôn hiện hộp thoại xác nhận trước khi xóa. Đề thư viện khi xóa chỉ bị ẩn, có thể khôi phục lại trong bảng Tổng hợp các đề. Mỗi đề tài hiện dạng văn bản gồm câu hỏi chính và các dòng gợi ý, ví dụ *Was machen Sie gern am Sonntag? / - Freunde treffen? / - Hobbys? / - Lange schlafen? / - Fernsehen?*. Bấm vào một đề tài, viết câu trả lời tiếng Đức rồi **Nộp câu trả lời**: AI chấm theo trình độ cố định A2 và giải thích bằng tiếng Việt, đồng thời tạo từ 1 đến 6 câu hỏi phụ đúng chủ đề. Tất cả câu hỏi phụ hiện cùng lúc; mỗi câu có ô nhập riêng, nút **Dịch và gợi ý** (có thể ẩn lại) và nút **Chấm điểm** riêng.

Cả bốn nút **Tổng hợp các đề**, **Kiểm tra random**, **Tạo đề từ AI** và **Thêm đề tài** có trong trang **Luyện nói** khi đang ở danh sách đề hoặc bảng **Tổng hợp các đề**; khi bấm vào một đề để làm thì 4 nút này được ẩn đi, chỉ giữ nút **Danh sách đề tài**. Hành vi này áp dụng đồng nhất cho **Luyện nói**, **Thống nhất lịch trình** và **Luyện viết SMS và Thư**: đang làm đề thì không còn 4 nút quản lý đề, muốn dùng lại thì bấm quay về danh sách. Nút **Tạo đề từ AI** sinh ngay một đề mới gồm 1 câu hỏi tiếng Đức và đúng 4 gợi ý cùng mẫu Goethe, mở luôn để làm bài. Mỗi lần bấm Worker chọn ngẫu nhiên một nhóm chủ đề khác nhau (ăn uống, du lịch, công việc, sức khỏe, nhà ở, công nghệ, trường học, động vật, tiền bạc, thời tiết, thành phố...), tránh lặp kiểu đề “cuối tuần” và không dùng các từ `Wochenende`, `Sonntag`, `Samstag`, `Freitagabend`. Ngay khi đề hiện ra đã có nút **Lưu đề tài** và **Xóa đề tài** (có hộp thoại xác nhận); bạn có thể lưu ngay hoặc làm xong rồi mới lưu. Đề được lưu sẽ xuất hiện trong danh sách với nhãn *(đề do AI tạo)*, kể cả trong bảng Tổng hợp; nếu chọn xóa thì đề không được lưu. Nút **Tổng hợp các đề** mở ngay một bảng trong trang (không phải cửa sổ popup) gộp toàn bộ thư viện Goethe A2 và các đề tài bạn tự thêm (đã bỏ trùng câu hỏi); bấm biểu tượng bút chì để sửa câu hỏi và các gợi ý của từng đề (kể cả đề Goethe có sẵn), thay đổi được lưu trên thiết bị và dùng luôn trong danh sách Luyện nói — đề thư viện có nút **Khôi phục đề gốc** nếu muốn quay lại bản gốc. Chọn một hoặc nhiều đề tài rồi **Tạo link chia sẻ**, hoặc bấm **Xóa đã chọn** (cũng có hộp thoại xác nhận) để xóa nhiều đề cùng lúc; nút **Khôi phục N đề đã xóa** đưa các đề thư viện đã xóa trở lại. Ai có link có thể dán vào mục **Thêm bằng link chia sẻ** (cùng ô nhận link thư mục từ vựng) hoặc mở trực tiếp link `#sp=...`, xem trước rồi **Thêm vào luyện nói**; đề tài trùng sẽ tự động được bỏ qua. Dữ liệu chia sẻ được nén/mã hóa để tạo URL, lưu qua Worker giống link thư mục, và là bản sao tại thời điểm tạo link.

Mục **Thống nhất lịch trình** trên thanh điều hướng là một khu vực luyện nói riêng, lấy dữ liệu trực tiếp từ 16 ảnh phiếu bài tập/lịch trong thư mục dự án (`Findet einen Termin`, `Wann könnt ihr euch treffen?`, lịch tuần, lịch tháng/ferien). 19 đề tài gồm: lịch Sonnabend của hai người (joggen, Anja im Café, Geburtstagsparty, Rock-Konzert / Gitarre spielen, Bäcker, Radtour im Wald, bei Paul zu Mittag essen, Handy zur Reparatur), lịch Freitag của hai người (länger schlafen, mit Mario skaten, Bibliothek, Abendessen kochen, Kino…) và lịch cả tuần (Basketballtraining, Englischunterricht, Test lernen, Oma besuchen, Annas Geburtstagsparty…). 14 đề mới được thêm từ 16 ảnh: Samstag 08.12. (Einkaufen, Zimmer aufräumen, Fußball-Training, Zahnarzt…), Wochenplan thứ hai (Mathe-Test, Sportschuhe, Volleyballtraining…), Samstag 10.05. (ausschlafen, Recycling, Olaf, Oma…), Dienstag 27.03. (Schulausflug, Friseur, Fahrrad, Fitness-Studio), hai lịch Sommer (Abschlussprüfungen, Urlaub, Brieffreundin, Computerkurs…), hai lịch Ferien/Tết (Geschenke, Partyvorbereitung, Bergwanderung, Reise nach Wien…), Montag 12.07. (Schule, AG Sport, Musik hören) và hai lịch Mittwoch 29.08. (Kindergarten, Geburtstagsgeschenk, Basketball, Pizza…). Danh sách đề chỉ hiện dạng tóm tắt, tối đa **12 đề tài mỗi trang** (có nút chọn trang/trang trước/trang sau); khi bấm vào một đề để kiểm tra mới hiện **bảng lịch chi tiết**: cột giờ liệt kê từng mốc (08.00, 09.00… 21.00), hoạt động được ghi rõ dải `08.00 – 09.00`, `16.00 – 18.00`… và ô ghép nhiều dòng cho hoạt động kéo dài nhiều giờ (ô trống hiện `frei`); Wochenplan dùng bảng `Tag / Termin` kèm buổi trong ngày. Trong trang làm bài, ô “Câu trả lời của bạn” được thay bằng **hội thoại chốt lịch**: ngẫu nhiên AI hoặc bạn mở lời trước, hai bên thay phiên bằng tiếng Đức; mọi câu trong hội thoại đều hiện bằng tiếng Đức (chữ tối thiểu 16px); tiếng Việt chỉ hiện khi bạn bấm nút **Dịch** trên từng câu, gồm bản dịch và nhận xét ngắn của AI. Khi thống nhất được thời điểm thì hiện thông báo **Đã chốt lịch!**. Có nút **Đổi lượt mở lời** để luyện lại. Khu vực này có riêng nút **Thêm đề tài**, **Tổng hợp các đề**, **Kiểm tra random**, **Tạo đề từ AI**, phân trang 20 đề/trang, xóa có xác nhận và khôi phục đề thư viện đã xóa. Khi **Thêm đề tài**, nhập từng dòng `08.00 – 09.00: länger schlafen` (hoặc `08.00: joggen` cho một giờ) kèm tên lịch; bảng và hội thoại được dựng từ các dải giờ đó, cũng hỗ trợ đọc từ PDF/Word/TXT. **Tổng hợp các đề** sửa theo đúng định dạng này. Nút **Tạo đề từ AI** ở khu vực này cũng bắt AI trả 4 dải giờ dạng `HH.MM – HH.MM: Aktivität?`, nên đề vừa tạo mở ra là có bảng lịch ngay. Dữ liệu được lưu riêng tại `wortkarte.speaking.schedule.v1`, không làm ảnh hưởng đến 49 đề Goethe A2 ở trên.

Ở mục **Luyện viết SMS và Thư**, 120 đề **Goethe-Zertifikat A2 Schreiben** được trích từ toàn bộ 60 Test × 2 Teil của tài liệu `NOI VIET A2` (58 đề SMS, 62 đề E-Mail), hiển thị dạng lưới **20 đề/trang** với **Kiểm tra random** luôn sẵn và nút **Thêm đề tài** sát phải; khi mở đề để làm (kể cả cặp random Teil 1 + Teil 2) thì 4 nút quản lý đề biến mất, chỉ còn **Danh sách đề tài**. Bấm **Kiểm tra random** sẽ hiện 3 lựa chọn: **Đề SMS teil 1**, **Đề Email teil 2** và **Cả SMS và Email**; riêng lựa chọn cuối chọn ngẫu nhiên một Test rồi mở luôn một trang làm bài với cả Teil 1 ở trên và Teil 2 ở dưới của chính Test đó (ví dụ trúng Test 21 thì chỉ hiện Test 21 · Teil 1 và Test 21 · Teil 2); hai phần có ô nhập và nút **Chấm điểm Teil 1 / Chấm điểm Teil 2** riêng, chấm độc lập không cần quay lại danh sách hay cuộn tới đề. Mỗi đề có đề bài tiếng Đức, dạng bài, khoảng số từ và đúng 3 ý cần viết; bấm vào đề để mở ô soạn, gõ bài tiếng Đức rồi **Nộp bài chấm điểm**. AI chấm theo 3 ý, độ dài, ngữ pháp/chính tả và đúng định dạng SMS/E-Mail, trả điểm 0–10, từng ý đạt/chưa, bài gợi ý đã sửa và giải thích bằng tiếng Việt; chấp nhận bài đúng ý nhưng diễn đạt khác mẫu, không trừ điểm vì dấu cách thừa trước dấu câu. Về số từ: **dưới 15 từ mới bị lỗi độ dài**; từ 15 từ trở lên là đạt, kể cả khi bạn viết dài hơn khoảng khuyến nghị 20–30 / 30–40 từ của đề — AI không bắt rút gọn, không trừ điểm và cũng **không nhắc đến số từ trong phần giải thích** khi bài đã đạt độ dài. Trên giao diện, khoảng 20–30 / 30–40 chỉ được ghi là **khuyến nghị**, bộ đếm hiện số từ thuần túy và chỉ chuyển sang màu cảnh báo kèm yêu cầu “cần tối thiểu 15 từ” khi bài dưới 15 từ. Trang có **Tổng hợp các đề** để sửa/xóa/khôi phục đề và nút **Tạo đề từ AI** cũng mở menu với đúng 3 lựa chọn như **Kiểm tra random**: **Đề SMS teil 1**, **Đề Email teil 2** và **Cả SMS và Email**. Mỗi đề AI gồm 1 đề bài + đúng 3 ý, mở ngay để làm; riêng lựa chọn cuối tạo hai đề cùng lúc và mở trang làm bài ghép Teil 1 SMS + Teil 2 E-Mail, mỗi phần có ô nhập và nút chấm điểm riêng. Các nút **Lưu đề tài / Xóa đề tài** hiện ngay (với cặp là **Lưu 2 đề / Xóa đề tài**), đề lưu có nhãn *(đề do AI tạo)*). Kho đề viết lưu riêng tại `wortkarte.writing.v1`, không lẫn với 49 đề nói hay 19 đề lịch trình; bài viết chỉ được gửi tới AI để chấm, không lưu vào thiết bị. Trình độ chấm cố định `A2.2`.

Tiến độ làm bài được ghi riêng cho từng khu vực tại `wortkarte.practice.v1` trên thiết bị: sau khi bạn nộp câu trả lời / bài viết hoặc chốt lịch xong, đề đó được tính **1 lần**. Khi quay ra danh sách, thẻ đề hiện huy hiệu xanh **Đã làm · N lần**; nếu làm lại thì hiện thêm **· làm lại N-1**. Thông tin này cũng hiện trong dòng mô tả của bảng **Tổng hợp các đề**. Số lần chỉ cập nhật khi bài được chấm (hoặc hội thoại chốt lịch thành công), không tăng khi bạn chỉ mở đề rồi thoát ra; ba mục **Luyện nói**, **Thống nhất lịch trình** và **Luyện viết SMS và Thư** đếm độc lập, kể cả đề do AI tạo. Dữ liệu này không đồng bộ giữa các máy.

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

