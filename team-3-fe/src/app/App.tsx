import { AppRoutes } from '@/app/routes';
import { ErrorBoundary } from './providers/AppErrorBoundary/AppErrorBoundary';
import { NotificationProvider } from './providers/NotificationProvider';

function App() {
  return (
    <NotificationProvider>
      <ErrorBoundary>
        <AppRoutes />
      </ErrorBoundary>
    </NotificationProvider>
  );
}

export default App;
