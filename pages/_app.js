import React from 'react';
import App, { Container } from 'next/app';
import AuthState from '../containers/AuthState';
import { Provider } from 'unstated';

export default class MyApp extends App {
  static async getInitialProps({ Component, router, ctx }) {
    let pageProps = {};

    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx);
    }

    return { pageProps, loginUser: '---' };
  }

  constructor(props) {
    super(props);
    this.authState = new AuthState({ loginUser: props.loginUser });
  }

  render() {
    const { Component, pageProps } = this.props;

    // 为什么Provider要放在_app里?
    // _app只会在服务端渲染时才执行, 避免了客户端渲染时本地状态丢失
    return (
      <Container>
        <Provider inject={[this.authState]}>
          <Component {...pageProps} />
        </Provider>
      </Container>
    );
  }
}
