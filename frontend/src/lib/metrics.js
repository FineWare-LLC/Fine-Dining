import { Counter, register } from 'prom-client';

// Check if metrics are already registered to avoid duplicate registration
let requestCounter;
let errorCounter;

try {
  // Try to get existing metrics
  requestCounter = register.getSingleMetric('app_requests_total');

  // If metric doesn't exist, create it
  if (!requestCounter) {
    requestCounter = new Counter({
      name: 'app_requests_total',
      help: 'Total HTTP requests',
      labelNames: ['route', 'method', 'status'],
    });
  }
} catch (e) {
  // If there's an error, create a new metric
  requestCounter = new Counter({
    name: 'app_requests_total',
    help: 'Total HTTP requests',
    labelNames: ['route', 'method', 'status'],
  });
}

try {
  // Try to get existing metrics
  errorCounter = register.getSingleMetric('app_errors_total');

  // If metric doesn't exist, create it
  if (!errorCounter) {
    errorCounter = new Counter({
      name: 'app_errors_total',
      help: 'Total application errors',
      labelNames: ['route'],
    });
  }
} catch (e) {
  // If there's an error, create a new metric
  errorCounter = new Counter({
    name: 'app_errors_total',
    help: 'Total application errors',
    labelNames: ['route'],
  });
}

export { requestCounter, errorCounter, register };
