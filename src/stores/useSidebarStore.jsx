import { create } from 'zustand';

/**
 * Store useSidebarStore
 * Quản lý trạng thái hiển thị (Đóng/Mở) của thanh điều hướng Sidebar.
 * Trạng thái này được sử dụng chung bởi Sidebar và DashBoardLayout để
 * điều chỉnh không gian hiển thị của nội dung chính (Main Content).
 */
export const useSidebarStore = create((set) => ({
    // ================= STATE =================

    // Trạng thái mặc định: Sidebar đang mở (true)
    openSidebar: true,

    // ================= ACTIONS =================

    /**
     * Hàm toggleSidebar
     * Chuyển đổi trạng thái đóng sang mở và ngược lại.
     * Thường được gắn vào nút Hamburger menu trên Topbar.
     */
    toggleSidebar: () => set((state) => ({ openSidebar: !state.openSidebar })),

    /**
     * Hàm setOpenSidebar
     * Thiết lập trực tiếp giá trị cho trạng thái Sidebar.
     * Thường dùng để tự động đóng Sidebar trên các thiết bị di động (Mobile)
     * hoặc khi thực hiện điều hướng sang trang mới.
     * @param {boolean} value - Giá trị mong muốn của trạng thái đóng/mở.
     */
    setOpenSidebar: (value) => set({ openSidebar: value }),
}));
