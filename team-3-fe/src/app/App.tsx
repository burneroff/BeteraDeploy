import { AppRoutes } from '@/app/routes';
import { ErrorBoundary } from './providers/AppErrorBoundary/AppErrorBoundary';
import { NotificationProvider } from './providers/NotificationProvider';
import { pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

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
