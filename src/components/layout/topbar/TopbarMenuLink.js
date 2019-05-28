import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import {Auth} from 'aws-amplify';
import ThemeContext from '../../ThemeContext';


class TopbarMenuLink extends Component {
  async logOut() {
    try {
      await Auth.signOut();
    } catch (err) {
      // POST https://cognito-idp.us-east-1.amazonaws.com/ 400
      // Uncaught (in promise) {code: "NotAuthorizedException",
      // name: "NotAuthorizedException", message: "Access Token has been revoked"}
      window.location = '/login';
    }
  }

  render() {
    const {title, icon, path} = this.props;
    return (
      <React.Fragment>
        {title === 'Log Out' && (
          <Link className="topbar__link" to={path} onClick={this.logOut}>
            <span className={`topbar__link-icon lnr lnr-${icon}`}/>
            <p className="topbar__link-title">{title}</p>
          </Link>
        )}
        {title === 'Toggle Theme' && (
          <ThemeContext.Consumer>
            {({toggleTheme}) => (
              <Link className="topbar__link" to="" onClick={toggleTheme}>
                <span className={`topbar__link-icon lnr lnr-${icon}`}/>
                <p className="topbar__link-title">Toggle Theme</p>
              </Link>
            )}
          </ThemeContext.Consumer>
        )}
        {title !== 'Log Out' && title !== 'Toggle Theme' && (
          <Link className="topbar__link" to={path}>
            <span className={`topbar__link-icon lnr lnr-${icon}`}/>
            <p className="topbar__link-title">{title}</p>
          </Link>
        )}
      </React.Fragment>
    );
  }
}

TopbarMenuLink.propTypes = {
  title: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
  path: PropTypes.string.isRequired
};

export default TopbarMenuLink;
