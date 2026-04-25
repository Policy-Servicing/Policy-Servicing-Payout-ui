export const environment = {
  production: false,
  apiBaseUrl: '/api/v1',
  useMockData: true,            // existing flag — keep for backward compat
  useRealApi: false,            // set true to call Spring Boot instead of mock data
  apiUrl: 'http://localhost:8080/api/v1/dashboard',
  autoRefreshSeconds: 60,
  appName: 'PolicyServe Dashboard',
  version: '1.0.0'
};

