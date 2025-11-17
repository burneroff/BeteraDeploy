import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { authStorage } from '../auth/authStorage';

// ───────────────────────────────────────────────────────────────────────────────
// Базовый клиент для всех НЕ-auth запросов
// ───────────────────────────────────────────────────────────────────────────────
export const http = axios.create({
  baseURL: 'http://localhost:8080',
  withCredentials: true,
  timeout: 10000,
});

// Отдельный клиент ТОЛЬКО для refresh (без интерсепторов, без Authorization)
const refreshHttp = axios.create({
  baseURL: 'http://localhost:8080',
  withCredentials: true,
  timeout: 10000,
});

// Помогаем TS: помечаем ретраи и флаг "это refresh-запрос"
declare module 'axios' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface InternalAxiosRequestConfig {
    _retry?: boolean;
    _isRefresh?: boolean;
  }
}

// ───────────────────────────────────────────────────────────────────────────────
// REQUEST: подставляем accessToken
// ───────────────────────────────────────────────────────────────────────────────
http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = authStorage.getAccessToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let queue: Array<(token: string | null) => void> = [];
const waitForToken = () => new Promise<string | null>((resolve) => queue.push(resolve));

const flushQueue = (newToken: string | null) => {
  queue.forEach((resolve) => resolve(newToken));
  queue = [];
};

const isAuthEndpoint = (url = '') =>
  url.includes('/api/v1/auth/login') ||
  url.includes('/api/v1/auth/register') ||
  url.includes('/api/v1/auth/confirm') ||
  url.includes('/api/v1/auth/resend') ||
  url.includes('/api/v1/auth/refresh');

http.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig | undefined;
    if (!original || !error.response) return Promise.reject(error);
    if (error.response.status !== 401) return Promise.reject(error);

    const url = original.url || '';
    if (isAuthEndpoint(url) || original._isRefresh) {
      authStorage.clear();
      return Promise.reject(error);
    }
    if (original._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      const newToken = await waitForToken();
      if (!newToken) return Promise.reject(error);
      original.headers = original.headers ?? {};
      (original.headers as any).Authorization = `Bearer ${newToken}`;
      return http(original);
    }

    // запускаем refresh
    isRefreshing = true;
    original._retry = true;

    try {
      const refreshToken = authStorage.getRefreshToken();
      if (!refreshToken) throw new Error('No refresh token');

      const resp = await refreshHttp.post(
        '/api/v1/auth/refresh',
        { refresh_token: refreshToken },
        { headers: { 'Content-Type': 'application/json' } },
      );

      const data = (resp.data as any)?.data ?? {};
      const newAccess = data.accessToken || data.access_token;
      const newRefresh = data.refreshToken || data.refresh_token;
      if (!newAccess || !newRefresh) throw new Error('Bad refresh response');

      authStorage.saveTokens(newAccess, newRefresh);

      // критично: обновить дефолтные хедеры
      http.defaults.headers.common.Authorization = `Bearer ${newAccess}`;

      // разбудить ожидающих
      flushQueue(newAccess);

      original.headers = original.headers ?? {};
      (original.headers as any).Authorization = `Bearer ${newAccess}`;
      return http(original);
    } catch (e) {
      authStorage.clear();
      flushQueue(null);
      return Promise.reject(e);
    } finally {
      isRefreshing = false;
    }
  },
);
