# Slide 09 — MVP Scope

**Tiêu chí:** Feasibility · **Nền:** Paper · **Wireframe:** `charts/out/wireframes/09-mvp-scope.png`

## Mục tiêu
Chứng minh team biết cắt phạm vi: MVP chỉ chứng minh **một luồng trọn vẹn**, với công nghệ đơn giản, chạy trên điện thoại sẵn có. Giám khảo phải tin "team này làm được".

## Headline
`THE MVP PROVES ONE FLOW, END TO END.`

## Nội dung trên slide

- **Kicker:** `09 · MVP SCOPE & FEASIBILITY`
- **Câu mục tiêu MVP:** `A delivery can be received, verified, documented and reflected in live stock — with every discrepancy evidenced.`
- **Cột IN MVP (chip Yellow):**
  ```
  ✓ Expected delivery — manual, CSV, or no-PO
  ✓ Delivery-note OCR with receiver confirmation
  ✓ Barcode scan + search/photo/QR fallback
  ✓ Live three-way match per line
  ✓ Damage photo + structured reasons
  ✓ Manager approval queue
  ✓ Auto-generated digital goods receipt
  ✓ Live stock, batch, expiry, audit trail
  ```
- **Cột LATER (chip Red, chữ mờ hơn):**
  ```
  Put-away guidance · POS/sales sync · Demand forecasting
  Multi-warehouse transfers · Full ERP integration · Auto payments
  ```
- **Kiến trúc** (biểu đồ `s09_architecture`): `Receiver phone (web app) → VELO backend → database`; `AI service (OCR + SKU matching)`; `Manager dashboard`; `CSV in/out ↔ Excel/accounting`.
- **3 con số khả thi (dải dưới):**
  ```
  0 new hardware — employees' own phones
  CSV in/out — works beside Excel from day one
  [FILL: X] days — to set up one warehouse (pilot estimate)
  ```

## Bố cục

| Zone | Vị trí | Nội dung |
|---|---|---|
| Header | Trên | Kicker + headline + câu mục tiêu |
| IN MVP | Trái, 4 cột | Card list 8 dòng |
| LATER | Trái dưới, 4 cột | Card nhỏ, chữ Muted |
| Kiến trúc | Phải, 8 cột | Ảnh `s09_architecture.png` |
| Dải con số | Dưới cùng, 3 ô | Con số Archivo Black + mô tả |

## Hình / biểu đồ
- `s09_architecture.png` — sơ đồ khối: điện thoại, backend, DB, AI service, dashboard, CSV. Khối AI màu Yellow, còn lại Paper viền Ink.

## Speaker notes (≈ 50 giây)
> We cut the MVP to one claim: a delivery can be received, verified, documented and reflected in live stock. That means eight capabilities — and a clear list of what waits.
> The architecture is deliberately boring: a mobile web app on the phones employees already own, one backend, one database, and an AI service for reading documents. CSV import and export means VELO works next to Excel from day one — no ERP project needed.

## Lưu ý
- Nếu đến lúc nộp đã có một phần MVP chạy thật, ghi rõ phần nào **đã chạy**, phần nào **đang làm** — đừng gộp chung.
- Ước tính số ngày setup `[FILL]` phải có cơ sở (ví dụ: nhập catalogue top 200 SKU + 1 buổi đào tạo). Không chắc → bỏ ô thứ 3.
