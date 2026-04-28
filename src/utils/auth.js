/**
 * Tên khóa (Key) dùng để lưu trữ mã xác thực trong LocalStorage của trình duyệt.
 */
export const ACCESS_TOKEN_KEY = 'accessToken';

/**
 * Lưu trữ Access Token vào bộ nhớ cục bộ.
 * @param {string} token - Mã xác thực nhận được từ server sau khi đăng nhập.
 */
export function setAccessToken(token) {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

/**
 * Truy xuất Access Token hiện tại từ bộ nhớ cục bộ.
 * @returns {string|null} Trả về token nếu tồn tại, ngược lại trả về null.
 */
export function getAccessToken() {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
}

/**
 * Xóa Access Token khỏi bộ nhớ cục bộ (thường dùng khi đăng xuất hoặc token hết hạn).
 */
export function clearAccessToken() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
}

/**
 * Giải mã và kiểm tra thông tin từ mã xác thực mô phỏng (Mock Token).
 * Lưu ý: Đây là cơ chế giả lập dùng cho quá trình phát triển (Development)
 * để kiểm tra các quyền truy cập Admin mà không cần qua Backend thực tế.
 * @param {string} token - Token cần giải mã.
 */
export function decodeMockToken(token) {
    if (!token) return null;
    // Kiểm tra chuỗi token giả lập dành riêng cho Quản trị viên hệ thống
    if (token === 'mock.admin.token') {
        return { role: 'admin', fullName: 'System Admin', email: 'admin@healthhub.com' };
    }
    return null;
}

/**
 * Kiểm tra xem người dùng hiện tại có phải là Quản trị viên đã xác thực hay không.
 * Cơ chế: Lấy token -> Giải mã payload -> Kiểm tra vai trò 'admin'.
 * @returns {boolean} True nếu là Admin hợp lệ, ngược lại là False.
 */
export function isAdminAuthenticated() {
    const token = getAccessToken();
    const payload = decodeMockToken(token);
    return payload?.role === 'admin';
}
