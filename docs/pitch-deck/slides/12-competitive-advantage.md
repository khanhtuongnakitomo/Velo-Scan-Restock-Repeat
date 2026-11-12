# Slide 12 — Competitive Advantage

**Tiêu chí:** Idea & Creativity — "Ý tưởng có khác biệt? Có cải thiện cách làm hiện tại?" · **Nền:** Cream · **Wireframe:** `charts/out/wireframes/12-competitive-advantage.png`

## Mục tiêu
Trả lời câu "khác gì phần mềm quản lý kho đang có?" Định vị VELO: **kiểm chứng sâu tại cửa kho** nhưng **nhẹ, rẻ, triển khai nhanh**.

## Headline
`DEEPER THAN A CHECKLIST. LIGHTER THAN A WMS.`

## Nội dung trên slide

- **Kicker:** `12 · COMPETITIVE ADVANTAGE`
- **Bản đồ định vị** (biểu đồ `s12_positioning`): trục X = `Cost & setup effort` (thấp → cao), trục Y = `Verification depth at the dock` (thấp → cao). 4 nhóm:
  - `Paper + Excel` — thấp / thấp
  - `SME sales & inventory apps` — thấp / trung bình-thấp
  - `Enterprise WMS / ERP` — cao / cao
  - `VELO` — thấp / cao ← góc mục tiêu
  - Nhãn: `TEAM ASSESSMENT`
- **Bảng so sánh:**

| | Paper + Excel | SME inventory apps | Enterprise WMS | **VELO** |
|---|---|---|---|---|
| `Three-way match at the dock` | ✗ | `[VERIFY]` | ✓ | ✓ |
| `Evidence per discrepancy (photo, driver)` | ✗ | `[VERIFY]` | Partial | ✓ |
| `Works without supplier barcodes` | ✓ | `[VERIFY]` | ✗ | ✓ |
| `Reads Vietnamese delivery notes (AI)` | ✗ | `[VERIFY]` | ✗ | ✓ |
| `Setup time` | `None` | `Days` | `Months` | `Days` |
| `Extra hardware` | `None` | `Optional` | `Scanners` | `None` |

- **3 lý do chọn VELO (dải dưới):**
  ```
  01 Verification, not just recording
  02 Built for messy Vietnamese reality — no barcode, no PO, handwritten notes
  03 Phone-first: no hardware, days to deploy, works beside Excel
  ```

## Bố cục

| Zone | Vị trí | Nội dung |
|---|---|---|
| Header | Trên | Kicker + headline |
| Bản đồ định vị | Trái, 5 cột | Ảnh `s12_positioning.png` |
| Bảng so sánh | Phải, 7 cột | Bảng; cột VELO nền Yellow |
| 3 lý do | Dưới cùng, 3 ô | Số Archivo Black + câu ngắn |

## Hình / biểu đồ
- `s12_positioning.png` — scatter 4 nhóm, VELO hero (viền đỏ), góc "low cost / high verification" tô nhạt.

## ⚠ Việc bắt buộc trước khi nộp
Các ô `[VERIFY]` là **chưa kiểm chứng**. Phần mềm bán hàng & quản lý kho phổ biến cho SME tại Việt Nam (ví dụ KiotViet, MISA, Sapo) **có thể đã có** chức năng nhập kho, đối chiếu đơn đặt hàng, hoặc quét mã. Trước khi nộp:
1. Xem trang tính năng chính thức / dùng thử bản miễn phí của 2–3 phần mềm.
2. Điền ✓ / ✗ / Partial đúng sự thật vào bảng.
3. Nếu họ đã có đối chiếu PO, sửa luận điểm thành: VELO khác ở **bằng chứng tại cửa kho (ảnh, tài xế xác nhận), AI đọc phiếu giao hàng, hàng không có mã vạch** — và có thể **tích hợp** với các phần mềm đó thay vì cạnh tranh.
4. Không nêu tên thương hiệu cụ thể trên slide nếu chưa kiểm chứng; dùng tên nhóm ("SME inventory apps").

## Speaker notes (≈ 50 giây)
> Where does VELO sit? Paper and Excel cost nothing but verify nothing. Enterprise warehouse systems verify deeply, but take months and dedicated scanners. SME sales and inventory apps record stock well [adjust after verification].
> VELO aims for the empty corner: deep verification at the dock, at the cost and speed of a phone app. It is built for Vietnamese reality — goods without barcodes, deliveries without a PO, handwritten notes. And it works beside the tools businesses already use.

## Lưu ý
- Câu hỏi "khác gì KiotViet/MISA?" gần như chắc chắn xuất hiện ở Q&A. Chuẩn bị câu trả lời trong `A-appendix.md`.
