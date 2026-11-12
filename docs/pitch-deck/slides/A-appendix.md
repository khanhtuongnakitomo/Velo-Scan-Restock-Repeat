# Slide A — Appendix: Assumptions & Q&A

**Tiêu chí:** Hỗ trợ Feasibility + Q&A 5 phút · **Nền:** Paper · **Wireframe:** `charts/out/wireframes/A-appendix.png`

## Mục tiêu
Một trang tham khảo: toàn bộ giả định đằng sau slide 10, độ nhạy của kết quả, và phương pháp thu thập bằng chứng. Không trình bày khi pitch — mở ra khi giám khảo hỏi.

## Headline
`APPENDIX — ASSUMPTIONS, SENSITIVITY & METHOD`

## Nội dung trên slide

- **Bảng giả định** (sinh tự động từ `charts/data/assumptions.json` — copy giá trị sau khi cập nhật):

| Assumption | Value | Source |
|---|---|---|
| `Deliveries per month` | `80` | `[FILL: interview / assumption]` |
| `Minutes saved per delivery` | `15` | `[FILL]` |
| `Loaded labour cost` | `1,000 VND/min` | `[FILL]` |
| `Inbound goods value per month` | `1.5 bn VND` | `[FILL]` |
| `Unrecovered discrepancy rate today` | `0.5%` | `[FILL]` |
| `Share VELO recovers` | `60%` | `Assumption — pilot target` |
| `Expiry/damage write-off per month` | `3 M VND`, `−30%` | `[FILL]` |
| `Oversold orders per month` | `4 × 500k VND margin`, `−50%` | `[FILL]` |
| `VELO subscription` | `1.5 M VND/month` | `Assumption — pricing to validate` |

- **Biểu đồ độ nhạy** `sA_sensitivity`: `Net monthly value vs. today's unrecovered discrepancy rate`, 3 đường theo giá trị hàng nhập (0,5 / 1,5 / 3 tỷ VND/tháng), đường hòa vốn = 0.
- **Phương pháp:** `Interviews: n=[FILL] (roles: …) · Artefacts: [FILL] anonymised delivery notes · OCR test: [FILL] notes, field accuracy [FILL]%`

## Bố cục

| Zone | Vị trí | Nội dung |
|---|---|---|
| Header | Trên | Kicker `APPENDIX` + headline |
| Bảng giả định | Trái, 6 cột | Bảng 9 dòng, chữ 18 px |
| Độ nhạy | Phải, 6 cột | Ảnh `sA_sensitivity.png` |
| Phương pháp | Dưới cùng | 1–2 dòng Mono |

## Chuẩn bị Q&A (không đặt lên slide — học thuộc)

| Câu hỏi | Trả lời ngắn |
|---|---|
| *Khác gì KiotViet / MISA / Sapo?* | Các phần mềm đó ghi nhận nhập kho; VELO **kiểm chứng** nhập kho tại cửa kho: đối chiếu 3 nguồn, bằng chứng ảnh, tài xế xác nhận, AI đọc phiếu giao hàng, xử lý hàng không mã vạch. VELO có thể xuất dữ liệu đã kiểm chứng sang các phần mềm đó. *(Điều chỉnh sau khi kiểm chứng tính năng của họ.)* |
| *AI ở đâu? Đối chiếu số lượng chỉ là rule.* | Đúng, và có chủ đích: kiểm soát phải kiểm toán được. AI làm phần rule không làm được: đọc chứng từ tiếng Việt lộn xộn, khớp tên hàng nhà cung cấp với SKU, phát hiện bất thường. |
| *Nhân viên khai gian số đếm thì sao?* | Không hệ thống nào chặn hoàn toàn thông đồng — chúng tôi nói thẳng. VELO tăng chi phí gian lận: định danh người xác nhận, ảnh, tài xế đồng xác nhận, quản lý duyệt, nhật ký phát hiện mẫu bất thường. |
| *Nhà cung cấp có hợp tác không?* | Họ không phải thay đổi gì. Tài xế chỉ xác nhận sai lệch đang nằm trước mặt cả hai bên. VELO cũng ghi nhận các lần giao **đúng** — bảo vệ nhà cung cấp trung thực. |
| *Hàng rời như xi măng, sắt thép đếm thế nào?* | Đếm theo đơn vị/pallet + ảnh chụp lô hàng + ngưỡng sai lệch theo loại hàng. VELO kiểm chứng số đếm khai báo, không thay cân xe — chúng tôi nói rõ giới hạn này. |
| *Mạng yếu ở bãi?* | Thiết kế phiên làm việc chịu mất mạng là yêu cầu bắt buộc, đang trong lộ trình; không nằm trong demo hiện tại. |
| *Số tiền ở slide 10 lấy đâu ra?* | Giả định công khai ở phụ lục, có độ nhạy; mục tiêu pilot 8 tuần là đo số thật. |
| *Mô hình kinh doanh?* | Thuê bao theo kho/tháng; không cần phần cứng; triển khai trong vài ngày. Giá sẽ chốt sau khi kiểm chứng mức sẵn sàng chi trả. |
| *Dữ liệu bảo mật thế nào?* | Phân quyền theo vai trò; giá nhà cung cấp chỉ quản lý thấy; AI không tự thay đổi tồn kho. |
