import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import SidebarLink from './SidebarLink';
import i18n from 'i18next';
import { useTranslation } from 'react-i18next';
import ReactCountryFlag from "react-country-flag";

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
  )
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
    return (
      <div className="sidebar__content">
        <SideElement title="Job Dashboard" icon="ic_assignment" route="/" handle={this.hideSidebar}/>
        <SideElement title="Truck Search" icon="ic_local_shipping" route="/TrucksList" handle={this.hideSidebar}/>
        <SideElement title="Reporting" icon="ic_timeline" route="/Reports" handle={this.hideSidebar}/>
        <SideElement title="Settings" icon="ic_settings" route="/Settings" handle={this.hideSidebar}/>
      </div>
    );
  }
}

SidebarCustomerContent.propTypes = {
  onClick: PropTypes.func.isRequired
};

export default SidebarCustomerContent;
