import { Container } from 'unstated';

class AuthState extends Container {
  constructor(props) {
    super(props);
    this.state = { loginUser: props.loginUser };
  }

  setLoginUser(loginUser) {
    this.setState({ loginUser });
  }
}

export default AuthState;
