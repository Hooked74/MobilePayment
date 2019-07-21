import { Layout, message } from "antd";
import { NormalizedCacheObject } from "apollo-cache-inmemory";
import ApolloClient from "apollo-client";
import { DocumentContext } from "next/document";
import { PureComponent } from "react";
import { compose, withApollo } from "react-apollo";
import Header from "../src/components/Header/Header";
import Operators from "../src/components/Operators/Operators";
import Payment from "../src/components/Payment/Payment";
import withData from "../src/decorators/WithData/WithData";
import GetMeQuery from "../src/schemes/queries/GetMe.graphql";
import style from "./index.scss";

type IGetMeQuery = MobilePayment.schemes.queries.IGetMeQuery;

interface IProps
  extends MobilePayment.decorators.WithData.IProps<NormalizedCacheObject>,
    IGetMeQuery {
  client?: ApolloClient<NormalizedCacheObject>;
  operatorId?: string;
}
interface IState {}

@compose(withData, withApollo) // prettier-ignore
export default class Index extends PureComponent<IProps, IState> {
  public static async getInitialProps(
    context: DocumentContext,
    apolloClient: ApolloClient<NormalizedCacheObject>
  ): Promise<any> {
    const operatorId: string =
      context && context.query && context.query.id ? (context.query.id as string) : null;
    const { data } = await apolloClient.query({ query: GetMeQuery });
    return { me: (data as IGetMeQuery).me, operatorId };
  }

  get content(): JSX.Element {
    const { operatorId } = this.props;
    return operatorId ? <Payment operatorId={operatorId} /> : <Operators />;
  }

  public componentDidUpdate() {
    if (localStorage && localStorage.getItem("payment")) {
      localStorage.removeItem("payment");
      message.success("Your phone balance has been successfully replenished");
    }
  }

  public render() {
    const { client, me } = this.props;
    return (
      <Layout className={style.layout}>
        <Header client={client} name={me.name} />
        {this.content}
      </Layout>
    );
  }
}
