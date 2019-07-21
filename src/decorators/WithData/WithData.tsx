import { NormalizedCacheObject } from "apollo-cache-inmemory/lib/types";
import { ApolloClient } from "apollo-client";
import { DocumentContext } from "next/document";
import Head from "next/head";
import { PureComponent } from "react";
import { ApolloProvider, getDataFromTree } from "react-apollo";
import initApollo from "../../initApollo";
import { parseCookies } from "../../utils";

type IProps<T> = MobilePayment.decorators.WithData.IProps<T>;
type IState = MobilePayment.decorators.WithData.IState;
type IURLProps = MobilePayment.decorators.WithData.IURLProps;

export default (ComposedComponent: any) =>
  class WithData extends PureComponent<IProps<NormalizedCacheObject>, IState> {
    public static displayName: string = `WithData(${ComposedComponent.displayName})`;

    public static async getInitialProps(context: DocumentContext) {
      let serverState: NormalizedCacheObject = {};

      // Setup a server-side one-time-use apollo client for initial props and
      // rendering (on server)
      const apollo: ApolloClient<NormalizedCacheObject> = initApollo(
        {},
        {
          getToken: () => parseCookies(context).token
        }
      );

      // Evaluate the composed component's getInitialProps()
      let composedInitialProps: any = {};
      if (ComposedComponent.getInitialProps) {
        composedInitialProps = await ComposedComponent.getInitialProps(context, apollo);
      }

      // Run all graphql queries in the component tree
      // and extract the resulting data
      if (!process.browser) {
        if (context.res && context.res.finished) {
          // When redirecting, the response is finished.
          // No point in continuing to render
          return false;
        }

        // Provide the `url` prop data in case a graphql query uses it
        try {
          // Run all GraphQL queries
          const url: IURLProps = { query: context.query, pathname: context.pathname };
          const app: JSX.Element = (
            <ApolloProvider client={apollo}>
              <ComposedComponent url={url} {...composedInitialProps} />
            </ApolloProvider>
          );

          await getDataFromTree(app, {
            router: {
              query: context.query,
              pathname: context.pathname,
              asPath: context.asPath
            }
          });
        } catch (error) {
          // Prevent Apollo Client GraphQL errors from crashing SSR.
          // Handle them in components via the data.error prop:
          // http://dev.apollodata.com/react/api-queries.html#graphql-query-data-error
        }
        // getDataFromTree does not call componentWillUnmount
        // head side effect therefore need to be cleared manually
        Head.rewind();

        // Extract query data from the Apollo's store
        serverState = apollo.cache.extract();
      }

      return {
        serverState,
        ...composedInitialProps
      };
    }

    protected apollo: ApolloClient<NormalizedCacheObject>;

    public constructor(props: IProps<NormalizedCacheObject>) {
      super(props);
      // Note: Apollo should never be used on the server side beyond the initial
      // render within `getInitialProps()` above (since the entire prop tree
      // will be initialized there), meaning the below will only ever be
      // executed on the client.
      this.apollo = initApollo(this.props.serverState, {
        getToken: () => parseCookies().token
      });
    }

    public render() {
      return (
        <ApolloProvider client={this.apollo}>
          <ComposedComponent {...this.props} />
        </ApolloProvider>
      );
    }
  };
