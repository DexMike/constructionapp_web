import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import {
  Container,
  Card,
  CardBody,
  Col,
  Row,
  Modal,
  Button,
  ButtonToolbar
} from 'reactstrap';
import moment from 'moment';
import JobService from '../../api/JobService';
import AddressService from '../../api/AddressService';
import BidService from '../../api/BidService';
import BookingService from '../../api/BookingService';
import BookingEquipmentService from '../../api/BookingEquipmentService';
import ProfileService from '../../api/ProfileService';
import JobMaterialsService from '../../api/JobMaterialsService';
import TFormat from '../common/TFormat';
import CompanyService from '../../api/CompanyService';
import RatesDeliveryService from '../../api/RatesDeliveryService';
import CompanySettingsService from '../../api/CompanySettingsService';
import GroupListService from '../../api/GroupListService';
import TSubmitButton from '../common/TSubmitButton';
import TSpinner from '../common/TSpinner';
import TMap from '../common/TMap';

class JobViewForm extends Component {
  constructor(props) {
    super(props);
    const job = JobService.getDefaultJob();

    this.state = {
      company: [],
      companyCarrier: [],
      companyName: '',
      booking: null,
      ...job,
      bid: [],
      loaded: false,
      favoriteCompany: [],
      profile: [],
      btnSubmitting: false,
      modalCancelRequest: false,
      selectedDrivers: [],
      accessForbidden: false,
      modalLiability: false,
      trelarFees: 0,
      producerBillingType: ''
    };
    this.closeNow = this.closeNow.bind(this);
    this.saveJob = this.saveJob.bind(this);
    this.toggleCancelRequest = this.toggleCancelRequest.bind(this);
    this.handleCancelRequest = this.handleCancelRequest.bind(this);
    this.toggleLiabilityModal = this.toggleLiabilityModal.bind(this);
  }

  async componentDidMount() {
    let {
      job,
      company,
      companyName,
      companyCarrier,
      allTruckTypes,
      booking,
      profile,
      favoriteCompany,
      selectedDrivers,
      producerBillingType,
      trelarFees
    } = this.state;
    const { jobId } = this.props;

    let startAddress = {};
    let endAddress = {};

    let bid = [];
    let bids = [];
    // const gps = [];
    profile = await ProfileService.getProfile();
    try {
      job = await JobService.getJobById(jobId);
    } catch (e) {
      if (e.message === 'Access Forbidden') {
        // access 403
        this.setState({accessForbidden: true});
        return;
      }
    }
    if (job) {
      if (profile.companyType === 'Carrier') {
        companyCarrier = await CompanyService.getCompanyById(profile.companyId);
      }
      company = await CompanyService.getCompanyById(job.companiesId); // Producer
      startAddress = await AddressService.getAddressById(job.startAddress);
      endAddress = null;
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

      allTruckTypes = await JobService.getMaterialsByJobId(job.id);
      if (allTruckTypes.length > 0) {
        allTruckTypes = allTruckTypes.join(', ');
      }

      const producerCompanySettings = await CompanySettingsService.getCompanySettings(company.id);
      if (producerCompanySettings && producerCompanySettings.length > 0) {
        producerBillingType = producerCompanySettings.filter(obj => obj.key === 'billingType');
        producerBillingType = producerBillingType[0].value;
      }

      const companyRates = {
        companyId: company.id,
        rate: job.rate,
        rateEstimate: job.rateEstimate
      };
      try {
        trelarFees = await RatesDeliveryService.calculateTrelarFee(companyRates);
      } catch (err) {
        console.error(err);
      }

      bids = await BidService.getBidsByJobId(job.id);
      if (bids.length) { // we have a bid record
        bids.filter((filteredBid) => {
          if (filteredBid.hasCustomerAccepted === 1
            && filteredBid.hasSchedulerAccepted === 0
            && filteredBid.companyCarrierId === profile.companyId) { // "Marketplace" bid
            bid = filteredBid;
          } else if (filteredBid.companyCarrierId === profile.companyId
            && filteredBid.hasSchedulerAccepted === 1
            && (filteredBid.status === 'Pending' || filteredBid.status === 'Declined')) { // "Requested" or "Declied" bid
            bid = filteredBid;
          }
          return bid;
        });
      }

      const bookings = await BookingService.getBookingsByJobId(job.id);
      if (bookings && bookings.length > 0) {
        [booking] = bookings;
        const bookingEquipments = await BookingEquipmentService
          .getBookingEquipmentsByBookingId(booking.id);
        selectedDrivers = bookingEquipments
          .map(bookingEquipmentItem => bookingEquipmentItem.driverId);
      }

      // Check if carrier is favorite for this job's customer
      if (profile.companyType === 'Carrier') {
        // check if Carrier Company [profile.companyId]
        // is Customer's Company favorite [job.companiesId]
        favoriteCompany = await GroupListService.getGroupListsByCompanyId(
          profile.companyId, job.companiesId
        );
      }
    }

    this.setState({
      job,
      company,
      companyName,
      companyCarrier,
      allTruckTypes,
      bid,
      booking,
      profile,
      favoriteCompany,
      selectedDrivers,
      trelarFees,
      producerBillingType,
      loaded: true
    });
  }

  async handleCancelRequest() {
    this.setState({btnSubmitting: true});

    const {
      bid
    } = this.state;
    try {
      await BidService.deleteBidbById(bid.id);
      this.setState({bid: null});
    } catch (err) {
      console.error(err);
    }
    this.toggleCancelRequest();

    this.setState({btnSubmitting: false});
  }

  // save after the user has checked the info
  async saveJob() {
    this.setState({ btnSubmitting: true });
    const {
      job,
      favoriteCompany
    } = this.state;

    // Is the Carrier this Company's favorite? If so, accepting the job
    if (favoriteCompany.length > 0) {
      try {
        await JobService.acceptJob(job.id);
      } catch (e) {
        // console.log(e);
      }
      this.closeNow();
    } else {
      // The Carrier is not this Company's favorite? requesting the job
      try {
        await JobService.requestJob(job.id);
      } catch (e) {
        // console.log(e);
      }
      this.closeNow();
    }
  }

  toggleCancelRequest() {
    const {modalCancelRequest} = this.state;
    this.setState({
      modalCancelRequest: !modalCancelRequest
    });
  }

  // remove non numeric
  phoneToNumberFormat(phone) {
    const num = Number(phone.replace(/\D/g, ''));
    return num;
  }

  // check format ok
  checkPhoneFormat(phone) {
    const phoneNotParents = String(this.phoneToNumberFormat(phone));
    const areaCode3 = phoneNotParents.substring(0, 3);
    const areaCode4 = phoneNotParents.substring(0, 4);
    if (areaCode3.includes('555') || areaCode4.includes('1555')) {
      return false;
    }
    return true;
  }

  toggleLiabilityModal() {
    const {modalLiability} = this.state;
    this.setState({
      modalLiability: !modalLiability
    });
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

  renderCancelRequestConfirmation() {
    const {
      modalCancelRequest,
      btnSubmitting
    } = this.state;

    if (modalCancelRequest) {
      return (
        <Modal
          isOpen={modalCancelRequest}
          toggle={this.toggleCancelRequest}
          className="modal-dialog--primary modal-dialog--header"
          backdrop="static"
        >
          <div className="modal__header">
            <button type="button" className="lnr lnr-cross modal__close-btn"
                    onClick={this.toggleCancelRequest}
            />
            <div className="bold-text modal__title">Request Cancellation</div>
          </div>
          <div className="modal__body" style={{padding: '10px 25px 0px 25px'}}>
            <Container className="dashboard">
              <Row>
                <Col md={12} lg={12}>
                  <Card style={{paddingBottom: 0}}>
                    <CardBody
                      className="form form--horizontal addtruck__form"
                    >
                      <Row className="col-md-12">
                        <p>Are you sure you want to cancel your request for this job?</p>
                      </Row>
                      <hr/>
                      <Row className="col-md-12">
                        <ButtonToolbar className="col-md-4 wizard__toolbar">
                          <Button color="minimal" className="btn btn-outline-secondary"
                                  type="button"
                                  onClick={this.toggleCancelRequest}
                          >
                            Cancel
                          </Button>
                        </ButtonToolbar>
                        <ButtonToolbar className="col-md-8 wizard__toolbar right-buttons">
                          <TSubmitButton
                            onClick={() => this.handleCancelRequest()}
                            className="primaryButton"
                            loading={btnSubmitting}
                            loaderSize={10}
                            bntText="Cancel Request"
                          />
                        </ButtonToolbar>
                      </Row>
                    </CardBody>
                  </Card>
                </Col>
              </Row>
            </Container>
          </div>
        </Modal>
      );
    }
    return null;
  }

  renderJobTop(job) {
    const {
      bid,
      company,
      companyCarrier,
      companyName,
      favoriteCompany,
      profile,
      btnSubmitting,
      trelarFees,
      producerBillingType
    } = this.state;
    const companyProducer = company;
    let showModalButton;
    let jobStatus;

    // A Carrier will see 'Published And Offered' as 'Published' in the Marketplace
    if (job.status === 'Published And Offered') {
      jobStatus = 'Published';
    } else {
      jobStatus = job.status;
    }

    let btnFunction;
    // If Carrier has not enough liability insurance, show confirmation modal
    if ((companyProducer.liabilityGeneral > 0.01 || companyProducer.liabilityAuto > 0.01)
    && ((companyCarrier.liabilityGeneral < companyProducer.liabilityGeneral) || (companyCarrier.liabilityAuto < companyProducer.liabilityAuto))) {
      btnFunction = () => this.toggleLiabilityModal();
    } else {
      btnFunction = this.saveJob;
    }

    // Job was 'Published' to the Marketplace,
    // Carrier is a favorite OR Customer has requested this particular Carrier
    if (jobStatus === 'Published' && (favoriteCompany.length > 0 || (bid && bid.hasCustomerAccepted === 1 && bid.status === 'Pending'))) {
      showModalButton = (
        <TSubmitButton
          onClick={btnFunction}
          className="primaryButton float-right"
          loading={btnSubmitting}
          loaderSize={10}
          bntText="Accept Job"
        />
      );
    // Job was 'Published' to the Marketplace
    } else if (jobStatus === 'Published' && !bid && favoriteCompany.length === 0) {
      showModalButton = (
        <TSubmitButton
          onClick={btnFunction}
          className="primaryButton float-right"
          loading={btnSubmitting}
          loaderSize={10}
          bntText="Request Job"
        />
      );
    // Job was 'Published And Offered', there's a bid
    } else if (jobStatus === 'Published' && (bid && (bid.status !== 'Pending' && bid.status !== 'Declined')) && favoriteCompany.length === 0) {
      showModalButton = (
        <TSubmitButton
          onClick={btnFunction}
          className="primaryButton float-right"
          loading={btnSubmitting}
          loaderSize={10}
          bntText="Request Job"
        />
      );
    // Job "Requested" by the carrier
    } else if (jobStatus === 'Published' && (bid && bid.status === 'Pending')) {
      showModalButton = (
        <TSubmitButton
          onClick={this.toggleCancelRequest}
          className="primaryButton float-right"
          loading={btnSubmitting}
          loaderSize={10}
          bntText="Cancel Request"
        />
      );
    // Job "Declined" by the customer
    } else if (jobStatus === 'Published' && (bid && bid.status === 'Declined' && bid.hasSchedulerAccepted === 1 && bid.hasCustomerAccepted === 0)) {
      showModalButton = 'Your request for this job has been declined.';
    // Job "Declined" by the carrier
    } else if (jobStatus === 'Published' && (bid && bid.status === 'Declined' && bid.hasSchedulerAccepted === 0 && bid.hasCustomerAccepted === 1)) {
      showModalButton = 'You have declined this offer.';
    }

    return (
      <React.Fragment>
        <Row>
          <Col md={8}>
            <h3 className="subhead">
              {companyName}
              &nbsp;/&nbsp;
              {job.name}
              <br/>
              {moment(job.startTime)
                .format('dddd, MMMM Do')}
            </h3>
            <p>
              Potential Earnings:&nbsp;
              {
                (
                  producerBillingType === 'Excluded'
                ) ? TFormat.asMoneyByRate(job.rateType, job.rate, job.rateEstimate)
                  : TFormat.asMoneyByRate(job.rateType, job.rate - trelarFees.perTonPerHourFee, job.rateEstimate)
              }
              <br/>
              Rate: {
                (
                  producerBillingType === 'Excluded'
                ) ? TFormat.asMoney(job.rate)
                  : TFormat.asMoney(job.rate - trelarFees.perTonPerHourFee)
              } / {job.rateType}
              <br/>
              Estimated: {job.rateEstimate} {job.amountType}(s)
            </p>
          </Col>
          <Col md={4}>
            {showModalButton}
          </Col>
        </Row>
        <Row>
          <div className="col-md-12">
            <hr/>
          </div>
        </Row>
      </React.Fragment>
    );
  }

  renderLiabilityConfirmation() {
    const {
      modalLiability,
      btnSubmitting,
      company,
      companyCarrier,
      favoriteCompany,
      bid,
      job
    } = this.state;

    const companyProducer = company;

    let jobAction;
    if ((job.status === 'Published' || job.status === 'Published And Offered')
    && (favoriteCompany.length > 0 || (bid && bid.hasCustomerAccepted === 1 && bid.status === 'Pending'))) {
      jobAction = 'Accept';
    } else {
      jobAction = 'Request';
    }

    if (modalLiability) {
      return (
        <Modal
          isOpen={modalLiability}
          toggle={this.toggleLiabilityModal}
          className="modal-dialog--primary modal-dialog--header"
          backdrop="static"
        >
          <div className="modal__header">
            <button type="button" className="lnr lnr-cross modal__close-btn"
                    onClick={this.toggleLiabilityModal}
            />
            <div className="bold-text modal__title">Liability Insurance</div>
          </div>
          <div className="modal__body" style={{ padding: '10px 25px 0px 25px' }}>
            <Container className="dashboard">
              <Row>
                <Col md={12} lg={12}>
                  <Card style={{paddingBottom: 0}}>
                    <CardBody
                      className="form form--horizontal addtruck__form"
                    >
                      <Row className="col-md-12">
                        <p>This job requires a minimum&nbsp;
                          {TFormat.asMoneyNoDecimals(companyProducer.liabilityGeneral)} of
                          General Liability Insurance and&nbsp;
                          {TFormat.asMoneyNoDecimals(companyProducer.liabilityAuto)} of Auto
                          Liability Insurance. Our records show that you have&nbsp;
                          {TFormat.asMoneyNoDecimals(companyCarrier.liabilityGeneral)} of General
                          Liability Insurance and&nbsp;
                          {TFormat.asMoneyNoDecimals(companyCarrier.liabilityAuto)}&nbsp;
                          of Auto Liability Insurance.
                        </p>

                        <p>You risk being rejected by {companyProducer.legalName} due to your
                        insurance levels. If you have updated your insurance levels please
                        contact <a href="mailto:csr@trelar.com">Trelar Support</a>.
                        </p>

                        <p>Are you sure you want to {jobAction.toLowerCase()} this job?</p>
                      </Row>
                      <hr/>
                      <Row className="col-md-12">
                        <ButtonToolbar className="col-md-4 wizard__toolbar">
                          <Button color="minimal" className="btn btn-outline-secondary"
                                  type="button"
                                  onClick={this.toggleLiabilityModal}
                          >
                            Cancel
                          </Button>
                        </ButtonToolbar>
                        <ButtonToolbar className="col-md-8 wizard__toolbar right-buttons">
                          <TSubmitButton
                            onClick={this.saveJob}
                            className="primaryButton"
                            loading={btnSubmitting}
                            loaderSize={10}
                            bntText={`${jobAction} Job`}
                          />
                        </ButtonToolbar>
                      </Row>
                    </CardBody>
                  </Card>
                </Col>
              </Row>
            </Container>
          </div>
        </Modal>
      );
    }
    return null;
  }

  renderJobAddresses(job) {
    return (
      <Container>
        <Row>
          <span className="col-md-6">
            {this.renderAddress(job.startAddress, 'start')}
          </span>
          <span className="col-md-6">
            {this.renderAddress(job.endAddress, 'end')}
          </span>
        </Row>
        <span className="col-md-12">
          <TMap
            id={`job${job.id}`}
            width="100%"
            height="250px"
            startAddress={job.startAddress}
            endAddress={job.endAddress}
          />
        </span>
      </Container>
    );
  }

  renderAddress(address, type) {
    return (
      <Container>
        <Row>
          <div className="col-md-12">
            <h3 className="subhead">{type === 'start' ? 'Start Location' : 'End Location'}</h3>
          </div>
          <div className="col-md-12">{address.address1}</div>
          {address.address2 && (
            <div className="col-md-12">
              {address.address2}
            </div>
          )}
          {address.address3 && (
            <div className="col-md-12">
              {address.address3}
            </div>
          )}
          {address.address4 && (
            <div className="col-md-12">
              {address.address4}
            </div>
          )}
          <div className="col-md-12">
            {`${address.city}, `}
            {`${address.state}, `}
            {`${address.zipCode}`}
          </div>
        </Row>
      </Container>
    );
  }

  renderJobDetails(job) {
    const { allTruckTypes } = this.state;
    return (
      <React.Fragment>
        <Container>
          <Row>
            <div className="col-md-4">
              <h3 className="subhead">
                Job Details
              </h3>
            </div>
            <div className="col-md-4">
              <h3 className="subhead">
                Truck Details
              </h3>
              Number of Trucks: {job.numEquipments || 'Any'}<br/>
              {allTruckTypes}
            </div>
            <div className="col-md-4">
              <h3 className="subhead">
                Materials
              </h3>
              {this.equipmentMaterialsAsString(job.materials)}
            </div>
          </Row>
        </Container>
      </React.Fragment>
    );
  }

  renderJobBottom(job) {
    return (
      <React.Fragment>
        <h3 className="subhead">
          Notes
        </h3>
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
    const { job, loaded, accessForbidden } = this.state;

    if (accessForbidden) {
      return (
        <Col md={12}>
          <Card style={{paddingBottom: 0}}>
            <CardBody>
              <Row className="col-md-12"><h1>Access Forbidden</h1></Row>
            </CardBody>
          </Card>
        </Col>
      );
    }

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
                {this.renderLiabilityConfirmation()}
                {this.renderCancelRequestConfirmation()}
                {/* {this.renderJobFormButtons()} */}
              </CardBody>
            </Card>
          </Col>
        </React.Fragment>
      );
    }
    return (
      <Col md={12}>
        <Card style={{paddingBottom: 0}}>
          <CardBody>
            <Row className="col-md-12"><TSpinner loading/></Row>
          </CardBody>
        </Card>
      </Col>
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
