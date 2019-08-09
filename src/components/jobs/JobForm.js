import React, { Component } from 'react';
import moment from 'moment';
import * as PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';
import { Card, CardBody, Row, Container, Col } from 'reactstrap';
import './jobs.css';
// import HEREMap, { Marker, RouteLine } from 'here-maps-react';
import HEREMap, { Marker, RouteLine } from '../../utils/here-maps-react';
import TFormat from '../common/TFormat';
import JobService from '../../api/JobService';
import BookingService from '../../api/BookingService';
import BookingInvoiceService from '../../api/BookingInvoiceService';
import LoadService from '../../api/LoadService';
import LoadsTable from '../loads/LoadsTable';
import BookingEquipmentService from '../../api/BookingEquipmentService';
import CompanyService from '../../api/CompanyService';
import ProfileService from '../../api/ProfileService';
// import GeoCodingService from '../../api/GeoCodingService';

/*
RouteFeatureWeightType
-3) strictExclude The routing engine guarantees that the route does not contain strictly excluded features.
 If the condition cannot be fulfilled no route is returned.
-2) softExclude The routing engine does not consider links containing the corresponding feature.
  If no route can be found because of these limitations the condition is weakened.
-1) avoid The routing engine assigns penalties for links containing the corresponding feature.
0)  normal The routing engine does not alter the ranking of links containing the corresponding feature.
*/
const routeFeatureWeightType = 0;
const center = {
  lat: 30.252606,
  lng: -97.754209
};

const hereMapsId = process.env.HERE_MAPS_APP_ID;
const hereMapsCode = process.env.HERE_MAPS_APP_CODE;
const hereMapsApiKey = process.env.HERE_MAPS_API_KEY;

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
      createdOn: moment.utc().format(),
      modifiedBy: 0,
      modifiedOn: moment.utc().format(),
      isArchived: 0,
      overlayMapData: {},
      isExpanded: false
    };

    this.state = {
      ...job,
      images: [],
      carrier: null,
      coords: null,
      loads: [],
      loaded: false,
      distance: 0,
      time: 0,
      showMainMap: false,
      cachedOrigin: '',
      cachedDestination: '',
      profile: [],
      shape: {},
      timeAndDistance: '',
      instructions: [],
      markersGroup: {}
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.onExpandedChanged = this.onExpandedChanged.bind(this);
    this.renderHereMap = this.renderHereMap.bind(this);
    this.onError = this.onError.bind(this);
    this.onSuccess = this.onSuccess.bind(this);
  }

  async componentDidMount() {
    const profile = await ProfileService.getProfile();
    const { job, companyCarrier } = this.props;
    let {
      loads,
      carrier,
      images
    } = this.state;
    const bookings = await BookingService.getBookingsByJobId(job.id);
    const startPoint = job.startAddress;
    const endPoint = job.endAddress;
    let distance = 0;
    let time = 0;
    let group = [];

    const platform = new H.service.Platform({
      apikey: hereMapsApiKey,
      useCIT: true,
      app_id: hereMapsId,
      app_code: hereMapsCode,
      useHTTPS: true
    });

    if (job.startAddress) {
      const routeRequestParams = {
        mode: `balanced;truck;traffic:disabled;motorway:${routeFeatureWeightType}`,
        representation: 'display',
        routeattributes: 'waypoints,summary,shape,legs,incidents',
        maneuverattributes: 'direction,action',
        waypoint0: `${startPoint.latitude},${startPoint.longitude}`,
        waypoint1: `${endPoint.latitude},${endPoint.longitude}`,
        truckType: 'tractorTruck',
        limitedWeight: 700,
        metricSystem: 'imperial',
        language: 'en-us' // en-us|es-es|de-de
      };

      const originMarker = new H.map.Marker({
        lat: startPoint.latitude,
        lng: startPoint.longitude
      });
      const destinationMarker = new H.map.Marker({
        lat: endPoint.latitude,
        lng: endPoint.longitude
      });
      group = new H.map.Group();
      group.addObjects([originMarker, destinationMarker]);

      const router = platform.getRoutingService();
      router.calculateRoute(
        routeRequestParams,
        this.onSuccess,
        this.onError
      );
    }

    try {
      // TODO -> do this without MapBox
      /*
      const response = await GeoCodingService
        .getDistance(startPoint.longitude, startPoint.latitude,
          endPoint.longitude, endPoint.latitude);
      distance = response.routes[0].distance;
      time = response.routes[0].duration;
      */
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
      time,
      cachedOrigin: startPoint,
      cachedDestination: endPoint,
      profile,
      markersGroup: group
    });
  }

  async componentWillReceiveProps(nextProps) {
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
    if (nextProps.companyCarrier) {
      let { carrier } = this.state;
      if (!carrier) {
        carrier = await CompanyService.getCompanyById(nextProps.companyCarrier);
        this.setState({
          carrier
        });
      }
    }
  }

  onError(error) {
    console.log('>>ERROR : ', error);
  }

  onSuccess(result) {
    const route = result.response.route[0];
    this.setState({
      showMainMap: true,
      shape: route.shape,
      timeAndDistance: `Travel time and distance: ${route.summary.text}`,
      instructions: route.leg[0]
    });
    // ... etc.
  }

  onExpandedChanged(rowId) {
    if (rowId !== 0) {
      this.setState({
        showMainMap: false
      });
    } else {
      this.setState({
        showMainMap: true
      });
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
      jobForm.modifiedOn = moment.utc().format();
      await JobService.updateJob(jobForm);
      handlePageClick('Job');
    } else {
      // create
      await JobService.createJob(jobForm);
      handlePageClick('Job');
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

  renderPhone(formatedPhone) {
    if (formatedPhone) {
      return (
        <React.Fragment>
          <br/>
          Telephone: {formatedPhone}
        </React.Fragment>
      );
    }
    return false;
  }

  renderJobTop(job) {
    const { profile, companyType, carrier } = this.state;

    let estimatedCost = TFormat.asMoneyByRate(job.rateType, job.rate, job.rateEstimate);
    estimatedCost = estimatedCost.props ? estimatedCost.props.value : 0;
    const fee = estimatedCost * 0.1;
    let showPhone = null;
    // A Carrier will see 'Published And Offered' as 'On Offer' in the Dashboard
    let displayStatus = job.status;
    if (job.status === 'Published And Offered' && companyType === 'Carrier') {
      displayStatus = 'On Offer';
    }
    if (job.status === 'Booked' || job.status === 'Allocated'
      || job.status === 'In Progress' || job.status === 'Job Complete'
    ) {
      // showPhone = `Telephone: ${TFormat.asPhoneText(job.company.phone)}`;
      showPhone = TFormat.asPhoneText(job.company.phone);
    }
    return (
      <React.Fragment>
        <div className="col-md-4">
          <h3 className="subhead">
            Job: {job.name}
          </h3>
          {carrier && (
            <React.Fragment>
              Carrier: {carrier ? carrier.legalName : ''}
              <br/>
            </React.Fragment>
          )}
          Producer: {job.company.legalName}
          {this.renderPhone(showPhone)}
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
          Start Date: {job.startTime && TFormat.asDayWeek(job.startTime, profile.timeZone)}
          <br/>
          Created On: {TFormat.asDayWeek(job.createdOn, profile.timeZone)}
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
            Rate: {job.rate > 0 && TFormat.asMoney(job.rate)} / {job.rateType}
            <br/>
            Material: {job.materials}
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
            Rate:&nbsp;{job.rate > 0 && TFormat.asMoney(job.rate)} / {job.rateType}
            <br/>
            Material: {job.materials}
          </div>
        )}
      </React.Fragment>
    );
  }

  renderAddress(address) {
    return (
      <React.Fragment>
        {address.address1 && (
        <div>
          <span>{address.address1}</span>
        </div>
        )}
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
        {job && <LoadsTable loads={loads} job={job} expandedRow={this.onExpandedChanged} />}
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
                  <span>Tons Delivered: <span>{tonsDelivered}</span></span>
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
    const { loads } = this.state;
    let completedLoads = 0;
    let tonsDelivered = 0;
    if (loads.length > 0) {
      for (const i in loads) {
        if (loads[i].loadStatus === 'Submitted') {
          completedLoads += 1;
          tonsDelivered += loads[i].tonsEntered;
        }
      }
    }
    let tonnage = 0;
    tonnage = parseFloat((tonsDelivered / loads.length).toFixed(2));
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
                    tonnage ? tonnage : 0
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
        <h3 className="subhead">
          Start Location
        </h3>
        {address && this.renderAddress(address)}
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

  renderHereMap() {
    const {
      showMainMap,
      shape,
      cachedOrigin,
      cachedDestination,
      markersGroup
    } = this.state;

    const opts = {
      layer: 'traffic',
      mapType: 'normal'
    };

    if (showMainMap) {
      return (
        <HEREMap
          style={{height: '200px', background: 'gray' }}
          appId="FlTEFFbhzrFwU1InxRgH"
          appCode="gTgJkC9u0YWzXzvjMadDzQ"
          center={center}
          zoom={14}
          setLayer={opts}
          hidpi={false}
          interactive
          markersGroup={markersGroup}
        >
          <RouteLine
            shape={shape}
            strokeColor="purple"
            lineWidth="4"
          />
          {/* // If markersGroup exists, do not send markers
          <Marker lat={cachedOrigin.latitude} lng={cachedOrigin.longitude} />
          <Marker lat={cachedDestination.latitude} lng={cachedDestination.longitude} />
          */}
        </HEREMap>
      );
    }
    return (
      <React.Fragment>
        &nbsp; Map not available
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
    let endAddress;

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
                {
                  /*
                  <div className="col-md-4">
                    {this.renderRunSummary(job)}
                  </div>
                  */
                }
              </div>
              <hr/>
              <Row style={{
                paddingLeft: '10px',
                paddingRight: '10px'
              }}
              >
                <div className="col-md-8" style={{ padding: 0 }}>
                  {/* NOTE seems like we dont need overlayMapData or coords */}
                  {this.renderHereMap(overlayMapData, coords)}
                </div>
                <div className="col-md-4">
                  <div className="row">
                    <div className="col-md-12">
                      {job.startAddress && this.renderStartAddress(job.startAddress)}
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
                  {this.renderHereMap(null, null)}
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
                {this.renderHereMap(null, null)}
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
            {
              job.status !== 'Published And Offered' && (
                <React.Fragment>
                  <hr/>
                  {this.renderLoads(loads, job)}
                </React.Fragment>
              )
            }
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
