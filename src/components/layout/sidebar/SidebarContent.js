import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
// import SidebarLink from './SidebarLink';
// import SidebarCategory from './SidebarCategory';
// import ThemeTogglerButton from '../../App';
// import ThemeContext from '../../ThemeContext';
import SidebarCarrierContent from './SidebarCarrierContent';
import SidebarCustomerContent from './SidebarCustomerContent';
import ProfileService from '../../../api/ProfileService';
// import DashboardCarrierPage from '../../dashboard/DashboardPage';

class SidebarContent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      companyType: null
    };
  }

  async componentDidMount() {
    const profile = await ProfileService.getProfile();
    this.setState({ companyType: profile.companyType });
  }

  renderSidebarFromCompanyType() {
    const { companyType } = this.state;
    const { onClick } = this.props;
    return (
      <React.Fragment>
        { companyType === 'Carrier' && <SidebarCarrierContent onClick={onClick}/>}
        { companyType === 'Customer' && <SidebarCustomerContent onClick={onClick}/>}
      </React.Fragment>
    );
  }

  render() {
    const { companyType } = this.state;
    return (
      <React.Fragment>
        { !!companyType && this.renderSidebarFromCompanyType() }
      </React.Fragment>
    );
  }
}

SidebarContent.propTypes = {
  onClick: PropTypes.func.isRequired
};

export default SidebarContent;
