// app/providers/NotificationProvider/notificationService.ts
let notifyFn: (args: {
  message: string;
  severity?: 'success' | 'error' | 'warning' | 'info';
}) => void;

export const setNotify = (fn: typeof notifyFn) => {
  notifyFn = fn;
};

export const notify = (args: {
  message: string;
  severity?: 'success' | 'error' | 'warning' | 'info';
}) => {
  if (notifyFn) {
    notifyFn(args);
  } else {
    console.warn('Notification system not initialized');
  }
};
