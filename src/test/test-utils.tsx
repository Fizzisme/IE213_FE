import { render as rtlRender } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';

// Tạo QueryClient mặc định
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
        },
    },
});

// Custom render function với providers
function render(
    ui: React.ReactNode,
    {
        route = '/',
        providerProps = {},
        ...renderOptions
    }: {
        route?: string;
        providerProps?: Partial<React.ComponentProps<typeof QueryClientProvider>>;
    } = {}
) {
    const Wrapper = ({ children }: { children: React.ReactNode }) => (
        <MemoryRouter initialEntries={[route]}>
            <QueryClientProvider client={queryClient} {...providerProps}>
                <ThemeProvider attribute="class" defaultTheme="light">
                    {children}
                </ThemeProvider>
            </QueryClientProvider>
        </MemoryRouter>
    );

    return rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
}

// Export utils
export * from '@testing-library/react';
export { render };
