import { Layout } from "antd";
import { NormalizedCacheObject } from "apollo-cache-inmemory";
import ApolloClient from "apollo-client";
import { NextDocumentContext } from "next/document";
import { PureComponent } from "react";
import { compose, withApollo } from "react-apollo";
import Header from "../src/components/Header/Header";
import withData from "../src/decorators/WithData/WithData";
import GetMeQuery from "../src/schemes/queries/GetMe.graphql";

type IGetMeQuery = MobilePayment.schemes.queries.IGetMeQuery;

interface IProps
  extends MobilePayment.decorators.WithData.IProps<NormalizedCacheObject>,
    IGetMeQuery {
  client?: ApolloClient<NormalizedCacheObject>;
}
interface IState {}

@compose(withData, withApollo) // prettier-ignore
export default class Index extends PureComponent<IProps, IState> {
  public static async getInitialProps(
    _: NextDocumentContext,
    apolloClient: ApolloClient<NormalizedCacheObject>
  ): Promise<any> {
    const { data } = await apolloClient.query({ query: GetMeQuery });
    return { me: (data as IGetMeQuery).me };
  }

  public render() {
    const { client, me } = this.props;

    return (
      <Layout>
        <Header client={client} name={me.name} />
      </Layout>
    );
  }
}
