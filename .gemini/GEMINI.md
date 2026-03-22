# Yêu cầu chung

- Tuyệt đối không viết comment (//, /\* \*/, <!-- -->) và log (alert, console) trong code trong bất cứ trường hợp nào.
- Tên biến bắt buộc phải sử dụng tiếng Anh.
- Luôn luôn sử dụng cú pháp VueJS, Javascript, CSS mới nhất.
- Không bao giờ được tự động cài thư viện cho các dự án, trừ trường hợp tôi yêu cầu. Nếu bạn muốn cài thêm thư viện, phải thông báo qua cho tôi.
- Không bao giờ được đổi nội dung các file env trừ trường hợp tôi yêu cầu. Nếu bạn muốn thay đổi, phải thông báo qua cho tôi.
- Tất cả phản hồi đều phải được viết bằng tiếng Việt, kể cả Task, Plan.
- Các quy tắc của Eslint cần được tuân thủ theo cấu hình của dự án.

# CSS

- Không sử dụng ID để định dạng. Không sử dụng !important.
- Giới hạn độ sâu nesting tối đa là 3 cấp.
- Thứ tự thuộc tính (Property Order): Phải sắp xếp theo nhóm từ ngoài vào trong:
  - Positioning (position, top, z-index...)
  - Box Model (display, flex, grid, margin, padding, border, width, height...)
  - Typography (font, line-height, color, text-align...)
  - Visual (background, opacity, transition...)
  - Misc (cursor, pointer-events...)

# JavaScript

- Luôn dùng const mặc định, chỉ dùng let khi thực sự cần thay đổi giá trị.
- Sử dụng Arrow functions cho các callback và hàm ẩn danh.
- Sử dụng Template literals cho chuỗi. Kết thúc mọi câu lệnh bằng dấu chấm phẩy ;.
- Tên biến phải bằng tiếng Anh, có ý nghĩa rõ ràng.
- Hàm xử lý logic phải bắt đầu bằng động từ.
- Biến Boolean phải bắt đầu bằng is, has, should, hoặc can.
- Nguyên tắc Logic:
  - Early Return: Trả về kết quả sớm để tránh lồng ghép if-else quá 2 tầng.
  - Immutability: Không thay đổi trực tiếp tham số đầu vào hoặc dữ liệu gốc. Sử dụng Spread operator (...), map, filter, reduce.
  - Async/Await: Mọi lời gọi bất đồng bộ bắt buộc phải nằm trong khối try-catch để kiểm soát lỗi.
  - Single Responsibility: Một hàm chỉ thực hiện duy nhất một nhiệm vụ. Nếu hàm dài quá 20 dòng, phải cân nhắc tách hàm.
  - Formatting: Tuân thủ chặt chẽ cấu hình Prettier. Không để lại code thừa hoặc comment rác.

# Cấu trúc File (.vue)

> [!IMPORTANT]
> **Thứ tự ưu tiên:** `<script setup>` -> `<template>` -> `<style>`.
> **Lý do:** Bạn cần đọc logic và dữ liệu trước khi xem giao diện. Để `<style>` ở giữa là một sai lầm về trải nghiệm lập trình (DX) vì nó thường rất dài, khiến bạn phải scroll mỏi tay để nhảy giữa logic và template.

# Đặt tên

- **Component & File:** Đồng nhất sử dụng **PascalCase** (ví dụ: `UserCard.vue`).
- **Tại sao?** Trong Vue, Component là một class/object đặc biệt. Việc dùng `kebab-case` cho tên file chỉ làm khó hệ thống tự động import và gây mất đồng nhất khi gọi Component trong template.

# Build dự án

Khi có sự thay đổi trong dự án.

- Đầu tiên chạy "npm run lint" để kiểm tra xem còn lỗi cú pháp thừa nào hay không
- Sau đó chạy "npm run build" để xác nhận không còn lỗi. Nếu lỗi, phải sửa cho đến khi build thành công.

# Tuyệt đối không tự ý Commit Dự án

Tuyệt đối không tự ý commit và push code lên trên git cho dự án.
