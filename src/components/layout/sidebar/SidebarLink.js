import React, { Component } from 'react';
import {withTranslation} from 'react-i18next';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';

class SidebarLink extends Component {
  render() {
    const { t } = { ...this.props };
    const translate = t;
    const { route, onClick, icon, title } = this.props;
    return (
      <NavLink
        to={route}
        onClick={onClick}
        activeClassName="sidebar__link-active"
        exact
      >
        <li className="sidebar__link">
          {icon ? <i className="material-icons iconSet">{icon}</i> : ''}
          <p className="sidebar__link-title">
            {translate(title)}
          </p>
        </li>
      </NavLink>
    );
  }
}

SidebarLink.propTypes = {
  title: PropTypes.string.isRequired,
  icon: PropTypes.string,
  customIcon: PropTypes.string,
  newLink: PropTypes.bool,
  route: PropTypes.string,
  onClick: PropTypes.func
};

SidebarLink.defaultProps = {
  icon: '',
  customIcon: '',
  newLink: false,
  route: '/',
  onClick: () => {
  }
};

export default withTranslation()(SidebarLink);
