import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import SidebarLink from './SidebarLink';
// import SidebarCategory from './SidebarCategory';
// import ThemeTogglerButton from '../../App';
// import ThemeContext from '../../ThemeContext';

class SidebarCustomerContent extends Component {
  constructor(props) {
    super(props);

    this.hideSidebar = this.hideSidebar.bind(this);
  }

  hideSidebar() {
    const { onClick } = this.props;
    onClick();
  }

  render() {
    return (
      <div className="sidebar__content">

        <ul className="sidebar__block">
          <SidebarLink
            title="Jobs"
            icon="home"
            route="/"
            onClick={this.hideSidebar}
          />
        </ul>

        <ul className="sidebar__block">
          <SidebarLink
            title="Search for Trucks"
            customIcon="dump_truck"
            route="/TrucksList"
            onClick={this.hideSidebar}
          />
        </ul>

        <ul className="sidebar__block">
          <SidebarLink
            title="Reports"
            icon="assignment"
            route="/Reports"
            onClick={this.hideSidebar}
          />
        </ul>

        <ul className="sidebar__block">
          <SidebarLink
            title="Settings"
            icon="settings"
            route="/Settings"
            onClick={this.hideSidebar}
          />
        </ul>
      </div>
    );
  }
}

SidebarCustomerContent.propTypes = {
  onClick: PropTypes.func.isRequired
};

export default SidebarCustomerContent;
