import { AxiosError } from 'axios';

export interface ApiError {
  message: string;
  code?: string;
  statusCode?: number;
  details?: any;
}

export const parseApiError = (error: unknown): ApiError => {
  // Handle Axios errors
  if (error instanceof AxiosError) {
    if (error.response) {
      // Server responded with error status
      return {
        message: error.response.data?.message || error.message || 'Error del servidor',
        code: error.response.data?.code || error.code,
        statusCode: error.response.status,
        details: error.response.data
      };
    } else if (error.request) {
      // Request was made but no response received
      return {
        message: 'No se pudo conectar al servidor. Verifica tu conexión a internet.',
        code: 'NETWORK_ERROR',
        statusCode: 0
      };
    }
  }

  // Handle standard errors
  if (error instanceof Error) {
    return {
      message: error.message,
      details: error
    };
  }

  // Handle unknown errors
  if (typeof error === 'string') {
    return { message: error };
  }

  return { message: 'Ha ocurrido un error inesperado' };
};

export const getErrorMessage = (error: unknown): string => {
  const parsedError = parseApiError(error);
  return parsedError.message;
};

export const isNetworkError = (error: unknown): boolean => {
  const parsedError = parseApiError(error);
  return parsedError.code === 'NETWORK_ERROR' || parsedError.statusCode === 0;
};

export const createErrorHandler = (
  onError?: (error: ApiError) => void,
  fallbackMessage?: string
) => {
  return (error: unknown) => {
    const parsedError = parseApiError(error);
    
    if (fallbackMessage) {
      parsedError.message = fallbackMessage;
    }
    
    console.error('Error handled:', parsedError);
    
    if (onError) {
      onError(parsedError);
    }
    
    return parsedError;
  };
};