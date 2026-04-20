// Stub - network features disabled for APK build
import React, { createContext, useContext, ReactNode } from 'react';

interface NetworkContextType {
    isConnected: boolean | null;
    isInternetReachable: boolean | null;
    connectionType: string | null;
}

const NetworkContext = createContext<NetworkContextType>({
    isConnected: true,
    isInternetReachable: true,
    connectionType: 'wifi',
});

export const NetworkProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    return (
        <NetworkContext.Provider
            value={{
                isConnected: true,
                isInternetReachable: true,
                connectionType: 'wifi',
            }}
        >
            {children}
        </NetworkContext.Provider>
    );
};

export const useNetwork = () => useContext(NetworkContext);

export default NetworkContext;