import { useState, useCallback } from 'react';

interface AsyncOperationState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface AsyncOperationActions<T> {
  execute: (...args: any[]) => Promise<T>;
  reset: () => void;
  setData: (data: T) => void;
}

export function useAsyncOperation<T>(
  asyncFunction: (...args: any[]) => Promise<T>
): AsyncOperationState<T> & AsyncOperationActions<T> {
  const [state, setState] = useState<AsyncOperationState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (...args: any[]) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await asyncFunction(...args);
      setState(prev => ({ ...prev, data: result, loading: false, error: null }));
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ha ocurrido un error inesperado';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      throw error;
    }
  }, [asyncFunction]);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  const setData = useCallback((data: T) => {
    setState(prev => ({ ...prev, data, error: null }));
  }, []);

  return {
    ...state,
    execute,
    reset,
    setData,
  };
}