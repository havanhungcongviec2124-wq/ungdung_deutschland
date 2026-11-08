import {
  CircleHelp,
  FileText,
  ImagePlus,
  Sparkles,
  Upload,
  X,
} from "lucide-react";

export default function ImportPage({
  bulkText,
  setBulkText,
  onParse,
  onFile,
  onImages,
  onRecognizeImages,
  selectedImages,
  onRemoveImage,
  onClearImages,
  fileRef,
  imageRef,
  loading,
}) {
  return (
    <section>
      {/* ---------- Page heading ---------- */}
      <div className="page-heading">
        <div>
          <div className="eyebrow">THÊM NHIỀU TỪ CÙNG LÚC</div>
          <h1>Nhập hàng loạt</h1>
          <p>Tiết kiệm thời gian bằng cách nhập văn bản, file hoặc ảnh chụp.</p>
        </div>
      </div>

      {/* ---------- Import methods ---------- */}
      <div className="import-methods">
        {/* --- Paste text --- */}
        <div className="import-card">
          <div className="import-card-icon purple-bg">
            <FileText size={22} />
          </div>
          <h3>Dán văn bản</h3>
          <p>Nhập danh sách từ vựng theo từng dòng.</p>
          <textarea
            value={bulkText}
            onChange={(event) => setBulkText(event.target.value)}
            rows="9"
            placeholder={
              "der Fehler | die Fehler | Lỗi, sai sót\ndie Prüfung | die Prüfungen | Kỳ thi\ndas Geschenk | die Geschenke | Món quà\nstattfinden | | diễn ra"
            }
          />
          <div className="format-hint">
            Định dạng: <b>Từ vựng | Số nhiều | Nghĩa</b>
          </div>
          <button className="btn-primary full" onClick={onParse}>
            <Sparkles size={17} /> Phân tích văn bản
          </button>
        </div>

        {/* --- Upload file --- */}
        <div className="import-card">
          <div className="import-card-icon green-bg">
            <Upload size={22} />
          </div>
          <h3>Tải file lên</h3>
          <p>Hỗ trợ file TXT và CSV có 2 hoặc 3 cột.</p>
          <div className="upload-zone" onClick={() => fileRef.current?.click()}>
            <Upload size={25} />
            <strong>Chọn file từ thiết bị</strong>
            <span>TXT, CSV</span>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".txt,.csv,text/plain,text/csv"
            hidden
            onChange={(event) => onFile(event.target.files?.[0])}
          />
          <div className="format-hint">
            CSV có thể dùng tiêu đề: front, plural, back.
          </div>
        </div>

        {/* --- Recognize images --- */}
        <div className="import-card">
          <div className="import-card-icon orange-bg">
            <ImagePlus size={22} />
          </div>
          <h3>Nhận diện từ ảnh</h3>
          <p>
            Chọn nhiều ảnh cùng lúc hoặc thêm ảnh qua nhiều lần chọn. OCR chạy
            ngay trong trình duyệt, không gửi ảnh lên dịch vụ AI bên ngoài.
          </p>

          <div
            className="upload-zone image-zone"
            onClick={() => imageRef.current?.click()}
          >
            <ImagePlus size={25} />
            <strong>
              {selectedImages.length ? "Chọn thêm ảnh" : "Chọn ảnh để nhận diện"}
            </strong>
            <span>PNG, JPG, WEBP · có thể thêm ảnh nhiều lần</span>
          </div>

          <input
            ref={imageRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(event) => {
              onImages(event.target.files);
              event.target.value = "";
            }}
          />

          {/* Selected image list */}
          {selectedImages.length > 0 && (
            <>
              <div className="selected-image-heading">
                <strong>{selectedImages.length} ảnh đã chọn</strong>
                <button
                  className="link-button"
                  type="button"
                  onClick={onClearImages}
                  disabled={loading}
                >
                  Bỏ tất cả
                </button>
              </div>
              <div className="selected-image-list">
                {selectedImages.map((file, index) => (
                  <div
                    className="selected-image-row"
                    key={`${file.name}-${file.lastModified}-${index}`}
                  >
                    <span>{file.name}</span>
                    <button
                      className="icon-button"
                      type="button"
                      aria-label={`Bỏ ảnh ${file.name}`}
                      onClick={() => onRemoveImage(index)}
                      disabled={loading}
                    >
                      <X size={15} />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          <button
            className="btn-primary full"
            type="button"
            onClick={onRecognizeImages}
            disabled={!selectedImages.length || loading}
          >
            <ImagePlus size={17} /> Nhận diện{" "}
            {selectedImages.length
              ? `${selectedImages.length} ảnh`
              : "ảnh đã chọn"}
          </button>
          <div className="format-hint">
            Tự tách bảng theo hàng và cột, gộp kết quả các ảnh vào một bảng xem
            trước. Ảnh chụp thẳng, rõ chữ cho kết quả tốt hơn.
          </div>
        </div>
      </div>

      {/* ---------- Format example ---------- */}
      <div className="import-example">
        <div className="example-icon">
          <CircleHelp size={18} />
        </div>
        <div>
          <strong>Ví dụ định dạng văn bản</strong>
          <p>
            Mỗi dòng một thẻ. Dùng dấu <code>|</code> hoặc phím Tab để tách các
            cột. Nếu chỉ có 2 cột, nhập từ và nghĩa.
          </p>
        </div>
      </div>
    </section>
  );
}