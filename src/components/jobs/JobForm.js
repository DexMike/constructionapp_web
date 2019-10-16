import React, { Component } from 'react';
import moment from 'moment';
import * as PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';
import {
  Card,
  CardBody,
  Row,
  Container,
  Col,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button } from 'reactstrap';
import './jobs.css';
import TFormat from '../common/TFormat';
import JobService from '../../api/JobService';
import BookingService from '../../api/BookingService';
import BookingInvoiceService from '../../api/BookingInvoiceService';
import LoadService from '../../api/LoadService';
import LoadsTable from '../loads/LoadsTable';
import BookingEquipmentService from '../../api/BookingEquipmentService';
import CompanyService from '../../api/CompanyService';
import ProfileService from '../../api/ProfileService';
import TMapLive from '../common/TMapLive';
import TMap from '../common/TMap';
import GeoUtils from '../../utils/GeoUtils';
import TSpinner from '../common/TSpinner';
import RatesDeliveryService from '../../api/RatesDeliveryService';
import TCalculator from '../common/TCalculator';

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
      isExpanded: false,
      allTruckTypes: []
    };

    this.state = {
      ...job,
      images: [],
      company: [],
      carrier: null,
      coords: null,
      loads: [],
      loaded: false,
      distance: 0,
      distanceEnRoute: 0,
      distanceReturn: 0,
      time: 0,
      timeReturning: 0,
      showMainMap: false,
      cachedOrigin: '',
      cachedDestination: '',
      profile: [],
      shape: {},
      timeAndDistance: '',
      instructions: [],
      markersGroup: [],
      approveLoadsModal: false,
      approvingLoads: false,
      approvingLoadsError: false,
      trelarFee: 0
    };

    this.loadJobForm = this.loadJobForm.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.onExpandedChanged = this.onExpandedChanged.bind(this);
    this.getLoads = this.getLoads.bind(this);
    this.toggleApproveLoadsModal = this.toggleApproveLoadsModal.bind(this);
    this.approveAllSubmittedLoads = this.approveAllSubmittedLoads.bind(this);
  }

  async componentDidMount() {
    await this.loadJobForm();
  }

  async componentWillReceiveProps(nextProps) {
    if (nextProps.job) {
      await this.loadJobForm();
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

  getLoads() {
    const { loads } = this.state;
    return loads;
  }

  async loadJobForm() {
    const profile = await ProfileService.getProfile();
    const { job, companyCarrier } = this.props;
    let {
      loads,
      carrier,
      images,
      distance,
      time,
      timeReturning,
      company,
      trelarFee
    } = this.state;
    const bookings = await BookingService.getBookingsByJobId(job.id);
    const startPoint = job.startAddress;
    const endPoint = job.endAddress;

    if (job.startAddress) {
      const waypoint0 = `${startPoint.latitude},${startPoint.longitude}`;
      const waypoint1 = `${endPoint.latitude},${endPoint.longitude}`;
      const summary = await GeoUtils.getDistance(waypoint0, waypoint1);
      const summaryReturn = await GeoUtils.getDistance(waypoint0, waypoint1);
      distance = summary.distance;
      time = summary.travelTime; // time "en route"
      timeReturning = summaryReturn.travelTime; // time "returning"
    }

    if (companyCarrier) {
      carrier = await CompanyService.getCompanyById(companyCarrier);
    }
    company = await CompanyService.getCompanyById(job.companiesId);
    if (bookings.length > 0) {
      const bookingEquipments = await BookingEquipmentService
        .getBookingEquipmentsByBookingId(bookings[0].id);
      if (bookingEquipments.length > 0) {
        loads = await LoadService.getLoadsByBookingId(
          bookings[0].id // booking.id 6
        );
        loads = loads.reverse();
      }
    }

    if (profile.companyType === 'Customer' || profile.companyType === 'Producer') {
      const companyRates = {
        companyId: profile.companyId,
        rate: job.rate,
        rateEstimate: job.rateEstimate
      };
      try {
        trelarFee = await RatesDeliveryService.calculateTrelarFee(companyRates);
      } catch (err) {
        console.error(err);
      }
    }

    if (bookings && bookings.length > 0) {
      const booking = bookings[0];
      const bookingInvoices = await BookingInvoiceService.getBookingInvoicesByBookingId(booking.id);
      images = bookingInvoices.map(item => item.image);
    }

    const allTruckTypes = await JobService.getMaterialsByJobId(job.id);

    this.setState({
      images,
      companyType: profile.companyType,
      carrier,
      loaded: true,
      loads,
      job,
      cachedOrigin: startPoint,
      cachedDestination: endPoint,
      profile,
      company,
      distance,
      time,
      allTruckTypes,
      trelarFee
    });
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

  toggleApproveLoadsModal() {
    const {approveLoadsModal} = this.state;
    this.setState({
      approveLoadsModal: !approveLoadsModal,
      approvingLoadsError: false
    });
  }

  handlePageClick(menuItem) {
    if (menuItem) {
      this.setState({ [`goTo${menuItem}`]: true });
    }
  }

  async approveAllSubmittedLoads() {
    const { job } = this.props;
    let approvingLoadsError = false;
    this.setState({ approvingLoads: true });
    try {
      const response = await LoadService.approveJobSubmittedLoads(job.id);
      if (response === true) {
        window.location.reload();
      } else {
        approvingLoadsError = true;
      }
    } catch (e) {
      approvingLoadsError = true;
      // console.log(e);
    }
    this.setState({ approvingLoads: false, approvingLoadsError });
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

  renderApproveAllLoadsButton() {
    const { companyType, loads } = this.state;
    let submittedLoads = 0;
    loads.forEach((load) => {
      if (load.loadStatus === 'Submitted') submittedLoads += 1;
    });
    if (companyType !== 'Carrier' && loads.length > 0
      && submittedLoads > 0) {
      return (
        <Button
          onClick={() => this.toggleApproveLoadsModal()}
          className="secondaryButton"
        >
          Approve All Submitted Loads
        </Button>
      );
    }
    return false;
  }

  renderApproveAllLoadsModal() {
    const { approveLoadsModal, approvingLoads, approvingLoadsError } = this.state;
    return (
      <React.Fragment>
        <Modal isOpen={approveLoadsModal} toggle={this.toggleApproveLoadsModal} className="status-modal">
          <ModalHeader toggle={this.toggleModal} style={{ backgroundColor: '#006F53' }} className="text-left">
            <div style={{ fontSize: 16, color: '#FFF' }}>
              { approvingLoadsError ? 'Error Message' : 'Confirmation' }
            </div>
          </ModalHeader>
          <ModalBody className="text-left">
            <p>
              {
                approvingLoadsError ? 'There was an error when trying to approve all the loads. Please try again now or after some time has passed.'
                  : 'Are you sure you want to approve all of the submitted loads for this job?'
              }
            </p>
          </ModalBody>
          <ModalFooter>
            <Row>
              <Col md={12} className="text-right">
                <Button
                  color="secondary"
                  onClick={this.toggleApproveLoadsModal}
                  disabled={approvingLoads}
                >
                  {
                    approvingLoadsError ? 'Ok' : 'Cancel'
                  }
                </Button>
                &nbsp;
                {
                  !approvingLoadsError && (
                    <Button
                      color="primary"
                      onClick={() => this.approveAllSubmittedLoads()}
                      disabled={approvingLoads}
                    >
                      {
                        approvingLoads ? (
                          <TSpinner
                            color="#808080"
                            loaderSize={10}
                            loading
                          />
                        ) : 'Yes, approve all'
                      }
                    </Button>
                  )
                }
              </Col>
            </Row>
          </ModalFooter>
        </Modal>
      </React.Fragment>
    );
  }

  renderMinimumInsurance() {
    const { company } = this.state;
    let liabilityGeneral;
    let liabilityAuto;
    let liabilityOther;
    if (company.liabilityGeneral > 0.01) {
      liabilityGeneral = (
        <React.Fragment>
          Minimum General Liability: {TFormat.asMoneyNoDecimals(company.liabilityGeneral)}
          <br/>
        </React.Fragment>
      );
    }
    if (company.liabilityAuto > 0.01) {
      liabilityAuto = (
        <React.Fragment>
          Minimum Auto Liability: {TFormat.asMoneyNoDecimals(company.liabilityAuto)}
          <br/>
        </React.Fragment>
      );
    }
    if (company.liabilityOther > 0.01) {
      liabilityOther = (
        <React.Fragment>
          Minimum Other Liability: {TFormat.asMoneyNoDecimals(company.liabilityOther)}
          <br/>
        </React.Fragment>
      );
    }

    if (company.liabilityGeneral < 0.01 && company.liabilityAuto < 0.01) {
      return false;
    }
    return (
      <React.Fragment>
        {liabilityGeneral}
        {liabilityAuto}
        {liabilityOther}
      </React.Fragment>
    );
  }

  renderJobTop(job) {
    const {
      profile,
      companyType,
      carrier,
      allTruckTypes,
      trelarFee,
      time,
      timeReturning
    } = this.state;
    const { bid } = this.props;

    const trucks = allTruckTypes.join(', ');

    let estimatedCost = TFormat.asMoneyByRate(job.rateType, job.rate, job.rateEstimate);
    estimatedCost = estimatedCost.props ? estimatedCost.props.value : 0;
    let showPhone = null;
    // A Carrier will see 'Published And Offered' as 'On Offer' in the Dashboard
    let displayStatus = job.status;
    if ((job.status === 'Published' || job.status === 'Published And Offered') && companyType === 'Carrier') {
      displayStatus = 'On Offer';
      if (bid && bid.status === 'Pending' && bid.hasSchedulerAccepted === 1) {
        displayStatus = 'Requested';
      }
    }
    if (job.status === 'Job Ended') {
      displayStatus = 'Job Finishing';
    }
    if (job.status === 'Booked' || job.status === 'Allocated'
      || job.status === 'In Progress' || job.status === 'Job Complete'
    ) {
      // showPhone = `Telephone: ${TFormat.asPhoneText(job.company.phone)}`;
      if (companyType === 'Carrier') {
        // showPhone = TFormat.asPhoneText(job.company.phone);
        showPhone = job.company.phone;
      }
      if (companyType === 'Customer' && carrier) {
        // showPhone = TFormat.asPhoneText(carrier.phone);
        showPhone = carrier.phone;
      }
      showPhone = TFormat.asPhoneText(showPhone);
    }
    return (
      <React.Fragment>
        <div className="col-md-4">
          <h3 className="subhead">
            Job: {job.name}
          </h3>
          {(((companyType === 'Customer' || companyType === 'Producer')
            || (companyType === 'Carrier'
              && (job.status !== 'Published'
              && job.status !== 'On Offer'
              && job.status !== 'Published And Offered'
              && job.status !== 'Saved'
              && job.status !== 'Cancelled')))
            && job.poNumber) && (
            <React.Fragment>
              PO Number: {job.poNumber}
              {((bid && bid.status === 'Accepted') || companyType === 'Carrier') && (<br/>)}
            </React.Fragment>
          )}
          {(carrier && companyType === 'Customer') && (
            <React.Fragment>
              Carrier: {carrier ? carrier.legalName : ''}
            </React.Fragment>
          )}
          {
            (companyType === 'Carrier') && (
              <React.Fragment>
                Producer: {job.company.legalName}
              </React.Fragment>
            )
          }
          {this.renderPhone(showPhone)}
          <br/>
          {this.renderMinimumInsurance()}
          Number of Trucks: {job.numEquipments || 'Any'}
          <br/>
          Truck Types: {trucks}
          <br/>
          Material: {job.materials}
        </div>
        <div className="col-md-4">
          <h3 className="subhead">
            Dates:
          </h3>
          Start Date: {job.startTime && TFormat.asDayWeek(job.startTime, profile.timeZone)}
          <br/>
          {job.endTime && (
            <React.Fragment>
            End Date: {job.endTime && TFormat.asDayWeek(job.endTime, profile.timeZone)}
              <br/>
            </React.Fragment>
          )}
          Created On: {TFormat.asDayWeek(job.createdOn, profile.timeZone)}
        </div>
        {companyType === 'Carrier' && (
          <div className="col-md-4">
            <h3 className="subhead">
              Job Status: {displayStatus}
            </h3>
            {
              // job.status === 'Job Completed'
              //   ? 'Total'
              //   : 'Potential'
            }
            Potential Earnings:&nbsp;
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
          </div>
        )}
        {(companyType === 'Customer' || companyType === 'Producer') && (
          <div className="col-md-4">
            <h3 className="subhead">
              Job Status: {displayStatus}
            </h3>
            Estimated Amount: {job.rateEstimate} {job.rateType}(s)
            <br/>
            Rate:&nbsp;{job.rate > 0 && TFormat.asMoney(job.rate)} / {job.rateType}
            <br/>
            Estimated Costs:
            <br/>
            {(job.rateType === 'Hour') && (
              <React.Fragment>
                &nbsp;&nbsp;- One Way cost / ton / mile: ${TCalculator.getOneWayCostByHourRate(
                time,
                timeReturning,
                0.25,
                0.25,
                job.rate,
                22,
                job.avgDistance
              )}
              </React.Fragment>
            )}
            {(job.rateType === 'Ton') && (
              <React.Fragment>
                &nbsp;&nbsp;- One Way cost / ton / mile: $ {TCalculator.getOneWayCostByTonRate(
                job.rate,
                job.avgDistance
              )}
              </React.Fragment>
            )}
            <br/>
            &nbsp;&nbsp;- Delivery Cost&nbsp;
            {
              TFormat.asMoneyByRate(job.rateType, job.rate, job.rateEstimate)
            }
            <br/>
            &nbsp;&nbsp;- Trelar Fee&nbsp;
            {
              TFormat.asMoney(trelarFee)
            }
            <br/>
            &nbsp;&nbsp;- Total Cost&nbsp;
            {
              TFormat.asMoney(estimatedCost + trelarFee)
            }
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
        {this.renderApproveAllLoadsModal()}
        {
          this.renderApproveAllLoadsButton()
        }
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

  renderEverything() {
    const {
      images,
      loads
    } = this.state;
    const { job } = this.props;
    let endAddress;

    if (job.endAddress) { // if there's endAddress, render it
      endAddress = this.renderEndAddress(job.endAddress);
    }

    if (job.status === 'In Progress'
    || job.status === 'Job Ended'
    || job.status === 'Job Completed'
    ) {
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
                  <TMap
                    id={`job${job.id}`}
                    width="100%"
                    height="100%"
                    startAddress={job.startAddress}
                    endAddress={job.endAddress}
                  />
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
                  <TMapLive
                    id={`job${job.id}`}
                    width="100%"
                    height="100%"
                    startAddress={job.startAddress}
                    endAddress={job.endAddress}
                    loads={this.getLoads}
                  />
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
                <TMap
                  id={`job${job.id}`}
                  width="100%"
                  height="100%"
                  startAddress={job.startAddress}
                  endAddress={job.endAddress}
                />
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
              (job.status !== 'Published And Offered'
              && job.status !== 'Job Deleted'
              && job.status !== 'Cancelled'
              ) && (
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
  bid: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.array
  ]),
  companyCarrier: PropTypes.number,
  handlePageClick: PropTypes.func.isRequired
};

JobForm.defaultProps = {
  job: null,
  bid: null,
  companyCarrier: null
};

export default JobForm;
