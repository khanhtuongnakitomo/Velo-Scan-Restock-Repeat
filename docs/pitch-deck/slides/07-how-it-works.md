# Slide 07 — How It Works

**Tiêu chí:** Idea 30% + Feasibility · **Nền:** Cream · **Wireframe:** `charts/out/wireframes/07-how-it-works.png`

## Mục tiêu
Cho thấy luồng vận hành đầy đủ từ lúc xe tới đến lúc tồn kho cập nhật — cụ thể, đi được từng bước, không mơ hồ. Mỗi bước gắn nhãn ai làm: AI / Rule / Human.

## Headline
`ONE DELIVERY. EIGHT STEPS. ONE PHONE.`

## Nội dung trên slide

- **Kicker:** `07 · HOW IT WORKS`
- **Luồng 8 bước** (biểu đồ `s07_workflow`), 2 hàng × 4:

| # | Bước | Nhãn |
|---|---|---|
| 01 | `Expected delivery` — from PO or CSV; no-PO mode | RULE |
| 02 | `Scan delivery note` — OCR extracts lines; receiver confirms | AI |
| 03 | `Scan & count` — barcode/QR; no barcode → search, photo, print QR label | HUMAN |
| 04 | `Live three-way match` — every line turns blue, yellow or red | RULE |
| 05 | `Confirm or flag` — reason + photo; driver co-confirms | HUMAN |
| 06 | `Manager approves` — accept, partial, reject, claim | HUMAN |
| 07 | `Digital goods receipt` — phiếu nhập kho generated | RULE |
| 08 | `Live stock & alerts` — batch, expiry, low stock, supplier accuracy | RULE + AI |

- **Chú giải nhãn:** `● AI  ● RULE  ● HUMAN`
- **Dải dưới:** `Documentation is the by-product of checking — not extra work after it.`

## Bố cục

| Zone | Vị trí | Nội dung |
|---|---|---|
| Header | Trên | Kicker + headline |
| Workflow | Giữa, 12 cột | Ảnh `s07_workflow.png` (2 hàng, mũi tên chữ Z) |
| Screenshot strip (tùy chọn) | Bên phải nếu thu hẹp workflow còn 9 cột | 2 ảnh điện thoại nhỏ: bước 03 và 04 |
| Dải dưới | Dưới cùng | Câu chốt |

## Hình / biểu đồ
- `s07_workflow.png` — 8 ô có số, viền màu theo nhãn (Yellow = AI, Blue = Rule, Ink = Human), mũi tên nối.

## Speaker notes (≈ 60 giây)
> Here is one delivery, end to end. The manager imports the expected delivery — or the receiver starts a no-PO receipt, which is common in Vietnam. The receiver scans the delivery note; AI reads it. Then they scan and count. If a product has no barcode, VELO lets them search, photograph it, and print a QR label on the spot.
> As they count, every line turns blue, yellow or red. Exceptions get a reason and a photo, and the driver confirms on the same phone. The manager approves. VELO generates the goods receipt and updates live stock.
> Notice: the employee never fills in paperwork. The documentation is a by-product of checking.

## Lưu ý
- Nhấn mạnh 2 điểm thích ứng Việt Nam: **no-PO mode** và **hàng không có mã vạch → in QR**.
