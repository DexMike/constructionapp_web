import React, { Component } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import Amplify from 'aws-amplify';
import {
  ConfirmSignIn,
  ForgotPassword,
  RequireNewPassword,
  ConfirmSignUp,
  SignUp,
  VerifyContact,
  withAuthenticator
} from 'aws-amplify-react';
import 'bootstrap/dist/css/bootstrap.css';
import '../scss/app.scss';
import ScrollToTop from './ScrollToTop';
import Router from './routing/Router';
import ThemeContext from './ThemeContext';
import LoginPage from './login/LoginPage';
import SignUpPage from './signUp/SignUpPage';
import ConfirmSignUpPage from './signUp/ConfirmSignUpPage';
import ForgotPasswordPage from './forgotPassword/ForgotPasswordPage';
import RequireNewPasswordPage from './forgotPassword/RequireNewPasswordPage';
import ProfileService from "../api/ProfileService";
import UserService from "../api/UserService";
import i18n from "i18next";

Amplify.configure({
  Auth: {
    mandatorySignIn: true,
    region: process.env.AWS_REGION,
    userPoolId: process.env.AWS_USER_POOL_ID,
    identityPoolId: process.env.AWS_IDENTITY_POOL_ID,
    userPoolWebClientId: process.env.AWS_USER_POOL_WEB_CLIENT_ID
  },
  Storage: {
    AWSS3: {
      bucket: process.env.AWS_UPLOADS_BUCKET,
      region: process.env.AWS_REGION
    }
  }
});

export const history = createBrowserHistory();

class App extends Component {
  constructor(props) {
    super(props);

    this.toggleTheme = () => {
      this.setState(state => ({
        theme: state.theme === 'dark' ? 'light' : 'dark'
      }), () => {
        const { theme } = this.state;
        localStorage.setItem('theme', theme);
      });
    };

    const theme = localStorage.getItem('theme')
      ? localStorage.getItem('theme')
      : 'light';

    this.state = {
      loading: false,
      loaded: true,
      theme,
      toggleTheme: this.toggleTheme // eslint-disable-line react/no-unused-state
    };
  }

  async componentDidMount() {
    const profile = await ProfileService.getProfile();
    const user = await UserService.getUserById(profile.userId);
    i18n.changeLanguage(user.preferredLanguage);
    window.addEventListener('load', () => {
      this.setState({ loading: false });
      setTimeout(() => this.setState({ loaded: true }), 500);
    });
  }

  renderLoader() {
    const { loading } = this.state;
    return (
      <div className={`load${loading ? '' : ' loaded'}`}>
        <div className="load__icon-wrap">
          <svg className="load__icon">
            <path fill="#4ce1b6" d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z"/>
          </svg>
        </div>
      </div>
    );
  }

  render() {
    const { loaded } = this.state;
    return (
      <BrowserRouter>
        <ThemeContext.Provider value={this.state}>
          <ScrollToTop>
            <React.Fragment>
              {!loaded && this.renderLoader()}
              <div>
                <Router history={history}/>
              </div>
            </React.Fragment>
          </ScrollToTop>
        </ThemeContext.Provider>
      </BrowserRouter>
    );
  }
}

export default withAuthenticator(App, false, [
  <LoginPage/>,
  <ConfirmSignIn/>,
  <VerifyContact/>,
  <SignUpPage/>,
  <ConfirmSignUpPage/>,
  <ForgotPasswordPage/>,
  <RequireNewPasswordPage/>
]);
