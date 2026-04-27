// Hàm yêu cầu MetaMask chuyển sang mạng Sepolia
export const switchToSepolia = async () => {
    if (!window.ethereum) return false;

    const sepoliaChainId = '0xaa36a7'; // Chain ID của Sepolia hệ Hex

    try {
        // Lấy chain ID hiện tại
        const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });

        // Nếu đã ở Sepolia thì bỏ qua
        if (currentChainId === sepoliaChainId) return true;

        toast.loading('Đang yêu cầu chuyển sang mạng Sepolia...', { id: 'networkSwitch' });

        // Yêu cầu chuyển mạng
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: sepoliaChainId }],
        });

        toast.success('Đã chuyển sang mạng Sepolia', { id: 'networkSwitch' });
        return true;
    } catch (switchError) {
        // Mã lỗi 4902 nghĩa là mạng chưa được thêm vào MetaMask của user
        if (switchError.code === 4902) {
            try {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [
                        {
                            chainId: sepoliaChainId,
                            chainName: 'Sepolia Testnet',
                            nativeCurrency: {
                                name: 'Sepolia Ether',
                                symbol: 'SEP', // Hoặc ETH
                                decimals: 18,
                            },
                            rpcUrls: ['https://rpc.sepolia.org'], // RPC công khai của Sepolia
                            blockExplorerUrls: ['https://sepolia.etherscan.io'],
                        },
                    ],
                });
                toast.success('Đã thêm và chuyển sang mạng Sepolia', { id: 'networkSwitch' });
                return true;
            } catch (addError) {
                console.error('Lỗi khi thêm mạng Sepolia:', addError);
                toast.error('Không thể tự động thêm mạng Sepolia', { id: 'networkSwitch' });
                return false;
            }
        }

        // Các lỗi khác (ví dụ user từ chối chuyển mạng)
        console.error('Lỗi chuyển mạng:', switchError);
        toast.error('Bạn cần chuyển sang Sepolia để tiếp tục', { id: 'networkSwitch' });
        return false;
    }
};
