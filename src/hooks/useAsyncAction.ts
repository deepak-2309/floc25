import { useState, useCallback } from 'react';
import { getErrorMessage } from '../utils/errorUtils';

/**
 * State shape returned by useAsyncAction hook.
 */
export interface AsyncActionState<T> {
    data: T | null;
    isLoading: boolean;
    error: string | null;
    successMessage: string | null;
}

/**
 * Actions returned by useAsyncAction hook.
 */
export interface AsyncActionHelpers<T> {
    execute: () => Promise<void>;
    setData: React.Dispatch<React.SetStateAction<T | null>>;
    setError: React.Dispatch<React.SetStateAction<string | null>>;
    clearError: () => void;
    setSuccessMessage: React.Dispatch<React.SetStateAction<string | null>>;
    clearSuccessMessage: () => void;
}

/**
 * A reusable hook for managing async actions with loading, error, and success states.
 * 
 * @param asyncFn - The async function to execute
 * @param options - Optional configuration
 * @returns State and helper functions for managing the async action
 * 
 * @example
 * const { data, isLoading, error, execute } = useAsyncAction(fetchUserActivities);
 */
export function useAsyncAction<T>(
    asyncFn: () => Promise<T>,
    options: {
        loadOnMount?: boolean;
        onSuccess?: (data: T) => void;
        onError?: (error: string) => void;
    } = {}
): AsyncActionState<T> & AsyncActionHelpers<T> {
    const [data, setData] = useState<T | null>(null);
    const [isLoading, setIsLoading] = useState(options.loadOnMount ?? true);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const execute = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const result = await asyncFn();
            setData(result);
            options.onSuccess?.(result);
        } catch (err) {
            const message = getErrorMessage(err);
            setError(message);
            options.onError?.(message);
        } finally {
            setIsLoading(false);
        }
    }, [asyncFn, options]);

    const clearError = useCallback(() => setError(null), []);
    const clearSuccessMessage = useCallback(() => setSuccessMessage(null), []);

    return {
        data,
        isLoading,
        error,
        successMessage,
        execute,
        setData,
        setError,
        clearError,
        setSuccessMessage,
        clearSuccessMessage,
    };
}

export default useAsyncAction;
