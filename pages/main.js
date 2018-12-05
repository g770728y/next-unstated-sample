import React from 'react';
import { Subscribe } from 'unstated';
import { withRouter } from 'next/router';
import AuthState from '../containers/AuthState';

class Main extends React.Component {
  static getInitialProps() {
    return { k: 2 };
  }

  // 注意下面Subscribe用的是 AuthState class, 不是authState
  render() {
    return (
      <Subscribe to={[AuthState]}>
        {authState => {
          return (
            <div>
              <h1>main页面</h1>
              <div>
                authState.state.loginUser=
                {authState.state && authState.state.loginUser}
              </div>
              <button
                onClick={() => {
                  this.props.router.push('/');
                }}
              >
                返回index页面, loginUser的值照理说不会变化
              </button>
            </div>
          );
        }}
      </Subscribe>
    );
  }
}

export default withRouter(Main);
