import React from 'react';
import LoadingSpinner from './LoadingSpinner';
import ErrorAlert from './ErrorAlert';
import EmptyState from './EmptyState';
import { LucideIcon } from 'lucide-react';

interface AsyncContentProps<T> {
  loading: boolean;
  error: string | null;
  data: T | null;
  children: (data: T) => React.ReactNode;
  
  // Loading state customization
  loadingText?: string;
  loadingSpinnerSize?: 'sm' | 'md' | 'lg';
  
  // Error state customization
  errorTitle?: string;
  onRetry?: () => void;
  
  // Empty state customization
  emptyIcon?: LucideIcon;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  
  // Layout
  className?: string;
  minHeight?: string;
}

function AsyncContent<T>({
  loading,
  error,
  data,
  children,
  loadingText = 'Cargando...',
  loadingSpinnerSize = 'md',
  errorTitle = 'Error',
  onRetry,
  emptyIcon,
  emptyTitle = 'No hay datos',
  emptyDescription = 'No se encontraron datos para mostrar',
  emptyAction,
  className = '',
  minHeight = '400px'
}: AsyncContentProps<T>) {
  const containerStyle = { minHeight };

  if (loading) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={containerStyle}>
        <LoadingSpinner size={loadingSpinnerSize} text={loadingText} />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center p-4 ${className}`} style={containerStyle}>
        <ErrorAlert
          title={errorTitle}
          message={error}
          onDismiss={onRetry}
          className="max-w-md"
        />
      </div>
    );
  }

  if (!data) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={containerStyle}>
        <EmptyState
          icon={emptyIcon}
          title={emptyTitle}
          description={emptyDescription}
          action={emptyAction}
        />
      </div>
    );
  }

  return <>{children(data)}</>;
}

export default AsyncContent;