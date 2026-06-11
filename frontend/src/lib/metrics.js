// import { Counter, register } from 'prom-client';

const register = {
    getSingleMetric: () => null,
    metrics: () => Promise.resolve(''),
    contentType: 'text/plain',
};

const requestCounter = {
    inc: () => {},
};

const errorCounter = {
    inc: () => {},
};

export { requestCounter, errorCounter, register };
