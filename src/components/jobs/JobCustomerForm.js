import React, {Component} from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import {Redirect} from 'react-router-dom';
import {Card, CardBody, Col, Row, Container} from 'reactstrap';
// import TCheckBox from '../common/TCheckBox';

import './jobs.css';
import mapboxgl from 'mapbox-gl';
// import TMap from '../common/TMapOriginDestination';
import TMapBoxOriginDestinationWithOverlay
  from '../common/TMapBoxOriginDestinationWithOverlay';
import TTable from '../common/TTable';
import TFormat from '../common/TFormat';

import JobService from '../../api/JobService';
import BookingService from '../../api/BookingService';
import BookingInvoiceService from '../../api/BookingInvoiceService';
import GPSPointService from '../../api/GPSPointService';
import GPSTrackingService from '../../api/GPSTrackingService';
import LoadService from '../../api/LoadService';
import LoadsTable from '../loads/LoadsTable';

mapboxgl.accessToken = process.env.MAPBOX_API;
const MAPBOX_MAX = 23;

class JobCustomerForm extends Component {
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
      loads: null,
      loaded: false
    };

    this.handleInputChange = this.handleInputChange.bind(this);
  }

  async componentDidMount() {
    const {job} = this.props;
    let {images} = this.props;
    let {gpsTrackings, loads} = this.state;

    const bookings = await BookingService.getBookingsByJobId(job.id);

    // get overlay data
    let gpsData = [];
    if (bookings.length > 0) {
      gpsData = await GPSTrackingService.getGPSTrackingByBookingEquipmentId(
        bookings[0].id // booking.id 6
      );
      loads = await LoadService.getLoadsByBookingId(
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
      const bookingInvoices = await BookingInvoiceService.getBookingInvoicesByBookingId(
        booking.id
      );
      images = bookingInvoices.map(item => item.image);
      gpsTrackings = await this.fetchGPSPoints(booking.id);
    }

    this.setState({
      images,
      loaded: true,
      gpsTrackings,
      loads,
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

  /* async handleDelete() {
    const job = this.state;
    await JobCarrierForm.deleteJobById(job.id);
    this.handlePageClick('Job');
  } */

  handleInputChange(e) {
    this.setState({[e.target.name]: e.target.value});
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

  async fetchGPSPoints(bookingId) {
    return GPSPointService.getGPSTrackingsByBookingId(bookingId);
  }

  renderGoTo() {
    const {goToDashboard, goToJob} = this.state;
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
        <div className="col-md-4">
          <h3 className="subhead">
            Job: {job.name}
          </h3>

          {/* <br/> */}
          {job.company.legalName}
          <br/>
          {/* Find the company admin name */}
          Phone #: <a
          href={'tel:' + TFormat.asPhoneText(job.company.phone)}>{TFormat.asPhoneText(job.company.phone)}</a>
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
            Job Status: {job.status}
          </h3>
          Estimated Cost: {
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

  renderLoads(loads) {
    return (
      <React.Fragment>
        <h3 className="subhead" style={{
          paddingTop: 30,
          color: '#006F53',
          fontSize: 22
        }}
        >
          Loads
        </h3>
        <LoadsTable loads={loads}/>
      </React.Fragment>
    );
    // console.log(loads);
    // if (loads != null && loads.length > 0) {
    //   return (
    //     <React.Fragment>
    //       <hr/>
    //       <h3 className="subhead">
    //         Loads
    //       </h3>
    //       <Row>
    //         <Col md={12} lg={12}>
    //           <Card>
    //             <CardBody className="products-list">
    //               <div className="tabs tabs--bordered-bottom">
    //                 <div className="tabs__wrap">
    //                   <TTable
    //                     columns={
    //                       [
    //                         {
    //                           name: 'id',
    //                           displayName: 'IDs'
    //                         }
    //                       ]
    //                     }
    //                     data={loads}
    //                     handleIdClick={this.handleInputChange}
    //                   />
    //                 </div>
    //               </div>
    //             </CardBody>
    //           </Card>
    //         </Col>
    //       </Row>
    //     </React.Fragment>
    //   );
    // }
  }

  renderJobTons() {
    return (
      <React.Fragment>
        <Row>
          <Col>
            <h3 className="subhead">
              Delivery Metrics
            </h3>
            <div>
              <span>Total Tons:  <span>42</span></span>
              <br/>
              <span>Tons Delivered: <span>125</span></span>
              <br/>
              <span>Tons Remaining: <span>8.5</span></span>
              <br/>
              <span>% Completed: <span>80%</span></span>
              <br/>
            </div>
            <br/>
          </Col>
        </Row>
      </React.Fragment>
    );
  }

  renderJobLoads() {
    return (
      <React.Fragment>
        <Row>
          <Col>
            <h3 className="subhead">
              Load Information
            </h3>
            <div>
              <span>Est # of Loads:  <span>42</span></span>
              <br/>
              <span>Loads Completed: <span>35</span></span>
              <br/>
              <span>Loads Remaining: <span>8.5</span></span>
              <br/>
              <span>Avg Tons / Load: <span>10 Tons</span></span>
              <br/>
            </div>
            <br/>
          </Col>
        </Row>
      </React.Fragment>
    );
  }

  renderJobRuns() {
    return (
      <React.Fragment>
        <h3 className="subhead">
          Run Information
        </h3>

        <Row>
          <Col xl={2} lg={2} md={2} sm={12}>
            <div>
              <span><b>Activity</b></span>
              <div>
                <span>Waiting to Load</span>
              </div>
            </div>
          </Col>
          <Col xl={2} lg={2} md={2} sm={12}>
            <div>
              <span><b>Start Time</b></span>
              <div>
                <span>8:00 AM</span>
              </div>
            </div>
          </Col>
          <Col xl={2} lg={2} md={2} sm={12}>
            <div>
              <span><b>End Time</b></span>
              <div>
                <span>8:30 AM</span>
              </div>
            </div>
          </Col>
          <Col xl={2} lg={2} md={2} sm={12}>
            <div>
              <span><b>Duration</b></span>
              <div>
                <span>30 mins</span>
              </div>
            </div>
          </Col>
          <Col xl={2} lg={2} md={2} sm={12}>
            <div>
              <span><b>Distance</b></span>
              <div>
                <span>0</span>
              </div>
            </div>
          </Col>
          <Col xl={2} lg={2} md={2} sm={12}>
            <div>
              <span><b>Load Amount</b></span>
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

  renderRunSummary() {
    return (
      <React.Fragment>
        <Row>
          <Col>
            <h3 className="subhead">
              Run Summary
            </h3>
            <div>
              <span>Avg Load Time: <span>22 mins</span></span>
              <br/>
              <span>Avg UnLoad Time: <span>22 mins</span></span>
              <br/>
              <span>Avg Transit Time: <span>22 mins</span></span>
              <br/>
              <span>Avg Idle Time: <span>20 mins</span></span>
              <br/>
            </div>
          </Col>
        </Row>
      </React.Fragment>
    );
  }

  renderUploadedPhotos(images) {
    if (images && images.length > 0) {
      return (
        <React.Fragment>
          <hr/>
          <h3 className="subhead">
            Uploaded Images
          </h3>
          <Row>
            {images.map(item => (
              <Col className="col-md-3 pt-3" key={`img-${item}`}>
                <img key={item} src={`${item}`} alt={`${item}`}/>
              </Col>
            ))
            }
          </Row>
        </React.Fragment>
      );
    }
    return false;
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

  renderStartAddress(address) {
    return (
      <React.Fragment>
        <h3 className="subhead">Start Location
          {/* <img */}
          {/*  src={`${window.location.origin}/${pinAImage}`} */}
          {/*  alt="avatar" */}
          {/*  className="pinSize" */}
          {/* /> */}
        </h3>
        {this.renderAddress(address)}
      </React.Fragment>
    );
  }

  renderEndAddress(address) {
    return (
      <React.Fragment>
        <h3 className="subhead">End Location
          {/* <img */}
          {/*  src={`${window.location.origin}/${pinBImage}`} */}
          {/*  alt="avatar" */}
          {/*  className="pinSize" */}
          {/* /> */}
        </h3>
        {this.renderAddress(address)}
      </React.Fragment>
    );
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
    const {images, gpsTrackings, overlayMapData, loads} = this.state;
    const {job} = this.props;
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
                <div className="col-md-8 mr-24">
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
                  <div className="row mt-1">
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
              {this.renderGPSPoints(gpsTrackings)}
              {this.renderLoads(loads)}
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
                <div className="row mt-1">
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
    const {loaded} = this.state;
    if (loaded) {
      return (
        <Container className="dashboard">
          {this.renderEverything()}
        </Container>
      );
    }
    return (
      <Container className="dashboard">
        Loading...
      </Container>
    );
  }

  // return (
  // <Container className="dashboard">
  // Loading...
  // </Container>
  // );
}

JobCustomerForm.propTypes = {
  job: PropTypes.shape({
    id: PropTypes.number
  })
};

JobCustomerForm.defaultProps = {
  job: null
};

export default JobCustomerForm;
