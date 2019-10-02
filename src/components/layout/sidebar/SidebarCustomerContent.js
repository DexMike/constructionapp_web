import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import ReactCountryFlag from 'react-country-flag';
import i18n from 'i18next';
import { useTranslation } from 'react-i18next';
import SidebarLink from './SidebarLink';
// import SidebarCategory from './SidebarCategory';
// import ThemeTogglerButton from '../../App';
// import ThemeContext from '../../ThemeContext';


function SideElement ({title, icon, route, custom, handle}) {
  const { t } = useTranslation();
  return (
    <ul className="sidebar__block">
      <SidebarLink
        icon={icon}
        title={t(title)}
        // customIcon={custom}
        route={route}
        onClick={handle}
      />
    </ul>
  );
}

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
    let { isAdmin } = this.props;
    return (
      <div className="sidebar__content">
        <SideElement
          title="Job Dashboard"
          icon="ic_assignment"
          route="/"
          handle={this.hideSidebar}
        />
        <SideElement
          title="Carrier Search"
          icon="ic_supervised_user_circle"
          route="/carrierslist"
          handle={this.hideSidebar}
        />
        {
          isAdmin && (
            <React.Fragment>
              <SideElement
                title="Truck Locator"
                icon="ic_map"
                route="/generalmap"
                onClick={this.hideSidebar}
              />
              <SideElement
                title="Charges"
                icon="ic_attach_money"
                route="/payments"
                handle={this.hideSidebar}
              />
              <SideElement
                title="Addresses"
                icon="ic_home_work"
                route="/company/addresses"
                handle={this.hideSidebar}
              />
            </React.Fragment>
          )
        }
        <SideElement
          title="Reporting"
          icon="ic_timeline"
          route="/Reports"
          handle={this.hideSidebar}
        />
      </div>
    );
  }
}

SidebarCustomerContent.propTypes = {
  onClick: PropTypes.func.isRequired,
  isAdmin: PropTypes.bool
};

SidebarCustomerContent.defaultProps = {
  isAdmin: false
};

export default SidebarCustomerContent;
