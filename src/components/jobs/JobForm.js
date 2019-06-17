import React, {Component} from 'react';
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
      loaded: false
    };

    this.handleInputChange = this.handleInputChange.bind(this);
  }

  async componentDidMount() {
    const { job, companyCarrier } = this.props;
    let { loads, carrier, images } = this.state;
    const bookings = await BookingService.getBookingsByJobId(job.id);
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
      carrier,
      loaded: true,
      loads
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
    const companyType = (carrier) ? 'Customer' : 'Carrier';
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
          Phone #:&nbsp;
          <a href={`tel:${TFormat.asPhoneText(job.company.phone)}`}>
            {TFormat.asPhoneText(job.company.phone)}
          </a>
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
        {carrier && (
          <div className="col-md-4">
            <h3 className="subhead">
              Status: {job.status}
            </h3>
            {
              job.status === 'Job Completed'
                ? 'Total'
                : 'Estimated'
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
            Product: {this.materialsAsString(job.materials)}
          </div>
        )}
        {!carrier && (
          <div className="col-md-4">
            <h3 className="subhead">
              Job Status: {displayStatus}
            </h3>
            Estimated Cost:
            {
              TFormat.asMoneyByRate(job.rateType, job.rate, job.rateEstimate)
            }
            <br/>
            Trelar Fee:
            {
              TFormat.asMoney(fee)
            }
            <br/>
            Total Cost:
            {
              TFormat.asMoney(estimatedCost + fee)
            }
            <br/>
            Estimated Amount: {job.rateEstimate} {job.rateType}(s)
            <br/>
            Rate: {TFormat.asMoney(job.rate)} / {job.rateType}
            <br/>
            Product: {this.materialsAsString(job.materials)}
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

  renderLoads() {
    const {loads, job} = {...this.state};
    return (
      <React.Fragment>
        <h3 className="subhead" style={{
          paddingTop: 30,
          color: '#006F53',
          fontSize: 22
        }}
        >
          Run Information
        </h3>
        <LoadsTable loads={loads} job={job}/>
      </React.Fragment>
    );
  }

  renderJobTons() {
    const { loads } = this.state;
    const total = loads.length;
    let delivered = 0;
    let completed = 0;
    if (loads.length > 0) {
      for (const i in loads) {
        if (loads[i].loadStatus === 'Submitted') {
          delivered += 1;
        }
      }
    }
    if (total) {
      completed = parseFloat((delivered * 100 / total).toFixed(2));
    }
    return (
      <React.Fragment>
        <Row>
          <Col>
            <h3 className="subhead">
              Delivery Metrics
            </h3>
            <div>
              <span>Total Tons:  <span>{total}</span></span>
              <br/>
              <span>Load Tonnage Delivered: <span>{delivered}</span></span>
              <br/>
              <span>Tons Remaining: <span>{total - delivered}</span></span>
              <br/>
              <span>% Completed: <span>{completed}%</span></span>
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
              <Row style={{paddingLeft: '10px', paddingRight: '10px'}}>
                <div className="col-md-8" style={{padding: 0}}>
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
                  <hr/>
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
              <Row style={{paddingLeft: '10px', paddingRight: '10px'}}>
                <div className="col-md-8" style={{padding: 0}}>
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
                  <hr/>
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
            <Row style={{paddingLeft: '10px', paddingRight: '10px'}}>
              <div className="col-md-8" style={{padding: 0}}>
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
                <hr/>
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
