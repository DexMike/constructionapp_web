import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
// import SidebarLink from './SidebarLink';
// import SidebarCategory from './SidebarCategory';
// import ThemeTogglerButton from '../../App';
// import ThemeContext from '../../ThemeContext';
import SidebarCarrierContent from './SidebarCarrierContent';
import SidebarCustomerContent from './SidebarCustomerContent';

class SidebarContent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      // todo set companyType to Customer | Carrier to show appropriate page
      companyType: 'Customer'
      // companyType: 'Carrier'
    };
  }

  render() {
    const { companyType } = this.state;
    const { onClick } = this.props;
    return (
      <React.Fragment>
        <div>
          &nbsp;
        </div>
        {companyType === 'Carrier' && <SidebarCarrierContent onClick={onClick}/>}
        {companyType === 'Customer' && <SidebarCustomerContent onClick={onClick}/>}
      </React.Fragment>
    );
  }
}

SidebarContent.propTypes = {
  onClick: PropTypes.func.isRequired
};

export default SidebarContent;
