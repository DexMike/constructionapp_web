import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Container, Card, CardBody, Col, Row } from 'reactstrap';
import moment from 'moment';
import CloneDeep from 'lodash.clonedeep';
import JobService from '../../api/JobService';
import AddressService from '../../api/AddressService';
import BidService from '../../api/BidService';
import ProfileService from '../../api/ProfileService';
import JobMaterialsService from '../../api/JobMaterialsService';
import TFormat from '../common/TFormat';
import TMap from '../common/TMapOriginDestination';
import TwilioService from '../../api/TwilioService';
import CompanyService from '../../api/CompanyService';

class JobViewForm extends Component {
  constructor(props) {
    super(props);
    const job = JobService.getDefaultJob();

    this.state = {
      companyName: '',
      customerAccepted: 0,
      bidId: 0,
      bidExists: false,
      ...job,
      loaded: false,
      profile: []
    };
    this.closeNow = this.closeNow.bind(this);
    this.saveJob = this.saveJob.bind(this);
  }

  async componentDidMount() {
    let {
      job,
      companyName,
      bidId,
      bidExists,
      customerAccepted,
      profile
    } = this.state;
    const { jobId } = this.props;
    profile = await ProfileService.getProfile();

    job = await JobService.getJobById(jobId);

    if (job) {
      const company = await CompanyService.getCompanyById(job.companiesId);
      const startAddress = await AddressService.getAddressById(job.startAddress);
      let endAddress = null;
      if (job.endAddress) {
        endAddress = await AddressService.getAddressById(job.endAddress);
      }
      const materials = await JobMaterialsService.getJobMaterialsByJobId(job.id);
      const bids = await BidService.getBidsByJobId(job.id);

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

      if (bids.length) { // we have a bid record
        bidExists = true;
        bidId = bids[0].id;
        customerAccepted = bids[0].hasCustomerAccepted; // has customer accepted?
      }
    }

    this.setState({
      job,
      companyName,
      bidId,
      bidExists,
      customerAccepted,
      profile,
      loaded: true
    });

    // const { selectedJob, selectedMaterials } = this.props;

    // await this.fetchForeignValues();
  }

  // save after the user has checked the info
  async saveJob() {
    // save new or update?
    const {
      job,
      bidId,
      customerAccepted,
      profile
    } = this.state;

    let bid;
    try {
      bid = await BidService.getBidById(bidId);
    } catch (e) {
      // console.log('there is no Bid record');
    }

    if (bid) { // we have a bid record
      // if (bid.length) { // we have a bid record
      if (customerAccepted === 1) { // we accept the job
        // console.log('accepting');
        const newBid = CloneDeep(bid);
        newBid.hasSchedulerAccepted = 1;
        newBid.status = 'Accepted';
        newBid.modifiedBy = profile.userId;
        newBid.modifiedOn = moment()
          .unix() * 1000;
        await BidService.updateBid(newBid);
        // Let's make a call to Twilio to send an SMS
        // We need to change later get the body from the lookups table
        // We need to get the phone number from the carrier co
        const notification = {
          to: '16129990787',
          body: 'You have won this job! Congratulations.'
        };
        await TwilioService.createSms(notification);
        // eslint-disable-next-line no-alert
        alert('You have won this job! Congratulations.');
        this.closeNow();
      } else { // we request a job
        // console.log('requesting');
        const newBid = CloneDeep(bid);
        newBid.hasSchedulerAccepted = 1;
        newBid.status = 'New';
        newBid.modifiedBy = profile.userId;
        newBid.modifiedOn = moment()
          .unix() * 1000;
        newBid.createdOn = moment()
          .unix() * 1000;
        await BidService.updateBid(newBid);
        // Let's make a call to Twilio to send an SMS
        // We need to change later get the body from the lookups table
        // We need to get the phone number from the carrier co
        const notification = {
          to: '16129990787',
          body: 'Your Request has been sent.'
        };
        await TwilioService.createSms(notification);
        // eslint-disable-next-line no-alert
        alert('Your Request has been sent.');
        this.closeNow();
      }
    } else { // no bid record, request a job
      // console.log('requesting');
      bid = {};
      bid.jobId = job.id;
      bid.userId = profile.userId;
      bid.companyCarrierId = job.companiesId;
      bid.hasCustomerAccepted = 0;
      bid.hasSchedulerAccepted = 1;
      bid.status = 'New';
      bid.rateType = job.rateType;
      bid.rate = job.rate;
      bid.rateEstimate = job.rateEstimate;
      bid.notes = job.notes;
      bid.createdBy = profile.userId;
      bid.modifiedBy = profile.userId;
      bid.modifiedOn = moment()
        .unix() * 1000;
      bid.createdOn = moment()
        .unix() * 1000;
      await BidService.createBid(bid);
      // Let's make a call to Twilio to send an SMS
      // We need to change later get the body from the lookups table
      // We need to get the phone number from the carrier co
      const notification = {
        to: '16129990787',
        body: 'Your Request has been sent.'
      };
      await TwilioService.createSms(notification);
      // eslint-disable-next-line no-alert
      alert('Your Request has been sent.');
      this.closeNow();
    }
  }

  equipmentMaterialsAsString(materials) {
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

  closeNow() {
    const { toggle } = this.props;
    toggle();
  }

  renderJobTop(job) {
    const {
      companyName,
      bidExists,
      customerAccepted
    } = this.state;
    return (
      <React.Fragment>
        <Row style={{
          borderBottom: '3px solid #ccc',
          marginBottom: '20px'
        }}
        >
          <Col md={8}>
            <h4>
              {companyName}
              &nbsp;/&nbsp;
              {job.name}
            </h4>
          </Col>
          <Col md={4}>
            <button
              type="submit"
              className="btn btn-primary"
              onClick={this.saveJob}
            >
              {bidExists && customerAccepted === 1 ? 'Accept Job' : 'Request Job'}
            </button>
          </Col>
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
    return (
      <Row style={{ marginTop: '20px' }}>
        <Col sm={12}>
          {type === 'start' ? 'Start Location' : 'End Location'}
        </Col>
        <Col sm={12}>
          {address.address1}
        </Col>
        {address.address2 && (
          <Col sm={12}>
            {address.address2}
          </Col>
        )}
        {address.address3 && (
          <Col sm={12}>
            {address.address3}
          </Col>
        )}
        {address.address4 && (
          <Col sm={12}>
            {address.address4}
          </Col>
        )}
        <Col md={12}>
          {`${address.city}, `}
          {`${address.state}, `}
          {`${address.zipCode}`}
        </Col>
      </Row>
    );
  }

  renderJobDetails(job) {
    return (
      <React.Fragment>
        <Row>
          <Col md={6}>
            <Row>
              <h4 style={{
                borderBottom: '3px solid #ccc',
                marginBottom: '20px'
              }}
              >
                Job Details
              </h4>
            </Row>
          </Col>
          <Col md={6}>
            <Row>
              <h4 style={{
                borderBottom: '3px solid #ccc',
                marginBottom: '20px'
              }}
              >
                Truck Details
              </h4>
            </Row>
          </Col>
        </Row>
        <Row>
          <Col md={6}>
            <Row>
              <Col md={12}>
                Materials
              </Col>
              <Col md={12}>
                {this.equipmentMaterialsAsString(job.materials)}
              </Col>
            </Row>
          </Col>
          <Col md={6}>
            <Row>
              {job.equipmentType}
            </Row>
          </Col>
        </Row>
      </React.Fragment>
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

  /* renderSelectedJob() {
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
                  <span>{ job.company.legalName }</span>
              </div>
            </div>
          </Col>
          <Col xl={3} lg={4} md={6} sm={12}>
            <div className="form__form-group">
              <span className="form__form-group-label">Materials</span>
              <div className="form__form-group-field">
                <span>{ this.materialsAsString(job.materials) }</span>
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
  } */

  renderJobFormButtons() {
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
          </div>
        </div>
      </div>
    );
  }

  render() {
    const { job, loaded } = this.state;
    if (loaded) {
      return (
        <React.Fragment>
          <Col md={12} lg={12}>
            <Card>
              <CardBody>
                {this.renderJobTop(job)}
                {this.renderJobAddresses(job)}
                {this.renderJobDetails(job)}
                {this.renderJobBottom(job)}
                {this.renderJobFormButtons()}
              </CardBody>
            </Card>
          </Col>
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

JobViewForm.propTypes = {
  jobId: PropTypes.number,
  toggle: PropTypes.func.isRequired
};

JobViewForm.defaultProps = {
  jobId: null
};

export default JobViewForm;
