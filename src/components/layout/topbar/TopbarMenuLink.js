import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

class TopbarMenuLink extends Component {
  render() {
    const { title, icon, path } = this.props;

    return (
      <Link className="topbar__link" to={path}>
        <span className={`topbar__link-icon lnr lnr-${icon}`}/>
        <p className="topbar__link-title">{title}</p>
      </Link>
    );
  }
}

TopbarMenuLink.propTypes = {
  title: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
  path: PropTypes.string.isRequired
};

export default TopbarMenuLink;
