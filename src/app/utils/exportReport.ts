import { DashboardStats, ActivityItem } from '../api';

/**
 * Tạo một báo cáo hoạt động dạng HTML in được và mở hộp thoại in của trình duyệt
 * (người dùng chọn "Lưu thành PDF"). Cách này không cần thư viện ngoài và hiển thị
 * tiếng Việt chính xác.
 */
export function exportAdminReportPDF(
  stats: DashboardStats | undefined,
  activity: ActivityItem[] = []
) {
  const now = new Date().toLocaleString('vi-VN');
  const s = stats;

  const statRows = [
    ['Tổng người dùng', s?.total_users ?? 0],
    ['Người dùng hoạt động', s?.active_users ?? 0],
    ['Người dùng bị khóa', s?.banned_users ?? 0],
    ['Tổng ảnh', s?.total_photos ?? 0],
    ['Ảnh chờ duyệt', s?.photos_by_status?.pending ?? 0],
    ['Ảnh đã duyệt', s?.photos_by_status?.approved ?? 0],
    ['Ảnh bị từ chối', s?.photos_by_status?.rejected ?? 0],
    ['Tổng lượt thích', s?.total_likes ?? 0],
    ['Tổng bình luận', s?.total_comments ?? 0],
    ['Báo cáo chờ xử lý', s?.pending_reports ?? 0],
  ]
    .map(
      ([label, val]) =>
        `<tr><td>${label}</td><td style="text-align:right;font-weight:600">${Number(
          val
        ).toLocaleString('vi-VN')}</td></tr>`
    )
    .join('');

  const tagRows =
    (s?.top_tags || [])
      .map((t) => `<li>#${escapeHtml(t.name)} <span class="muted">(${t.count})</span></li>`)
      .join('') || '<li class="muted">Chưa có dữ liệu</li>';

  const activityRows =
    activity
      .map(
        (a) =>
          `<tr><td>${escapeHtml(a.user)}</td><td>${escapeHtml(a.action)} ${escapeHtml(
            a.target || ''
          )}</td><td class="muted">${a.created_at ? new Date(a.created_at).toLocaleString('vi-VN') : ''}</td></tr>`
      )
      .join('') || '<tr><td colspan="3" class="muted">Chưa có hoạt động</td></tr>';

  const html = `<!doctype html>
<html lang="vi"><head><meta charset="utf-8"><title>Báo cáo hoạt động - PhotoShare</title>
<style>
  * { font-family: 'Segoe UI', Arial, sans-serif; }
  body { color: #1f2937; margin: 32px; }
  h1 { font-size: 22px; margin: 0 0 4px; }
  h2 { font-size: 15px; margin: 24px 0 8px; color: #6d28d9; border-bottom: 2px solid #ede9fe; padding-bottom: 4px; }
  .muted { color: #9ca3af; }
  .sub { color: #6b7280; font-size: 12px; margin-bottom: 16px; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  td, th { padding: 6px 8px; border-bottom: 1px solid #f3f4f6; }
  ul { columns: 2; font-size: 13px; }
  .brand { display:inline-block;width:14px;height:14px;border-radius:4px;background:linear-gradient(135deg,#a855f7,#ec4899);vertical-align:-2px;margin-right:6px; }
  @media print { body { margin: 12mm; } }
</style></head>
<body>
  <h1><span class="brand"></span>Báo Cáo Hoạt Động – PhotoShare Community</h1>
  <div class="sub">Xuất lúc: ${now}</div>

  <h2>Thống kê tổng quan</h2>
  <table><tbody>${statRows}</tbody></table>

  <h2>Thẻ phổ biến</h2>
  <ul>${tagRows}</ul>

  <h2>Hoạt động gần đây</h2>
  <table>
    <thead><tr><th style="text-align:left">Người dùng</th><th style="text-align:left">Hành động</th><th style="text-align:left">Thời gian</th></tr></thead>
    <tbody>${activityRows}</tbody>
  </table>

  <script>window.onload = function(){ window.print(); }</script>
</body></html>`;

  const win = window.open('', '_blank', 'width=900,height=700');
  if (!win) {
    alert('Trình duyệt đã chặn cửa sổ in. Vui lòng cho phép pop-up để xuất PDF.');
    return;
  }
  win.document.open();
  win.document.write(html);
  win.document.close();
}

function escapeHtml(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
