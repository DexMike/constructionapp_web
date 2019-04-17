import React, { Component } from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';
import { Card, CardBody, Col, Row, Container } from 'reactstrap';
// import TCheckBox from '../common/TCheckBox';
import TTable from '../common/TTable';
import TFormat from '../common/TFormat';
import TMap from '../common/TMapOriginDestination';
import TMapBox from '../common/TMapBox';

import JobService from '../../api/JobService';
import BookingService from '../../api/BookingService';
import BookingInvoiceService from '../../api/BookingInvoiceService';
// import CompanyService from '../../api/CompanyService';
// import JobMaterialsService from '../../api/JobMaterialsService';
// import AddressService from '../../api/AddressService';
import './jobs.css';
import pinAImage from '../../img/PinA.png';
import pinBImage from '../../img/PinB.png';

import JobCustomerForm from './JobCustomerForm';


class JobCarrierForm extends JobCustomerForm {
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
      ...job,
      images: []
    };

    this.handleInputChange = this.handleInputChange.bind(this);
  }

  async componentDidMount() {
    const { job } = this.props;
    const bookings = await BookingService.getBookingsByJobId(job.id);
    if (bookings && bookings.length > 0) {
      const booking = bookings[0];
      const bookingInvoices = await BookingInvoiceService.getBookingInvoicesByBookingId(booking.id);
      const images = bookingInvoices.map(item => item.image);
      this.setState({ images });
    }
  }

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

  renderJobTop(job) {
    return (
      <React.Fragment>
        <div className="col-md-4">
          <h3 className="subhead">
            Job: {job.name}
          </h3>
          {job.company.legalName}
          <br/>
          {/* Find the company admin name */}
          Phone #: <a
          href={`tel:${TFormat.asPhoneText(job.company.phone)}`}>{TFormat.asPhoneText(job.company.phone)}</a>
          <br/>
          Number of Trucks: {job.numEquipments}
          <br/>
        </div>
        <div className="col-md-4">
          <h3 className="subhead">
            Dates:
          </h3>
          Start Date: {TFormat.asDayWeek(job.startTime)}
          <br/>
          Created On: {TFormat.asDayWeek(job.createdOn)}
        </div>
        <div className="col-md-4">
          <h3 className="subhead">
            Status: {job.status}
          </h3>
          Potential Earnings: {
          TFormat.asMoneyByRate(job.rateType, job.rate, job.rateEstimate)
        }
          <br/>
          Estimated Amount: {job.rateEstimate} {job.rateType}(s)
          <br/>
          Rate: ${job.rate} / {job.rateType}
          <br/>
          Product: {this.materialsAsString(job.materials)}
        </div>
      </React.Fragment>
    );
  }

  renderMapBox(origin, destination) {

    // Need to first convert addresses to long, lat.
    //
    // see
    //
    //
    // see https://github.com/mapbox/mapbox-sdk-js/blob/master/docs/services.md#forwardgeocode
    //

    //
    // Hard coded location due to long, lat changes to point in Address objects
    // NOTE: mapbox requires 'lng' not 'long'
    //
    let lat = 41.8507300;
    let lng = -87.6512600;
    let zoom = 12;

    return (
      <React.Fragment>
        <TMapBox
          state={
            {
              lat,
              lng,
              zoom
            }
          }
        />
      </React.Fragment>
    );
  }

  renderEverything() {
    const { images } = this.state;
    const { job } = this.props;
    let origin = '';
    let destination = '';
    let endAddress;

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

    if (job.endAddress) { // if there's endAddress, render it
      endAddress = this.renderEndAddress(job.endAddress);
    }

    if (job.status === 'Job Completed') {
      return (
        <Container>
          <Card>
            <CardBody className="card-full-height">
              <Row>
                {this.renderJobTop(job)}
              </Row>
              <hr/>
              <Row>
                <div className="col-md-8 backo_red">

                  {/*swap to mapbox from Google*/}
                  {/*{this.renderMapBox(origin, destination)}*/}

                  {/*Call from parent object*/}
                  {this.renderGoogleMap(origin, destination)}

                </div>
                <div className="col-md-4">
                  <div className="row">
                    <div className="col-md-12">
                      {this.renderStartAddress(job.startAddress)}
                    </div>
                  </div>
                  <div className="row mt-1">
                    <div className="col-md-12">
                      {endAddress}
                    </div>
                  </div>
                  <hr/>
                  <div className="row  mt-1">
                    <div className="col-md-12">
                      {this.renderJobBottom(job)}
                    </div>
                  </div>
                </div>
              </Row>
              <hr/>
              <div className="row">
                <div className="col-md-4">
                  {this.renderJobTons(job)}
                </div>
                <div className="col-md-4">
                  {this.renderJobLoads(job)}
                </div>
                <div className="col-md-4">
                  {this.renderRunSummary(job)}
                </div>
              </div>
              <hr/>
              {this.renderJobRuns(job)}
              {this.renderUploadedPhotos(images)}
            </CardBody>
          </Card>
        </Container>
      );
    }
    return (
      <Container>
        <Card>
          <CardBody className="card-full-height">
            <Row>
              {this.renderJobTop(job)}
            </Row>
            <hr/>
            <Row>
              <div className="col-md-8 backo_red">

                {/*swap to mapbox from Google*/}
                {/*{this.renderMapBox(origin, destination)}*/}

                {/*Call from parent object*/}
                {this.renderGoogleMap(origin, destination)}

              </div>
              <div className="col-md-4">
                <div className="row">
                  <div className="col-md-12">
                    {this.renderStartAddress(job.startAddress)}
                  </div>
                </div>
                <div className="row mt-1">
                  <div className="col-md-12">
                    {endAddress}
                  </div>
                </div>
                <hr/>
                <div className="row  mt-1">
                  <div className="col-md-12">
                    {this.renderJobBottom(job)}
                  </div>
                </div>
              </div>
              {/*<div className="col-md-12">*/}
              {/*  {this.renderImages(images)}*/}
              {/*</div>*/}
            </Row>
            <hr/>
            {/*<div className="row">*/}
            {/*  <div className="col-md-4">*/}
            {/*    {this.renderJobTons(job)}*/}
            {/*  </div>*/}
            {/*  <div className="col-md-4">*/}
            {/*    {this.renderJobLoads(job)}*/}
            {/*  </div>*/}
            {/*  <div className="col-md-4">*/}
            {/*    {this.renderRunSummary(job)}*/}
            {/*  </div>*/}
            {/*</div>*/}
            {/*<hr/>*/}
            {/*{this.renderJobRuns(job)}*/}
          </CardBody>
        </Card>
      </Container>
    );
  }

  render() {
    return (
      <Container className="dashboard">
        {this.renderEverything()}
      </Container>
    );
  }

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
