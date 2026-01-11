/**
 * Toast Component
 * 
 * Toast notifications with multiple variants and auto-dismiss.
 * Includes a simple store for managing toasts app-wide.
 */

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

// Toast variants configuration
const variants = {
  success: {
    icon: CheckCircle,
    className: 'bg-success-50 border-success-200 text-success-800',
    iconClassName: 'text-success-500',
  },
  error: {
    icon: AlertCircle,
    className: 'bg-error-50 border-error-200 text-error-800',
    iconClassName: 'text-error-500',
  },
  warning: {
    icon: AlertTriangle,
    className: 'bg-warning-50 border-warning-200 text-warning-800',
    iconClassName: 'text-warning-500',
  },
  info: {
    icon: Info,
    className: 'bg-primary-50 border-primary-200 text-primary-800',
    iconClassName: 'text-primary-500',
  },
};

// Simple toast store
let toastListeners = [];
let toasts = [];
let toastId = 0;

function notifyListeners() {
  toastListeners.forEach((listener) => listener([...toasts]));
}

export const toast = {
  show: (message, options = {}) => {
    const id = ++toastId;
    const newToast = {
      id,
      message,
      variant: options.variant || 'info',
      duration: options.duration ?? 5000,
      ...options,
    };
    toasts = [...toasts, newToast];
    notifyListeners();
    return id;
  },
  success: (message, options = {}) =>
    toast.show(message, { ...options, variant: 'success' }),
  error: (message, options = {}) =>
    toast.show(message, { ...options, variant: 'error' }),
  warning: (message, options = {}) =>
    toast.show(message, { ...options, variant: 'warning' }),
  info: (message, options = {}) =>
    toast.show(message, { ...options, variant: 'info' }),
  dismiss: (id) => {
    toasts = toasts.filter((t) => t.id !== id);
    notifyListeners();
  },
  dismissAll: () => {
    toasts = [];
    notifyListeners();
  },
};

// Hook to use toast store
function useToastStore() {
  const [state, setState] = useState(toasts);

  useEffect(() => {
    toastListeners.push(setState);
    return () => {
      toastListeners = toastListeners.filter((l) => l !== setState);
    };
  }, []);

  return state;
}

// Single toast item
function ToastItem({ toast: t, onDismiss }) {
  const [isExiting, setIsExiting] = useState(false);
  const variant = variants[t.variant] || variants.info;
  const Icon = variant.icon;

  // Auto dismiss
  useEffect(() => {
    if (t.duration > 0) {
      const timer = setTimeout(() => {
        setIsExiting(true);
      }, t.duration);
      return () => clearTimeout(timer);
    }
  }, [t.duration]);

  // Handle exit animation
  useEffect(() => {
    if (isExiting) {
      const timer = setTimeout(() => {
        onDismiss(t.id);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isExiting, onDismiss, t.id]);

  const handleDismiss = useCallback(() => {
    setIsExiting(true);
  }, []);

  return (
    <div
      className={`
        flex items-start gap-3 p-4 rounded-lg border shadow-lg
        transform transition-all duration-300
        ${variant.className}
        ${isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'}
      `}
      role="alert"
    >
      <Icon className={`h-5 w-5 flex-shrink-0 ${variant.iconClassName}`} />
      <div className="flex-1 text-sm font-medium">{t.message}</div>
      <button
        onClick={handleDismiss}
        className="flex-shrink-0 p-0.5 rounded hover:bg-black/10 transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

// Toast container component
export function ToastContainer({ position = 'top-right' }) {
  const toasts = useToastStore();

  // Position classes
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
  };

  if (toasts.length === 0) return null;

  return createPortal(
    <div
      className={`fixed z-[100] flex flex-col gap-2 w-full max-w-sm ${positionClasses[position]}`}
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={toast.dismiss} />
      ))}
    </div>,
    document.body
  );
}

export default toast;
