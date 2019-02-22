import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Auth } from 'aws-amplify';
import ThemeContext from '../../ThemeContext';

class TopbarMenuLink extends Component {
  logOut() {
    Auth.signOut({ global: true });
  }

  render() {
    const { title, icon, path } = this.props;

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
            {({ toggleTheme }) => (
              <button type="button" className="sidebar__link" onClick={toggleTheme}>
                <p className="sidebar__link-title">Toggle Theme</p>
              </button>
            )}
          </ThemeContext.Consumer>
        )}
        { title !== 'Log Out' && title !== 'Toggle Theme' && (
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
