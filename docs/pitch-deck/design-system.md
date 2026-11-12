# Design system cho deck VELO

Kế thừa nhận diện **Primary Workshop (Bauhaus)** của website (`public/tokens.css`, `design/design.md`), điều chỉnh cho slide 16:9.

## 1. Canvas & lưới

| Thông số | Giá trị |
|---|---|
| Kích thước | **1920 × 1080 px** (16:9). PowerPoint/Google Slides: *Widescreen 16:9* (33,867 × 19,05 cm) |
| Lề ngoài | 96 px trái/phải, 72 px trên, 72 px dưới |
| Lưới | 12 cột, khoảng cách cột (gutter) 24 px → mỗi cột ≈ 122 px |
| Vùng tiêu đề | y = 72 → 240 (kicker + headline) |
| Vùng nội dung | y = 264 → 960 |
| Footer | y = 990 → 1040: nguồn/nhãn bên trái, số trang + `VELO · DNKTV` bên phải |

Wireframe từng slide: chạy `charts/make_wireframes.py` → `charts/out/wireframes/`. Tọa độ trong wireframe là tọa độ thật trên canvas 1920×1080.

## 2. Màu (lấy từ `public/tokens.css`)

| Tên | Hex | Dùng cho |
|---|---|---|
| Ink | `#20201D` | Chữ chính, viền 3–4 px, nền slide tối |
| Paper | `#F7F0E2` | Nền thẻ (card), nền slide sáng |
| Cream | `#F1E5CB` | Nền slide mặc định |
| Yellow | `#F0C642` | **Màu chủ đạo** — slide tiêu đề, điểm nhấn, trạng thái *Attention* |
| Workshop Red | `#B92D25` | **Hành động / cảnh báo** — điểm gãy, *Mismatch*, con số chính |
| Cobalt Blue | `#315C91` | Màu đối trọng — *Match*, slide giải pháp, dữ liệu nhóm 2 |
| Muted | `#555247` | Chú thích, nguồn |
| White | `#FFFFFF` | Chữ trên nền đỏ/xanh |

**Ý nghĩa màu cố định trên mọi slide** (không đổi giữa các slide):
- 🔵 Blue = **Match / AI-đã-xác-nhận / trạng thái tốt**
- 🟡 Yellow = **Attention / AI** (bước có AI tham gia)
- 🔴 Red = **Mismatch / lỗi / rủi ro cao**
- ⚫ Ink = **Human / quyết định của con người**

Độ tương phản (WCAG): Ink trên Yellow 12,1:1; Ink trên Paper 13,8:1; trắng trên Red 4,7:1; trắng trên Blue 5,2:1 — đều đạt AA.

## 3. Font

| Vai trò | Font | Cỡ | Ghi chú |
|---|---|---|---|
| Headline | **Archivo Black** | 56–64 px | VIẾT HOA, letter-spacing −2%, tối đa 2 dòng |
| Kicker (nhãn trên headline) | IBM Plex Mono Bold | 18 px | VIẾT HOA, letter-spacing +8%, dạng `02 · BUSINESS PROBLEM` |
| Con số lớn | Archivo Black | 96–160 px | Màu Red hoặc Ink |
| Chữ thân | IBM Plex Sans Regular/SemiBold | 24–28 px | Tối thiểu **22 px** — giám khảo đọc từ xa |
| Nhãn thẻ, chip, bảng | IBM Plex Mono SemiBold | 16–20 px | VIẾT HOA cho tiêu đề cột |
| Footer / nguồn | IBM Plex Mono | 14 px | Màu Muted |

Tải miễn phí từ Google Fonts. Khi xuất PDF phải **nhúng font** (PowerPoint: *File → Options → Save → Embed fonts*).

## 4. Thành phần dùng lại

| Thành phần | Quy cách |
|---|---|
| **Card** | Nền Paper, viền Ink 3 px, góc vuông (bo 0), padding 28 px, không đổ bóng |
| **Hero card** (chỉ 1 chỗ/slide) | Như card + bóng lệch `10px 10px` màu Red |
| **Chip trạng thái** | Chữ Mono 16 px VIẾT HOA, viền 2 px, nền theo màu ý nghĩa |
| **Step box** | Card nhỏ có số `01…08` (Archivo Black 28 px) ở góc trên |
| **Dải câu chốt** | Nền Ink, chữ Paper Archivo Black 40–48 px, cao 160–200 px |
| **Nhãn trung thực** | Chip viền nét đứt: `ILLUSTRATIVE`, `PILOT TARGET`, `PROTOTYPE MOCKUP`, `TEAM ASSESSMENT` |

## 5. Quy tắc nội dung

1. **Headline là một câu khẳng định**, không phải nhãn mục. Đọc 13 headline liền nhau phải ra câu chuyện.
2. **Một ý chính mỗi slide.** Chữ trên slide ≤ ~40 từ (không tính nhãn biểu đồ). Giải thích dài để trong speaker notes.
3. **Biểu đồ có tiêu đề là kết luận**, ví dụ “Discrepancy recovery drives most of the value”, không phải “Value chart”.
4. **Nhãn trung thực** trên mọi số chưa kiểm chứng.
5. Footer ghi nguồn khi có số liệu: `Source: DNKTV interviews (n=3), Nov 2026` hoặc `Team assumptions — see Appendix`.
6. Hình ảnh: ưu tiên ảnh chụp kho/phiếu giao hàng thật (đã che thông tin) hơn ảnh stock.
7. Không emoji trong slide; dùng chấm tròn màu hoặc chip thay cho 🟢🟡🔴.

## 6. Nền slide theo nhịp

| Slide | Nền | Lý do |
|---|---|---|
| 01 Title | Yellow | Mở màn mạnh |
| 02–04 Problem | Cream, slide 04 có dải Ink | Nghiêm túc, tập trung vấn đề |
| 05 Solution | Blue | Chuyển cảnh: từ vấn đề sang giải pháp |
| 06–07 | Cream | Giải thích |
| 08 Demo | Ink | Nổi bật màn hình điện thoại |
| 09–12 | Cream / Paper xen kẽ | Phần khả thi, nhiều dữ liệu |
| 13 Closing | Yellow + dải Ink | Khép vòng với slide 01 |
| A Appendix | Paper | Tài liệu tham khảo |
