import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import SidebarLink from './SidebarLink';
// import SidebarCategory from './SidebarCategory';
// import ThemeTogglerButton from '../../App';
// import ThemeContext from '../../ThemeContext';

class SidebarCarrierContent extends Component {
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
            title="Dashboard"
            icon="home"
            route="/dashboard"
            onClick={this.hideSidebar}
          />
        </ul>

        <ul className="sidebar__block">
          <SidebarLink
            title="Marketplace"
            icon="store"
            route="/marketplace"
            onClick={this.hideSidebar}
          />
        </ul>

        <ul className="sidebar__block">
          <SidebarLink
            title="Trucks"
            customIcon="dump_truck"
            route="/trucks"
            onClick={this.hideSidebar}
          />
        </ul>

        {/* <ul className="sidebar__block">
          <SidebarLink
            title="Jobs"
            icon="business_center"
            route="/jobs"
            onClick={this.hideSidebar}
          />
        </ul> */}

        <ul className="sidebar__block">
          <SidebarLink
            title="Drivers"
            icon="people"
            route="/drivers"
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

SidebarCarrierContent.propTypes = {
  onClick: PropTypes.func.isRequired
};

export default SidebarCarrierContent;
