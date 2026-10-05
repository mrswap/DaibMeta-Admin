import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5,      // 5 min fresh
            gcTime: 1000 * 60 * 10,         // 10 min cache
            retry: 1,
            refetchOnWindowFocus: false,
        },
    },
});