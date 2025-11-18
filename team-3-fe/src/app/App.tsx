import { AppRoutes } from '@/app/routes';
import { ErrorBoundary } from './providers/AppErrorBoundary/AppErrorBoundary';
import { NotificationProvider } from './providers/NotificationProvider';
import { pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc =
  'https://cdn.jsdelivr.net/npm/pdf.worker@1.0.0/pdf.worker.min.js';

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
