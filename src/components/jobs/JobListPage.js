import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { Container } from 'reactstrap';
// import { Button, Card, CardBody, Col, Container, Row } from 'reactstrap';
// import moment from 'moment';
// import TTable from '../common/TTable';
// import JobService from '../../api/JobService';
import ProfileService from '../../api/ProfileService';
import JobCarrierListPage from './JobCarrierListPage';
import JobCustomerListPage from './JobCustomerListPage';
// import CompanyService from '../../api/CompanyService';

class JobListPage extends Component {
  constructor(props) {
    super(props);

    // todo set companyType to Customer | Carrier to show appropriate page
    this.state = {
      loaded: false,
      // jobs: [],
      goToDashboard: false,
      goToAddJob: false,
      goToUpdateJob: false,
      jobId: 0,
      companyType: null,
      companyId: 0
    };

    this.renderGoTo = this.renderGoTo.bind(this);
    this.handleJobEdit = this.handleJobEdit.bind(this);
  }

  async componentDidMount() {
    const profile = await ProfileService.getProfile();
    this.setState({
      companyType: profile.companyType,
      companyId: profile.companyId
    });
    this.setState({ loaded: true });
  }

  getState() {
    const status = this.state;
    return status;
  }

  handleJobEdit(id) {
    this.setState({
      goToUpdateJob: true,
      jobId: id
    });
  }

  handlePageClick(menuItem) {
    if (menuItem) {
      this.setState({ [`goTo${menuItem}`]: true });
    }
  }

  renderJobListFromCompanyType() {
    const { companyType, companyId } = this.state;
    return (
      <React.Fragment>
        {
          companyType === 'Carrier'
          && <JobCarrierListPage companyId={companyId} />
        }
        {
          companyType === 'Customer'
          && <JobCustomerListPage companyId={companyId}/>
        }
      </React.Fragment>
    );
  }

  renderGoTo() {
    const status = this.state;
    if (status.goToDashboard) {
      return <Redirect push to="/"/>;
    }
    if (status.goToAddJob) {
      return <Redirect push to="/jobs/save"/>;
    }
    if (status.goToUpdateJob) {
      return <Redirect push to={`/jobs/save/${status.jobId}`}/>;
    }
    return false;
  }

  render() {
    const { companyType, loaded } = this.state;
    if (loaded) {
      return (
        <React.Fragment>
          { !!companyType && this.renderJobListFromCompanyType()}
        </React.Fragment>
      );
    }
    return (
      <Container className="dashboard">
        Loading...
      </Container>
    );
  }
}

export default JobListPage;
