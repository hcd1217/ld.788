// Optimized notification utilities for better tree shaking
import {notifications} from '@mantine/notifications';

// Centralized notification types for better bundling
export type NotificationOptions = {
  title: string;
  message: string;
  color?: 'green' | 'red' | 'blue' | 'orange' | 'yellow';
  icon?: React.ReactNode;
  autoClose?: boolean | number;
  withCloseButton?: boolean;
};

// Optimized notification functions
export const showSuccessNotification = (
  options: Pick<NotificationOptions, 'title' | 'message'>,
) => {
  notifications.show({
    title: options.title,
    message: options.message,
    color: 'green',
    autoClose: 5000,
    withCloseButton: true,
  });
};

export const showErrorNotification = (
  options: Pick<NotificationOptions, 'title' | 'message'> & {
    icon?: React.ReactNode;
  },
) => {
  notifications.show({
    title: options.title,
    message: options.message,
    color: 'red',
    icon: options.icon,
    autoClose: 7000,
    withCloseButton: true,
  });
};

export const showInfoNotification = (
  options: Pick<NotificationOptions, 'title' | 'message'>,
) => {
  notifications.show({
    title: options.title,
    message: options.message,
    color: 'blue',
    autoClose: 5000,
    withCloseButton: true,
  });
};

export const showWarningNotification = (
  options: Pick<NotificationOptions, 'title' | 'message'>,
) => {
  notifications.show({
    title: options.title,
    message: options.message,
    color: 'orange',
    autoClose: 6000,
    withCloseButton: true,
  });
};

// Auth-specific notification helpers
export const showAuthNotifications = {
  loginSuccess(title: string, message: string) {
    showSuccessNotification({title, message});
  },
  loginFailed(title: string, message: string, icon?: React.ReactNode) {
    showErrorNotification({title, message, icon});
  },
  resetPasswordSuccess(title: string, message: string) {
    showSuccessNotification({title, message});
  },
  resetPasswordFailed(title: string, message: string) {
    showErrorNotification({title, message});
  },
  forgotPasswordSuccess(title: string, message: string) {
    showSuccessNotification({title, message});
  },
  registrationSuccess(title: string, message: string) {
    showSuccessNotification({title, message});
  },
  registrationFailed(title: string, message: string) {
    showErrorNotification({title, message});
  },
};

// Generic notification function (for backward compatibility)
export const showNotification = (options: NotificationOptions) => {
  notifications.show({
    title: options.title,
    message: options.message,
    color: options.color || 'blue',
    icon: options.icon,
    autoClose: options.autoClose ?? 5000,
    withCloseButton: options.withCloseButton ?? true,
  });
};

// Utility to clear all notifications
export const clearAllNotifications = () => {
  notifications.clean();
};

// Re-export original notifications for advanced use cases
export {notifications};
