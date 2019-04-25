import React from 'react';
import { ConfirmSignUp } from 'aws-amplify-react';
import TAlert from "../common/TAlert";
import AccountOutlineIcon from "mdi-react/AccountOutlineIcon";
import KeyVariantIcon from "mdi-react/KeyVariantIcon";
import {Auth} from "aws-amplify";

class ConfirmSignUpPage extends ConfirmSignUp {
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
  }

  handleInputChange(e) {
    const { value } = e.target;
    this.setState({ [e.target.name]: value });
  }

  onDismiss() {
    this.setState({ error: null });
  }

  async onSignUp() {
    try {
      const {createUsername, createPassword} = this.state;
      const username = createUsername;
      const password = createPassword;
      if (createUsername.length <= 0 || createPassword.length <= 0) {
        this.setState({
          error: 'Username and password required.',
          loading: false
        });
        return;
      }
      // const {phone} = this.state
      // const {phone} = this.state
      await Auth.signUp({
        username,
        password,
        // attributes: {
        //   phone // optional - E.164 number convention
        //   // other custom attributes
        // },
        validationData: [] // optional
      });
      this.props.onStateChange('confirmSignUp');
    } catch (err) {
      console.log('Error: ', err);
      this.setState({
        error: err.message,
        loading: false
      });
    }
  }

  renderConfirmSignUpForm() {
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
              name="createUsername"
              type="text"
              placeholder="Email"
              value={this.state.createUsername}
              onChange={this.handleInputChange}
            />
          </div>
        </div>
        <div className="form__form-group">
          <span className="form__form-group-label">Confirmation Code</span>
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
                      <span className="account__logo">
                        Confirm Sign Up
                      </span>
                    </h3>
                  </div>
                  {this.renderConfirmSignUpForm()}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  render() {
    const {props} = this;
    console.log(props);
    if (this.props.authState !== 'confirmSignUp') {
      return null;
    }
    return (
      <React.Fragment>
        {this.renderPage()}
      </React.Fragment>
    );
  }
}

ConfirmSignUpPage.defaultProps = {

};

export default ConfirmSignUpPage;
