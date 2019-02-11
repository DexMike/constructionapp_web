import React, { Component } from 'react';
import AccountOutlineIcon from 'mdi-react/AccountOutlineIcon';
import KeyVariantIcon from 'mdi-react/KeyVariantIcon';
import EyeIcon from 'mdi-react/EyeIcon';
import { Link } from 'react-router-dom';
import TCheckBox from '../common/TCheckBox';

class LogInForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showPassword: false
    };

    this.showPassword = this.showPassword.bind(this);
  }

  showPassword(e) {
    e.preventDefault();
    const { showPassword } = this.state;
    this.setState({
      showPassword: !showPassword
    });
  }

  render() {
    const { showPassword } = this.state;
    return (
      <form className="form">
        <div className="form__form-group">
          <span className="form__form-group-label">Username</span>
          <div className="form__form-group-field">
            <div className="form__form-group-icon">
              <AccountOutlineIcon/>
            </div>
            <input
              name="name"
              type="text"
              placeholder="Name"
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
            <a href="/">Forgot a password?</a>
          </div>
        </div>
        <div className="form__form-group">
          <div className="form__form-group-field">
            <TCheckBox name="remember_me" label="Remember me" onChange={() => {
            }} value={false}
            />
          </div>
        </div>
        <Link className="btn btn-primary account__btn account__btn--small" to="/dashboard">
          Sign In
        </Link>
        <Link className="btn btn-outline-primary account__btn account__btn--small" to="/log_in">
          Create Account
        </Link>
      </form>
    );
  }
}

export default LogInForm;
