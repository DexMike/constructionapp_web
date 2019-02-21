import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import SidebarLink from './SidebarLink';
import SidebarCategory from './SidebarCategory';
// import ThemeTogglerButton from '../../App';
import ThemeContext from '../../ThemeContext';

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
            title="Dashboard"
            route="/Dashboard"
            onClick={this.hideSidebar}
          />
        </ul>

        <ul className="sidebar__block">
          <SidebarLink
            title="Jobs"
            route="/Jobs"
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
