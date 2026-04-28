import { create } from 'zustand';
import { authService } from '@/services/authService.js';
import { patientService } from '@/services/patientService.js';

/**
 * Store useAuthStore
 * Quản lý trạng thái xác thực toàn cục cho ứng dụng EHR.
 * Lưu trữ thông tin tài khoản người dùng, hồ sơ bệnh nhân (nếu có),
 * cũng như các trạng thái loading và lỗi liên quan đến quá trình đăng nhập/đăng xuất.
 */
export const useAuthStore = create((set, get) => ({
    // ================= STATE =================
    user: null, // Thông tin tài khoản cơ bản (role, email, nationId...)
    patient: null, // Thông tin hồ sơ y tế chi tiết (dành riêng cho role PATIENT)
    loading: true, // Trạng thái kiểm tra phiên đăng nhập khi khởi tạo ứng dụng
    error: null, // Lưu trữ thông báo lỗi từ API

    // ================= PRIVATE ACTIONS (INTERNAL) =================

    /**
     * Lấy thông tin tài khoản hiện tại từ Server (Session/Cookie).
     * @private
     */
    _fetchCurrentUser: async () => {
        try {
            const res = await authService.getMe();
            const userData = res?.data || res;
            set({ user: userData, error: null });
            return userData;
        } catch (err) {
            set({ user: null, error: err.message });
            return null;
        }
    },

    /**
     * Lấy hồ sơ chi tiết của bệnh nhân từ Server.
     * Phương thức này chỉ được gọi sau khi xác định người dùng có vai trò là PATIENT.
     * @private
     */
    _fetchCurrentPatient: async () => {
        try {
            const res = await patientService.getMe();
            const patientData = res?.data || res;
            set({ patient: patientData });
            return patientData;
        } catch (err) {
            set({ patient: null });
            return null;
        }
    },

    // ================= PUBLIC ACTIONS =================

    /**
     * Khởi tạo trạng thái xác thực (Auth Initialization).
     * Luồng: Lấy thông tin User -> Nếu là PATIENT, lấy tiếp thông tin hồ sơ -> Tắt loading.
     */
    initAuth: async () => {
        try {
            const userData = await get()._fetchCurrentUser();
            if (userData?.role === 'PATIENT') {
                await get()._fetchCurrentPatient();
            }
        } finally {
            set({ loading: false });
        }
    },

    /**
     * Đăng nhập bằng phương thức truyền thống (NationID/Password).
     * Đồng bộ hóa hồ sơ bệnh nhân ngay sau khi đăng nhập thành công.
     */
    login: async (credentials) => {
        try {
            const res = await authService.loginNationId(credentials);
            const userData = res?.data;
            if (!userData) throw new Error('No user data returned');

            set({ user: userData, error: null });
            if (userData?.role === 'PATIENT') await get()._fetchCurrentPatient();

            return userData;
        } catch (err) {
            set({ user: null, patient: null, error: err.message });
            throw err;
        }
    },

    /**
     * Đăng nhập bằng Ví MetaMask thông qua chữ ký số.
     * Hỗ trợ xác thực danh tính Web3 và đồng bộ hồ sơ bệnh nhân tương ứng.
     */
    loginMetaMask: async (walletAddress, signature, registrationSignature) => {
        try {
            const res = await authService.loginWallet({
                walletAddress,
                signature,
                registrationSignature,
            });
            const userData = res?.data;
            if (!userData) throw new Error('No user data returned');

            set({ user: userData, error: null });
            if (userData?.role === 'PATIENT') await get()._fetchCurrentPatient();

            return userData;
        } catch (err) {
            set({ user: null, patient: null, error: err.message });
            throw err;
        }
    },

    /**
     * Đăng xuất người dùng.
     * Xóa sạch dữ liệu trong Store và gọi API xóa Session/Cookie trên Server.
     */
    logout: async () => {
        try {
            await authService.logout();
        } finally {
            set({ user: null, patient: null, error: null });
        }
    },

    /**
     * Làm mới thông tin người dùng và hồ sơ.
     * Thường được gọi sau khi người dùng cập nhật thông tin cá nhân hoặc khởi tạo Profile mới.
     */
    refreshUser: async () => {
        const userData = await get()._fetchCurrentUser();
        if (userData?.role === 'PATIENT') await get()._fetchCurrentPatient();
        return userData;
    },
}));
