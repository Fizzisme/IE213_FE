# IE213 Frontend


Frontend cho hệ thống quản lý hồ sơ sức khỏe điện tử, xây dựng bằng `React + Vite`, hỗ trợ phân quyền theo vai trò và đăng nhập bằng `MetaMask`.


## Tổng quan


Dự án hiện được tổ chức theo các phân hệ chính:


- **Auth**: màn hình đăng nhập và xác thực ví `MetaMask`.
- **Patient**: dashboard, hồ sơ bệnh án, lịch hẹn, thông báo.
- **Doctor**: dashboard, bệnh nhân, hồ sơ y tế, chẩn đoán.
- **Lab Tech**: dashboard, thông báo, xử lý tài liệu/liều lượng, upload kết quả xét nghiệm.
- **Admin**: dashboard và quản lý người dùng.


## Công nghệ sử dụng


- **Framework**: `React 19`, `Vite 7`
- **Routing**: `react-router-dom`
- **State management**: `zustand`
- **Styling**: `Tailwind CSS 4`
- **UI utilities**: `shadcn/ui`, `lucide-react`, `sonner`, `framer-motion`
- **Web3**: `ethers`
- **Charts**: `echarts`, `echarts-for-react`
- **Linting**: `ESLint 9`


## Yêu cầu môi trường


- **Node.js**: nên dùng bản LTS mới
- **npm**: dự án hiện có `package-lock.json`, vì vậy nên dùng `npm`
- **MetaMask**: cần thiết cho luồng đăng nhập ví


## Cài đặt và chạy dự án


```bash
npm install
npm run dev
```


Mặc định Vite sẽ chạy ở local URL do terminal cung cấp, thường là `http://localhost:5173`.


## Scripts


- **`npm run dev`**: chạy môi trường phát triển
- **`npm run build`**: build production
- **`npm run preview`**: chạy bản build local
- **`npm run lint`**: kiểm tra code bằng ESLint


## Cấu hình backend


Frontend đang gọi backend thông qua hằng số `BE_URL` tại:


```ts
src/lib/constans.ts
```


Giá trị hiện tại:


```ts
export const BE_URL = '/api/v1';
```


Điều này có nghĩa là frontend kỳ vọng có lớp rewrite/proxy từ `/api/*` sang backend thật.


### Deploy hiện tại


File `vercel.json` đang cấu hình rewrite:


- **`/api/:path*`** -> `http://62.72.46.7:1306/:path*`
- **SPA fallback** -> mọi route còn lại trỏ về `/`


### Chạy local với backend riêng


Nếu bạn chạy frontend local nhưng không có proxy `/api`, bạn có 2 cách:


- **Cách 1**: dựng reverse proxy để chuyển `/api/*` về backend
- **Cách 2**: sửa tạm `src/lib/constans.ts` sang URL backend local, ví dụ dòng đã được để sẵn trong file:


```ts
// export const BE_URL = 'http://localhost:8080/v1';
```


Lưu ý: các request auth/service đang dùng `credentials: 'include'`, nên backend cần hỗ trợ cookie/CORS đúng cấu hình.


## Cách ứng dụng hoạt động


### 1. Khởi tạo ứng dụng


- `src/main.jsx` mount app với `BrowserRouter`
- `src/App.jsx` gọi `initAuth()` từ `useAuthStore`
- Trong lúc kiểm tra phiên đăng nhập, ứng dụng hiển thị `LoadingScreen`


### 2. Xác thực và phân quyền


Store xác thực chính nằm tại:


```bash
src/stores/useAuthStore.js
```


Luồng chính:


- **`initAuth`**: gọi `/auth/me` để lấy user hiện tại
- **Nếu role là `PATIENT`**: gọi thêm `patientService.getMe()` để lấy hồ sơ bệnh nhân
- **`loginMetaMask`**: đăng nhập bằng ví
- **`logout`**: xóa session phía server và reset store


Các route riêng theo vai trò được bảo vệ bởi:


```bash
src/components/guards/RoleProtectedRoute.jsx
```


Nếu user chưa đăng nhập, route sẽ chuyển về `/`.
Nếu đăng nhập nhưng sai role, route sẽ hiển thị màn hình `Unauthorized`.


### 3. Đăng nhập MetaMask


Trang đăng nhập nằm tại:


```bash
src/components/pages/Auth/AuthPage.jsx
```


Luồng hiện tại:


- **Bước 1**: kiểm tra `window.ethereum`
- **Bước 2**: lấy địa chỉ ví bằng `ethers.BrowserProvider`
- **Bước 3**: gọi backend lấy `nonce`
- **Bước 4**: yêu cầu người dùng ký nonce để xác thực đăng nhập
- **Bước 5**: yêu cầu ký thêm thông điệp `REGISTER_ZUNI_PATIENT`
- **Bước 6**: gửi chữ ký về backend để nhận thông tin user
- **Bước 7**: điều hướng tới dashboard theo role


Map route theo role trong trang auth:


- **`PATIENT`** -> `/patient/dashboard`
- **`LAB_TECH`** -> `/lab-tech/dashboard`
- **`DOCTOR`** -> `/Doctor/dashboard`
- **`ADMIN`** -> `/admin/dashboard`


## Hệ thống routing


Các route được khai báo tập trung trong `src/routes` và được nạp vào `src/App.jsx`.


### Public routes


- **`/`**: trang auth
- **`/auth`**: trang auth


### Patient routes


File: `src/routes/patientRoutes.jsx`


- **`/patient/dashboard`**
- **`/patient/create-patient`**
- **`/patient/appointments-manage`**
- **`/patient/appointments`**
- **`/patient/notifications`**
- **`/patient/medical-records`**
- **`/patient/medical-records/:medicalRecordId`**


### Doctor routes


File: `src/routes/doctorRoutes.jsx`


- **`/doctor/dashboard`**
- **`/doctor/profile`**
- **`/doctor/patients`**
- **`/doctor/patients/:patientId/create-record`**
- **`/doctor/medical-records`**
- **`/doctor/medical-records/:medicalRecordId/diagnose`**
- **`/doctor/appointments`**


### Lab Tech routes


File: `src/routes/labTechRoutes.jsx`


- **`/lab-tech/dashboard`**
- **`/lab-tech/notifications`**
- **`/lab-tech/documents/dosage`**


### Admin routes


File: `src/routes/adminRoutes.jsx`


- **`/admin/dashboard`**
- **`/admin/users`**


## Cấu trúc thư mục chính


```bash
src/
├── App.jsx
├── main.jsx
├── components/
│   ├── guards/
│   ├── layouts/
│   ├── pages/
│   └── ui/
├── hooks/
├── lib/
├── routes/
├── services/
├── stores/
└── utils/
```


## Kiến trúc code


### `services/`


Chứa lớp giao tiếp backend cho từng phân hệ:


- **`authService.js`**
- **`patientService.js`**
- **`doctorService.js`**
- **`LabTechService.js`**
- **`adminService.js`**


Hầu hết service dùng `fetch`, `Content-Type: application/json` và `credentials: 'include'`.


### `stores/`


- **`useAuthStore.js`**: auth state toàn cục
- **`useLayoutStore.jsx`**: state dùng chung cho layout/dashboard
- **`useSidebarStore.jsx`**: state sidebar


### `components/pages/`


Mỗi phân hệ được tách theo thư mục riêng:


- **`Auth/`**
- **`Patients/`**
- **`Doctor/`**
- **`LabTech/`**
- **`Admin/`**


### `lib/`


- **`constans.ts`**: hằng số cấu hình backend
- **`utils.ts`**: utility dùng chung


## Tối ưu hiệu năng hiện có


- Các trang theo role được tải bằng `React.lazy`
- Vite được cấu hình tách chunk thủ công cho:
    - **`vendor-react`**: React, React DOM, React Router
    - **`vendor-charts`**: ECharts và `zrender`
- `chunkSizeWarningLimit` được tăng lên `1200`


## UI và alias


- Alias `@` trỏ tới `src/`
- Cấu hình alias tồn tại ở cả `vite.config.js` và `tsconfig.json`
- `components.json` cho thấy dự án đang dùng hệ sinh thái `shadcn/ui` với style `radix-nova`


Ví dụ import nội bộ:


```jsx
import { useAuthStore } from '@/stores/useAuthStore.js';
```


## Tài nguyên tĩnh


Thư mục `public/` hiện chứa logo và ảnh minh họa như:


- **`AEGITAS.png`**
- **`AEGITAS2.png`**
- **`doctor-welcome.png`**
- **`labtech-welcome.png`**


## Một số lưu ý khi phát triển


- Dự án đang có cả file `.js/.jsx` và `.ts/.tsx`
- Tên file `src/lib/constans.ts` hiện đang được viết là `constans`, không phải `constants`
- Một số import đang dùng đuôi file khác nhau giữa `.js`, `.jsx`, `.ts`, `.tsx`; khi refactor nên giữ nhất quán để tránh lỗi resolve
- Route điều hướng role bác sĩ trong `AuthPage` hiện là `/Doctor/dashboard`, trong khi route khai báo là `/doctor/...`; nếu sau này phát sinh lỗi điều hướng, đây là điểm cần kiểm tra đầu tiên


## Lệnh đề xuất trước khi merge


```bash
npm run lint
npm run build
```


## Tóm tắt


Đây là frontend SPA cho hệ thống EHR, tập trung vào:


- **xác thực bằng session/cookie và MetaMask**
- **phân quyền theo vai trò**
- **kiến trúc chia module theo phân hệ nghiệp vụ**
- **gọi backend qua lớp service riêng biệt**
- **triển khai SPA bằng Vercel rewrite**



