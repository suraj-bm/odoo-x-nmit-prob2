// Custom React hooks for API state management

import { useState, useEffect, useCallback } from 'react';
import { ApiError } from '../api';

export interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  refetch: () => Promise<void>;
}

export interface UseApiOptions {
  immediate?: boolean;
  onSuccess?: (data: unknown) => void;
  onError?: (error: ApiError) => void;
}

// Generic hook for API calls
export function useApi<T>(
  apiCall: () => Promise<T>,
  options: UseApiOptions = {}
): UseApiState<T> {
  const { immediate = true, onSuccess, onError } = options;
  
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState<ApiError | null>(null);

  const execute = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      setData(result);
      onSuccess?.(result);
    } catch (err) {
      const apiError = err instanceof ApiError ? err : new ApiError('An unknown error occurred', 0);
      setError(apiError);
      onError?.(apiError);
    } finally {
      setLoading(false);
    }
  }, [apiCall, onSuccess, onError]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute]);

  return {
    data,
    loading,
    error,
    refetch: execute,
  };
}

// Hook for paginated data
export interface UsePaginatedApiState<T> {
  data: T[];
  loading: boolean;
  error: ApiError | null;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  totalCount: number;
  currentPage: number;
  refetch: () => Promise<void>;
  loadNextPage: () => Promise<void>;
  loadPreviousPage: () => Promise<void>;
  goToPage: (page: number) => Promise<void>;
}

export function usePaginatedApi<T>(
  apiCall: (page: number) => Promise<{
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
  }>,
  options: UseApiOptions = {}
): UsePaginatedApiState<T> {
  const { immediate = true, onSuccess, onError } = options;
  
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState<ApiError | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);

  const execute = useCallback(async (page: number = currentPage) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall(page);
      
      if (page === 1) {
        setData(result.results);
      } else {
        setData(prev => [...prev, ...result.results]);
      }
      
      setTotalCount(result.count);
      setHasNextPage(!!result.next);
      setHasPreviousPage(!!result.previous);
      setCurrentPage(page);
      
      onSuccess?.(result);
    } catch (err) {
      const apiError = err instanceof ApiError ? err : new ApiError('An unknown error occurred', 0);
      setError(apiError);
      onError?.(apiError);
    } finally {
      setLoading(false);
    }
  }, [apiCall, currentPage, onSuccess, onError]);

  useEffect(() => {
    if (immediate) {
      execute(1);
    }
  }, [immediate, execute]);

  const loadNextPage = useCallback(async () => {
    if (hasNextPage && !loading) {
      await execute(currentPage + 1);
    }
  }, [hasNextPage, loading, currentPage, execute]);

  const loadPreviousPage = useCallback(async () => {
    if (hasPreviousPage && !loading) {
      await execute(currentPage - 1);
    }
  }, [hasPreviousPage, loading, currentPage, execute]);

  const goToPage = useCallback(async (page: number) => {
    if (page !== currentPage && !loading) {
      await execute(page);
    }
  }, [currentPage, loading, execute]);

  const refetch = useCallback(async () => {
    await execute(1);
  }, [execute]);

  return {
    data,
    loading,
    error,
    hasNextPage,
    hasPreviousPage,
    totalCount,
    currentPage,
    refetch,
    loadNextPage,
    loadPreviousPage,
    goToPage,
  };
}

// Hook for mutations (create, update, delete)
export interface UseMutationState<T, TVariables = unknown> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  mutate: (variables?: TVariables) => Promise<T | undefined>;
  reset: () => void;
}

export function useMutation<T, TVariables = unknown>(
  mutationFn: (variables: TVariables) => Promise<T>,
  options: {
    onSuccess?: (data: T) => void;
    onError?: (error: ApiError) => void;
  } = {}
): UseMutationState<T, TVariables> {
  const { onSuccess, onError } = options;
  
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const mutate = useCallback(async (variables?: TVariables) => {
    try {
      setLoading(true);
      setError(null);
      const result = await mutationFn(variables as TVariables);
      setData(result);
      onSuccess?.(result);
      return result;
    } catch (err) {
      const apiError = err instanceof ApiError ? err : new ApiError('An unknown error occurred', 0);
      setError(apiError);
      onError?.(apiError);
      return undefined;
    } finally {
      setLoading(false);
    }
  }, [mutationFn, onSuccess, onError]) as (variables?: TVariables) => Promise<T | undefined>;

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    mutate: mutate as (variables?: TVariables) => Promise<T | undefined>,
    reset,
  };
}
