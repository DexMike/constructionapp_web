import React from 'react';
// import { Link } from 'react-router-dom';
// import FacebookIcon from 'mdi-react/FacebookIcon';
// import GooglePlusIcon from 'mdi-react/GooglePlusIcon';
// import { Link, Redirect } from 'react-router-dom';
import { SignIn } from 'aws-amplify-react';
import { Auth } from 'aws-amplify';
import AccountOutlineIcon from 'mdi-react/AccountOutlineIcon';
import KeyVariantIcon from 'mdi-react/KeyVariantIcon';
import EyeIcon from 'mdi-react/EyeIcon';
import TCheckBox from '../common/TCheckBox';
import TAlert from '../common/TAlert';
// import ProfileService from '../../api/ProfileService';
// import AgentService from '../../api/AgentService';

// import MainWrapper from '../routing/Router';

class LoginPage extends SignIn {
  constructor(props) {
    super(props);
    this.state = {
      showPassword: false,
      authData: this.props.authData,
      authState: this.props.authState,
      modalShowing: false,
      loading: false,
      error: null,
      username: this.props.authData.username || '',
      password: this.props.authData.password || '',
      user: null
    };
    this.showPassword = this.showPassword.bind(this);
    this.onSignIn = this.onSignIn.bind(this);
    this.onResetPassword = this.onResetPassword.bind(this);
    this.onSignUp = this.onSignUp.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.onDismiss = this.onDismiss.bind(this);
  }

  showPassword(e) {
    e.preventDefault();
    const { showPassword } = this.state;
    this.setState({
      showPassword: !showPassword
    });
  }

  async loginRouting() {
    window.location = '/'; // go to the equipments listing as the customer needs to create a job.
  }

  async onSignIn() {
    this.setState({ loading: true });
    try {
      if (!this.state.username || this.state.username.length <= 0
        || !this.state.password || this.state.password.length <= 0) {
        this.setState({
          error: 'Incorrect username or password.',
          loading: false
        });
        return;
      }
      const data = await Auth.signIn(this.state.username, this.state.password);

      // console.log(`onSignIn::Response#1: ${JSON.stringify(data, null, 2)}`);
      // If the user session is not null, then we are authenticated
      if (data.signInUserSession !== null) {
        this.props.onStateChange('authenticated', data);
        // window.location = '/';
        await this.loginRouting();
        return;
      }

      // If there is a challenge, then show the modal
      if ('challengeName' in data) {
        // console.log(`onSignIn: Expecting challenge to be recieved via ${data.challengeType}`);
        this.setState({
          user: data,
          loading: false,
          modalShowing: true
        });
      }

      // Anything else and there is a problem
      throw new Error('Invalid response from server');
    } catch (err) {
      // console.log(`Error: ${JSON.stringify(err, null, 2)}`);
      this.setState({
        error: err.message,
        loading: false
      });
    }
  }

  async onConfirmSignin(token) {
    this.setState({ loading: true });
    try {
      // console.log(`onConfirmSignIn:: ${this.state.username}, ${token}`);
      // const data = await Auth.confirmSignIn(this.state.user, token);
      await Auth.confirmSignIn(this.state.user, token);
      // console.log(`onConfirmSignIn::Response#2: ${JSON.stringify(data, null, 2)}`);
      const profile = await Auth.currentUser();
      this.props.onStateChange('authenticated', profile);
    } catch (err) {
      // console.log('Error: ', err);
      this.setState({
        error: err.message,
        loading: false,
        modalShowing: false
      });
    }
  }

  onResetPassword() {
    this.props.onStateChange('forgotPassword');
  }

  onSignUp() {
    this.props.onStateChange('signUp');
  }

  handleInputChange(e) {
    let { value } = e.target;
    if (e.target.name === 'rememberMe') {
      value = e.target.checked ? Number(1) : Number(0);
    }
    this.setState({ [e.target.name]: value });
  }

  onDismiss() {
    this.setState({ error: null });
  }

  renderLogInForm() {
    const { showPassword } = this.state;
    return (
      <div className="form">
        <TAlert color="danger" visible={!!this.state.error} onDismiss={this.onDismiss}>
          <p>
            <span className="bold-text">
              Error!
            </span>
            &nbsp;
            {this.state.error}
          </p>
        </TAlert>
        <div className="form__form-group">
          <span className="form__form-group-label">Username</span>
          <div className="form__form-group-field">
            <div className="form__form-group-icon">
              <AccountOutlineIcon/>
            </div>
            <input
              name="username"
              type="text"
              placeholder="Email"
              value={this.state.username}
              onChange={this.handleInputChange}
            />
          </div>
        </div>
        <div className="form__form-group">
          <span className="form__form-group-label">Password</span>
          <div className="form__form-group-field">
            <div className="form__form-group-icon">
              <KeyVariantIcon/>
            </div>
            <input
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={this.state.password}
              onChange={this.handleInputChange}
            />
            <button
              type="button"
              className={`form__form-group-button${showPassword ? ' active' : ''}`}
              onClick={e => this.showPassword(e)}
            >
              <EyeIcon/>
            </button>
          </div>
          <div className="account__forgot-password">
            <button type="button"
                    className="app-link"
                    onClick={this.onResetPassword}
            >
              Forgot a password?
            </button>
          </div>
        </div>
        <div className="form__form-group">
          <div className="form__form-group-field">
            <TCheckBox name="remember_me" label="Remember me" onChange={() => {
            }} value={false}
            />
          </div>
        </div>
        <button type="button" className="btn btn-primary account__btn account__btn--small"
                onClick={this.onSignIn}
        >
          Sign In
        </button>
        <button type="button" className="btn btn-outline-primary account__btn account__btn--small"
                onClick={this.onSignUp}
        >
          Create Account
        </button>
      </div>
    );
  }

  renderPage() {
    return (
      <div className="theme-light">
        <div className="wrapper">
          <main>
            <div className="account">
              <div className="account__wrapper">
                <div className="account__card">
                  <div className="account__head">
                    <h3 className="account__title">
                      Welcome to&nbsp;
                      <span className="account__logo">
                        TRE
                        <span className="account__logo-accent">
                          LAR
                        </span>
                      </span>
                      <span style={{
                        fontSize: '16px',
                        position: 'relative',
                        bottom: '6px'
                      }}
                      >
                        &trade;
                      </span>
                    </h3>
                    <h4 className="account__subhead subhead">
                      Changing how Construction Moves
                    </h4>
                  </div>
                  {this.renderLogInForm()}
                  {/* <div className="account__or"> */}
                  {/* <p>Or Easily Using</p> */}
                  {/* </div> */}
                  {/* <div className="account__social"> */}
                  {/* <span className="account__social-btn account__social-btn--facebook"> */}
                  {/* <FacebookIcon/> */}
                  {/* </span> */}
                  {/* <span className="account__social-btn account__social-btn--google"> */}
                  {/* <GooglePlusIcon/> */}
                  {/* </span> */}
                  {/* </div> */}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  render() {
    const { authState } = this.props;
    return (
      <React.Fragment>
        {authState === 'signIn' && this.renderPage()}
      </React.Fragment>
    );
  }
}

LoginPage.defaultProps = {
  authData: {},
  authState: 'signIn'// ,
  // onAuthStateChange: (next, data) => {
  // console.log(`SignIn:onAuthStateChange(${next}, ${JSON.stringify(data, null, 2)})`);
  // }
};

export default LoginPage;
