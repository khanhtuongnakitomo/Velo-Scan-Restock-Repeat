# VELO — Pitch Deck Kit (Team DNKTV)

Bộ hồ sơ để dựng slide nộp cuộc thi **LIKELION — AI for Business Innovation**.
Folder này chứa: bố cục từng slide, nội dung chữ đặt trên slide (tiếng Anh — yêu cầu của BTC), hình/biểu đồ cần có, code Python sinh biểu đồ và wireframe, và ghi chú thuyết trình.

> Nguồn nội dung: `docs/proposals/VELO_Vietnam_Receiving_Story.md` (câu chuyện sản phẩm) và `public/strategy.html` (trang chiến lược).
> Mọi con số tài chính/pilot trong deck là **giả định hoặc chỉ tiêu (target)** — phải ghi nhãn rõ trên slide. Không trình bày như kết quả.

---

## 1. Yêu cầu nộp bài (từ đề BTC)

| Mục | Yêu cầu |
|---|---|
| Định dạng | **PDF**, **tiếng Anh**, **tối đa 15 slide** |
| Điểm cộng | Có prototype / MVP |
| Tên folder nộp | **`AI4Biz_DNKTV_2026`** |
| Nộp qua | Google Form nộp bài của BTC |
| Hạn chót | **23:59, 13/11/2026** |
| Chung kết 19/11 | Pitch tối đa 15 phút (slide + **video demo ≤ 2 phút**), Q&A 5 phút, tiếng Anh, ≥ 3 thành viên có mặt |

### Tiêu chí chấm → slide nào ăn điểm

| Tiêu chí | Trọng số | Slide phụ trách |
|---|---|---|
| Problem | 25% | 02, 03, 04 |
| Idea & Creativity | 30% | 05, 06, 07, 12 |
| Feasibility | 20% (*mục chi tiết ghi 25%*) | 09, 10, 11, 13 |
| Presentation | 25% (*mục chi tiết ghi 20%*) | 01, 08, 13 + toàn bộ thiết kế |

> Đề BTC ghi trọng số Feasibility/Presentation không thống nhất giữa bảng tổng và mục chi tiết. Xem cả hai đều quan trọng.

---

## 2. Bản đồ deck — 13 slide + 1 phụ lục = 14/15

| # | File spec | Tiêu đề trên slide (headline) | Visual chính | Biểu đồ/hình (code) |
|---|---|---|---|---|
| 01 | `slides/01-title.md` | VELO — Receive. Verify. Record. | Logo + tagline + team | — |
| 02 | `slides/02-business-problem.md` | A tick is not a confirmation. | Quy trình nhận hàng hôm nay, 6 bước, điểm gãy màu đỏ | `s02_receiving_today` |
| 03 | `slides/03-target-users.md` | Built for Vietnam's building-materials distributors first. | Chân dung khách hàng + 4 vai trò | — |
| 04 | `slides/04-business-insight.md` | Receiving is where inventory truth is created — or lost. | Chuỗi hệ quả + bằng chứng phỏng vấn | `s04_ripple_effect`, `s04_interview_pains` |
| 05 | `slides/05-proposed-solution.md` | Stock only exists when three sources agree. | Phương trình 3 nguồn | `s05_three_way_match` |
| 06 | `slides/06-how-ai-helps.md` | AI reads. Rules check. People decide. | 3 cột AI / Rules / Human | — |
| 07 | `slides/07-how-it-works.md` | One delivery, eight steps, one phone. | Luồng 8 bước có nhãn AI/Rule/Human | `s07_workflow` |
| 08 | `slides/08-mockup-demo.md` | 96 entered stock. 4 entered a claim. | 4 màn hình điện thoại + dashboard | Ảnh chụp từ `public/strategy.html#demo` |
| 09 | `slides/09-mvp-scope.md` | The MVP proves one flow, end to end. | Trong/ngoài phạm vi + kiến trúc | `s09_architecture` |
| 10 | `slides/10-business-value.md` | Value we can measure, not promise. | Thác giá trị/tháng + chỉ tiêu pilot | `s10_value_waterfall` |
| 11 | `slides/11-risks-mitigation.md` | We know where VELO can fail — and how we contain it. | Ma trận rủi ro | `s11_risk_matrix` |
| 12 | `slides/12-competitive-advantage.md` | Deeper than a checklist, lighter than a WMS. | Bản đồ định vị + bảng so sánh | `s12_positioning` |
| 13 | `slides/13-pilot-roadmap-closing.md` | Prove it in one warehouse in 8 weeks. | Gantt pilot + lộ trình + câu chốt | `s13_pilot_gantt` |
| A | `slides/A-appendix.md` | Appendix — assumptions & Q&A | Độ nhạy giá trị + Q&A | `sA_sensitivity` |

Câu chuyện chạy theo mạch: **Vấn đề (02–04) → Giải pháp (05–08) → Khả thi (09–11) → Khác biệt & Hành động (12–13)**.

---

## 3. Cấu trúc folder

```
docs/pitch-deck/
├── README.md              ← file này: tổng quan, bản đồ deck, quy trình
├── design-system.md       ← canvas, lưới, màu, font, cỡ chữ, thành phần
├── slides/                ← 14 file spec, mỗi slide một file
│   ├── 01-title.md … 13-pilot-roadmap-closing.md
│   └── A-appendix.md
├── evidence/
│   └── interview-guide.md ← kịch bản phỏng vấn để lấy bằng chứng cho slide 04
└── charts/
    ├── requirements.txt
    ├── velo_style.py      ← bảng màu, font, hàm vẽ dùng chung
    ├── make_charts.py     ← sinh toàn bộ biểu đồ/sơ đồ
    ├── make_wireframes.py ← sinh wireframe bố cục cho 14 slide
    ├── data/
    │   ├── assumptions.json  ← giả định tài chính (THAY bằng số thật)
    │   ├── interviews.csv    ← kết quả phỏng vấn (đang là dữ liệu MẪU)
    │   └── risks.csv         ← đánh giá rủi ro của team
    └── out/               ← ảnh sinh ra (PNG 300dpi + SVG)
        └── wireframes/
```

Mỗi file spec slide có cùng cấu trúc:
1. **Mục tiêu & tiêu chí chấm** — slide này phải thuyết phục giám khảo điều gì.
2. **Headline** — câu khẳng định đặt làm tiêu đề.
3. **Nội dung trên slide** — chữ tiếng Anh, copy thẳng vào slide.
4. **Bố cục** — các vùng (zone) và vị trí; xem wireframe PNG tương ứng.
5. **Hình / biểu đồ** — tên file, cách sinh, cách đặt.
6. **Speaker notes** — lời nói tiếng Anh khi pitch.
7. **Lưu ý / tránh** — lỗi dễ mắc.

---

## 4. Sinh biểu đồ và wireframe

Yêu cầu: Python 3.10+.

```bash
cd docs/pitch-deck/charts
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS/Linux
source .venv/bin/activate

pip install -r requirements.txt
python make_charts.py        # → out/*.png + out/*.svg
python make_wireframes.py    # → out/wireframes/*.png + contact sheet
```

Chỉ sinh một biểu đồ: `python make_charts.py s10_value_waterfall`
Liệt kê tên biểu đồ: `python make_charts.py --list`

**Font:** script tự dùng *Archivo Black* (tiêu đề) và *IBM Plex Sans/Mono* (chữ) nếu máy đã cài; không có thì tự dùng font hệ thống. Chữ đậm cần file **static** `IBMPlexSans-Regular.ttf` + `IBMPlexSans-Bold.ttf` — bản *Variable* không có kiểu đậm trong matplotlib, khi đó script dùng Segoe UI/Arial và in ra một dòng `note:`. Font nằm ngoài thư mục hệ thống: đặt biến `VELO_FONTS=<thư mục chứa .ttf>`.

**Dữ liệu thật thay dữ liệu mẫu:**

| File | Trạng thái hiện tại | Khi nào thay |
|---|---|---|
| `data/interviews.csv` | Dữ liệu **MẪU** (`is_sample=1`) — biểu đồ sẽ in watermark *"SAMPLE DATA — DO NOT SUBMIT"* | Sau mỗi buổi phỏng vấn: thêm dòng thật với `is_sample=0`, xóa dòng mẫu |
| `data/assumptions.json` | **Giả định** của team — biểu đồ ghi nhãn *"Illustrative — team assumptions"* | Khi phỏng vấn cho số liệu thật (số chuyến hàng/tháng, lương, giá trị nhập…) |
| `data/risks.csv` | Đánh giá chủ quan của team (thang 1–5) | Cập nhật nếu phỏng vấn cho thấy rủi ro khác |

> Quy tắc vàng: **không nộp slide nào có watermark SAMPLE.** Nếu chưa có phỏng vấn, slide 04 dùng phiên bản không có biểu đồ (xem spec slide 04).

---

## 5. Quy trình làm slide (đến hạn 13/11)

| Thời điểm | Việc | Đầu ra |
|---|---|---|
| 12/11 tối | Phỏng vấn 2–3 người làm kho (`evidence/interview-guide.md`), nhập `interviews.csv` | Bằng chứng cho slide 04 |
| 12/11 tối | Chốt chữ trên 14 slide (sửa trực tiếp trong `slides/*.md`) | Nội dung khóa |
| 13/11 sáng | Chạy script → ảnh biểu đồ; chụp 4 màn hình demo từ `strategy.html` | `charts/out/` |
| 13/11 chiều | Dựng slide theo wireframe + `design-system.md` | File slide |
| 13/11 ~20:00 | Rà soát theo checklist bên dưới, xuất PDF | `AI4Biz_DNKTV_2026/…pdf` |
| 13/11 trước 22:00 | Nộp Google Form (chừa 2 giờ dự phòng) | Đã nộp |

### Checklist trước khi xuất PDF

- [ ] Đúng ≤ 15 trang, toàn bộ bằng tiếng Anh
- [ ] Slide 01 có tên team **DNKTV**, tên + trường của từng thành viên
- [ ] Không slide nào còn `[FILL]`, watermark SAMPLE, hay chữ placeholder
- [ ] Mọi số liệu tài chính/pilot có nhãn *assumption* hoặc *pilot target*
- [ ] Ảnh demo có nhãn *"Prototype mockup"* — không nói là sản phẩm đã chạy thật
- [ ] Không có dữ liệu cá nhân, tên công ty thật hay dữ liệu nhạy cảm (yêu cầu bảo mật của BTC) — ẩn danh mọi bằng chứng phỏng vấn
- [ ] Font nhúng vào PDF; ảnh ≥ 150dpi khi in
- [ ] Đọc thử headline 13 slide liền nhau: phải thành một câu chuyện liền mạch
- [ ] Đặt tên file & folder `AI4Biz_DNKTV_2026`
