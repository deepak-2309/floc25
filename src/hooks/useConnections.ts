import { useState, useEffect, useCallback } from 'react';
import { Connection } from '../types';
import {
    fetchUserConnections,
    fetchUserConnectionsList,
    addConnection as addConnectionAction,
    removeConnection as removeConnectionAction
} from '../firebase/userActions';
import { getErrorMessage } from '../utils/errorUtils';

/**
 * Options for configuring the useConnections hook.
 */
export interface UseConnectionsOptions {
    /** User ID to fetch connections for. If undefined, fetches current user's connections. */
    userId?: string;
    /** Whether to auto-refresh connections periodically (default: false) */
    autoRefresh?: boolean;
    /** Refresh interval in ms (default: 10000) */
    refreshInterval?: number;
}

/**
 * Return type for the useConnections hook.
 */
export interface UseConnectionsReturn {
    connections: Connection[];
    isLoading: boolean;
    error: string | null;
    successMessage: string | null;
    reload: () => Promise<void>;
    addConnection: (email: string) => Promise<void>;
    removeConnection: (userId: string) => Promise<void>;
    clearError: () => void;
    clearSuccessMessage: () => void;
}

/**
 * Hook for managing connection data fetching, adding, and removing.
 * 
 * @param options - Configuration options
 * @returns Connections data and helper functions
 * 
 * @example
 * // For current user's connections:
 * const { connections, addConnection, removeConnection } = useConnections();
 * 
 * // For another user's connections:
 * const { connections } = useConnections({ userId: 'some-user-id' });
 */
export function useConnections(options: UseConnectionsOptions = {}): UseConnectionsReturn {
    const { userId, autoRefresh = false, refreshInterval = 10000 } = options;
    const isViewingOther = !!userId;

    const [connections, setConnections] = useState<Connection[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const reload = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            let fetched: Connection[];
            if (isViewingOther && userId) {
                fetched = await fetchUserConnectionsList(userId);
            } else {
                fetched = await fetchUserConnections();
            }

            setConnections(fetched);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setIsLoading(false);
        }
    }, [userId, isViewingOther]);

    // Load on mount
    useEffect(() => {
        reload();
    }, [reload]);

    // Auto-refresh for own connections
    useEffect(() => {
        if (!autoRefresh || isViewingOther) return;

        const intervalId = setInterval(reload, refreshInterval);
        return () => clearInterval(intervalId);
    }, [autoRefresh, isViewingOther, refreshInterval, reload]);

    const addConnection = useCallback(async (email: string) => {
        try {
            setError(null);
            await addConnectionAction(email);
            setSuccessMessage('Connection added successfully');
            await reload();
        } catch (err) {
            setError(getErrorMessage(err));
            throw err; // Re-throw so caller can handle
        }
    }, [reload]);

    const removeConnection = useCallback(async (targetUserId: string) => {
        try {
            setError(null);
            await removeConnectionAction(targetUserId);
            setSuccessMessage('Connection removed successfully');
            await reload();
        } catch (err) {
            setError(getErrorMessage(err));
            throw err;
        }
    }, [reload]);

    const clearError = useCallback(() => setError(null), []);
    const clearSuccessMessage = useCallback(() => setSuccessMessage(null), []);

    return {
        connections,
        isLoading,
        error,
        successMessage,
        reload,
        addConnection,
        removeConnection,
        clearError,
        clearSuccessMessage,
    };
}

export default useConnections;
