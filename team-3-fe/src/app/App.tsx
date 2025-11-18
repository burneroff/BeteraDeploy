import { AppRoutes } from '@/app/routes';
import { ErrorBoundary } from './providers/AppErrorBoundary/AppErrorBoundary';
import { NotificationProvider } from './providers/NotificationProvider';
import { pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = '/assets/pdf.worker.min.mjs';

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
