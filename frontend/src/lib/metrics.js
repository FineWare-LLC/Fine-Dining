import { Counter, register } from 'prom-client';

export const requestCounter = new Counter({
  name: 'app_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['route', 'method', 'status'],
});

export const errorCounter = new Counter({
  name: 'app_errors_total',
  help: 'Total application errors',
  labelNames: ['route'],
});

export { register };
