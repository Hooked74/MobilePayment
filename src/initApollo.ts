import { InMemoryCache } from "apollo-cache-inmemory";
import { NormalizedCacheObject } from "apollo-cache-inmemory/lib/types";
import { ApolloClient } from "apollo-client";
import { ApolloLink } from "apollo-link";
import { setContext } from "apollo-link-context";
import { createHttpLink } from "apollo-link-http";
import debug from "debug";
import fetch from "isomorphic-unfetch";

let apolloClient: ApolloClient<NormalizedCacheObject> = null;

// Polyfill fetch() on the server (used by apollo-client)
if (!process.browser) {
  global.fetch = fetch;
}

function create(
  initialState: NormalizedCacheObject,
  { getToken }: MobilePayment.IApolloInitOptions
): ApolloClient<NormalizedCacheObject> {
  const httpLink: ApolloLink = createHttpLink({
    uri: "/graphql",
    credentials: "same-origin"
  });

  const authLink: ApolloLink = setContext((_, { headers }) => {
    const token: string = getToken();
    return {
      headers: {
        ...headers,
        authorization: token ? `bearer ${token}` : null
      }
    };
  });

  return new ApolloClient({
    connectToDevTools: process.browser,
    ssrMode: !process.browser, // Disables forceFetch on the server (so queries are only run once)
    link: authLink.concat(httpLink),
    cache: new InMemoryCache().restore(initialState || {})
  });
}

export default function initApollo(
  initialState: NormalizedCacheObject,
  options: MobilePayment.IApolloInitOptions
): ApolloClient<NormalizedCacheObject> {
  // Make sure to create a new client for every server-side request so that data
  // isn't shared between connections (which would be bad)
  if (!process.browser) {
    return create(initialState, options);
  }

  // Reuse client on the client-side
  if (!apolloClient) {
    apolloClient = create(initialState, options);
  }

  return apolloClient;
}
