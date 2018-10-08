import { Avatar, Button, Card, Col, Icon, Layout, List, Row, Skeleton } from "antd";
import { NormalizedCacheObject } from "apollo-cache-inmemory";
import ApolloClient from "apollo-client";
import Link from "next/link";
import { PureComponent } from "react";
import * as React from "react";
import { compose, graphql, withApollo } from "react-apollo";
import GetOperatorsQuery from "../../schemes/queries/GetOperators.graphql";
import style from "./Operators.scss";

type IGetOperatorsQuery = MobilePayment.schemes.queries.IGetOperatorsQuery;
type IOperator = MobilePayment.schemes.queries.IOperator;

interface IProps extends IGetOperatorsQuery {
  loading?: boolean;
  client?: ApolloClient<NormalizedCacheObject>;
}

const QueryOptions = {
  props: ({ data }: any) => ({ loading: data.loading, operators: data.operators })
};

@compose(withApollo, graphql(GetOperatorsQuery, QueryOptions)) // prettier-ignore
export default class Operators extends PureComponent<IProps> {
  public renderItem = (operator: IOperator): JSX.Element => {
    return (
      <List.Item
        actions={[
          <Link as={`/o/${operator.id}`} href={`/?id=${operator.id}`} key={0}>
            <Button type="primary" className={style.button}>
              Refill balance
              <Icon type="right" />
            </Button>
          </Link>
        ]}
        className={style.item}
      >
        <List.Item.Meta
          title={operator.name}
          description={`Total: ${operator.balance}$`}
          avatar={<Avatar shape="square" size={64} src={operator.image} />}
          className={style.meta}
        />
      </List.Item>
    );
  };

  public render() {
    return (
      <Layout.Content className={style.container}>
        <Row>
          <Col
            xs={{ span: 20, offset: 2 }}
            sm={{ span: 18, offset: 3 }}
            md={{ span: 16, offset: 4 }}
            lg={{ span: 14, offset: 5 }}
          >
            <Card title="Mobile operators" loading={this.props.loading}>
              <List
                itemLayout="horizontal"
                dataSource={this.props.operators}
                renderItem={this.renderItem}
              />
            </Card>
          </Col>
        </Row>
      </Layout.Content>
    );
  }
}
