export const environment = {
  production: true,
  apiBaseUrl: '',               // Empty = same origin; configure via Vercel env var if needed
  useMockData: false,           // Always use real API in production
  useRealApi: true,             // Production always calls Spring Boot
  apiUrl: '/api/v1/dashboard',  // Relative — served from same origin via reverse proxy
  autoRefreshSeconds: 60,
  appName: 'PolicyServe Dashboard',
  version: '1.0.0'
};

