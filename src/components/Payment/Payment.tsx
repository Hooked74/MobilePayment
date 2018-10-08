// tslint:disable:no-bitwise
// tslint:disable:jsx-no-lambda
import { Avatar, Button, Card, Form, InputNumber, Layout, message } from "antd";
import { GetFieldDecoratorOptions, WrappedFormUtils } from "antd/lib/form/Form";
import { NormalizedCacheObject } from "apollo-cache-inmemory";
import ApolloClient from "apollo-client";
import cookie from "cookie";
import Link from "next/link";
import { PureComponent } from "react";
import * as React from "react";
import { compose, graphql, withApollo } from "react-apollo";
import PaymentMutation from "../../schemes/mutations/Payment.graphql";
import GetOperatorByIdQuery from "../../schemes/queries/GetOperatorById.graphql";
import GetOperatorsQuery from "../../schemes/queries/GetOperators.graphql";
import { redirect } from "../../utils";
import PhoneInput from "../PhoneInput/PhoneInput";
import style from "./Payment.scss";

type IGetOperatorByIdQuery = MobilePayment.schemes.queries.IGetOperatorByIdQuery;
type IPaymentMutation = MobilePayment.schemes.mutations.IPaymentMutation;

interface IProps extends IGetOperatorByIdQuery, IPaymentMutation {
  form?: WrappedFormUtils;
  operatorId: string;
  operatorLoading?: boolean;
  client?: ApolloClient<NormalizedCacheObject>;
}

interface IState {
  payLoading: boolean;
}

interface IFormData {
  phone: string;
  amount: number;
}

const QueryOptions = {
  options: props => ({
    variables: { id: props.operatorId }
  }),
  props: ({ data }: any) => ({ operatorLoading: data.loading, operator: data.operator })
};

const MutationOptions = {
  name: "pay",
  props: ({ pay }: any) => ({
    pay
  }),
  options: {
    update: (cache, { data: { pay } }) => {
      // update balance in cache
      const { operators } = cache.readQuery({ query: GetOperatorsQuery });
      cache.writeQuery({
        query: GetOperatorsQuery,
        data: {
          operators: operators.reduce((accum, operator) => {
            if (operator.id === pay.operatorId) {
              operator = { ...operator, balance: pay.balance };
            }
            accum.push(operator);
            return accum;
          }, [])
        }
      });
    }
  }
};

const FormItem: typeof Form.Item = Form.Item;

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 8 }
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 }
  }
};

@compose(
  withApollo,
  graphql(GetOperatorByIdQuery, QueryOptions),
  graphql(PaymentMutation, MutationOptions)
)
@(Form.create() as any)
export default class Payment extends PureComponent<IProps, IState> {
  get titleRightPart(): JSX.Element {
    return this.props.operator ? (
      <div className={style["title-right-part"]}>
        <Avatar src={this.props.operator.image} />
        <span>{this.props.operator.name}</span>
      </div>
    ) : null;
  }

  get phone(): JSX.Element {
    const { getFieldDecorator } = this.props.form;
    const input: JSX.Element = <PhoneInput />;
    const options: GetFieldDecoratorOptions = {
      rules: [
        {
          required: true,
          message: "Please input your phone number!"
        },
        {
          validator: this.validatePhone
        }
      ]
    };

    return (
      <FormItem {...formItemLayout} label="Phone Number">
        {getFieldDecorator("phone", options)(input)}
      </FormItem>
    );
  }

  get amount(): JSX.Element {
    const { getFieldDecorator } = this.props.form;
    const input: JSX.Element = (
      <InputNumber
        min={1}
        max={1000}
        formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
        parser={value => value.replace(/\$\s?|(,*)/g, "") as any}
      />
    );
    const options: GetFieldDecoratorOptions = {
      initialValue: 10,
      rules: [
        {
          required: true,
          message: "Please input amount!"
        }
      ]
    };

    return (
      <FormItem {...formItemLayout} label="Amount">
        {getFieldDecorator("amount", options)(input)}
      </FormItem>
    );
  }
  public state: IState = {
    payLoading: false
  };

  public render() {
    return (
      <Layout.Content className={style.container}>
        <Card
          title={
            <div className={style.title}>
              <span>Refill balance</span>
              {this.titleRightPart}
            </div>
          }
          className={style.card}
          loading={this.props.operatorLoading}
        >
          <Form onSubmit={this.pay as any}>
            {this.phone}
            {this.amount}
            <div className={style.buttons}>
              <Button type="primary" htmlType="submit" loading={this.state.payLoading}>
                Submit
              </Button>
              <Link href="/">
                <Button style={{ marginLeft: 8 }}>Cancel</Button>
              </Link>
            </div>
          </Form>
        </Card>
      </Layout.Content>
    );
  }

  private pay = async (e: MouseEvent): Promise<void> => {
    e.preventDefault();
    this.setState({ payLoading: true });

    const values: IFormData = await new Promise<IFormData>((resolve, reject) =>
      this.props.form.validateFields((err, data: IFormData) => {
        if (err) {
          this.setState({ payLoading: false });
          reject(err);
        } else {
          resolve(data);
        }
      })
    );

    const payVariables = {
      variables: {
        operatorId: this.props.operatorId,
        phoneNumber: values.phone,
        amount: values.amount
      }
    };

    const ErrorMessage: string = "Failed to refill balance";

    try {
      const {
        data: {
          pay: { success }
        }
      } = await this.props.pay(payVariables as any);

      if (!success) throw new Error(ErrorMessage);
      localStorage.setItem("payment", "success");
      redirect("/");
    } catch (e) {
      message.error(ErrorMessage);
      this.setState({ payLoading: false });
    }
  };

  private validatePhone = (rule, value, callback) => {
    const phone: string = this.props.form.getFieldValue("phone");
    if (phone && ~phone.lastIndexOf("_")) {
      callback("Incorrect number!");
    } else {
      callback();
    }
  };
}
