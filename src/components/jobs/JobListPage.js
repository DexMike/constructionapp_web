import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
// import { Button, Card, CardBody, Col, Container, Row } from 'reactstrap';
// import moment from 'moment';
// import TTable from '../common/TTable';
// import JobsService from '../../api/JobsService';
import JobCarrierListPage from './JobCarrierListPage';
import JobCustomerListPage from './JobCustomerListPage';

class JobListPage extends Component {
  constructor(props) {
    super(props);

    // todo set companyType to Customer | Carrier to show appropriate page
    this.state = {
      // jobs: [],
      goToDashboard: false,
      goToAddJob: false,
      goToUpdateJob: false,
      jobId: 0,
      companyType: 'Customer'
    };

    this.renderGoTo = this.renderGoTo.bind(this);
    this.handleJobEdit = this.handleJobEdit.bind(this);
  }

  async componentDidMount() {
    //    await this.fetchJobs();
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

  // async fetchJobs() {
  //   let jobs = await JobsService.getJobs();
  //   jobs = jobs.map((job) => {
  //     const newJob = job;
  //     newJob.modifiedOn = moment(job.modifiedOn)
  //       .format();
  //     newJob.createdOn = moment(job.createdOn)
  //       .format();
  //     return newJob;
  //   });
  //   this.setState({ jobs });
  // }

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
    // const { jobs } = this.state;
    return (
      <React.Fragment>
        <div>
          Made it to JobListPage
        </div>
        { this.state.companyType === 'Carrier' && <JobCarrierListPage/>}
        { this.state.companyType === 'Customer' && <JobCustomerListPage/>}
      </React.Fragment>
    );
  }
}

export default JobListPage;
