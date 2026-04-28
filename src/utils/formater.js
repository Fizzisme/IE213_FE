/**
 * Hàm formatDateVN
 * Chuyển đổi một chuỗi ngày tháng hoặc đối tượng Date thành định dạng hiển thị chuẩn Việt Nam.
 * Sử dụng múi giờ 'Asia/Ho_Chi_Minh' để đảm bảo tính chính xác bất kể vị trí của Server/Client.
 * @param {string|Date} date - Giá trị thời gian cần định dạng.
 * @returns {string} Chuỗi thời gian đã định dạng (VD: 15/04/2026, 14:30:00).
 */
export const formatDateVN = (date) => {
    return new Date(date).toLocaleString('vi-VN', {
        timeZone: 'Asia/Ho_Chi_Minh',
    });
};

/**
 * Hàm getInitials
 * Trích xuất các chữ cái đầu từ tên người dùng để làm hình ảnh đại diện (Avatar placeholder).
 * @param {string} name - Họ và tên đầy đủ của người dùng.
 * @returns {string} Chuỗi tối đa 2 ký tự viết hoa (VD: "Phan Đình Phúc" -> "PD").
 */
export const getInitials = (name) => {
    // Trả về chuỗi rỗng nếu không có tên để tránh lỗi runtime
    if (!name) return '';

    return name
        .split(' ') // Tách chuỗi thành mảng các từ
        .map((w) => w[0]) // Lấy ký tự đầu tiên của mỗi từ
        .join('') // Ghép các ký tự lại thành chuỗi
        .slice(0, 2) // Chỉ lấy 2 ký tự đầu tiên để đảm bảo tính thẩm mỹ trên UI
        .toUpperCase(); // Chuyển sang chữ hoa chuẩn
};
