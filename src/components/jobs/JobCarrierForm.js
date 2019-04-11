import React, { Component } from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';
import { Card, CardBody, Col, Row, Container } from 'reactstrap';
// import TCheckBox from '../common/TCheckBox';

import TFormat from '../common/TFormat';

import JobService from '../../api/JobService';
// import CompanyService from '../../api/CompanyService';
// import JobMaterialsService from '../../api/JobMaterialsService';
// import AddressService from '../../api/AddressService';
import TMap from '../common/TMapOriginDestination';
import './jobs.css';
import pinAImage from '../../img/PinA.png';
import pinBImage from '../../img/PinB.png';

class JobCarrierForm extends Component {
  constructor(props) {
    super(props);

    const job = {
      companiesId: 0,
      status: 'New',
      startAddress: 0,
      endAddress: 0,
      rateType: 'All',
      rate: 0,
      notes: '',
      createdBy: 0,
      createdOn: moment()
        .unix() * 1000,
      modifiedBy: 0,
      modifiedOn: moment()
        .unix() * 1000,
      isArchived: 0
    };

    this.state = {
      ...job
    };

    this.handleInputChange = this.handleInputChange.bind(this);
  }

  // async componentDidMount() {
  //   const jobs = await this.fetchJobs();
  //
  //   Promise.all(
  //     jobs.map(async (job) => {
  //       const newJob = job;
  //       const company = await CompanyService.getCompanyById(newJob.companiesId);
  //       newJob.companyName = company.legalName;
  //
  //       const materialsList = await JobMaterialsService.getJobMaterialsByJobId(job.id);
  //       const materials = materialsList.map(materialItem => materialItem.value);
  //       newJob.material = this.equipmentMaterialsAsString(materials);
  //
  //       const address = await AddressService.getAddressById(newJob.startAddress);
  //       newJob.zip = address.zipCode;
  //
  //       return newJob;
  //     })
  //   );
  //   this.setState({ jobs });
  //   // console.log(jobs);
  // }

  componentWillReceiveProps(nextProps) {
    if (nextProps.job) {
      const { job } = nextProps;
      Object.keys(job)
        .map((key) => {
          if (job[key] === null) {
            job[key] = '';
          }
          return true;
        });
      this.setState({ ...job });
    }
  }

  toggle(tab) {
    const { activeTab } = this.state;
    if (activeTab !== tab) {
      this.setState({
        activeTab: tab
      });
    }
  }

  handlePageClick(menuItem) {
    if (menuItem) {
      this.setState({ [`goTo${menuItem}`]: true });
    }
  }

  async saveJob(e) {
    e.preventDefault();
    const { job, handlePageClick } = this.props;
    if (!this.isFormValid()) {
      // TODO display error message
      // console.error('didnt put all the required fields.');
      return;
    }
    const jobForm = this.state;
    if (job && job.id) {
      // then we are updating the record
      jobForm.isArchived = jobForm.isArchived === 'on' ? 1 : 0;
      jobForm.modifiedOn = moment()
        .unix() * 1000;
      await JobService.updateJob(jobForm);
      handlePageClick('Job');
    } else {
      // create
      await JobService.createJob(jobForm);
      handlePageClick('Job');
    }
  }

  isFormValid() {
    const job = this.state;
    return !!(
      job.companiesId
      && job.status
      && job.startAddress
      && job.endAddress
      && job.rateType
    );
  }

  async handleDelete() {
    const job = this.state;
    await JobCarrierForm.deleteJobById(job.id);
    this.handlePageClick('Job');
  }

  handleInputChange(e) {
    this.setState({ [e.target.name]: e.target.value });
  }

  materialsAsString(materials) {
    let materialsString = '';
    if (materials) {
      let index = 0;
      for (const material of materials) {
        if (index !== materials.length - 1) {
          materialsString += `${material}, `;
        } else {
          materialsString += material;
        }
        index += 1;
      }
    }
    return materialsString;
  }

  renderGoTo() {
    const { goToDashboard, goToJob } = this.state;
    if (goToDashboard) {
      return <Redirect push to="/"/>;
    }
    if (goToJob) {
      return <Redirect push to="/jobs"/>;
    }
    return true;
  }

  renderJobTop(job) {
    return (
      <React.Fragment>
        <div className="col-md-3">
          <h3 className="subhead">
            Carrier Status: {job.status}
          </h3>
          Job: {job.name}
          <br/>
          {job.company.legalName}
          <br/>
          Start Date: {TFormat.asDateTime(job.startTime)}
          <br/>
          Created On: {TFormat.asDateTime(job.createdOn)}
        </div>
        <div className="col-md-3">
          <h3 className="subhead">
            Potential Earnings: {
            TFormat.asMoneyByRate(job.rateType, job.rate, job.rateEstimate)
          }
          </h3>
          Estimated Amount: {job.rateEstimate} {job.rateType}(s)
          <br/>
          Rate: ${job.rate} / {job.rateType}
          <br/>
          Materials: {this.materialsAsString(job.materials)}
        </div>
      </React.Fragment>
    );
  }


  renderAddress(address) {
    return (
      <React.Fragment>
        <div>
          <span>{address.address1}</span>
        </div>
        {address.address2 && (
          <div>
            <span>{address.address2}</span>
          </div>
        )}
        {address.address3 && (
          <div>
            <span>{address.address3}</span>
          </div>
        )}
        {address.address4 && (
          <div>
            <span>{address.address4}</span>
          </div>
        )}
        <div>
          <span>{address.city}, {address.state} {address.zipCode}</span>
        </div>
      </React.Fragment>
    );
  }

  renderJobBottom(job) {
    return (
      <React.Fragment>
        <h3 className="subhead">
          Comments
        </h3>
        <Row>
          <Col>
            <div>
              <div>
                {job.notes}
              </div>
            </div>
            <br/>
          </Col>
        </Row>
      </React.Fragment>
    );
  }

  renderJobLoads(job) {
    return (
      <React.Fragment>
        <Row>
          <Col>
            <h3 className="subhead">
              Load Information
            </h3>
            <div>
              <span>Number of Runs:  <span>42</span></span>
              <br/>
              <span>Tons Completed: <span>12,255</span></span>
              <br/>
              <span>Hours Completed: <span>8.5</span></span>
              <br/>
              <span>Avg Run Time: <span>42 mins</span></span>
              <br/>
              <span>Avg Drive Time: <span>12 mins</span></span>
              <br/>
              <span>Avg Idle Time: <span>20 mins</span></span>
              <br/>
            </div>
            <br/>
          </Col>
        </Row>
      </React.Fragment>
    );
  }

  renderJobRunss(job) {
    return (
      <React.Fragment>
        <h3 className="subhead">
          Run Information
        </h3>

        <Row>
          <Col xl={2} lg={2} md={2} sm={12}>
            <div>
              <span>Activity</span>
              <div>
                <span>Waiting to Load</span>
              </div>
            </div>
          </Col>
          <Col xl={2} lg={2} md={2} sm={12}>
            <div>
              <span>Start Time</span>
              <div>
                <span>8:00 AM</span>
              </div>
            </div>
          </Col>
          <Col xl={2} lg={2} md={2} sm={12}>
            <div>
              <span>End Time</span>
              <div>
                <span>8:30 AM</span>
              </div>
            </div>
          </Col>
          <Col xl={2} lg={2} md={2} sm={12}>
            <div>
              <span>Time</span>
              <div>
                <span>30 mins</span>
              </div>
            </div>
          </Col>
          <Col xl={2} lg={2} md={2} sm={12}>
            <div>
              <span>Distance</span>
              <div>
                <span>0</span>
              </div>
            </div>
          </Col>
          <Col xl={2} lg={2} md={2} sm={12}>
            <div>
              <span>[map]</span>
              <div>
                <span>8.5</span>
              </div>
            </div>
          </Col>
        </Row>

        <Row>
          <Col xl={2} lg={2} md={2} sm={12}>
            <div>
              <div>
                <span>Loading</span>
              </div>
            </div>
          </Col>
          <Col xl={2} lg={2} md={2} sm={12}>
            <div>
              <div>
                <span>8:30 AM</span>
              </div>
            </div>
          </Col>
          <Col xl={2} lg={2} md={2} sm={12}>
            <div>
              <div>
                <span>8:50 AM</span>
              </div>
            </div>
          </Col>
          <Col xl={2} lg={2} md={2} sm={12}>
            <div>
              <div>
                <span>20 mins</span>
              </div>
            </div>
          </Col>
          <Col xl={2} lg={2} md={2} sm={12}>
            <div>
              <div>
                <span>8.5</span>
              </div>
            </div>
          </Col>
          <Col xl={2} lg={2} md={2} sm={12}>
            <div>
              <div>
                <span>8.5</span>
              </div>
            </div>
          </Col>
        </Row>

        <Row>
          <Col xl={2} lg={2} md={2} sm={12}>
            <div>
              <div>
                <span>Driving</span>
              </div>
            </div>
          </Col>
          <Col xl={2} lg={2} md={2} sm={12}>
            <div>
              <div>
                <span>8:50 AM</span>
              </div>
            </div>
          </Col>
          <Col xl={2} lg={2} md={2} sm={12}>
            <div>
              <div>
                <span>9:20 AM</span>
              </div>
            </div>
          </Col>
          <Col xl={2} lg={2} md={2} sm={12}>
            <div>
              <div>
                <span>30 mins</span>
              </div>
            </div>
          </Col>
          <Col xl={2} lg={2} md={2} sm={12}>
            <div>
              <div>
                <span>8.5</span>
              </div>
            </div>
          </Col>
          <Col xl={2} lg={2} md={2} sm={12}>
            <div>
              <div>
                <span>8.5</span>
              </div>
            </div>
          </Col>
        </Row>
        <Row>
          <Col xl={2} lg={2} md={2} sm={12}>
            <div>
              <div>
                <span>Unloading</span>
              </div>
            </div>
          </Col>
          <Col xl={2} lg={2} md={2} sm={12}>
            <div>
              <div>
                <span>9:20 AM</span>
              </div>
            </div>
          </Col>
          <Col xl={2} lg={2} md={2} sm={12}>
            <div>
              <div>
                <span>9:40 AM</span>
              </div>
            </div>
          </Col>
          <Col xl={2} lg={2} md={2} sm={12}>
            <div>
              <div>
                <span>20 mins</span>
              </div>
            </div>
          </Col>
          <Col xl={2} lg={2} md={2} sm={12}>
            <div>
              <div>
                <span>8.5</span>
              </div>
            </div>
          </Col>
          <Col xl={2} lg={2} md={2} sm={12}>
            <div>
              <div>
                <span>8.5</span>
              </div>
            </div>
          </Col>
        </Row>

        <Row>
          <Col xl={2} lg={2} md={2} sm={12}>
            <div>
              <div>
                <span>Driving</span>
              </div>
            </div>
          </Col>
          <Col xl={2} lg={2} md={2} sm={12}>
            <div>
              <div>
                <span>9:40 AM</span>
              </div>
            </div>
          </Col>
          <Col xl={2} lg={2} md={2} sm={12}>
            <div>
              <div>
                <span>10:15 AM</span>
              </div>
            </div>
          </Col>
          <Col xl={2} lg={2} md={2} sm={12}>
            <div>
              <div>
                <span>35 mins</span>
              </div>
            </div>
          </Col>
          <Col xl={2} lg={2} md={2} sm={12}>
            <div>
              <div>
                <span>8.5</span>
              </div>
            </div>
          </Col>
          <Col xl={2} lg={2} md={2} sm={12}>
            <div>
              <div>
                <span>8.5</span>
              </div>
            </div>
          </Col>
        </Row>

      </React.Fragment>
    );
  }

  renderRunSummary(job) {
    return (
      <React.Fragment>
        <Row>
          <Col>
            <h3 className="subhead">
              Run Summary
            </h3>
            <div>
              <span>Avg Run Time: <span>42 mins</span></span>
              <br/>
              <span>Avg Drive Time: <span>22 mins</span></span>
              <br/>
              <span>Avg Idle Time: <span>20 mins</span></span>
              <br/>
              <span>Avg Load Time: <span>22 mins</span></span>
              <br/>
              <span>Avg Drive Time: <span>42 mins</span></span>
              <br/>
              <span>Avg Unload Time: <span>20 mins</span></span>
              <br/>
            </div>
          </Col>
        </Row>
      </React.Fragment>
    );
  }

  renderStartAddress() {
    const { job } = this.props;
    let origin = '';
    let destination = '';

    if (!job.startAddress && job.endAddress) {
      origin = `${job.endAddress.address1} ${job.endAddress.city} ${job.endAddress.state} ${job.endAddress.zipCode}`;
      destination = `${job.endAddress.address1} ${job.endAddress.city} ${job.endAddress.state} ${job.endAddress.zipCode}`;
    }
    if (job.startAddress && !job.endAddress) {
      origin = `${job.startAddress.address1} ${job.startAddress.city} ${job.startAddress.state} ${job.startAddress.zipCode}`;
      destination = `${job.startAddress.address1} ${job.startAddress.city} ${job.startAddress.state} ${job.startAddress.zipCode}`;
    }
    if (job.startAddress && job.endAddress) {
      origin = `${job.startAddress.address1} ${job.startAddress.city} ${job.startAddress.state} ${job.startAddress.zipCode}`;
      destination = `${job.endAddress.address1} ${job.endAddress.city} ${job.endAddress.state} ${job.endAddress.zipCode}`;
    }

    return (
      <React.Fragment>
        <h3 className="subhead">Start Location
          {/*<img*/}
          {/*  src={`${window.location.origin}/${pinAImage}`}*/}
          {/*  alt="avatar"*/}
          {/*  className="pinSize"*/}
          {/*/> */}
        </h3>
        {this.renderAddress(job.startAddress)}
      </React.Fragment>
    );
  }

  renderEndAddress() {
    const { job } = this.props;
    let origin = '';
    let destination = '';

    if (!job.startAddress && job.endAddress) {
      origin = `${job.endAddress.address1} ${job.endAddress.city} ${job.endAddress.state} ${job.endAddress.zipCode}`;
      destination = `${job.endAddress.address1} ${job.endAddress.city} ${job.endAddress.state} ${job.endAddress.zipCode}`;
    }
    if (job.startAddress && !job.endAddress) {
      origin = `${job.startAddress.address1} ${job.startAddress.city} ${job.startAddress.state} ${job.startAddress.zipCode}`;
      destination = `${job.startAddress.address1} ${job.startAddress.city} ${job.startAddress.state} ${job.startAddress.zipCode}`;
    }
    if (job.startAddress && job.endAddress) {
      origin = `${job.startAddress.address1} ${job.startAddress.city} ${job.startAddress.state} ${job.startAddress.zipCode}`;
      destination = `${job.endAddress.address1} ${job.endAddress.city} ${job.endAddress.state} ${job.endAddress.zipCode}`;
    }

    return (
      <React.Fragment>
        <h3 className="subhead">End Location
          {/*<img*/}
          {/*  src={`${window.location.origin}/${pinBImage}`}*/}
          {/*  alt="avatar"*/}
          {/*  className="pinSize"*/}
          {/*/> */}
        </h3>
        {this.renderAddress(job.endAddress)}
      </React.Fragment>
    );
  }

  renderEverything() {
    const { job } = this.props;
    let origin = '';
    let destination = '';

    if (!job.startAddress && job.endAddress) {
      origin = `${job.endAddress.address1} ${job.endAddress.city} ${job.endAddress.state} ${job.endAddress.zipCode}`;
      destination = `${job.endAddress.address1} ${job.endAddress.city} ${job.endAddress.state} ${job.endAddress.zipCode}`;
    }
    if (job.startAddress && !job.endAddress) {
      origin = `${job.startAddress.address1} ${job.startAddress.city} ${job.startAddress.state} ${job.startAddress.zipCode}`;
      destination = `${job.startAddress.address1} ${job.startAddress.city} ${job.startAddress.state} ${job.startAddress.zipCode}`;
    }
    if (job.startAddress && job.endAddress) {
      origin = `${job.startAddress.address1} ${job.startAddress.city} ${job.startAddress.state} ${job.startAddress.zipCode}`;
      destination = `${job.endAddress.address1} ${job.endAddress.city} ${job.endAddress.state} ${job.endAddress.zipCode}`;
    }

    return (
      <Container>
        <Card>
          <CardBody className="card-full-height">
            <Row>
              {this.renderJobTop(job)}
              <div className="col-md-3">
                {this.renderStartAddress(job)}
              </div>
              <div className="col-md-3">
                {this.renderEndAddress(job)}
              </div>
            </Row>
            <Row>
              <div>
                <hr></hr>
              </div>
            </Row>
            <Row>
              <div className="col-md-5 backo_red">
                <TMap
                  input={
                    {
                      origin,
                      destination
                    }
                  }
                />
              </div>
              <div className="col-md-7">
                {this.renderJobBottom(job)}
                <div className="row">
                  <div className="col-md-6">
                    {this.renderRunSummary(job)}
                  </div>
                  <div className="col-md-6">
                    {this.renderJobLoads(job)}
                  </div>
                </div>
                {this.renderJobRunss(job)}
              </div>
            </Row>
          </CardBody>
        </Card>
      </Container>
    );
  }

  render() {
    // const { loaded } = this.state;
    // if (loaded) {
    return (
      <Container className="dashboard">
        {this.renderEverything()}
      </Container>
    );
  }

  // return (
  //   <Container className="dashboard">
  //     Loading...
  //   </Container>
  // );
}

JobCarrierForm.propTypes = {
  job: PropTypes.shape({
    id: PropTypes.number
  }),
  handlePageClick: PropTypes.func.isRequired
};

JobCarrierForm.defaultProps = {
  job: null
};

export default JobCarrierForm;
