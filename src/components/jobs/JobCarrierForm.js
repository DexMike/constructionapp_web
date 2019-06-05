import React from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
// import { Redirect } from 'react-router-dom';
import { Card, CardBody, Col, Row, Container } from 'reactstrap';

import './jobs.css';
import TFormat from '../common/TFormat';
import TMapBoxOriginDestinationWithOverlay
  from '../common/TMapBoxOriginDestinationWithOverlay';
import TTable from '../common/TTable';

import JobService from '../../api/JobService';
import BookingService from '../../api/BookingService';
import BookingInvoiceService from '../../api/BookingInvoiceService';
import GPSPointService from '../../api/GPSPointService';
import GPSTrackingService from '../../api/GPSTrackingService';
import JobCustomerForm from './JobCustomerForm';

const MAPBOX_MAX = 23;

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
      isArchived: 0,
      overlayMapData: {}
    };

    this.state = {
      ...job,
      images: [],
      gpsTrackings: null,
      loaded: false
    };

    this.handleInputChange = this.handleInputChange.bind(this);
  }

  async componentDidMount() {
    const {job} = this.props;
    let {images} = this.props;
    let {gpsTrackings} = this.state;

    const bookings = await BookingService.getBookingsByJobId(job.id);

    // get overlay data
    let gpsData = [];
    if (bookings.length > 0) {
      gpsData = await GPSTrackingService.getGPSTrackingByBookingEquipmentId(
        bookings[0].id // booking.id 6
      );
    }

    // prepare the waypoints in an appropiate format for MB (GEOJson point)
    const gps = [];
    if (gpsData.length > 0) {
      for (const datum in gpsData) {
        if (gpsData[datum][0]) {
          const loc = {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [
                gpsData[datum][1],
                gpsData[datum][0]
              ]
            },
            properties: {
              title: 'Actual route',
              icon: 'car'
            }
          };
          // reduce the total of results to a maximum of 23
          // Mapbox's limit is 25 points plus an origin and destination
          const steps = Math.ceil(gpsData.length / MAPBOX_MAX);
          const reducer = datum / steps;
          const remainder = (reducer % 1);
          if (remainder === 0) {
            gps.push(loc);
          }
        }
      }
    }

    if (bookings && bookings.length > 0) {
      const booking = bookings[0];
      const bookingInvoices = await BookingInvoiceService.getBookingInvoicesByBookingId(booking.id);
      images = bookingInvoices.map(item => item.image);
      gpsTrackings = await this.fetchGPSPoints(booking.id);
    }

    this.setState({
      images,
      loaded: true,
      gpsTrackings,
      overlayMapData: {gps}
    });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.job) {
      const {job} = nextProps;
      Object.keys(job)
        .map((key) => {
          if (job[key] === null) {
            job[key] = '';
          }
          return true;
        });
      this.setState({
        ...job,
        loaded: true
      });
    }
  }

  handlePageClick(menuItem) {
    if (menuItem) {
      this.setState({[`goTo${menuItem}`]: true});
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

  async saveJob(e) {
    e.preventDefault();
    const {job, handlePageClick} = this.props;
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

  handleInputChange(e) {
    this.setState({[e.target.name]: e.target.value});
  }

  async handleDelete() {
    const job = this.state;
    await JobCarrierForm.deleteJobById(job.id);
    this.handlePageClick('Job');
  }

  async fetchGPSPoints(bookingId) {
    return GPSPointService.getGPSTrackingsByBookingId(bookingId);
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
          Phone #: <a href={`tel:${TFormat.asPhoneText(job.company.phone)}`}>{TFormat.asPhoneText(job.company.phone)}</a>
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
          Rate: {TFormat.asMoney(job.rate)} / {job.rateType}
          <br/>
          Product: {this.materialsAsString(job.materials)}
        </div>
      </React.Fragment>
    );
  }

  renderGPSPoints(gpsTrackings) {
    if (gpsTrackings && gpsTrackings != null && gpsTrackings.length > 0) {
      gpsTrackings = gpsTrackings.map((gps) => {
        const newGPS = gps;
        // newGPS.newRecordedAt = moment(gps.recordedAt)
        newGPS.newRecordedAt = TFormat.asDayWeek(gps.recordedAt);
        newGPS.accuracy = '90%';
        newGPS.battery = '87%';
        return newGPS;
      });

      return (
        <React.Fragment>
          <hr/>
          <h3 className="subhead">
            GPS Tracking Data
          </h3>
          <Row>
            <Col md={12} lg={12}>
              <Card>
                <CardBody className="products-list">
                  <div className="tabs tabs--bordered-bottom">
                    <div className="tabs__wrap">
                      <TTable
                        columns={
                          [
                            {
                              name: 'newRecordedAt',
                              displayName: 'Time'
                            },
                            {
                              name: 'latitude',
                              displayName: 'Latitude'
                            },
                            {
                              name: 'longitude',
                              displayName: 'Longitude'
                            },
                            {
                              name: 'accuracy',
                              displayName: 'Accuracy'
                            },
                            {
                              name: 'battery',
                              displayName: 'Battery level'
                            }
                          ]
                        }
                        data={gpsTrackings}
                        handleIdClick={this.handleInputChange}
                      />
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </React.Fragment>
      );
    }
  }

  renderMBMap(origin, destination, gpsData) {
    return (
      <React.Fragment>
        <TMapBoxOriginDestinationWithOverlay
          input={
            {
              origin,
              destination,
              gpsData
            }
          }
        />
      </React.Fragment>
    );
  }

  renderEverything() {
    const {images, gpsTrackings, overlayMapData} = this.state;
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
              <Row style={{paddingLeft: '10px', paddingRight: '10px'}}>
                <div className="col-md-8" style={{padding: 0}}>
                  {this.renderMBMap(origin, destination, overlayMapData)}
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
              {this.renderGPSPoints(gpsTrackings)}
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
            <Row style={{paddingLeft: '10px', paddingRight: '10px'}}>
              <div className="col-md-8" style={{padding: 0}}>
                {this.renderMBMap(origin, destination, overlayMapData)}
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
    const { loaded } = this.state;
    if (loaded) {
      return (
        <Container className="dashboard">
          {this.renderEverything()}
        </Container>
      );
    }
    return (
      <Container className="dashboard">
        {this.renderLoader()}
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
