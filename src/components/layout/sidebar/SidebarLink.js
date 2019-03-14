import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Badge } from 'reactstrap';
import { NavLink } from 'react-router-dom';
import DumpTruckIcon from './dump_truck.png';

class SidebarLink extends Component {
  render() {
    const { route, onClick, customIcon, icon, title, newLink } = this.props;
    return (
      <NavLink
        to={route}
        onClick={onClick}
        activeClassName="sidebar__link-active"
      >
        <li className="sidebar__link">
          {/* EasyDev default icon: */}
          {/* {icon ? <span className={`sidebar__link-icon lnr lnr-${icon}`}/> : ''} */}
          {/* Material icon: */}
          {icon ? <i className="material-icons iconSet">{icon}</i> : ''}
          {/* Custom icon. Note: first import image at the top */}
          {customIcon === 'dump_truck' ? <img className="customIcon" src={DumpTruckIcon} alt=""/> : ''}
          <p className="sidebar__link-title">
            {title}
            {newLink ? <Badge className="sidebar__link-badge"><span>New</span></Badge> : ''}
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

export default SidebarLink;
