import React, { Component } from 'react';
import { BrowserRouter } from 'react-router-dom';
import createHistory from 'history/createBrowserHistory';
import Amplify from 'aws-amplify';
import {
  ConfirmSignIn,
  ConfirmSignUp,
  ForgotPassword,
  RequireNewPassword,
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

Amplify.configure({
  Auth: {
    mandatorySignIn: true,
    region: 'us-east-1',
    userPoolId: 'us-east-1_ztq1xhttu',
    identityPoolId: 'us-east-1:602b5b90-1686-47cd-aaa9-39cf385699bd',
    userPoolWebClientId: '52tgalb82hnrv338ambff0korj'
  }
});


export const history = createHistory();

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

  componentDidMount() {
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
  <SignUp/>,
  <ConfirmSignUp/>,
  <ForgotPassword/>,
  <RequireNewPassword/>
]);
