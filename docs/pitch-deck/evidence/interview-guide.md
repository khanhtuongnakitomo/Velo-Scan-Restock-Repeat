# Kịch bản phỏng vấn — bằng chứng cho slide 04, 10, 12

**Mục tiêu:** 2–3 buổi trước 13/11 (lý tưởng 3–5), mỗi buổi 10–15 phút. Đối tượng: nhân viên nhận hàng, quản lý kho, chủ cửa hàng/đại lý vật liệu xây dựng hoặc vật tư công nghiệp.

**Nguyên tắc:**
- Xin phép trước khi ghi âm/chụp ảnh. Nói rõ: dùng cho bài thi sinh viên, **ẩn danh** tên người và tên công ty.
- Hỏi về **lần gần nhất cụ thể**, không hỏi ý kiến chung ("lần gần nhất hàng giao thiếu là khi nào?" tốt hơn "anh có hay bị giao thiếu không?").
- Không giới thiệu VELO trước câu 8 — tránh dẫn dắt câu trả lời.

## Câu hỏi

**A. Quy trình hiện tại (→ slide 02)**
1. Khi xe hàng tới, anh/chị kiểm hàng thế nào? Kể từng bước lần gần nhất.
2. Lúc kiểm có đơn đặt hàng (PO) bên cạnh không? Kiểm theo phiếu giao hàng hay theo PO?
3. Kết quả kiểm được ghi vào đâu? Bao lâu sau thì có trong Excel/phần mềm? Ai nhập?

**B. Sự cố & chi phí (→ slide 04, 10)**
4. Lần gần nhất hàng giao thiếu / sai / hỏng / gần hết hạn là khi nào? Chuyện gì xảy ra sau đó?
5. Lần đó thiệt hại khoảng bao nhiêu? Mất bao lâu để giải quyết với nhà cung cấp? Có bằng chứng gì?
6. Một tháng kho nhận khoảng bao nhiêu chuyến hàng? Mỗi chuyến kiểm mất bao lâu?
7. Có khi nào bán hàng rồi mới phát hiện kho không có hàng không?

**C. Giải pháp (→ slide 10, 12)**
8. Hiện có dùng phần mềm nào cho kho/bán hàng không? Nó làm được gì khi nhập hàng? Chi phí/tháng?
9. *(Giới thiệu VELO 30 giây.)* Phần nào hữu ích nhất? Phần nào không thực tế?
10. Nếu có công cụ như vậy, anh/chị sẵn sàng trả khoảng bao nhiêu/tháng? Có muốn thử 1–2 tháng không?

## Ghi kết quả vào `charts/data/interviews.csv`

| Cột | Ý nghĩa |
|---|---|
| `id` | I01, I02… |
| `role` | `receiver` / `manager` / `owner` |
| `business_type` | ví dụ `building materials distributor` |
| `city` | ví dụ `HCMC` |
| `deliveries_per_month` | số (để trống nếu không biết) |
| `minutes_per_check` | số |
| `pains` | các mã vấn đề cách nhau bằng `;` — dùng mã trong bảng dưới |
| `quote_en` | 1 câu trích dẫn đã dịch sang tiếng Anh |
| `is_sample` | `0` cho dữ liệu thật (dòng mẫu có `1` — xóa đi khi có dữ liệu thật) |

**Mã vấn đề (`pains`):**

| Mã | Nghĩa (nhãn trên biểu đồ) |
|---|---|
| `no_po_check` | Checked without the purchase order |
| `short_delivery` | Short or over deliveries missed |
| `damage_unrecorded` | Damage not recorded with evidence |
| `late_entry` | Stock entered late into Excel/system |
| `expiry_missed` | Batch / expiry not captured |
| `supplier_dispute` | Supplier disputes without evidence |
| `oversell` | Sold stock that was not there |
| `exhausting` | Receiving is exhausting / rigid |

Sau khi nhập: `python make_charts.py s04_interview_pains` → kiểm tra không còn watermark SAMPLE.
