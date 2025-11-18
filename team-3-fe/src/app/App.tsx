import { AppRoutes } from '@/app/routes';
import { ErrorBoundary } from './providers/AppErrorBoundary/AppErrorBoundary';
import { NotificationProvider } from './providers/NotificationProvider';
import { pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

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
