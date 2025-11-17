// app/providers/NotificationProvider/NotificationProvider.tsx
import { useEffect, useState } from 'react';
import { setNotify } from './notificationService';
import { Notification } from '@/shared/components/Notification/Notification';

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  const [notification, setNotification] = useState<{ message: string; severity?: any } | null>(
    null,
  );

  const notify = (n: { message: string; severity?: any }) => {
    setNotification(n);
    setOpen(true);
  };

  useEffect(() => {
    setNotify(notify);
  }, []);

  return (
    <>
      {children}
      {notification && (
        <Notification
          open={open}
          message={notification.message}
          severity={notification.severity}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
};
