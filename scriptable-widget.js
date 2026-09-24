// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: pink; icon-glyph: heart;
/**
 * WIDGET 4X4 (LARGE) CHO IPHONE - COUPLE LOCKET & HABI
 * Hướng dẫn sử dụng:
 * 1. Tải ứng dụng "Scriptable" từ App Store trên iPhone (hoàn toàn miễn phí).
 * 2. Mở Scriptable, bấm dấu [+] ở góc phải trên để tạo script mới.
 * 3. Dán toàn bộ mã nguồn này vào.
 * 4. Ra màn hình chính của iPhone > Nhấn giữ màn hình > Bấm dấu [+] góc trên > Chọn "Scriptable" > Chọn kích thước Lớn (4x4) hoặc Vừa (2x4).
 * 5. Nhấn giữ vào Widget vừa thêm > Chọn "Edit Widget" > Mục Script chọn tên script bạn vừa tạo.
 */

// Đổi đường dẫn này thành link Firebase Database hoặc API của bạn
// Mặc định đang đọc link demo:
const COUPLE_API_URL = "https://your-couple-app.web.app/api/widget.json";

// Dữ liệu dự phòng khi chưa có mạng
const FALLBACK_DATA = {
  photoUrl: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=800&auto=format&fit=crop",
  caption: "Nhớ người yêu quá nè... 💕",
  senderName: "Người Yêu",
  mood: "Đang nhớ bạn 💕",
  moodEmoji: "❤️",
  daysTogether: 520,
  updatedAt: "Vừa xong"
};

async function createWidget() {
  const widget = new ListWidget();
  widget.backgroundColor = new Color("#020617");
  widget.setPadding(16, 16, 16, 16);

  let data = FALLBACK_DATA;
  try {
    const req = new Request(COUPLE_API_URL);
    req.timeoutInterval = 6;
    data = await req.loadJSON();
  } catch (err) {
    console.log("Dùng dữ liệu offline cache: " + err);
  }

  // Tải hình ảnh Locket
  try {
    const imgReq = new Request(data.photoUrl);
    const img = await imgReq.loadImage();
    widget.backgroundImage = img;
  } catch (e) {
    widget.backgroundColor = new Color("#1e1b4b");
  }

  // Header của Widget
  const topRow = widget.addStack();
  topRow.layoutHorizontally();
  topRow.centerAlignContent();

  const badge = topRow.addStack();
  badge.backgroundColor = new Color("#000000", 0.6);
  badge.cornerRadius = 10;
  badge.setPadding(4, 8, 4, 8);
  const badgeText = badge.addText("❤️ " + data.daysTogether + " Ngày Yêu");
  badgeText.font = Font.boldSystemFont(12);
  badgeText.textColor = new Color("#fecdd3");

  topRow.addSpacer();

  const statusBadge = topRow.addStack();
  statusBadge.backgroundColor = new Color("#000000", 0.6);
  statusBadge.cornerRadius = 10;
  statusBadge.setPadding(4, 8, 4, 8);
  const statusText = statusBadge.addText(data.moodEmoji || "✨");
  statusText.font = Font.systemFont(12);

  widget.addSpacer();

  // Footer: Caption & Người gửi
  const bottomCard = widget.addStack();
  bottomCard.layoutVertically();
  bottomCard.backgroundColor = new Color("#000000", 0.75);
  bottomCard.cornerRadius = 16;
  bottomCard.setPadding(10, 12, 10, 12);

  const captionText = bottomCard.addText('"' + data.caption + '"');
  captionText.font = Font.semiboldSystemFont(13);
  captionText.textColor = Color.white();
  captionText.shadowColor = Color.black();
  captionText.shadowRadius = 3;

  bottomCard.addSpacer(3);

  const infoRow = bottomCard.addStack();
  infoRow.layoutHorizontally();
  
  const senderText = infoRow.addText("Bởi " + data.senderName);
  senderText.font = Font.systemFont(10);
  senderText.textColor = new Color("#fda4af");

  infoRow.addSpacer();

  const timeText = infoRow.addText(data.updatedAt || "Mới đây");
  timeText.font = Font.systemFont(10);
  timeText.textColor = new Color("#94a3b8");

  // Chạm vào widget sẽ mở thẳng vào Couple App
  widget.url = "https://your-couple-app.web.app";

  return widget;
}

const widget = await createWidget();
if (config.runsInWidget) {
  Script.setWidget(widget);
} else {
  widget.presentLarge();
}
Script.complete();
