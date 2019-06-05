import React, { Component } from 'react';
// import { Redirect } from 'react-router-dom';
import { Container } from 'reactstrap';

import PaymentsCarrier from './PaymentsCarrier';
import PaymentsCustomer from './PaymentsCustomer';
import ProfileService from '../../api/ProfileService';

class PaymentsPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loaded: false,
      companyType: ''
    };
  }

  async componentDidMount() {
    const profile = await ProfileService.getProfile();
    const { companyType } = profile;
    this.setState({ companyType, loaded: true });
  }

  renderLoader() {
    return (
      <div className="load loaded inside-page">
        <div className="load__icon-wrap">
          <svg className="load__icon">
            <path fill="rgb(0, 111, 83)" d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z"/>
          </svg>
        </div>
      </div>
    );
  }

  render() {
    const { companyType, loaded } = this.state;
    if (loaded) {
      return (
        <Container className="dashboard">
          {
            companyType === 'Customer'
              ? <PaymentsCustomer/>
              : null
          }
          {
            companyType === 'Carrier'
              ? <PaymentsCarrier/>
              : null
          }
        </Container>
      );
    }
    return (
      <React.Fragment>
        {this.renderLoader()}
      </React.Fragment>
    );
  }
}

export default PaymentsPage;
