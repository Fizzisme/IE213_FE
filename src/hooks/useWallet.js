import { useWeb3AuthConnect, useWeb3AuthDisconnect } from '@web3auth/modal/react';
import { useAccount } from 'wagmi';

export function useWallet() {
    const { connect, isConnected, connectorName, loading: connectLoading, error: connectError } = useWeb3AuthConnect();
    const { disconnect, loading: disconnectLoading, error: disconnectError } = useWeb3AuthDisconnect();
    
}
