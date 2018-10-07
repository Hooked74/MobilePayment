import { Layout } from "antd";
import { NormalizedCacheObject } from "apollo-cache-inmemory";
import ApolloClient from "apollo-client";
import cookie from "cookie";
import Link from "next/link";
import { MouseEvent, PureComponent } from "react";
import * as React from "react";
import { redirect } from "../../utils";
import style from "./Header.scss";

interface IProps {
  name: string;
  client: ApolloClient<NormalizedCacheObject>;
}

export default class Header extends PureComponent<IProps> {
  public render() {
    return (
      <Layout.Header className={style.container}>
        <Link href="/" prefetch={true}>
          <div className={style.logo}>Mobile Payment</div>
        </Link>
        <div className={style.welcome}>
          <span>Hello {this.props.name}</span>,{" "}
          <a href="#" onClick={this.logout}>
            log out
          </a>
        </div>
      </Layout.Header>
    );
  }

  private logout = (e: MouseEvent) => {
    e.preventDefault();

    document.cookie = cookie.serialize("token", "", {
      maxAge: -1 // Expire the cookie immediately
    });

    // Force a reload of all the current queries now that the user is
    // logged in, so we don't accidentally leave any state around.
    this.props.client.cache.reset().then(() => {
      // Redirect to a more useful page when signed out
      redirect("/login");
    });
  };
}
