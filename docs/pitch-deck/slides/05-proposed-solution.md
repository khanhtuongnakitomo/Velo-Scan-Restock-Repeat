# Slide 05 — Proposed Solution

**Tiêu chí:** Idea & Creativity 30% · **Nền:** Blue (chuyển cảnh sang giải pháp) · **Wireframe:** `charts/out/wireframes/05-proposed-solution.png`

## Mục tiêu
Một ý duy nhất giám khảo phải nhớ: **Three-Way Match**. Tồn kho chỉ được tạo ra khi 3 nguồn khớp nhau, hoặc khi một người có tên phê duyệt chênh lệch.

## Headline
`STOCK ONLY EXISTS WHEN THREE SOURCES AGREE.`

## Nội dung trên slide

- **Kicker:** `05 · PROPOSED SOLUTION`
- **Phương trình** (biểu đồ `s05_three_way_match`):
  ```
  ORDERED            +   CLAIMED                 +   RECEIVED                 =   VERIFIED STOCK
  Purchase order         Supplier delivery note      Scanned & counted            Digital goods receipt
  What we asked for      What they say arrived       What is actually here        + inventory + audit trail
  ```
- **3 trạng thái:**
  ```
  ● MATCH      All three agree → receiver confirms
  ● ATTENTION  Short, over, near-expiry, no PO → reason required
  ● MISMATCH   Wrong item, damaged → photo + manager approval
  ```
- **Câu chốt:** `VELO turns receiving from paperwork into a control point.`

## Bố cục

| Zone | Vị trí | Nội dung |
|---|---|---|
| Header | Trên | Kicker + headline (chữ trắng trên nền Blue) |
| Phương trình | Giữa, 12 cột, cao ~360 px | Ảnh `s05_three_way_match.png` (nền trong suốt) |
| 3 chip trạng thái | Dưới, 3 cột bằng nhau | Card Paper; chấm Blue / Yellow / Red |
| Câu chốt | Dưới cùng | Chữ trắng, Archivo Black 36 px |

## Hình / biểu đồ
- `s05_three_way_match.png` — 3 khối màu (Cream / Yellow / Paper-viền-Blue) + dấu `+` + khối kết quả Ink. Xuất kèm SVG để phóng to không vỡ.

## Speaker notes (≈ 50 giây)
> Our solution is one simple rule, enforced on a phone at the dock: stock only exists when three sources agree. What we ordered. What the supplier claims on the delivery note. And what the employee actually scans and counts.
> If all three match, the receiver confirms. If something is short, over, or close to expiry, VELO asks for a reason. If an item is wrong or damaged, VELO requires a photo and a manager's approval. Nothing enters inventory by assumption.

## Lưu ý
- Three-way match là thông lệ kiểm soát có sẵn trong nghề kho — điểm sáng tạo là **làm nó khả thi trên điện thoại, ngay tại cửa kho, cho doanh nghiệp nhỏ**, không phải "phát minh" khái niệm.
