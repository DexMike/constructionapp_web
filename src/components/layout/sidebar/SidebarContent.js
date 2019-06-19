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
      loaded: false
    };
  }

  async componentDidMount() {
    const profile = await ProfileService.getProfile();
    this.setState({
      companyType: profile.companyType,
      loaded: true
    });
  }

  renderSidebarFromCompanyType() {
    const { companyType, loaded } = this.state;
    const { onClick } = this.props;
    if (loaded) {
      return (
        <React.Fragment>
          { companyType === 'Carrier' && <SidebarCarrierContent onClick={onClick}/>}
          { companyType === 'Customer' && <SidebarCustomerContent onClick={onClick}/>}
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
