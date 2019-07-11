import React, { Component } from 'react';
import moment from 'moment';
import * as PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';
import { Card, CardBody, Row, Container, Col } from 'reactstrap';
import './jobs.css';
import TFormat from '../common/TFormat';
import TMapBoxOriginDestinationWithOverlay
  from '../common/TMapBoxOriginDestinationWithOverlay';
import JobService from '../../api/JobService';
import BookingService from '../../api/BookingService';
import BookingInvoiceService from '../../api/BookingInvoiceService';
import LoadService from '../../api/LoadService';
import LoadsTable from '../loads/LoadsTable';
import BookingEquipmentService from '../../api/BookingEquipmentService';
import CompanyService from '../../api/CompanyService';
import ProfileService from '../../api/ProfileService';
import GeoCodingService from '../../api/GeoCodingService';

class JobForm extends Component {
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
      carrier: null,
      coords: null,
      loads: [],
      loaded: false,
      distance: 0,
      time: 0
    };

    this.handleInputChange = this.handleInputChange.bind(this);
  }

  async componentDidMount() {
    const profile = await ProfileService.getProfile();
    const { job, companyCarrier } = this.props;
    let { loads, carrier, images } = this.state;
    const bookings = await BookingService.getBookingsByJobId(job.id);
    const startPoint = job.startAddress;
    const endPoint = job.endAddress;
    let distance = 0;
    let time = 0;
    try {
      const response = await GeoCodingService
        .getDistance(startPoint.longitude, startPoint.latitude,
          endPoint.longitude, endPoint.latitude);
      distance = response.routes[0].distance;
      time = response.routes[0].duration;
    } catch (e) {
      // console.log(e)
    }
    if (companyCarrier) {
      carrier = await CompanyService.getCompanyById(companyCarrier);
    }
    if (bookings.length > 0) {
      const bookingEquipments = await BookingEquipmentService
        .getBookingEquipmentsByBookingId(bookings[0].id);
      if (bookingEquipments.length > 0) {
        loads = await LoadService.getLoadsByBookingId(
          bookings[0].id // booking.id 6
        );
      }
    }

    if (bookings && bookings.length > 0) {
      const booking = bookings[0];
      const bookingInvoices = await BookingInvoiceService.getBookingInvoicesByBookingId(booking.id);
      images = bookingInvoices.map(item => item.image);
    }

    this.setState({
      images,
      companyType: profile.companyType,
      carrier,
      loaded: true,
      loads,
      job,
      distance,
      time
    });
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
      this.setState({
        ...job,
        loaded: true
      });
    }
  }

  handlePageClick(menuItem) {
    if (menuItem) {
      this.setState({ [`goTo${menuItem}`]: true });
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

  renderJobTop(job, carrier) {
    const { companyType } = this.state;

    let estimatedCost = TFormat.asMoneyByRate(job.rateType, job.rate, job.rateEstimate);
    estimatedCost = estimatedCost.props.value;
    const fee = estimatedCost * 0.1;
    // A Carrier will see 'Published And Offered' as 'On Offer' in the Dashboard
    let displayStatus = job.status;
    if (job.status === 'Published And Offered' && companyType === 'Carrier') {
      displayStatus = 'On Offer';
    }
    return (
      <React.Fragment>
        <div className="col-md-4">
          <h3 className="subhead">
            Job: {job.name}
          </h3>
          {companyType}: {job.company.legalName}
          <br/>
          {
            job.status === 'Booked' || job.status === 'Allocated'
            || job.status === 'In Progress' || job.status === 'Job Complete'

              ? TFormat.asPhoneText(job.company.phone)
              : ''

            // Phone #:&nbsp;
          // <a href={`tel:${TFormat.asPhoneText(job.company.phone)}`}>
          //   {TFormat.asPhoneText(job.company.phone)}
          // </a>

          }
          <br/>
          Number of Trucks: {job.numEquipments}
          <br/>
          Truck Type: {job.equipmentType}
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
        {companyType === 'Carrier' && (
          <div className="col-md-4">
            <h3 className="subhead">
              Job Status: {job.status}
            </h3>
            {
              job.status === 'Job Completed'
                ? 'Total'
                : 'Potential'
            }
            &nbsp;Earnings:
            {
              TFormat.asMoneyByRate(job.rateType, job.rate, job.rateEstimate)
            }
            <br/>
            {
              job.status === 'Job Completed'
                ? 'Total'
                : 'Estimated'
            }
            &nbsp;Amount: {job.rateEstimate} {job.rateType}(s)
            <br/>
            Rate: {TFormat.asMoney(job.rate)} / {job.rateType}
            <br/>
            Material: {this.materialsAsString(job.materials)}
          </div>
        )}
        {companyType === 'Customer' && (
          <div className="col-md-4">
            <h3 className="subhead">
              Job Status: {displayStatus}
            </h3>
            Delivery Cost:&nbsp;
            {
              TFormat.asMoneyByRate(job.rateType, job.rate, job.rateEstimate)
            }
            <br/>
            Trelar Fee:&nbsp;
            {
              TFormat.asMoney(fee)
            }
            <br/>
            Estimated Total Cost:&nbsp;
            {
              TFormat.asMoney(estimatedCost + fee)
            }
            <br/>
            Estimated Amount: {job.rateEstimate} {job.rateType}(s)
            <br/>
            Rate:&nbsp;{TFormat.asMoney(job.rate)} / {job.rateType}
            <br/>
            Material: {this.materialsAsString(job.materials)}
          </div>
        )}
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
    const { distance, time } = this.state;
    return (
      <React.Fragment>
        <h3 className="subhead">
          Distance
        </h3>
        <Row>
          <Col>
            <div>
              <div>
                {TFormat.asMetersToMiles(distance)}
              </div>
            </div>
            <br/>
          </Col>
        </Row>
        <h3 className="subhead">
          Avg Travel Time
        </h3>
        <Row>
          <Col>
            <div>
              <div>
                {TFormat.asSecondsToHms(time)}
              </div>
            </div>
            <br/>
          </Col>
        </Row>
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

  renderLoads() {
    const { loads, job } = { ...this.state };
    return (
      <React.Fragment>
        <h3 className="subhead" style={{
          paddingTop: 30,
          color: '#006F53',
          fontSize: 22
        }}
        >
          Load Information
        </h3>
        {job && <LoadsTable loads={loads} job={job}/>}
      </React.Fragment>
    );
  }

  renderJobTons() {
    const { loads, job } = this.state;
    const total = job.rateEstimate;
    let tonsDelivered = 0;
    let hoursDelivered = 0;
    if (loads.length > 0) {
      for (const i in loads) {
        if (loads[i].loadStatus === 'Submitted') {
          tonsDelivered += loads[i].tonsEntered;
          hoursDelivered += loads[i].hoursEntered;
        }
      }
    }
    return (
      <React.Fragment>
        <Row>
          <Col>
            <h3 className="subhead">
              Delivery Metrics
            </h3>
            {
              job.rateType === 'Ton' ? (
                <div>
                  <span>Total Tons:  <span>{total} {job.rateType}(s)</span></span>
                  <br/>
                  <span>Load Tonnage Delivered: <span>{tonsDelivered}</span></span>
                  <br/>
                  <span>Tons Remaining: <span>{total - tonsDelivered}</span></span>
                  <br/>
                  <span>% Completed:&nbsp;
                    <span>
                      {parseFloat((tonsDelivered * 100 / total).toFixed(2))}%
                    </span>
                  </span>
                  <br/>
                </div>
              ) : (
                <div>
                  <span>Total Hours:  <span>{total} {job.rateType}(s)</span></span>
                  <br/>
                  <span>Hours Completed: <span>{hoursDelivered}</span></span>
                  <br/>
                  <span>Hours Remaining: <span>{total - hoursDelivered}</span></span>
                  <br/>
                  <span>% Completed:&nbsp;
                    <span>
                      {parseFloat((hoursDelivered * 100 / total).toFixed(2))}%
                    </span>
                  </span>
                  <br/>
                </div>
              )
            }
            <br/>
          </Col>
        </Row>
      </React.Fragment>
    );
  }

  renderJobLoads() {
    const { loads, job } = this.state;
    let completedLoads = 0;
    const total = job.rateEstimate;
    let tonsDelivered = 0;
    if (loads.length > 0) {
      for (const i in loads) {
        if (loads[i].loadStatus === 'Submitted') {
          completedLoads += 1;
        }
        tonsDelivered += loads[i].tonsEntered;
      }
    }
    let tonnage = 0;
    if (job.rateType === 'Ton' && loads.length > 0) {
      tonnage = parseFloat((total / loads.length).toFixed(2));
    }
    if (job.rateType === 'Hour' && loads.length > 0) {
      tonnage = parseFloat((tonsDelivered / loads.length).toFixed(2));
    }
    return (
      <React.Fragment>
        <Row>
          <Col>
            <h3 className="subhead">
              Load Information
            </h3>
            <div>
              <span>Loads Completed: <span>{completedLoads}</span></span>
              <br/>
              <span>Avg Tons / Load:&nbsp;
                <span>
                  {
                    tonnage
                  }
                </span>
              </span>
              <br/>
            </div>
            <br/>
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

  renderMBMap(origin, destination, gpsData, coords) {
    return (
      <React.Fragment>
        <TMapBoxOriginDestinationWithOverlay
          input={
            {
              origin,
              destination,
              gpsData,
              coords
            }
          }
        />
      </React.Fragment>
    );
  }

  renderEverything() {
    const {
      images,
      coords,
      overlayMapData,
      loads
    } = this.state;
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
              <Row style={{
                paddingLeft: '10px',
                paddingRight: '10px'
              }}
              >
                <div className="col-md-8" style={{ padding: 0 }}>
                  {/* NOTE seems like we dont need overlayMapData or coords */}
                  {this.renderMBMap(origin, destination, overlayMapData, coords)}
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
                  <div className="row mt-1">
                    <div className="col-md-12">
                      {this.renderJobBottom(job)}
                    </div>
                  </div>
                </div>
              </Row>
              <hr/>
              {this.renderLoads()}
              {this.renderUploadedPhotos(images)}
            </CardBody>
          </Card>
        </Container>
      );
    }
    if (job.status === 'In Progress') {
      return (
        <Container>
          <Card>
            <CardBody className="card-full-height">
              <Row>
                {this.renderJobTop(job)}
              </Row>
              <hr/>
              <Row style={{
                paddingLeft: '10px',
                paddingRight: '10px'
              }}
              >
                <div className="col-md-8" style={{ padding: 0 }}>
                  {this.renderMBMap(origin, destination)}
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
                  <div className="row mt-1">
                    <div className="col-md-12">
                      {this.renderJobBottom(job)}
                    </div>
                  </div>
                </div>
              </Row>
              <hr/>
              {this.renderLoads(loads, job)}
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
            <Row style={{
              paddingLeft: '10px',
              paddingRight: '10px'
            }}
            >
              <div className="col-md-8" style={{ padding: 0 }}>
                {this.renderMBMap(origin, destination)}
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
                <div className="row  mt-1">
                  <div className="col-md-12">
                    {this.renderJobBottom(job)}
                  </div>
                </div>
              </div>
            </Row>
            <hr/>
            {this.renderLoads(loads, job)}
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
          <div className="col-md-9">
            <h3 className="page-title">Job Details</h3>
          </div>
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

JobForm.propTypes = {
  job: PropTypes.shape({
    id: PropTypes.number
  }),
  companyCarrier: PropTypes.number,
  handlePageClick: PropTypes.func.isRequired
};

JobForm.defaultProps = {
  job: null,
  companyCarrier: null
};

export default JobForm;
