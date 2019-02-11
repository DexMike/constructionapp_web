import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Scrollbar from 'react-smooth-scrollbar';
import classNames from 'classnames';
import SidebarContent from './SidebarContent';

class Sidebar extends Component {
  render() {
    const { sidebarShow, sidebarCollapse, changeMobileSidebarVisibility } = this.props;
    const sidebarClass = classNames({
      sidebar: true,
      'sidebar--show': sidebarShow,
      'sidebar--collapse': sidebarCollapse
    });

    return (
      <div className={sidebarClass}>
        <button type="button" className="sidebar__back" onClick={changeMobileSidebarVisibility}/>
        <Scrollbar className="sidebar__scroll scroll">
          <div className="sidebar__wrapper sidebar__wrapper--desktop">
            <SidebarContent
              onClick={() => {
              }}
            />
          </div>
          <div className="sidebar__wrapper sidebar__wrapper--mobile">
            <SidebarContent
              onClick={changeMobileSidebarVisibility}
            />
          </div>
        </Scrollbar>
      </div>
    );
  }
}

Sidebar.propTypes = {
  sidebarShow: PropTypes.bool.isRequired,
  sidebarCollapse: PropTypes.bool.isRequired,
  changeMobileSidebarVisibility: PropTypes.func.isRequired
};

export default Sidebar;
