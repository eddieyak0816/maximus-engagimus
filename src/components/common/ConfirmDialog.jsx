/**
 * Confirm Dialog Component
 * 
 * Reusable confirmation dialog for destructive actions.
 * Note: This extends the Modal.Confirm functionality with additional options.
 */

import { useState } from 'react';
import { AlertTriangle, Trash2, LogOut, AlertCircle, Info } from 'lucide-react';
import { Modal, Button, Input } from '../ui';

// Variant configurations
const VARIANTS = {
  danger: {
    icon: AlertTriangle,
    iconBg: 'bg-error-100',
    iconColor: 'text-error-600',
    confirmVariant: 'danger',
  },
  warning: {
    icon: AlertCircle,
    iconBg: 'bg-warning-100',
    iconColor: 'text-warning-600',
    confirmVariant: 'primary',
  },
  info: {
    icon: Info,
    iconBg: 'bg-info-100',
    iconColor: 'text-info-600',
    confirmVariant: 'primary',
  },
  delete: {
    icon: Trash2,
    iconBg: 'bg-error-100',
    iconColor: 'text-error-600',
    confirmVariant: 'danger',
  },
  logout: {
    icon: LogOut,
    iconBg: 'bg-gray-100',
    iconColor: 'text-gray-600',
    confirmVariant: 'primary',
  },
};

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  loading = false,
  requireConfirmation = false,
  confirmationText = '',
  children,
}) {
  const [inputValue, setInputValue] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);

  const config = VARIANTS[variant] || VARIANTS.danger;
  const Icon = config.icon;

  // Check if confirmation input matches
  const canConfirm = requireConfirmation
    ? inputValue === confirmationText
    : true;

  // Handle confirm
  const handleConfirm = async () => {
    if (!canConfirm) return;

    setIsConfirming(true);
    try {
      await onConfirm();
    } finally {
      setIsConfirming(false);
      setInputValue('');
    }
  };

  // Handle close
  const handleClose = () => {
    if (!isConfirming) {
      setInputValue('');
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="sm">
      <div className="text-center">
        {/* Icon */}
        <div
          className={`h-12 w-12 rounded-full ${config.iconBg} mx-auto mb-4 flex items-center justify-center`}
        >
          <Icon className={`h-6 w-6 ${config.iconColor}`} />
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>

        {/* Message */}
        {message && (
          <p className="text-gray-600 mb-4">{message}</p>
        )}

        {/* Custom content */}
        {children}

        {/* Confirmation input */}
        {requireConfirmation && (
          <div className="mt-4 text-left">
            <p className="text-sm text-gray-600 mb-2">
              Type <strong>{confirmationText}</strong> to confirm:
            </p>
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={confirmationText}
              autoFocus
            />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-6">
        <Button
          variant="secondary"
          onClick={handleClose}
          disabled={isConfirming}
          fullWidth
        >
          {cancelText}
        </Button>
        <Button
          variant={config.confirmVariant}
          onClick={handleConfirm}
          loading={loading || isConfirming}
          disabled={!canConfirm}
          fullWidth
        >
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
}

/**
 * Hook for managing confirm dialog state
 */
export function useConfirmDialog() {
  const [state, setState] = useState({
    isOpen: false,
    config: {},
    onConfirm: null,
  });

  const open = (config) => {
    return new Promise((resolve) => {
      setState({
        isOpen: true,
        config,
        onConfirm: () => {
          setState(s => ({ ...s, isOpen: false }));
          resolve(true);
        },
      });
    });
  };

  const close = () => {
    setState(s => ({ ...s, isOpen: false }));
  };

  const confirm = async (config) => {
    return open(config);
  };

  const confirmDelete = (itemName) => {
    return open({
      title: `Delete ${itemName}?`,
      message: `This action cannot be undone. The ${itemName.toLowerCase()} will be permanently deleted.`,
      variant: 'delete',
      confirmText: 'Delete',
    });
  };

  const Dialog = () => (
    <ConfirmDialog
      isOpen={state.isOpen}
      onClose={close}
      onConfirm={state.onConfirm}
      {...state.config}
    />
  );

  return {
    open,
    close,
    confirm,
    confirmDelete,
    Dialog,
    isOpen: state.isOpen,
  };
}

/**
 * Preset confirm dialogs
 */
ConfirmDialog.Delete = function DeleteConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  itemName = 'item',
  itemLabel = '',
  ...props
}) {
  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title={`Delete ${itemName}?`}
      message={
        itemLabel
          ? `Are you sure you want to delete "${itemLabel}"? This action cannot be undone.`
          : `Are you sure you want to delete this ${itemName.toLowerCase()}? This action cannot be undone.`
      }
      confirmText="Delete"
      variant="delete"
      {...props}
    />
  );
};

ConfirmDialog.Logout = function LogoutConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  ...props
}) {
  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Sign Out?"
      message="Are you sure you want to sign out of your account?"
      confirmText="Sign Out"
      variant="logout"
      {...props}
    />
  );
};

ConfirmDialog.Discard = function DiscardConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  ...props
}) {
  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Discard Changes?"
      message="You have unsaved changes. Are you sure you want to discard them?"
      confirmText="Discard"
      variant="warning"
      {...props}
    />
  );
};
