import React from 'react';
import { withRouter } from 'next/router';
import { Subscribe } from 'unstated';
import AuthState from '../containers/AuthState';

class Index extends React.Component {
  static getInitialProps() {
    return { k: 1 };
  }

  getItems100000() {
    const result = [];

    for (let i = 0; i < 100000; i++) {
      result.push(<div key={i}>1111111111111111111111111111111111111111</div>);
    }
    return result;
  }

  // 注意下面Subscribe用的是 AuthState class, 不是authState
  render() {
    return (
      <Subscribe to={[AuthState]}>
        {authState => {
          return (
            <div>
              <h1>Index页面</h1>
              <div>{authState.state.loginUser}</div>
              <button
                onClick={() => {
                  if (authState.state && authState.state.loginUser) {
                    authState.setLoginUser(authState.state.loginUser + '-');
                  }
                }}
              >
                我要变长
              </button>
              <br />
              <button
                onClick={() => {
                  this.props.router.push('/main');
                }}
              >
                使用客户端渲染main页面, loginUser的值照理说不会变化
              </button>
              <div>以下是100000个div, 用于ab测试服务端渲染性能</div>
              <div style={{ background: '#ccc' }}>{this.getItems100000()}</div>
            </div>
          );
        }}
      </Subscribe>
    );
  }
}

export default withRouter(Index);
