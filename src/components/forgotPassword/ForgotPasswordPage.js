import React from 'react';
import { ForgotPassword } from 'aws-amplify-react';
import {Auth} from 'aws-amplify';
import AccountOutlineIcon from 'mdi-react/AccountOutlineIcon';
import TAlert from '../common/TAlert';

class ForgotPasswordPage extends ForgotPassword {
  constructor(props) {
    super(props);

    this.state = {
      authData: this.props.authData,
      authState: this.props.authState,
      modalShowing: false,
      loading: false,
      error: null,
      username: '',
      // phone: '',
      user: null
    };
    this.onSubmit = this.onSubmit.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.onDismiss = this.onDismiss.bind(this);
    this.changeState = this.changeState.bind(this);
    this.onBackToSignIn = this.onBackToSignIn.bind(this);
  }

  onBackToSignIn() {
    this.changeState('signIn');
  }

  handleInputChange(e) {
    const { value } = e.target;
    this.setState({ [e.target.name]: value });
  }

  onDismiss() {
    this.setState({ error: null });
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

  async onSubmit() {
    const {username} = this.state;
    try {
      if (username.length <= 0) {
        this.setState({
          error: 'Username cannot be empty',
          loading: false
        });
        return;
      }
      Auth.forgotPassword(username)
        .then(() => this.changeState('requireNewPassword', username))
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

  renderForgotPasswordForm() {
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
              className="lower"
              name="username"
              type="text"
              placeholder="Enter your username"
              value={this.state.username}
              onChange={this.handleInputChange}
            />
          </div>
        </div>
        <button type="button" className="btn btn-primary account__btn account__btn--small"
                onClick={this.onSubmit}
        >
          Send Code
        </button>

        <button type="button" className="btn btn-outline-primary account__btn account__btn--small"
                onClick={this.onBackToSignIn}
        >
          Back to Sign In
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
                  {this.renderForgotPasswordForm()}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  render() {
    if (this.props.authState !== 'forgotPassword') {
      return null;
    }
    return (
      <React.Fragment>
        {this.renderPage()}
      </React.Fragment>
    );
  }
}


ForgotPasswordPage.defaultProps = {

};

export default ForgotPasswordPage;
