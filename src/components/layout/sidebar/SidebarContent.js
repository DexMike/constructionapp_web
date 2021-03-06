import React, { Component } from 'react';
import { Container } from 'reactstrap';
import * as PropTypes from 'prop-types';
import SidebarCarrierContent from './SidebarCarrierContent';
import SidebarCustomerContent from './SidebarCustomerContent';
import ProfileService from '../../../api/ProfileService';

class SidebarContent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      companyType: null,
      isAdmin: false,
      loaded: false
    };
  }

  async componentDidMount() {
    const profile = await ProfileService.getProfile();
    this.setState({
      companyType: profile.companyType,
      isAdmin: profile.isAdmin,
      loaded: true
    });
  }

  renderSidebarFromCompanyType() {
    const { companyType, isAdmin, loaded } = this.state;
    const { onClick } = this.props;
    if (loaded) {
      return (
        <React.Fragment>
          { companyType === 'Carrier' && <SidebarCarrierContent onClick={onClick} isAdmin={isAdmin}/>}
          { companyType === 'Customer' && <SidebarCustomerContent onClick={onClick} isAdmin={isAdmin}/>}
        </React.Fragment>
      );
    }
    return (
      <Container className="dashboard">
          Loading...
      </Container>
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
