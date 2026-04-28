import { create } from 'zustand';

/**
 * Store useLayoutStore
 * Quản lý trạng thái giao diện (UI State) dùng chung cho các bộ Layout (DashBoardLayout).
 * Store này đóng vai trò như một "trạm trung chuyển" để các phân hệ (Patient, Doctor, Admin)
 * có thể cấu hình Sidebar, Topbar và các thành phần bổ trợ tùy theo nghiệp vụ riêng.
 */
export const useLayoutStore = create((set) => ({
    // ================= STATE =================
    userInfo: null, // Thông tin người dùng hiển thị trên Header/Sidebar
    role: '', // Nhãn vai trò (role label) để hiển thị trên UI
    navItems: [], // Danh sách các mục điều hướng (Menu items) động của Sidebar

    /**
     * renderExtra: Một hàm trả về React Component (Functional Component).
     * Cho phép các Layout con chèn thêm các khối UI đặc thù vào Sidebar (ví dụ: nút tạo hồ sơ, thanh tìm kiếm).
     */
    renderExtra: () => <div></div>,

    // ================= ACTIONS =================

    /**
     * Cập nhật thông tin người dùng hiện tại để hiển thị trên các thành phần Layout.
     * @param {Object} user - Object chứa fullName, avatar...
     */
    setUserInfo: (user) => {
        set({ userInfo: user });
    },

    /**
     * Thiết lập nhãn vai trò hiển thị (ví dụ: "Bệnh nhân", "Bác sĩ chuyên khoa").
     * @param {string} role - Chuỗi mô tả vai trò.
     */
    setRole: (role) => {
        set({ role: role });
    },

    /**
     * Thiết lập hàm render bổ sung cho Sidebar.
     * @param {Function} renderExtra - Một function trả về JSX.
     */
    setRenderExtra: (renderExtra) => {
        set({ renderExtra: renderExtra });
    },

    /**
     * Cập nhật danh sách menu điều hướng tương ứng với từng phân hệ.
     * @param {Array} navItems - Mảng các object chứa { icon, label, to }.
     */
    setNavItems: (navItems) => {
        set({ navItems: navItems });
    },
}));
