import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Container, Card, CardBody, Col, Row } from 'reactstrap';
import moment from 'moment';
import CloneDeep from 'lodash.clonedeep';
import NumberFormat from 'react-number-format';
import JobService from '../../api/JobService';
import truckImage from '../../img/default_truck.png';
import TButtonToggle from '../common/TButtonToggle';
import AddressService from '../../api/AddressService';
import LookupsService from '../../api/LookupsService';
import BidService from '../../api/BidService';
import BookingService from '../../api/BookingService';
import BookingEquipmentService from '../../api/BookingEquipmentService';
import ProfileService from '../../api/ProfileService';
import JobMaterialsService from '../../api/JobMaterialsService';
import TDateTimePicker from '../common/TDateTimePicker';
import TField from '../common/TField';
import TFormat from '../common/TFormat';
import TMap from '../common/TMapOriginDestination';
import TwilioService from '../../api/TwilioService';
import MultiSelect from '../common/TMultiSelect';
import SelectField from '../common/TSelect';
import CompanyService from '../../api/CompanyService';

class JobViewForm extends Component {
  constructor(props) {
    super(props);
    const job = JobService.getDefaultJob();

    this.state = {
      companyName: '',
      ...job,
      loaded: false,
      states: []
    };
    this.closeNow = this.closeNow.bind(this);
  }

  async componentDidMount() {
    let { job, companyName } = this.state;
    const { jobId } = this.props;
    const profile = await ProfileService.getProfile();

    job = await JobService.getJobById(jobId);

    if (job) {
      const company = await CompanyService.getCompanyById(job.companiesId);
      const startAddress = await AddressService.getAddressById(job.startAddress);
      let endAddress = null;
      if (job.endAddress) {
        endAddress = await AddressService.getAddressById(job.endAddress);
      }
      const materials = await JobMaterialsService.getJobMaterialsByJobId(job.id);

      if (company) {
        companyName = company.legalName;
      }

      if (startAddress) {
        job.startAddress = startAddress;
      }

      if (endAddress) {
        job.endAddress = endAddress;
      }

      if (materials) {
        job.materials = materials.map(material => material.value);
      }

      this.setState({ job, companyName, loaded: true });
    }

    // const { selectedJob, selectedMaterials } = this.props;

    // await this.fetchForeignValues();
  }

  async viewJob(e) {
    console.log('We are in ViewJob!');
    // e.preventDefault();
    const { closeModal, selectedEquipment } = this.props;
    const { startAddress, job, endAddress, bid, booking, bookingEquipment } = this.state;
    // const newJob = CloneDeep(job);
    // startAddress.name = `Job: ${newJob.name}`;
    // endAddress.name = `Job: ${newJob.name}`;
    if (!this.isFormValid()) {
      // TODO display error message
      // console.error('didnt put all the required fields.');
      return;
    }
    this.closeNow();
  }

  closeNow() {
    const { toggle } = this.props;
    toggle();
  }

  isFormValid() {
    const job = this.state;
    const {} = this.state;
    let isValid = true;

    return isValid;
  }

  renderJobTop(job) {
    const { companyName } = this.state;
    return (
      <React.Fragment>
        <Row style={{
          borderBottom: '3px solid #ccc',
          marginBottom: '20px'
        }}
        >
          <h4>
            {companyName}
            &nbsp;/&nbsp;
            {job.name}
          </h4>
        </Row>
        <Row style={{
          borderBottom: '3px solid #ccc',
          marginBottom: '20px'
        }}
        >
          <Col md={6}>
            <Row>
              {TFormat.asMoneyByRate(job.rateType, job.rate, job.rateEstimate)}
            </Row>
            <Row>
              Estimated Income
            </Row>
          </Col>
          <Col md={6}>
            <Row>Rate ${job.rate} / {job.rateType}</Row>
            <Row>Estimated - {job.rateEstimate} {job.rateType}(s)</Row>
          </Col>
        </Row>
        <Row style={{
          borderBottom: '3px solid #ccc',
          marginBottom: '20px'
        }}
        >
          <h4>
            Date of Job: {moment(job.startTime).format('dddd, MMMM Do')}
          </h4>
        </Row>
      </React.Fragment>
    );
  }

  renderJobAddresses(job) {
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
      <Row>
        <Col className="col-md-6">
          <TMap
            input={
              {
                origin,
                destination
              }
            }
          />
        </Col>
        <Col className="col-md-6">
          <Row>
            {this.renderAddress(job.startAddress, 'start')}
          </Row>
          <Row>
            {this.renderAddress(job.endAddress, 'end')}
          </Row>
        </Col>
      </Row>
    );
  }

  renderAddress(address, type) {
    console.log(address);
    return (
      <Row style={{ marginTop: '20px' }}>
        <Col sm={12}>
          <div className="form__form-group">
            <span className="form__form-group-label">{type === 'start' ? 'Start Location' : 'End Location'}</span>
            <div className="form__form-group-field">
              <span>{address.address1}</span>
            </div>
          </div>
        </Col>
        {address.address2 && (
          <Col sm={12}>
            <div className="form__form-group">
              <div className="form__form-group-field">
                <span>{address.address2}</span>
              </div>
            </div>
          </Col>
        )}
        {address.address3 && (
          <Col sm={12}>
            <div className="form__form-group">
              <div className="form__form-group-field">
                <span>{address.address3}</span>
              </div>
            </div>
          </Col>
        )}
        {address.address4 && (
          <Col sm={12}>
            <div className="form__form-group">
              <div className="form__form-group-field">
                <span>{address.address4}</span>
              </div>
            </div>
          </Col>
        )}
        <Col xl={3} lg={4} md={6} sm={12}>
          <div className="form__form-group">
            <span className="form__form-group-label">City</span>
            <div className="form__form-group-field">
              <span>{address.city}</span>
            </div>
          </div>
        </Col>
        <Col xl={3} lg={4} md={6} sm={12}>
          <div className="form__form-group">
            <span className="form__form-group-label">State</span>
            <div className="form__form-group-field">
              <span>{address.state}</span>
            </div>
          </div>
        </Col>
        <Col xl={3} lg={4} md={6} sm={12}>
          <div className="form__form-group">
            <span className="form__form-group-label">Zip Code</span>
            <div className="form__form-group-field">
              <span>{address.zipCode}</span>
            </div>
          </div>
        </Col>
      </Row>
    );
  }

  renderJobBottom(job) {
    return (
      <React.Fragment>
        <h4 style={{
          borderBottom: '3px solid #ccc',
          marginBottom: '20px'
        }}
        >
          Instructions
        </h4>
        <Row>
          <Col md={12}>
            <div className="form__form-group">
              <div className="form__form-group-field">
                {job.notes}
              </div>
            </div>
          </Col>
        </Row>
      </React.Fragment>
    );
  }

  renderSelectedJob() {
    const { job } = this.state;
    console.log(job);
    return (
      <React.Fragment>
        <h4 style={{
          borderBottom: '3px solid #ccc',
          marginBottom: '20px'
        }}
        >
          Customer Status: {job.status}
          &nbsp;-&nbsp;
          Job: {job.name}
        </h4>
        <Row>
          <Col xl={3} lg={4} md={6} sm={12}>
            <div className="form__form-group">
              <span className="form__form-group-label">Start Date</span>
              <div className="form__form-group-field">
                <span>
                  {moment(job.startTime)
                    .format('MM/DD/YY')}
                </span>
              </div>
            </div>
          </Col>
          <Col xl={3} lg={4} md={6} sm={12}>
            <div className="form__form-group">
              <span className="form__form-group-label">Estimated Amount</span>
              <div className="form__form-group-field">
                <span>{job.rateEstimate} {job.rateType}(s)</span>
              </div>
            </div>
          </Col>
          <Col xl={3} lg={4} md={6} sm={12}>
            <div className="form__form-group">
              <span className="form__form-group-label">Company Name</span>
              <div className="form__form-group-field">
                <span>{/* job.company.legalName */}</span>
              </div>
            </div>
          </Col>
          <Col xl={3} lg={4} md={6} sm={12}>
            <div className="form__form-group">
              <span className="form__form-group-label">Materials</span>
              <div className="form__form-group-field">
                <span>{/* this.materialsAsString(job.materials) */}</span>
              </div>
            </div>
          </Col>
          <Col xl={3} lg={4} md={6} sm={12}>
            <div className="form__form-group">
              <span className="form__form-group-label">Rate</span>
              <div className="form__form-group-field">
                ${job.rate} / {job.rateType}
              </div>
            </div>
          </Col>
          <Col xl={3} lg={4} md={6} sm={12}>
            <div className="form__form-group">
              <span className="form__form-group-label">Potential Cost</span>
              <div className="form__form-group-field">
                <span>{
                  TFormat.asMoneyByRate(job.rateType, job.rate, job.rateEstimate)
                }
                </span>
              </div>
            </div>
          </Col>
          <Col xl={3} lg={4} md={6} sm={12}>
            <div className="form__form-group">
              <span className="form__form-group-label">Created On</span>
              <div className="form__form-group-field">
                <span>
                  {moment(job.createdOn)
                    .format('MM/DD/YY')}
                </span>
              </div>
            </div>
          </Col>
        </Row>
      </React.Fragment>
    );
  }

  renderJobFormButtons() {
    // const { closeModal } = this.props;

    return (
      <div className="row">
        <div className="col-sm-5"/>
        <div className="col-sm-7">
          <div className="row">
            <div className="col-sm-4">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={this.closeNow}
              >
                Cancel
              </button>
            </div>
            <div className="col-sm-8">
              <button type="submit" className="btn btn-primary">
                Send Request
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  render() {
    const { job, loaded } = this.state;
    console.log(job);
    if (loaded) {
      return (
        <React.Fragment>
          <Col md={12} lg={12}>
            <Card>
              <CardBody>
                {this.renderJobTop(job)}
                {this.renderJobAddresses(job)}
                {this.renderJobBottom(job)}
                {this.renderJobFormButtons()}
              </CardBody>
            </Card>
          </Col>
        </React.Fragment>
      /* <form id="job-request" onSubmit={e => this.viewJob(e)}>
          {this.renderSelectedJob()}
          {this.renderJobFormButtons()}
        </form> */
      );
    }
    return (
      <Container className="dashboard">
        Loading...
      </Container>
    );
  }
}

JobViewForm.propTypes = {
  jobId: PropTypes.number,
  toggle: PropTypes.func.isRequired
};

JobViewForm.defaultProps = {
  jobId: null
};

export default JobViewForm;
