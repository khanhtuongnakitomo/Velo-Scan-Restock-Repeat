# Slide 10 — Business Value

**Tiêu chí:** Feasibility — "giải pháp có mang lại lợi ích thiết thực: tiết kiệm thời gian, giảm chi phí, tăng hiệu suất?" · **Nền:** Cream · **Wireframe:** `charts/out/wireframes/10-business-value.png`

## Mục tiêu
Cho thấy giá trị đến từ đâu bằng **công thức minh bạch** và **chỉ tiêu đo được trong pilot**. Trung thực: số là giả định, có nhãn rõ.

## Headline
`VALUE WE CAN MEASURE, NOT JUST PROMISE.`

## Nội dung trên slide

- **Kicker:** `10 · BUSINESS VALUE`
- **Biểu đồ thác** `s10_value_waterfall` — tiêu đề biểu đồ: `Illustrative monthly value for one warehouse (VND)`; các cột:
  `Labour time saved` + `Discrepancies recovered` + `Expiry & damage avoided` + `Oversell margin protected` − `VELO subscription` = `Net value / month`
- **Nhãn bắt buộc trên biểu đồ:** `ILLUSTRATIVE — TEAM ASSUMPTIONS, SEE APPENDIX`
- **Bảng chỉ tiêu pilot** (bên phải):

| Indicator | Pilot target |
|---|---|
| `Deliveries with a complete digital record` | `≥ 95%` |
| `Discrepancies caught at receiving` | `≥ 90%` |
| `Time from delivery to trusted stock` | `Same session` |
| `Inventory record accuracy (cycle count)` | `≥ 98%` |
| `Receiving effort vs paper` | `No slower; −20–30% by week 3` |

- **Chip trên bảng:** `PILOT TARGETS — TO BE MEASURED`
- **Câu insight dưới biểu đồ:** `Most value comes from discrepancies caught before the supplier is paid — not from saved minutes.` *(chỉ giữ câu này nếu số thật vẫn cho kết quả như vậy)*

## Bố cục

| Zone | Vị trí | Nội dung |
|---|---|---|
| Header | Trên | Kicker + headline |
| Biểu đồ thác | Trái, 7 cột | Ảnh `s10_value_waterfall.png` |
| Bảng chỉ tiêu | Phải, 5 cột | Bảng 5 dòng, chip trên đầu |
| Insight | Dưới biểu đồ | 1 câu Plex Sans SemiBold |
| Footer | Dưới cùng | `Assumptions: deliveries/month, labour cost, inbound value… — Appendix A` |

## Hình / biểu đồ
- `s10_value_waterfall.png` — sinh từ `charts/data/assumptions.json`. Đổi số trong JSON rồi chạy lại `python make_charts.py s10_value_waterfall`.
- Giả định hiện tại (cần thay bằng số phỏng vấn): 80 chuyến hàng/tháng, tiết kiệm 15 phút/chuyến, chi phí lao động 1.000 VND/phút, giá trị hàng nhập 1,5 tỷ VND/tháng, 0,5% sai lệch chưa được đòi, VELO thu hồi 60%…

## Speaker notes (≈ 60 giây)
> Where does the value come from? We modelled one warehouse, with assumptions we show in the appendix. Saved labour time is real but small. The big value is discrepancies caught before the supplier is paid, plus expiry and damage avoided, and orders no longer oversold.
> We are careful here: these are assumptions, not results. That is why our pilot has five measurable targets — documentation completeness, discrepancy capture, time to trusted stock, inventory accuracy, and receiving effort.

## Lưu ý
- **Không bao giờ** bỏ nhãn ILLUSTRATIVE nếu số chưa đến từ phỏng vấn/pilot.
- Trước khi nộp, hỏi ít nhất 1 người phỏng vấn: số chuyến hàng/tháng và giá trị hàng nhập/tháng — thay vào JSON.
