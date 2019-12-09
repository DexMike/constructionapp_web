import React, {Component} from 'react';
import {withTranslation} from 'react-i18next';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import ThemeContext from '../../ThemeContext';
import AuthService from '../../../utils/AuthService';

class TopbarMenuLink extends Component {
  async logOut() {
    localStorage.clear();
    await AuthService.logOut();
  }

  render() {
    const { t } = { ...this.props };
    const translate = t;
    const {title, icon, path, toggle} = this.props;
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
              <Link 
                className="topbar__link" 
                to=""
                onClick={(e) => {
                  e.preventDefault();
                  toggleTheme()
                  }}
              >
                <span className={`topbar__link-icon lnr lnr-${icon}`}/>
                <p className="topbar__link-title">Toggle Theme</p>
              </Link>
            )}
          </ThemeContext.Consumer>
        )}
        {title !== 'Log Out' && title !== 'Toggle Theme' && (
          <Link className="topbar__link" to={path}
            onClick={() => {              
              if (toggle) {
                toggle();
              }
            }}
          >
            <span className={`topbar__link-icon lnr lnr-${icon}`}/>
            <p className="topbar__link-title">{translate(title)}</p>
          </Link>
        )}
      </React.Fragment>
    );
  }
}

TopbarMenuLink.propTypes = {
  title: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
  path: PropTypes.string,
  toggle: PropTypes.func
};

TopbarMenuLink.defaultProps = {
  path: null,
  toggle: null
};

export default withTranslation()(TopbarMenuLink);
