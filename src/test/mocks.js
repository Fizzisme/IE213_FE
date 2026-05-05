import { vi } from 'vitest';

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
    useNavigate: vi.fn(),
    useLocation: vi.fn(),
    useParams: vi.fn(),
    useSearchParams: vi.fn(),
    NavLink: ({ children, to, className }: { children: React.ReactNode; to: string; className?: string }) => {
        const handleClick = () => {};
        return <a href={to} onClick={handleClick} className={className}>{children}</a>;
    },
}));

// Mock react-query
vi.mock('@tanstack/react-query', () => ({
    useQuery: vi.fn(),
    useMutation: vi.fn(),
    useQueryClient: vi.fn(),
    QueryClient: vi.fn().mockImplementation(() => ({
        setQueryData: vi.fn(),
        getQueryData: vi.fn(),
        invalidateQueries: vi.fn(),
        refetchQueries: vi.fn(),
    })),
    QueryClientProvider: ({ children, client }: { children: React.ReactNode; client: unknown }) => children,
}));

// Mock axios
vi.mock('axios', () => ({
    default: {
        create: vi.fn(() => ({
            get: vi.fn(),
            post: vi.fn(),
            put: vi.fn(),
            delete: vi.fn(),
            interceptors: {
                request: { use: vi.fn(), eject: vi.fn() },
                response: { use: vi.fn(), eject: vi.fn() },
            },
        })),
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
    },
}));

// Mock ethers
vi.mock('ethers', () => ({
    ethers: {
        Wallet: vi.fn(),
        providers: {
            JsonRpcProvider: vi.fn(),
        },
        constants: {
            AddressZero: '0x0000000000000000000000000000000000000000',
        },
    },
}));
