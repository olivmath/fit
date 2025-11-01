import { ApolloClient, InMemoryCache, HttpLink, ApolloLink } from '@apollo/client';
import { onError } from '@apollo/client/link/error';

// Use ENVIO GraphQL endpoint or fall back to localhost for local development
const ENVIO_GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_ENVIO_GRAPHQL_URL || 'http://localhost:8080/v1/graphql';

// Error handling link
const errorLink = onError((error: any) => {
  const { graphQLErrors, networkError } = error;

  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }: any) => {
      console.error(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`);
    });
  }

  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
  }
});

// HTTP link to ENVIO GraphQL endpoint
const httpLink = new HttpLink({
  uri: ENVIO_GRAPHQL_ENDPOINT,
  credentials: 'omit', // Don't send cookies for CORS requests
  fetch: (uri: RequestInfo | URL, options?: RequestInit) => {
    return fetch(uri, {
      ...options,
      // Ensure proper headers for GraphQL
      headers: {
        ...(options?.headers || {}),
        'Content-Type': 'application/json',
      },
    });
  },
});

// Combine error and HTTP links
const link = ApolloLink.from([errorLink, httpLink]);

// Create Apollo Client
export const apolloClient = new ApolloClient({
  ssrMode: typeof window === 'undefined', // Detect SSR
  link: link,
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          // Custom cache policies can be added here if needed
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network', // Try cache first, but fetch in background
      errorPolicy: 'all', // Return data even if there are errors
    },
    query: {
      fetchPolicy: 'cache-first', // Use cache if available
      errorPolicy: 'all',
    },
  },
});
