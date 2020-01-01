import React from 'react';
// import { Link } from 'react-router-dom';
// import FacebookIcon from 'mdi-react/FacebookIcon';
// import GooglePlusIcon from 'mdi-react/GooglePlusIcon';
// import { Link, Redirect } from 'react-router-dom';
import {
  Col,
  Row,
  Button
} from 'reactstrap';
import moment from 'moment';
import {SignIn} from 'aws-amplify-react';
import {Auth} from 'aws-amplify';
import AccountOutlineIcon from 'mdi-react/AccountOutlineIcon';
import KeyVariantIcon from 'mdi-react/KeyVariantIcon';
import EyeIcon from 'mdi-react/EyeIcon';
import TCheckBox from '../common/TCheckBox';
import TAlert from '../common/TAlert';
import UtilsService from '../../api/UtilsService';
// import LoginLogService from '../../api/LoginLogService';
import UserService from '../../api/UserService';
import TSubmitButton from '../common/TSubmitButton';
import ProfileService from '../../api/ProfileService';
// import CompanyService from '../../api/CompanyService';
import UserManagementService from '../../api/UserManagementService';

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
      errorCode: null,
      confirmUsername: null,
      userConfirmError: null,
      username: this.props.authData.username || '',
      password: this.props.authData.password || '',
      user: null,
      btnSubmitting: false, // Used by TSubmitButton
      userUnderReview: false,
      isDriver: false,
      // ip: '',
      browserVersion: [],
      screenSize: []
    };
    this.showPassword = this.showPassword.bind(this);
    this.onSignIn = this.onSignIn.bind(this);
    this.onResetPassword = this.onResetPassword.bind(this);
    this.onSignUp = this.onSignUp.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.onDismiss = this.onDismiss.bind(this);
    this.handleUserNotConfirmed = this.handleUserNotConfirmed.bind(this);
    this.changeState = this.changeState.bind(this);
    this.validateIsDriver = this.validateIsDriver.bind(this);
    this.validateIsUserUnderReview = this.validateIsUserUnderReview.bind(this);
  }

  async componentDidMount() {
    // console.log(mounted);
  }

  showPassword(e) {
    e.preventDefault();
    const {showPassword} = this.state;
    this.setState({
      showPassword: !showPassword
    });
  }

  changeState(state, data) {
    if (this.props.onStateChange) {
      this.props.onStateChange(state, data);
    }

    this.triggerAuthEvent({
      type: 'stateChange',
      data: state
    });
  }

  loginRouting(companyType, loginCount) {
    if (companyType === 'Carrier' && loginCount === 0) {
      window.location = '/settings/2';
    } else {
      window.location = '/';
    }
  }

  handleUserNotConfirmed() {
    this.setState({confirmUsername: null, error: null, errorCode: null});
    Auth.resendSignUp(this.state.confirmUsername);
    this.changeState('confirmSignUp', this.state.confirmUsername);
  }

  async setLogging(username) {
    const userCheck = {email: username};
    const user = await UserService.getUserByEmail(userCheck);

    user.lastLogin = moment.utc().format();
    user.loginCount += 1;
    await UserService.updateUser(user);
  }

  // async createLoginLog(state) {
  //   const log = {
  //     attemptedUsername: this.state.username,
  //     attemptedPassword: !state ? this.state.password : null,
  //     ipAddress: this.state.ip,
  //     browserType: this.state.browserVersion.name,
  //     browserVersion: this.state.browserVersion.version,
  //     screenSize: `${this.state.screenSize.width} x ${this.state.screenSize.height}`,
  //     createdBy: 1,
  //     createdOn: moment.utc().format(),
  //     modifiedBy: 1,
  //     modifiedOn: moment.utc().format()
  //   };
  //   await LoginLogService.createLoginLog(log);
  // }

  async onSignIn() {
    let { username } = this.state;
    const { password } = this.state;
    username = username.toLowerCase(); // Workaround for mobile safari uppercasing the first letter
    username = username.trim();
    this.setState({loading: true, btnSubmitting: true, error: null, errorCode: null});
    try {
      if (!username || username.length <= 0
        || !password || password.length <= 0
        || !(username.indexOf('@') > -1)) {
        // await this.createLoginLog(false);
        this.setState({
          error: 'Incorrect username or password.',
          btnSubmitting: false,
          loading: false
        });
        return;
      }

      const userCheck = {email: username};
      const user = await UserService.getUserByEmail(userCheck);

      if (!user || !user.id || !user.cognitoId || user.cognitoId === '') {
        // await this.createLoginLog(false);
        this.setState({
          error: 'Incorrect username or password.',
          btnSubmitting: false,
          loading: false
        });
        return;
      }

      const userSignIn = await UserManagementService.signIn({email: username, password});
      if (userSignIn.success) {
        const profile = await ProfileService
          .getProfilePreLogin(userSignIn.accessToken, userSignIn.idToken);
        if (profile.companyType === 'Carrier' && !profile.isAdmin) {
          this.setState({isDriver: true});
          return;
        }
      } else {
        this.setState({
          error: 'Incorrect username or password.',
          btnSubmitting: false,
          loading: false
        });
        return;
      }

      if (user.id && user.userStatus !== 'First Login' && user.userStatus !== 'Enabled' && user.userStatus !== 'Driver Created') {
        this.setState({userUnderReview: true});
        return;
        // user is under review
      }
      if (user.id && user.userStatus === 'Driver Created') {
        const driver = await UserService.getDriverByUserId(user.id);
        if (driver.id === null || driver.driverStatus !== 'Enabled') {
          // await this.createLoginLog(true);
          this.setState({userUnderReview: true});
          return;
        }
      }
      // let ip = '';
      // try {
      //   const ipAddress = await UtilsService.getUserIP();
      //   ({ ip } = ipAddress);
      // } catch (e) {
      //   // console.log(e);
      // }
      const browserVersion = await UtilsService.getBrowserVersion();
      const screenSize = await UtilsService.getScreenDimentions();

      this.setState({
        //  settingsLoaded: true,
        // ip,
        browserVersion,
        screenSize
      });
      const data = await Auth.signIn(user.cognitoId, password);

      // console.log(`onSignIn::Response#1: ${JSON.stringify(data, null, 2)}`);
      // If the user session is not null, then we are authenticated
      if (data.signInUserSession !== null) {
        if (this.props.onStateChange) {
          this.props.onStateChange('authenticated', data);
        }
        // await this.createLoginLog(true);
        // window.location = '/';
        this.setLogging(username);

        // are you a carrier and is it your first login?
        const profile = await ProfileService.getProfile();
        this.loginRouting(profile.companyType, user.loginCount);
        //
        return;
      }

      // If there is a challenge, then show the modal
      if ('challengeName' in data) {
        // console.log(`onSignIn: Expecting challenge to be recieved via ${data.challengeType}`);
        this.setState({
          user: data,
          loading: false,
          btnSubmitting: false,
          modalShowing: true
        });
      }

      // Anything else and there is a problem
      throw new Error('Invalid response from server');
    } catch (err) {
      // console.log(`Error: ${JSON.stringify(err, null, 2)}`);
      if (err.code === 'UserNotFoundException') {
        // await this.createLoginLog(false);
        this.setState({
          error: 'Incorrect username or password.',
          loading: false,
          btnSubmitting: false,
          errorCode: err.code,
          confirmUsername: null
        });
      } else if (err.code === 'UserNotConfirmedException') {
        // await this.createLoginLog(false);
        this.setState({
          error: err.message,
          loading: false,
          btnSubmitting: false,
          errorCode: err.code,
          confirmUsername: username
        });
      } else {
        // await this.createLoginLog(false);
        this.setState({
          error: err.message,
          loading: false,
          btnSubmitting: false,
          errorCode: err.code,
          confirmUsername: null
        });
      }
    }
  }

  async onConfirmSignin(token) {
    this.setState({loading: true});
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
    let {value} = e.target;
    if (e.target.name === 'rememberMe') {
      value = e.target.checked ? Number(1) : Number(0);
    }
    this.setState({[e.target.name]: value});
  }

  onDismiss() {
    this.setState({error: null});
  }

  validateIsUserUnderReview() {
    const {userUnderReviewIn} = this.state;
    if (userUnderReviewIn) {
      this.setState({
        userUnderReview: false,
        btnSubmitting: false,
        showPassword: false,
        username: '',
        password: ''
      });
    }
  }

  validateIsDriver() {
    const {driverIn} = this.state;
    if (driverIn) {
      this.setState({
        isDriver: false,
        btnSubmitting: false,
        showPassword: false,
        username: '',
        password: ''
      });
    }
  }

  renderUserNotReviewed() {
    this.state.userUnderReviewIn = true;
    return (
      <div className="form">
        <h6> Thank you for checking back with us. Your account is still in review.
          This normally takes 1-2 business days.
          If you have not been contact you can email us at csr@trelar.com. Thank you.
        </h6>
        <Button
          className="btn btn-primary account__btn account__btn--small"
          style={{ marginTop: '20px'}}
          onClick={() => this.validateIsUserUnderReview()}
        >
          Logout
        </Button>
      </div>
    );
  }

  renderIsDriver() {
    this.state.driverIn = true;
    return (
      <div className="form">
        <h6> Drivers do not have access to the Trelar web app at this time.
          You can email us at csr@trelar.com. Thank you.
        </h6>
        <Button
          className="btn btn-primary account__btn account__btn--small"
          style={{ marginTop: '20px'}}
          onClick={() => this.validateIsDriver()}
        >
          Logout
        </Button>
      </div>
    );
  }

  renderLogInForm() {
    const {showPassword, btnSubmitting} = this.state;
    return (
      <div className="form">
        <TAlert color="danger" visible={!!this.state.error && !this.state.confirmUsername} onDismiss={this.onDismiss}>
          <p>
            <span className="bold-text">
              Error!
            </span>
            &nbsp;
            {this.state.error}
          </p>
        </TAlert>
        <TAlert color="danger" visible={!!this.state.confirmUsername} onDismiss={this.onDismiss}>
          <p>
            User not confirmed.
            {this.state.errorCode === 'UserNotConfirmedException' && (
              <button type="button"
                      className="account__confirm"
                      onClick={this.handleUserNotConfirmed}
              >
                Confirm: {this.state.confirmUsername}
              </button>
            )}
            &nbsp;
            {this.state.userConfirmError}
          </p>
        </TAlert>
        <div className="form__form-group">
          <span className="form__form-group-label">Username</span>
          <div className="form__form-group-field">
            <div className="form__form-group-icon">
              <AccountOutlineIcon/>
            </div>
            <input
              // className="lower"
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
        </div>
        <Row className="col-12">
          <Col>
            <TCheckBox
              name="remember_me"
              label="Remember me"
              onChange={() => {}}
              value={false}
            />
          </Col>
          <Col className="text-right">
            <div aria-hidden="true" className="app-link" onClick={this.onResetPassword} style={{marginRight: -40}}>
              Forgot Password?
            </div>
          </Col>
        </Row>
        <TSubmitButton
          onClick={this.onSignIn}
          className="btn btn-primary account__btn account__btn--small"
          loading={btnSubmitting}
          loaderSize={10}
          bntText="Sign In"
          id="signinbutton"
        />
        {/* <button type="button" */}
        {/* className="btn btn-outline-primary account__btn account__btn--small" */}
        {/* id = "createaccountbutton" */}
        {/* onClick={this.onSignUp} */}
        {/* > */}
        {/* Create Account */}
        {/* </button> */}
      </div>
    );
  }

  renderPage() {
    const {userUnderReview, isDriver} = this.state;
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
                  {userUnderReview && this.renderUserNotReviewed()}
                  {isDriver && this.renderIsDriver()}
                  {!userUnderReview && !isDriver && this.renderLogInForm()}
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
    const {authState} = this.props;
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
