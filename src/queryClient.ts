import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // sensible defaults for the app: avoid refetch on window focus and
      // don't retry automatically (backend may return structured errors).
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});
