
import React, { Component } from 'react';
import {
  Container
} from 'reactstrap';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';
import JobCarrierForm from './JobCarrierForm';
import JobCustomerForm from './JobCustomerForm';
import JobService from '../../api/JobService';
import AddressService from '../../api/AddressService';
import JobMaterialsService from '../../api/JobMaterialsService';
import CompanyService from '../../api/CompanyService';
import ProfileService from '../../api/ProfileService';


class JobSavePage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loaded: false,
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
      },
      // moved companyType to the first level
      // for some reason I couldn't set it when nested
      companyType: null
    };

    this.handlePageClick = this.handlePageClick.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    // this.carrierOrCustomerForm = this.carrierOrCustomerForm.bind(this);
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

    // moved the loader to the mount function
    const profile = await ProfileService.getProfile();
    this.setState({ companyType: profile.companyType, loaded: true },
      () => {
        // console.log('setState completed', this.state);
      });
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
    const { job, companyType, loaded } = this.state;
    if (loaded) {
      // waiting for jobs and type to be available
      if (companyType !== null && job !== null) {
        let type = '';
        // console.log(companyType);
        // get the <JobCarrierForm> inside parentheses so that jsx doesn't complain
        if (companyType === 'Carrier') {
          type = (<JobCarrierForm job={job} handlePageClick={this.handlePageClick} />);
        } else {
          type = (<JobCustomerForm job={job} handlePageClick={this.handlePageClick} />);
        }
        return (
          <div className="container">
            <div className="col-md-12">
              <h3 className="page-title">
                Job Details
              </h3>
            </div>
            {/* <JobForm job={job} handlePageClick={this.handlePageClick} /> */}
            {/* this.carrierOrCustomerForm(job) */}
            {type}
          </div>
        );
      }
    }
    return (
      <Container className="dashboard">
        Loading...
      </Container>
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
