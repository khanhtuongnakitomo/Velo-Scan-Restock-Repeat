# Slide 08 — Mockup / Demo

**Tiêu chí:** Presentation 25% + điểm cộng prototype · **Nền:** Ink · **Wireframe:** `charts/out/wireframes/08-mockup-demo.png`

## Mục tiêu
Cho giám khảo *nhìn thấy* sản phẩm qua một câu chuyện cụ thể: 100 tuýp keo được giao, 4 tuýp bị bẹp. Kết thúc bằng câu chốt dễ nhớ nhất cả deck.

## Headline
`96 ENTERED STOCK. 4 ENTERED A CLAIM. ZERO BY ASSUMPTION.`

## Nội dung trên slide

- **Kicker:** `08 · PROTOTYPE WALKTHROUGH`
- **Tình huống (1 dòng):** `Expected: 100 tubes SikaFlex sealant + 20 bags cement from Supplier A.`
- **4 màn hình điện thoại theo thứ tự**, mỗi màn hình có caption:

| # | Màn hình | Caption dưới ảnh |
|---|---|---|
| 1 | Scan delivery note | `AI reads the note: 100 tubes, 20 bags.` |
| 2 | Count: 96 good, 4 crushed | `4 crushed → red. Photo taken, driver confirms. Batch expires in 20 days → yellow.` |
| 3 | Manager approves | `Accept 96, claim 4 — one tap, named approver.` |
| 4 | Receipt issued | `Digital phiếu nhập kho. Stock: 96 with batch & expiry. Claim: 4, documented.` |

- **Chip góc phải trên:** `PROTOTYPE MOCKUP`
- **Link / QR nhỏ góc phải dưới (tùy chọn):** link tới bản demo online nếu team deploy.

## Bố cục

| Zone | Vị trí | Nội dung |
|---|---|---|
| Header | Trên | Kicker (Yellow) + headline (Paper) |
| Tình huống | Dưới header | 1 dòng Mono màu Yellow |
| 4 điện thoại | Giữa, 4 cột bằng nhau, cách đều | Ảnh màn hình đặt trong khung điện thoại đen; số `01–04` lớn phía trên |
| Caption | Dưới mỗi điện thoại | Plex Sans 20 px, màu Paper |
| Chip | Góc phải trên | `PROTOTYPE MOCKUP` viền nét đứt |

## Hình / biểu đồ — cách chụp màn hình

Màn hình đã có sẵn trong `public/strategy.html` (mục *04 Demo*):

1. `pnpm dev` trong thư mục repo → mở `http://localhost:8443/strategy.html#demo`.
2. Trình duyệt Chrome → F12 → bật Device toolbar → chọn khung 1440 × 900, zoom 100%.
3. Bấm lần lượt 4 nút scene (`Scan the note`, `Count & find damage`, `Manager approves`, `Receipt & stock update`).
4. Mỗi scene: DevTools → chuột phải vào phần tử `.phone` → **Capture node screenshot**.
5. Lưu thành `charts/out/demo/scene-1.png` … `scene-4.png`.

Nếu team dựng MVP thật trước hạn: chụp từ MVP và **bỏ** chip `PROTOTYPE MOCKUP` chỉ khi màn hình thật sự chạy với dữ liệu.

## Speaker notes (≈ 60 giây)
> Let us show you one delivery. Supplier A delivers 100 tubes of sealant and 20 bags of cement. The receiver scans the note; VELO reads it. While counting, she finds four crushed tubes. The line turns red. She takes a photo; the driver confirms on the same phone. VELO also flags that this batch expires in 20 days.
> The manager approves: accept 96, claim 4. VELO issues the goods receipt.
> Ninety-six tubes entered stock. Four entered a claim. Zero entered by assumption.

## Lưu ý
- Đây là câu chốt dùng lại ở slide 13 và video demo 2 phút — giữ nguyên văn.
- Video demo chung kết nên quay đúng kịch bản này.
