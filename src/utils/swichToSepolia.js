/**
 * Utility switchToSepolia
 * Hàm thực hiện yêu cầu MetaMask chuyển đổi mạng kết nối sang Sepolia Testnet.
 * Khác với hàm "enforce", hàm này trả về giá trị boolean (true/false) để các
 * component gọi nó có thể chủ động quyết định luồng xử lý tiếp theo.
 * * @returns {Promise<boolean>} True nếu đã ở hoặc chuyển mạng thành công, False nếu thất bại.
 */
export const switchToSepolia = async () => {
    // Kiểm tra sự tồn tại của nhà cung cấp Ethereum (MetaMask)
    if (!window.ethereum) return false;

    // Chain ID định danh của Sepolia ở hệ Thập lục phân (Hexadecimal)
    const sepoliaChainId = '0xaa36a7';

    try {
        // Lấy mã Chain ID của mạng hiện tại mà ví đang kết nối
        const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });

        // Trường hợp 1: Nếu người dùng đã ở đúng mạng Sepolia, không cần thực hiện thêm thao tác
        if (currentChainId === sepoliaChainId) return true;

        toast.loading('Đang yêu cầu chuyển sang mạng Sepolia...', { id: 'networkSwitch' });

        // ================= YÊU CẦU CHUYỂN MẠNG =================
        // Gửi yêu cầu chuyển mạng (Pop-up MetaMask sẽ xuất hiện)
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: sepoliaChainId }],
        });

        toast.success('Đã chuyển sang mạng Sepolia', { id: 'networkSwitch' });
        return true;
    } catch (switchError) {
        // ================= XỬ LÝ LỖI MẠNG CHƯA TỒN TẠI =================

        /**
         * Mã lỗi 4902: Unrecognized Chain ID.
         * Xảy ra khi mạng Sepolia chưa được cấu hình (thêm) vào danh sách mạng trong ví MetaMask.
         */
        if (switchError.code === 4902) {
            try {
                // Thực hiện thêm cấu hình mạng Sepolia vào ví của người dùng
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [
                        {
                            chainId: sepoliaChainId,
                            chainName: 'Sepolia Testnet',
                            nativeCurrency: {
                                name: 'Sepolia Ether',
                                symbol: 'SEP',
                                decimals: 18,
                            },
                            rpcUrls: ['https://rpc.sepolia.org'], // Endpoint RPC để tương tác với Node Sepolia
                            blockExplorerUrls: ['https://sepolia.etherscan.io'],
                        },
                    ],
                });
                toast.success('Đã thêm và chuyển sang mạng Sepolia', { id: 'networkSwitch' });
                return true;
            } catch (addError) {
                // Xảy ra khi việc tự động thêm mạng thất bại hoặc bị từ chối
                console.error('[Blockchain] Lỗi khi thêm mạng Sepolia:', addError);
                toast.error('Không thể tự động thêm mạng Sepolia', { id: 'networkSwitch' });
                return false;
            }
        }

        // ================= XỬ LÝ CÁC LỖI NGOẠI LỆ KHÁC =================
        // Ví dụ: Người dùng chủ động từ chối (Reject) yêu cầu chuyển mạng trên MetaMask
        console.error('[Blockchain] Lỗi chuyển mạng:', switchError);
        toast.error('Bạn cần chuyển sang Sepolia để tiếp tục', { id: 'networkSwitch' });
        return false;
    }
};
