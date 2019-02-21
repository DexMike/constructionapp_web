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
            title="Log In"
            icon="exit"
            route="/log_in"
            onClick={this.hideSidebar}
          />
          <SidebarCategory title="Layout" icon="layers">
            <ThemeContext.Consumer>
              {({ toggleTheme }) => (
                <button type="button" className="sidebar__link" onClick={toggleTheme}>
                  <p className="sidebar__link-title">Toggle Theme</p>
                </button>
              )}
            </ThemeContext.Consumer>
            <React.Fragment />
          </SidebarCategory>
        </ul>

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
