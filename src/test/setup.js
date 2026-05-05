import '@testing-library/jest-dom';

// Mock window.matchMedia cho các component sử dụng responsive
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
    }),
});

// Mock scroll
Object.defineProperty(window, 'scrollTo', {
    value: () => {},
});
