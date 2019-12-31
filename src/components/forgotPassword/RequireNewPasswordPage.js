import React from 'react';
import { RequireNewPassword } from 'aws-amplify-react';
import {Auth} from 'aws-amplify';
import TAlert from '../common/TAlert';
import EyeIcon from "mdi-react/EyeIcon";
import KeyVariantIcon from "mdi-react/KeyVariantIcon";

class RequireNewPasswordPage extends RequireNewPassword {
  constructor(props) {
    super(props);

    this.state = {
      showPassword: false,
      authData: this.props.authData,
      authState: this.props.authState,
      modalShowing: false,
      loading: false,
      error: null,
      code: '',
      newPassword: '',
      // phone: '',
      user: null
    };
    this.onSubmit = this.onSubmit.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.onDismiss = this.onDismiss.bind(this);
    this.onBackToSignIn = this.onBackToSignIn.bind(this);
    this.showPassword = this.showPassword.bind(this);
  }

  showPassword(e) {
    e.preventDefault();
    const {showPassword} = this.state;
    this.setState({
      showPassword: !showPassword
    });
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

  async onSubmit() {
    const {props} = this;
    const username = props.authData;
    const {code, newPassword} = this.state;
    try {
      if (code.length <= 0 || newPassword.length <= 0) {
        this.setState({
          error: 'Code and new password cannot be empty',
          loading: false
        });
        return;
      }
      Auth.forgotPasswordSubmit(username, code, newPassword)
        .then(() => this.changeState('signIn'))
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

  renderResetPasswordForm() {
    const {showPassword} = this.state;
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
          <div className="form__form-group-field">
            <input
              name="code"
              type="text"
              placeholder="Code"
              value={this.state.code}
              onChange={this.handleInputChange}
            />
          </div>
        </div>
        <div className="form__form-group">
          <div className="form__form-group-field">
            <div className="form__form-group-icon">
              <KeyVariantIcon/>
            </div>
            <input
              name="newPassword"
              type={showPassword ? 'text' : 'password'}
              placeholder="New Password"
              value={this.state.newPassword}
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
        <button type="button" className="btn btn-primary account__btn account__btn--small"
                onClick={this.onSubmit}
        >
          SUBMIT
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
                      <span className="account__logo">
                        Reset your password
                      </span>
                    </h3>
                  </div>
                  {this.renderResetPasswordForm()}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  render() {
    if (this.props.authState !== 'requireNewPassword') {
      return null;
    }
    return (
      <React.Fragment>
        {this.renderPage()}
      </React.Fragment>
    );
  }
}


RequireNewPasswordPage.defaultProps = {

};

export default RequireNewPasswordPage;
