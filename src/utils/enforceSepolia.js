/**
 * Utility enforceSepolia
 * Hàm tiện ích dùng để kiểm tra và ép buộc người dùng chuyển sang mạng Sepolia Testnet.
 * * Logic vận hành:
 * 1. Kiểm tra sự tồn tại của MetaMask.
 * 2. So sánh Chain ID hiện tại với Sepolia (0xaa36a7).
 * 3. Nếu sai mạng, yêu cầu chuyển mạng (wallet_switchEthereumChain).
 * 4. Nếu mạng chưa tồn tại trong ví, tự động thêm mạng mới (wallet_addEthereumChain).
 */
export const enforceSepolia = async () => {
    // Kiểm tra xem trình duyệt đã cài đặt MetaMask (EIP-1193) chưa
    if (!window.ethereum) {
        throw new Error('Không tìm thấy MetaMask!');
    }

    // Chain ID của mạng Sepolia (Dạng Hexadecimal theo chuẩn Ethereum)
    const sepoliaChainId = '0xaa36a7';

    try {
        // Lấy Chain ID mà ví của người dùng đang kết nối hiện tại
        const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });

        // Trường hợp 1: Đã ở đúng mạng Sepolia thì cho phép tiếp tục luồng xử lý
        if (currentChainId === sepoliaChainId) return;

        // Thông báo cho người dùng biết hệ thống đang yêu cầu chuyển mạng
        toast.loading('Bắt buộc chuyển sang mạng Sepolia để giao dịch...', { id: 'networkSwitch' });

        // ================= YÊU CẦU CHUYỂN MẠNG (SWITCH NETWORK) =================
        // MetaMask sẽ hiển thị cửa sổ Pop-up yêu cầu xác nhận chuyển đổi
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: sepoliaChainId }],
        });

        toast.success('Đã chuyển sang mạng Sepolia', { id: 'networkSwitch' });
    } catch (error) {
        // ================= XỬ LÝ LỖI ĐẶC THÙ (ERROR HANDLING) =================

        /**
         * Lỗi 4902: Unrecognized Chain ID.
         * Xảy ra khi mạng Sepolia chưa từng được cấu hình trong ví của người dùng.
         */
        if (error.code === 4902) {
            try {
                // Yêu cầu MetaMask thêm mạng Sepolia với các cấu hình chuẩn RPC/Explorer
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [
                        {
                            chainId: sepoliaChainId,
                            chainName: 'Sepolia Testnet',
                            nativeCurrency: { name: 'Sepolia Ether', symbol: 'SEP', decimals: 18 },
                            rpcUrls: ['https://rpc.sepolia.org'],
                            blockExplorerUrls: ['https://sepolia.etherscan.io'],
                        },
                    ],
                });
                toast.success('Đã thêm và chuyển sang Sepolia', { id: 'networkSwitch' });
                return; // Sau khi thêm và chuyển thành công thì kết thúc hàm
            } catch (addError) {
                // Người dùng chủ động bấm "Cancel" trên Pop-up thêm mạng của MetaMask
                toast.dismiss('networkSwitch');
                throw new Error('Bạn đã từ chối thêm mạng Sepolia. Giao dịch bị hủy!');
            }
        }

        /**
         * Trường hợp người dùng từ chối chuyển mạng (Bấm Cancel trên Pop-up chuyển mạng).
         * Chúng ta cần ném lỗi (Throw Error) để chặn các hành động Blockchain tiếp theo (như ký giao dịch).
         */
        toast.dismiss('networkSwitch');
        throw new Error('Bắt buộc phải chuyển sang Sepolia Testnet để thực hiện tính năng này!');
    }
};
