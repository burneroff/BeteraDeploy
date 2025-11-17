import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from '@/app/App.tsx';
import { CssBaseline, ThemeProvider } from '@mui/material';
import theme from './theme/theme';
import { AppProviders } from './providers/AppProviders/AppProviders';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProviders>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <App />
        </ThemeProvider>
      </BrowserRouter>
    </AppProviders>
  </React.StrictMode>,
);
