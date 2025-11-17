import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';

let client: QueryClient | null = null;

export function getQueryClient() {
  if (client) return client;

  client = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 0,
      },
    },
    queryCache: new QueryCache({

    }),
    mutationCache: new MutationCache({

    }),
  });

  return client;
}
