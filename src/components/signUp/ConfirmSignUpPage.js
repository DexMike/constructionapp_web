import React from 'react';
import { ConfirmSignUp } from 'aws-amplify-react';
import AccountOutlineIcon from 'mdi-react/AccountOutlineIcon';
import KeyVariantIcon from 'mdi-react/KeyVariantIcon';
import {Auth} from 'aws-amplify';
import TAlert from '../common/TAlert';

class ConfirmSignUpPage extends ConfirmSignUp {
  constructor(props) {
    super(props);

    this.state = {
      authData: this.props.authData,
      authState: this.props.authState,
      modalShowing: false,
      loading: false,
      error: null,
      confirmationCode: '',
      // phone: '',
      user: null
    };
    this.onConfirm = this.onConfirm.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.onDismiss = this.onDismiss.bind(this);
  }

  handleInputChange(e) {
    const { value } = e.target;
    this.setState({ [e.target.name]: value });
    console.log(this.state);
  }

  onDismiss() {
    this.setState({ error: null });
  }

  async onConfirm(e) {
    const username = e.target.value;
    try {
      const {confirmationCode} = this.state;
      const code = confirmationCode;
      if (code.length <= 0) {
        this.setState({
          error: 'Code cannot be empty',
          loading: false
        });
        return;
      }
      Auth.confirmSignUp(username, code)
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

  renderConfirmSignUpForm() {
    const {props} = this;
    const username = props.authData;
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
              name="confirmUsername"
              type="text"
              placeholder={username}
              value={username}
              disabled
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
              name="confirmationCode"
              type="text"
              placeholder="Enter your code"
              value={this.state.confirmationCode}
              onChange={this.handleInputChange}
            />
          </div>
        </div>
        <button type="button" className="btn btn-outline-primary account__btn account__btn--small" value={username}
                onClick={this.onConfirm}
        >
          Confirm
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
