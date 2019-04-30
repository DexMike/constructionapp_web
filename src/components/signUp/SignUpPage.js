import React from 'react';
import {
  SignUp,
} from 'aws-amplify-react';
import {Auth} from 'aws-amplify';
import AccountOutlineIcon from 'mdi-react/AccountOutlineIcon';
import KeyVariantIcon from 'mdi-react/KeyVariantIcon';
import TAlert from '../common/TAlert';
import './SignUpPage.css';

class SignUpPage extends SignUp {
  constructor(props) {
    super(props);

    this.state = {
      authData: this.props.authData,
      authState: this.props.authState,
      modalShowing: false,
      loading: false,
      error: null,
      createUsername: '',
      createPassword: '',
      // phone: '',
      user: null
    };
    this.onSignUp = this.onSignUp.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.onDismiss = this.onDismiss.bind(this);
    this.changeState = this.changeState.bind(this);
  }

  handleInputChange(e) {
    const {value} = e.target;
    this.setState({[e.target.name]: value});
  }

  onDismiss() {
    this.setState({error: null});
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

  async onSignUp() {
    try {
      const {createUsername, createPassword} = this.state;
      const username = createUsername;
      const password = createPassword;
      if (username.length <= 0 || password.length <= 0) {
        this.setState({
          error: 'Username and password required.',
          loading: false
        });
        return;
      }
      Auth.signUp(username, password)
        .then(() => this.changeState('confirmSignUp', username))
        .catch(err => this.setState({
          error: err.message,
          loading: false
        }));
    } catch (err) {
      console.log('Error: ', err);
      this.setState({
        error: err.message,
        loading: false
      });
    }
  }

  renderSignUpForm() {
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
          <span className="form__form-group-label">New username</span>
          <div className="form__form-group-field">
            <div className="form__form-group-icon">
              <AccountOutlineIcon/>
            </div>
            <input
              className="lower"
              name="createUsername"
              type="text"
              placeholder="Email"
              value={this.state.createUsername}
              onChange={this.handleInputChange}
            />
          </div>
        </div>
        <div className="form__form-group">
          <span className="form__form-group-label">New password</span>
          <div className="form__form-group-field">
            <div className="form__form-group-icon">
              <KeyVariantIcon/>
            </div>
            <input
              name="createPassword"
              type="password"
              placeholder="Password"
              value={this.state.createPassword}
              onChange={this.handleInputChange}
            />
          </div>
        </div>
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
                  {this.renderSignUpForm()}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  render() {
    if (this.props.authState !== 'signUp') {
      return null;
    }
    return (
      <React.Fragment>
        {this.renderPage()}
      </React.Fragment>
    );
  }
}

SignUpPage.defaultProps = {};

export default SignUpPage;
