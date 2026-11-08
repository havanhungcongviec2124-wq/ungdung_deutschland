import {
  Brain,
  ChevronLeft,
  Check,
  Layers3,
  Pencil,
  Plus,
  Save,
  Search,
  Trash2,
  Upload,
  Volume2,
  X,
} from "lucide-react";
import EmptyState from "./EmptyState";

/* ============================================================
   CARDS PAGE
   ============================================================ */
export function CardsPage({
  currentFolder,
  dailyStats,
  dailyGoal,
  setFolderDailyGoal,
  studyStreak,
  openDailyReview,
  folderCards,
  query,
  setQuery,
  filteredCards,
  openStudySetup,
  openFolderOverview,
  deleteCard,
  speakGerman,
  openImportView,
  openCardForm,
}) {
  return (
    <section>
      {/* ---------- Page heading ---------- */}
      <div className="page-heading">
        <div>
          <div className="eyebrow">THƯ VIỆN TỪ VỰNG</div>
          <h1>{currentFolder?.name || "Tất cả thẻ từ"}</h1>
          <p>Quản lý và ôn tập những từ vựng của bạn.</p>
        </div>

        <div className="heading-actions">
          <button className="btn-secondary" onClick={openFolderOverview}>
            <Layers3 size={17} /> Tổng các từ vựng
          </button>
          <button className="btn-secondary" onClick={openImportView}>
            <Upload size={17} /> Nhập hàng loạt
          </button>
          <button className="btn-primary" onClick={openCardForm}>
            <Plus size={18} /> Tạo thẻ mới
          </button>
        </div>
      </div>

      {/* ---------- Daily review panel ---------- */}
      <div className="daily-review-panel">
        <div className="daily-review-heading">
          <div>
            <div className="eyebrow">THỐNG KÊ HÔM NAY</div>
            <h2>Ôn tập mỗi ngày</h2>
            <p>
              {dailyStats.complete
                ? "Bạn đã hoàn thành mục tiêu hôm nay."
                : "Ôn thẻ mới trong thư mục để hoàn thành mục tiêu."}
            </p>
          </div>

          <label className="daily-goal-control">
            Mục tiêu / ngày
            <input
              type="number"
              min="1"
              max="500"
              value={dailyGoal}
              onChange={(event) => setFolderDailyGoal(event.target.value)}
            />
            <span>thẻ</span>
          </label>
        </div>

        <div className="daily-stats-grid">
          <div>
            <span>Đã ôn hôm nay</span>
            <strong>
              {dailyStats.reviewed} / {dailyStats.required}
            </strong>
          </div>
          <div>
            <span>Đúng / cần ôn lại</span>
            <strong>
              <span className="daily-correct">{dailyStats.correct}</span> /{" "}
              <span className="daily-incorrect">{dailyStats.incorrect}</span>
            </strong>
          </div>
          <div>
            <span>Chuỗi hoàn thành</span>
            <strong>{studyStreak} ngày</strong>
          </div>
        </div>

        <div className="daily-progress-track">
          <div
            style={{
              width: `${
                dailyStats.required
                  ? Math.min(
                      100,
                      (dailyStats.reviewed / dailyStats.required) * 100
                    )
                  : 0
              }%`,
            }}
          />
        </div>

        <button
          className="btn-primary daily-review-button"
          onClick={openDailyReview}
          disabled={!folderCards.length || dailyStats.complete}
        >
          <Brain size={17} />
          {dailyStats.complete
            ? "Đã hoàn thành hôm nay"
            : `Ôn ${Math.max(0, dailyStats.required - dailyStats.reviewed)} thẻ hôm nay`}
        </button>
      </div>

      {/* ---------- Toolbar ---------- */}
      <div className="toolbar">
        <div className="search-box">
          <Search size={17} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm từ vựng hoặc nghĩa..."
          />
        </div>
        <span className="muted">{filteredCards.length} thẻ từ</span>
        <button className="btn-study" onClick={() => openStudySetup(filteredCards)}>
          <Brain size={17} /> Kiểm tra
        </button>
      </div>

      {/* ---------- Vocab list ---------- */}
      {filteredCards.length ? (
        <div className="vocab-grid">
          {filteredCards.map((card) => (
            <article className="vocab-card" key={card.id}>
              <div className="vocab-top">
                <span className="vocab-language">DEUTSCH</span>
                <button
                  className="more-button"
                  onClick={() => deleteCard(card)}
                  title="Xóa thẻ"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="vocab-front-row">
                <div className="vocab-front">{card.front}</div>
                <button
                  className="voice-button"
                  onClick={() => speakGerman(card.front)}
                  title={`Phát âm ${card.front}`}
                  aria-label={`Phát âm ${card.front}`}
                >
                  <Volume2 size={18} />
                </button>
              </div>

              <div className="vocab-bottom">
                <span className="vocab-hint">Nhấn khi ôn tập để lật thẻ</span>
                {card.plural && <span className="plural-tag">{card.plural}</span>}
              </div>

              <div className="vocab-translation">{card.back}</div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Chưa có thẻ từ nào"
          text="Tạo thẻ đầu tiên hoặc nhập danh sách từ vựng có sẵn."
          action={openCardForm}
        />
      )}
    </section>
  );
}

/* ============================================================
   FOLDER OVERVIEW PAGE
   ============================================================ */
export function FolderOverviewPage({
  currentFolder,
  folderCards,
  duplicateWordGroups,
  duplicateCardIds,
  duplicateExtraCount,
  onBack,
  onRemoveDuplicates,
  editingCardId,
  editingCardDraft,
  onEditDraft,
  onSaveEdit,
  onCancelEdit,
  onStartEdit,
  onCreateCard,
}) {
  return (
    <section>
      {/* ---------- Page heading ---------- */}
      <div className="page-heading">
        <div>
          <div className="eyebrow">TỔNG CÁC TỪ VỰNG</div>
          <h1>{currentFolder?.name || "Thư mục"}</h1>
          <p>Xem toàn bộ thẻ và kiểm tra từ bị trùng trong thư mục này.</p>
        </div>
        <button className="btn-secondary" onClick={onBack}>
          <ChevronLeft size={17} /> Quay lại thẻ từ
        </button>
      </div>

      {/* ---------- Toolbar ---------- */}
      <div className="preview-toolbar folder-overview-toolbar">
        <span>
          {folderCards.length} thẻ · {duplicateWordGroups.length} từ bị lặp ·{" "}
          {duplicateExtraCount} thẻ dư
        </span>
        <button
          className="btn-primary"
          onClick={onRemoveDuplicates}
          disabled={!duplicateExtraCount}
        >
          <Check size={17} /> Lưu lại, giữ 1 thẻ mỗi từ
        </button>
      </div>

      {/* ---------- Table ---------- */}
      {folderCards.length ? (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>TỪ VỰNG (MẶT TRƯỚC)</th>
                <th>SỐ NHIỀU</th>
                <th>NGHĨA (MẶT SAU)</th>
                <th>TRẠNG THÁI</th>
                <th>THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {folderCards.map((card) => {
                const duplicate = duplicateCardIds.has(card.id);
                const editing = editingCardId === card.id;

                return (
                  <tr
                    key={card.id}
                    className={duplicate ? "duplicate-row" : ""}
                  >
                    {/* Front */}
                    <td>
                      {editing ? (
                        <input
                          className="folder-edit-input"
                          aria-label="Từ vựng"
                          value={editingCardDraft.front}
                          onChange={(event) =>
                            onEditDraft("front", event.target.value)
                          }
                        />
                      ) : (
                        card.front
                      )}
                    </td>

                    {/* Plural */}
                    <td>
                      {editing ? (
                        <input
                          className="folder-edit-input"
                          aria-label="Số nhiều"
                          value={editingCardDraft.plural}
                          onChange={(event) =>
                            onEditDraft("plural", event.target.value)
                          }
                        />
                      ) : (
                        card.plural || "—"
                      )}
                    </td>

                    {/* Back */}
                    <td>
                      {editing ? (
                        <input
                          className="folder-edit-input"
                          aria-label="Nghĩa"
                          value={editingCardDraft.back}
                          onChange={(event) =>
                            onEditDraft("back", event.target.value)
                          }
                        />
                      ) : (
                        card.back
                      )}
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
                        {duplicate ? "Trùng lặp" : "Không trùng"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td>
                      <div className="folder-edit-actions">
                        {editing ? (
                          <>
                            <button
                              className="icon-button folder-save-button"
                              title="Lưu thay đổi"
                              aria-label="Lưu thay đổi"
                              onClick={() => onSaveEdit(card)}
                            >
                              <Save size={16} />
                            </button>
                            <button
                              className="icon-button"
                              title="Hủy sửa"
                              aria-label="Hủy sửa"
                              onClick={onCancelEdit}
                            >
                              <X size={16} />
                            </button>
                          </>
                        ) : (
                          <button
                            className="icon-button"
                            title={`Sửa ${card.front}`}
                            aria-label={`Sửa ${card.front}`}
                            onClick={() => onStartEdit(card)}
                          >
                            <Pencil size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          title="Thư mục chưa có thẻ"
          text="Thêm thẻ từ hoặc nhập danh sách để bắt đầu."
          action={onCreateCard}
        />
      )}
    </section>
  );
}