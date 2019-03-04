
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';
import JobForm from './JobForm';
import JobService from '../../api/JobService';
import AddressService from '../../api/AddressService';
import JobMaterialsService from '../../api/JobMaterialsService';
import CompanyService from '../../api/CompanyService';

class JobSavePage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      goToDashboard: false,
      goToJob: false,
      job: {
        company: {
          legalName: ''
        },
        startAddress: {
          address1: ''
        },
        endAddress: {
          address1: ''
        }
      }
    };

    this.handlePageClick = this.handlePageClick.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
  }

  async componentDidMount() {
    const { match } = this.props;
    if (match.params.id) {
      const job = await JobService.getJobById(match.params.id);
      // company
      const company = await CompanyService.getCompanyById(job.companiesId);
      // start address
      const startAddress = await AddressService.getAddressById(job.startAddress);
      // end address
      let endAddress = null;
      if (job.endAddress) {
        endAddress = await AddressService.getAddressById(job.endAddress);
      }
      // materials
      const materials = await JobMaterialsService.getJobMaterialsByJobId(job.id);
      job.company = company;
      job.startAddress = startAddress;
      job.endAddress = endAddress;
      job.materials = materials.map(material => material.value);
      this.setState({ job });
    }
  }

  handlePageClick(menuItem) {
    if (menuItem) {
      this.setState({ [`goTo${menuItem}`]: true });
    }
  }

  async handleDelete() {
    const { match } = this.props;
    const { id } = match.params;
    await JobService.deleteJobById(id);
    this.handlePageClick('Job');
  }

  renderGoTo() {
    const { goToDashboard, goToJob } = this.state;
    if (goToDashboard) {
      return <Redirect push to="/" />;
    }
    if (goToJob) {
      return <Redirect push to="/jobs" />;
    }
    return false;
  }

  render() {
    const { job } = this.state;
    return (
      <div className="container">
        {this.renderGoTo()}
        <button type="button" className="app-link"
          onClick={() => this.handlePageClick('Dashboard')}
        >
          Dashboard
        </button>
        &#62;
        <button type="button" className="app-link" onClick={() => this.handlePageClick('Job')}>
          Jobs
        </button>
        &nbsp;&#62;&nbsp;
        {job.company.legalName}
        &nbsp;&#62;&nbsp;
        {job.name}

        <div className="row">
          <div className="col-md-12">
            <h3 className="page-title">
              Job Details
            </h3>
          </div>
        </div>
        <JobForm job={job} handlePageClick={this.handlePageClick} />
      </div>
    );
  }
}

JobSavePage.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string
    })
  })
};

JobSavePage.defaultProps = {
  match: {
    params: {}
  }
};

export default JobSavePage;
