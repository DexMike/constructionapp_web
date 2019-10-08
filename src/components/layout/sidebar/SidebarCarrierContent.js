import React, {Component} from 'react';
import * as PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';
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
        customIcon={custom}
        route={route}
        onClick={handle}
      />
    </ul>
  )
}

class SidebarCarrierContent extends Component {
  constructor(props) {
    super(props);

    this.hideSidebar = this.hideSidebar.bind(this);
  }

  hideSidebar() {
    const {onClick} = this.props;
    onClick();
  }

  render() {
    const { isAdmin } = this.props;
    return (
      <div className="sidebar__content">
        <SideElement
          title="Job Dashboard"
          icon="ic_assignment"
          route="/dashboard"
          onClick={this.hideSidebar}
        />
        {/* <ul className="sidebar__block">
        {/* <ul className="sidebar__block">
          <SidebarLink
            title="Jobs"
            icon="business_center"
            route="/jobs"
            onClick={this.hideSidebar}
          />
        </ul> */}
        {
          isAdmin && (
            <React.Fragment>
              <SideElement
                title="Truck Locator"
                icon="ic_map"
                route="/generalmap"
                onClick={this.hideSidebar}
              />
              <SideElement title="Marketplace"
                     icon="ic_work"
                     route="/marketplace"
                     onClick={this.hideSidebar}/>
              <SideElement title="Trucks"
                          icon="ic_local_shipping"
                          route="/trucks"
                          onClick={this.hideSidebar}/>
              <SideElement title="Drivers"
                      icon="ic_airline_seat_recline_normal"
                      route="/drivers"
                      onClick={this.hideSidebar}
              />
              <SideElement title="Payments"
                      icon="ic_attach_money"
                      route="/payments"
                      onClick={this.hideSidebar}
              />
              {
                /*
                <SideElement
                  title="Addresses"
                  icon="ic_home_work"
                  route="/company/addresses"
                  handle={this.hideSidebar}
                />
                */
              }
              <SideElement title="Reports"
                     icon="ic_timeline"
                     route="/Reports"
                     onClick={this.hideSidebar}/>
            </React.Fragment>
          )
        }        
      </div>
    );
  }
}

SidebarCarrierContent.propTypes = {
  onClick: PropTypes.func.isRequired,
  isAdmin: PropTypes.bool
};

SidebarCarrierContent.defaultProps = {
  isAdmin: false
};

export default SidebarCarrierContent;
