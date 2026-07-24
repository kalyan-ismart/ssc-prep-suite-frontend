// jest-dom adds custom jest matchers for asserting on DOM nodes.
try {
  require('@testing-library/jest-dom');
} catch (e) {
  // @testing-library/jest-dom is optional
}

jest.mock('scheduler/tracing', () => ({
  __interactionsRef: { current: new Set() },
  __subscriberRef: { current: null },
  unstable_trace: (name, timestamp, callback) => callback(),
  unstable_wrap: (callback) => callback,
  unstable_getCurrent: () => null,
  unstable_clear: (callback) => callback(),
  unstable_subscribe: () => {},
  unstable_unsubscribe: () => {},
}), { virtual: true });

jest.mock('axios', () => ({
  get: jest.fn(() => Promise.resolve({ data: [] })),
  post: jest.fn(() => Promise.resolve({ data: {} })),
  delete: jest.fn(() => Promise.resolve({ data: {} })),
  put: jest.fn(() => Promise.resolve({ data: {} })),
}));






