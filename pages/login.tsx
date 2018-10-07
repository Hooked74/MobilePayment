// tslint:disable:jsx-no-lambda
import { Button, Card, Form, Icon, Input, Layout, message } from "antd";
import { FormComponentProps } from "antd/lib/form";
import { GetFieldDecoratorOptions } from "antd/lib/form/Form";
import fetch from "isomorphic-unfetch";
import { CSSProperties, MouseEvent, PureComponent } from "react";
import { FacebookLoginButton, GoogleLoginButton } from "react-social-login-buttons";
import { redirect } from "../src/utils";
import style from "./login.scss";

interface IProps {}
interface IAdvancedProps extends FormComponentProps, IProps {}

interface IState {
  loading: boolean;
}

interface IFormData {
  email: string;
  password: string;
}

const { Header, Content } = Layout;
const FormItem: typeof Form.Item = Form.Item;

@(Form.create() as any)
export default class Login extends PureComponent<IAdvancedProps, IState> {
  public state: IState = {
    loading: false
  };

  private socialButtonStyle: CSSProperties = {
    fontSize: "14px",
    height: "40px",
    lineHeight: 1.2,
    margin: "10px 0 0 0"
  };

  get email(): JSX.Element {
    const { getFieldDecorator } = this.props.form;
    const icon: JSX.Element = <Icon type="user" className={style.icon} />;
    const input: JSX.Element = <Input prefix={icon} placeholder="E-mail" />;
    const options: GetFieldDecoratorOptions = {
      rules: [
        {
          type: "email",
          message: "The input is not valid E-mail!"
        },
        {
          required: true,
          message: "Please input your E-mail!"
        }
      ]
    };

    return <FormItem>{getFieldDecorator("email", options)(input)}</FormItem>;
  }

  get password(): JSX.Element {
    const { getFieldDecorator } = this.props.form;
    const icon: JSX.Element = <Icon type="lock" className={style.icon} />;
    const input: JSX.Element = <Input prefix={icon} type="password" placeholder="Password" />;
    const options: GetFieldDecoratorOptions = {
      rules: [{ required: true, message: "Please input your Password!" }]
    };

    return <FormItem>{getFieldDecorator("password", options)(input)}</FormItem>;
  }

  public render() {
    return (
      <Layout className={style.layout}>
        <Header className={style.header}>
          <h1 className="logo">Mobile Payment</h1>
        </Header>
        <Content className={style.content}>
          <Card title="Login" className={style.card}>
            <Form className="login-form" onSubmit={this.login}>
              {this.email}
              {this.password}
              <Button
                type="primary"
                htmlType="submit"
                className={style.button}
                loading={this.state.loading}
              >
                Log in
              </Button>
            </Form>
            <div className={style.social}>
              <a href="/login/facebook">
                <FacebookLoginButton style={this.socialButtonStyle} />
              </a>
              <a href="/login/google">
                <GoogleLoginButton style={this.socialButtonStyle} />
              </a>
            </div>
          </Card>
        </Content>
      </Layout>
    );
  }

  public login = async (e: MouseEvent): Promise<void> => {
    e.preventDefault();
    this.setState({ loading: true });

    const values: IFormData = await new Promise<IFormData>((resolve, reject) =>
      this.props.form.validateFields((err, data: IFormData) => {
        if (err) {
          this.setState({ loading: false });
          reject(err);
        } else {
          resolve(data);
        }
      })
    );

    const res: Response = await fetch("/login", {
      method: "POST",
      body: JSON.stringify(values),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      }
    });

    const { error } = await res.json();

    this.setState({ loading: false });

    if (error !== void 0) {
      message.error(error);
    } else {
      redirect("/");
    }
  };
}
