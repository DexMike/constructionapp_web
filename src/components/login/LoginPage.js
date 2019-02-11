import React, { PureComponent } from 'react';
import { Link } from 'react-router-dom';
import FacebookIcon from 'mdi-react/FacebookIcon';
import GooglePlusIcon from 'mdi-react/GooglePlusIcon';
import LogInForm from './LogInForm';

class LoginPage extends PureComponent {
  render() {
    return (
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
              </h3>
              <h4 className="account__subhead subhead">Changing the Way Construction Moves</h4>
            </div>
            <LogInForm/>
            <div className="account__or">
              <p>Or Easily Using</p>
            </div>
            <div className="account__social">
              <Link
                className="account__social-btn account__social-btn--facebook"
                to="/pages/one"
              >
                <FacebookIcon/>
              </Link>
              <Link
                className="account__social-btn account__social-btn--google"
                to="/pages/one"
              >
                <GooglePlusIcon/>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default LoginPage;
