# Slide 11 — Risks & Mitigation

**Tiêu chí:** Feasibility + yêu cầu BTC "xem xét tính bảo mật, độ tin cậy và các rủi ro khi sử dụng AI" · **Nền:** Paper · **Wireframe:** `charts/out/wireframes/11-risks-mitigation.png`

## Mục tiêu
Chủ động nêu điểm yếu trước khi giám khảo hỏi, và cho thấy mỗi rủi ro đều có cách xử lý trong sản phẩm. Kèm nguyên tắc AI có trách nhiệm.

## Headline
`WE KNOW WHERE VELO CAN FAIL — AND HOW WE CONTAIN IT.`

## Nội dung trên slide

- **Kicker:** `11 · RISKS, RELIABILITY & RESPONSIBLE AI`
- **Ma trận rủi ro** (biểu đồ `s11_risk_matrix`): trục X = Likelihood, trục Y = Impact, mỗi chấm là một rủi ro, màu theo trạng thái xử lý (Blue = có trong MVP, Yellow = một phần, Red = lộ trình). Nhãn: `TEAM ASSESSMENT`.
- **Bảng 4 rủi ro chính:**

| Risk | Mitigation |
|---|---|
| `Goods without barcodes` | `Search + photo + print internal QR at receiving` |
| `Messy, handwritten delivery notes` | `OCR always confirmed by a person; matching learns` |
| `Staff feel monitored` | `The record protects the receiver; supplier facts, not blame` |
| `Poor signal in the yard` | `Offline-tolerant sessions (roadmap — not in MVP demo)` |

- **Card Responsible AI:**
  ```
  RESPONSIBLE AI
  · AI output never changes stock without human confirmation
  · Role-based access; supplier prices stay private
  · If OCR or scan fails, manual count still completes — VELO never blocks a delivery
  · Every change has a name, a time and evidence
  ```

## Bố cục

| Zone | Vị trí | Nội dung |
|---|---|---|
| Header | Trên | Kicker + headline |
| Ma trận | Trái, 6 cột | Ảnh `s11_risk_matrix.png` |
| Bảng rủi ro | Phải trên, 6 cột | Bảng 4 dòng |
| Responsible AI | Phải dưới, 6 cột | Card nền Ink chữ Paper |

## Hình / biểu đồ
- `s11_risk_matrix.png` — dữ liệu `charts/data/risks.csv` (likelihood, impact 1–5; status). Sửa CSV khi phỏng vấn cho thông tin mới.

## Speaker notes (≈ 50 giây)
> We want to be honest about where VELO can fail. Many Vietnamese suppliers' goods have no usable barcode — so VELO lets staff search, photograph and print a QR label. Delivery notes are messy and handwritten — so a person always confirms what the AI reads. Staff may feel monitored — so we position the record as their protection. And yards have poor signal — offline mode is on our roadmap, and we will not pretend it is in the demo.
> Most importantly: AI never changes stock on its own, and VELO never blocks a delivery.

## Lưu ý
- Không giấu rủi ro đỏ (lộ trình). Giám khảo đánh giá cao sự trung thực hơn là danh sách "đã giải quyết hết".
