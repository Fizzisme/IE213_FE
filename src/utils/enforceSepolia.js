// Đổi tên thành enforce (ép buộc) để thể hiện rõ logic
export const enforceSepolia = async () => {
    if (!window.ethereum) {
        throw new Error('Không tìm thấy MetaMask!');
    }

    const sepoliaChainId = '0xaa36a7';

    try {
        const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });

        // Đã ở đúng mạng Sepolia thì cho đi tiếp
        if (currentChainId === sepoliaChainId) return;

        toast.loading('Bắt buộc chuyển sang mạng Sepolia để giao dịch...', { id: 'networkSwitch' });

        // Yêu cầu chuyển mạng (MetaMask sẽ hiện Pop-up)
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: sepoliaChainId }],
        });

        toast.success('Đã chuyển sang mạng Sepolia', { id: 'networkSwitch' });
    } catch (error) {
        // Lỗi 4902: Mạng chưa có trong ví -> Ép thêm mạng
        if (error.code === 4902) {
            try {
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
                return; // Thêm và chuyển thành công thì cho đi tiếp
            } catch (addError) {
                // Người dùng từ chối thêm mạng
                toast.dismiss('networkSwitch');
                throw new Error('Bạn đã từ chối thêm mạng Sepolia. Giao dịch bị hủy!');
            }
        }

        // Người dùng bấm "Cancel" (Từ chối chuyển mạng) -> Bắn lỗi để chặn luồng
        toast.dismiss('networkSwitch');
        throw new Error('Bắt buộc phải chuyển sang Sepolia Testnet để thực hiện tính năng này!');
    }
};
