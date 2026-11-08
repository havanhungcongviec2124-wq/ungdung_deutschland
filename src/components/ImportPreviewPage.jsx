import { Check, ChevronLeft, Trash2 } from "lucide-react";

export default function ImportPreviewPage({
  validCount,
  newCount,
  duplicateCount,
  folders,
  folderId,
  setFolderId,
  onBack,
  onConfirm,
  rows,
  existingWords,
  normalizeVocabulary,
  onUpdateRow,
  onRemoveRow,
}) {
  return (
    <section>
      {/* ---------- Page heading ---------- */}
      <div className="page-heading">
        <div>
          <div className="eyebrow">KIỂM TRA DỮ LIỆU</div>
          <h1>Xem trước thẻ từ</h1>
          <p>Kiểm tra dữ liệu và các từ đã có trong thư mục trước khi lưu.</p>
        </div>
        <button className="btn-secondary" onClick={onBack}>
          <ChevronLeft size={17} /> Quay lại
        </button>
      </div>

      {/* ---------- Preview toolbar ---------- */}
      <div className="preview-toolbar">
        <span>
          {validCount} thẻ hợp lệ · {newCount} thẻ mới · {duplicateCount} từ đã
          tồn tại
        </span>

        <select
          value={folderId}
          onChange={(event) => setFolderId(event.target.value)}
        >
          {folders.map((folder) => (
            <option key={folder.id} value={folder.id}>
              {folder.name}
            </option>
          ))}
        </select>

        <button className="btn-primary" onClick={onConfirm} disabled={!newCount}>
          <Check size={17} /> Lưu {newCount} thẻ mới
        </button>
      </div>

      {/* ---------- Preview table ---------- */}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>TỪ VỰNG (MẶT TRƯỚC)</th>
              <th>SỐ NHIỀU</th>
              <th>NGHĨA (MẶT SAU)</th>
              <th>TRẠNG THÁI</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              const duplicate = Boolean(
                row.front?.trim() &&
                  row.back?.trim() &&
                  existingWords.has(normalizeVocabulary(row.front))
              );

              return (
                <tr
                  key={index}
                  className={duplicate ? "duplicate-row" : ""}
                >
                  {/* Front */}
                  <td>
                    <input
                      value={row.front}
                      onChange={(event) =>
                        onUpdateRow(index, "front", event.target.value)
                      }
                    />
                  </td>

                  {/* Plural */}
                  <td>
                    <input
                      value={row.plural || ""}
                      onChange={(event) =>
                        onUpdateRow(index, "plural", event.target.value)
                      }
                      placeholder="—"
                    />
                  </td>

                  {/* Back */}
                  <td>
                    <input
                      value={row.back}
                      onChange={(event) =>
                        onUpdateRow(index, "back", event.target.value)
                      }
                    />
                  </td>

                  {/* Status */}
                  <td>
                    <span
                      className={`duplicate-status ${
                        duplicate ? "is-duplicate" : "is-new"
                      }`}
                    >
                      <span className="duplicate-checkbox">
                        {duplicate && <Check size={12} />}
                      </span>
                      {duplicate ? "Đã có" : "Mới"}
                    </span>
                  </td>

                  {/* Remove */}
                  <td>
                    <button
                      className="icon-button danger"
                      onClick={() => onRemoveRow(index)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}