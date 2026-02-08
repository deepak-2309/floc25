import { useState, useEffect, useCallback } from 'react';
import { Activity } from '../types';
import {
    fetchUserActivities,
    fetchConnectionsActivities,
    joinActivity as joinActivityAction,
    leaveActivity as leaveActivityAction,
    hasUserJoined
} from '../firebase/activityActions';
import { getErrorMessage } from '../utils/errorUtils';

/**
 * Options for configuring the useActivities hook.
 */
export interface UseActivitiesOptions {
    /** Fetch user's own activities vs connections' activities */
    source: 'user' | 'connections';
    /** Whether to filter out past activities (default: true) */
    filterPast?: boolean;
    /** Whether to sort by date ascending (default: true) */
    sortAscending?: boolean;
}

/**
 * Return type for the useActivities hook.
 */
export interface UseActivitiesReturn {
    activities: Activity[];
    isLoading: boolean;
    error: string | null;
    successMessage: string | null;
    reload: () => Promise<void>;
    joinToggle: (activity: Activity) => Promise<void>;
    isJoined: (activity: Activity) => boolean;
    clearError: () => void;
    clearSuccessMessage: () => void;
}

/**
 * Hook for managing activity data fetching, joining, and leaving.
 * 
 * @param options - Configuration options
 * @returns Activities data and helper functions
 * 
 * @example
 * // For user's own activities:
 * const { activities, isLoading, joinToggle } = useActivities({ source: 'user' });
 * 
 * // For connections' activities:
 * const { activities, isLoading, joinToggle } = useActivities({ source: 'connections' });
 */
export function useActivities(options: UseActivitiesOptions): UseActivitiesReturn {
    const { source, filterPast = true, sortAscending = true } = options;

    const [activities, setActivities] = useState<Activity[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const fetchFn = source === 'user' ? fetchUserActivities : fetchConnectionsActivities;

    const reload = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const fetched = await fetchFn();

            let processed = fetched;

            // Filter past activities
            if (filterPast) {
                const now = new Date();
                processed = processed.filter(activity => activity.dateTime > now);
            }

            // Sort by date
            processed = processed.sort((a, b) => {
                const diff = a.dateTime.getTime() - b.dateTime.getTime();
                return sortAscending ? diff : -diff;
            });

            setActivities(processed);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setIsLoading(false);
        }
    }, [fetchFn, filterPast, sortAscending]);

    // Load on mount
    useEffect(() => {
        reload();
    }, [reload]);

    const joinToggle = useCallback(async (activity: Activity) => {
        try {
            setError(null);
            setSuccessMessage(null);
            const joined = hasUserJoined(activity);

            if (joined) {
                await leaveActivityAction(activity.id);
                setSuccessMessage('Left activity successfully');
            } else {
                await joinActivityAction(activity.id);
                setSuccessMessage('Joined activity successfully');
            }

            await reload();
        } catch (err) {
            setError(getErrorMessage(err));
        }
    }, [reload]);

    const isJoined = useCallback((activity: Activity) => {
        return hasUserJoined(activity);
    }, []);

    const clearError = useCallback(() => setError(null), []);
    const clearSuccessMessage = useCallback(() => setSuccessMessage(null), []);

    return {
        activities,
        isLoading,
        error,
        successMessage,
        reload,
        joinToggle,
        isJoined,
        clearError,
        clearSuccessMessage,
    };
}

export default useActivities;
