import React, { PureComponent } from 'react';
import moment from 'moment';
import {
  Card,
  CardBody,
  Col,
  Button,
  ButtonToolbar,
  Row
} from 'reactstrap';
import PropTypes from 'prop-types';
import ProfileService from '../../api/ProfileService';
import AddressService from '../../api/AddressService';
import JobService from '../../api/JobService';
import BidService from '../../api/BidService';
// import GroupService from '../../api/GroupService';
import TCheckBox from '../common/TCheckBox';
import TwilioService from '../../api/TwilioService';
import './jobs.css';
// import GroupListService from '../../api/GroupListService';
import JobMaterialsService from '../../api/JobMaterialsService';
import TSpinner from '../common/TSpinner';
import TSubmitButton from '../common/TSubmitButton';
import CompanyService from '../../api/CompanyService';
import GeoUtils from '../../utils/GeoUtils';

class JobCreateFormTwo extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      sendToMkt: true,
      sendToFavorites: true,
      showSendtoFavorites: false,
      favoriteCompanies: [],
      favoriteAdminTels: [],
      nonFavoriteAdminTels: [],
      loaded: false,
      btnSubmitting: false,
      profile: null,
      job: [],
      filters: null,
      reqCheckABox: {
        touched: false,
        error: ''
      }
    };
    this.handleInputChange = this.handleInputChange.bind(this);
    this.saveJobMaterials = this.saveJobMaterials.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.saveJob = this.saveJob.bind(this);
    this.saveJobTrucks = this.saveJobTrucks.bind(this);
    this.saveJobDraft = this.saveJobDraft.bind(this);
  }

  async componentDidMount() {
    const { firstTabData, jobId } = this.props;
    let { showSendtoFavorites } = this.state;

    let job = [];
    if (jobId) {
      job = await JobService.getJobById(jobId);
    }

    const d = firstTabData();
    let favoriteAdminTels = [];
    // does this customer has favorites?
    const profile = await ProfileService.getProfile();
    // get only those that match criteria
    if (d.selectedRatedHourOrTon === 'ton') {
      d.rateTab = 2;
    } else {
      d.rateTab = 1;
    }
    const filters = {
      tonnage: Number(d.tonnage),
      rateTab: d.rateTab,
      rateEstimate: d.rateEstimate,
      hourTrucksNumber: d.hourTrucksNumber,
      material: d.selectedMaterials.value
    };

    // get favorite companies for this carrier
    const favoriteCompanies = await CompanyService.getFavoritesByUserId(
      profile.userId,
      filters
    );

    // are there any favorite companies?
    if (favoriteCompanies.length > 0) {
      // get the phone numbers from the admins
      favoriteAdminTels = favoriteCompanies.map(x => (x.adminPhone ? x.adminPhone : null));
      // remove null values
      Object.keys(favoriteAdminTels).forEach(
        key => (favoriteAdminTels[key] === null) && delete favoriteAdminTels[key]
      );
      showSendtoFavorites = true;
    }

    this.setState({
      showSendtoFavorites,
      favoriteCompanies,
      favoriteAdminTels,
      profile,
      job,
      filters,
      loaded: true
    });
  }

  async saveJobDraft() {
    this.setState({ btnSubmitting: true });
    const { firstTabData, saveJobDraftOrCopy } = this.props;
    const d = firstTabData();
    saveJobDraftOrCopy(d);
  }

  isFormValid() {
    let isValid = true;
    const {
      showSendtoFavorites,
      sendToMkt,
      sendToFavorites,
      reqCheckABox
    } = this.state;

    if (showSendtoFavorites) {
      // We're showing both checkboxes, allow to check at least one of them
      if (sendToMkt === 0 && sendToFavorites === 0) {
        this.setState({
          reqCheckABox: {
            ...reqCheckABox,
            touched: true,
            error: 'You have to select at least one option'
          }
        });
        isValid = false;
      }
    }

    if (isValid) {
      return true;
    }

    return false;
  }

  async handleSubmit(menuItem) {
    if (menuItem) {
      this.setState({ [`goTo${menuItem}`]: true });
    }
  }

  async saveJobMaterials(jobId, material) {
    // const profile = await ProfileService.getProfile();
    const { profile } = this.state;
    if (profile && material) {
      const newMaterial = {
        jobsId: jobId,
        value: material,
        createdBy: profile.userId,
        createdOn: moment.utc().format(),
        modifiedBy: profile.userId,
        modifiedOn: moment.utc().format()
      };
      /* eslint-disable no-await-in-loop */
      await JobMaterialsService.createJobMaterials(newMaterial);
    }
  }

  // let's create a list of truck types that we want to save
  async saveJobTrucks(jobId, trucks) {
    const allTrucks = [];
    for (const truck of trucks) {
      const equipmentMaterial = {
        jobId,
        equipmentTypeId: Number(truck.value)
      };
      allTrucks.push(equipmentMaterial);
    }
    await JobMaterialsService.deleteJobEquipmentsByJobId(jobId);
    await JobMaterialsService.createJobEquipments(jobId, allTrucks);
  }

  async saveJob() {
    const { updateJobView } = this.props;
    this.setState({ btnSubmitting: true });

    if (!this.isFormValid()) {
      this.setState({ btnSubmitting: false });
      return;
    }
    const { firstTabData, copyJob } = this.props;
    const {
      favoriteCompanies,
      showSendtoFavorites,
      sendToFavorites,
      sendToMkt,
      favoriteAdminTels,
      filters,
      profile
    } = this.state;
    let { job } = this.state;
    const d = firstTabData();

    let status = 'Published';

    // start location
    let startAddress = {
      id: null
    };
    if (d.selectedStartAddressId === 0) {
      const address1 = {
        type: 'Delivery',
        name: d.startLocationAddressName,
        companyId: profile.companyId,
        address1: d.startLocationAddress1,
        address2: d.startLocationAddress2,
        city: d.startLocationCity,
        state: d.startLocationState,
        zipCode: d.startLocationZip,
        latitude: d.startLocationLatitude,
        longitude: d.startLocationLongitude,
        createdBy: profile.userId,
        createdOn: moment.utc().format(),
        modifiedBy: profile.userId,
        modifiedOn: moment.utc().format()
      };
      startAddress = await AddressService.createAddress(address1);
    } else {
      startAddress.id = d.selectedStartAddressId;
    }
    // end location
    let endAddress = {
      id: null
    };
    if (d.selectedEndAddressId === 0) {
      const address2 = {
        type: 'Delivery',
        name: d.endLocationAddressName,
        companyId: profile.companyId,
        address1: d.endLocationAddress1,
        address2: d.endLocationAddress2,
        city: d.endLocationCity,
        state: d.endLocationState,
        zipCode: d.endLocationZip,
        latitude: d.endLocationLatitude,
        longitude: d.endLocationLongitude
      };
      endAddress = await AddressService.createAddress(address2);
    } else {
      endAddress.id = d.selectedEndAddressId;
    }

    // job p
    let isFavorited = 0;
    if (showSendtoFavorites) {
      isFavorited = 1;
    }

    let rateType = '';
    let rate = 0;
    if (d.selectedRatedHourOrTon === 'ton') {
      rateType = 'Ton';
      rate = Number(d.rateByTonValue);
      d.rateEstimate = d.rateEstimate;
    } else {
      rateType = 'Hour';
      rate = Number(d.rateByHourValue);
      d.rateEstimate = d.rateEstimate;
    }

    // if both checks (Send to Mkt and Send to All Favorites) are selected
    if (showSendtoFavorites
      && (sendToMkt === true || sendToMkt === 1)
      && (sendToFavorites === true || sendToFavorites === 1)
    ) {
      status = 'Published And Offered';
    } else if (showSendtoFavorites
      && (sendToFavorites === true || sendToFavorites === 1)) { // sending to All Favorites only
      status = 'On Offer';
    } else { // default
      status = 'Published';
    }

    const calcTotal = d.rateEstimate * rate;
    const rateTotal = Math.round(calcTotal * 100) / 100;

    d.jobDate = moment(d.jobDate).format('YYYY-MM-DD HH:mm');

    // get distance
    let distance = 0;
    try {
      const startingPoint = `${job.startAddress.latitude},${job.startAddress.longitude}`;
      const endingPoint = `${job.endAddress.latitude},${job.endAddress.longitude}`;
      const geo = await GeoUtils.getDistance(startingPoint, endingPoint);
      distance = ((geo.distance / 1.609) / 1000);
    } catch (e) {
      console.log('ERROR: ', e);
    }
    

    let newJob = [];
    let savedJob = false;
    if (job && Object.keys(job).length > 0 && !copyJob) { // Job exists, from a 'Saved' job

      job = {
        id: job.id,
        companiesId: profile.companyId,
        name: d.name,
        status,
        isFavorited,
        startAddress: startAddress.id,
        endAddress: endAddress.id,
        avgDistance: distance,
        startTime: moment.tz(
          d.jobDate,
          profile.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone
        ).utc().format(),
        equipmentType: '',
        numEquipments: d.hourTrucksNumber,
        rateType,
        rate,
        rateEstimate: d.rateEstimate,
        rateTotal,
        notes: d.instructions,
        createdOn: moment.utc().format(),
        modifiedBy: profile.userId,
        modifiedOn: moment.utc().format()
      };

      newJob = await JobService.updateJob(job);
      savedJob = true;
    } else { // new job
      job = {
        companiesId: profile.companyId,
        name: d.name,
        status,
        isFavorited,
        startAddress: startAddress.id,
        endAddress: endAddress.id,
        avgDistance: distance,
        startTime: moment.tz(
          d.jobDate,
          profile.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone
        ).utc().format(),
        equipmentType: d.truckType.value ? d.truckType.value : d.truckType,
        numEquipments: d.hourTrucksNumber,
        rateType,
        rate,
        rateEstimate: d.rateEstimate,
        rateTotal,
        notes: d.instructions,
        createdBy: profile.userId,
        createdOn: moment.utc().format(),
        modifiedBy: profile.userId,
        modifiedOn: moment.utc().format()
      };

      newJob = await JobService.createJob(job);
    }

    // return false;

    // add materials
    if (newJob) {
      if (Object.keys(d.selectedMaterials).length > 0) { // check if there's materials to add
        this.saveJobMaterials(newJob.id, d.selectedMaterials.value);
      }
      if (Object.keys(d.selectedTrucks).length > 0) {
        this.saveJobTrucks(newJob.id, d.selectedTrucks);
      }
    }

    // create bids if this user has favorites:
    if (showSendtoFavorites && sendToFavorites && newJob) {
      const results = [];
      for (const favCompany of favoriteCompanies) {
        // bid
        const bid = {
          jobId: newJob.id,
          userId: profile.userId,
          companyCarrierId: favCompany.id,
          hasCustomerAccepted: 1,
          hasSchedulerAccepted: 0,
          status: 'New',
          rateType,
          rate: 0,
          rateEstimate: d.rateEstimate,
          notes: d.instructions,
          createdBy: profile.userId,
          createdOn: moment.utc().format(),
          modifiedBy: profile.userId,
          modifiedOn: moment.utc().format()
        };
        results.push(BidService.createBid(bid));
      }
      await Promise.all(results);

      // now let's send them an SMS to all favorites
      const allSms = [];
      for (const adminIdTel of favoriteAdminTels) {
        if (adminIdTel && this.checkPhoneFormat(adminIdTel)) {
          // console.log('>>Sending SMS to Jake...');
          const notification = {
            to: this.phoneToNumberFormat(adminIdTel),
            body: '🚚 You have a new Trelar Job Offer available. Log into your Trelar account to review and accept. https://app.mytrelar.com'
          };
          allSms.push(TwilioService.createSms(notification));
        }
      }
      try {
        await Promise.all(allSms);
      } catch (e) {
        // console.log(e);
      }
    }

    // if sending to mktplace, let's send SMS to everybody
    if (sendToMkt) {
      const allBiddersSms = [];
      let nonFavoriteAdminTels = [];

      // Get non-favorites carriers admin phone numbers based on each
      // carrier company_settings.operatingRange setting.
      // startAddressId is used to calculate distance between carrier address and job start address.
      // If distance <= operatingRange then we sent the SMS
      filters.startAddressId = startAddress.id;
      const nonFavoriteCarriers = await CompanyService.getNonFavoritesByUserId(
        profile.userId,
        filters
      );
      if (nonFavoriteCarriers.length > 0) {
        // get the phone numbers from the admins
        nonFavoriteAdminTels = nonFavoriteCarriers.map(x => (x.adminPhone ? x.adminPhone : null));
        // remove null values
        Object.keys(nonFavoriteAdminTels).forEach(
          key => (nonFavoriteAdminTels[key] === null) && delete nonFavoriteAdminTels[key]
        );
      }

      for (const bidderTel of nonFavoriteAdminTels) {
        if (bidderTel && this.checkPhoneFormat(bidderTel)) {
          const notification = {
            to: this.phoneToNumberFormat(bidderTel),
            body: '👷 A new Trelar Job is posted in your area. Log into your account to review and apply. https://app.mytrelar.com'
          };
          allBiddersSms.push(TwilioService.createSms(notification));
        }
      }
      try {
        await Promise.all(allBiddersSms);
      } catch (e) {
        // console.log(e);
      }
    }

    const { onClose } = this.props;
    if (savedJob) { // we have to update the view
      updateJobView(newJob);
    }

    if (copyJob) { // we're making a duplicate of a job we have to update the view
      newJob.copiedJob = true;
      updateJobView(newJob);
    }
    onClose();
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

  handleInputChange(e) {
    const { reqCheckABox, showSendtoFavorites } = this.state;
    let { value } = e.target;

    // Allow change only if there're favorites
    if (e.target.name === 'sendToMkt' && showSendtoFavorites) {
      value = e.target.checked ? Number(1) : Number(0);
      this.setState({
        sendToMkt: value,
        reqCheckABox: {
          ...reqCheckABox,
          touched: false
        }
      });
    } else if (e.target.name === 'sendToFavorites') {
      value = e.target.checked ? Number(1) : Number(0);
      this.setState({
        sendToFavorites: value,
        reqCheckABox: {
          ...reqCheckABox,
          touched: false
        }
      });
    } else {
      this.setState({ [e.target.name]: value });
    }
  }

  render() {
    const {
      job,
      sendToMkt,
      sendToFavorites,
      showSendtoFavorites,
      reqCheckABox,
      loaded,
      btnSubmitting
    } = this.state;
    const { onClose } = this.props;
    if (loaded) {
      return (
        <Col md={12} lg={12}>
          <Card>
            <CardBody>
              <form
                className="form form--horizontal addtruck__form"
              >
                <Row className="col-md-12">
                  <h3 className="subhead">
                    Thanks for creating a new job! How do you want to send this?
                  </h3>
                </Row>

                <Row className="col-md-12">
                  <div className="row">
                    <div
                      className={showSendtoFavorites ? 'col-md-1 form__form-group' : 'hidden'}
                    >
                      <TCheckBox
                        onChange={this.handleInputChange}
                        name="sendToFavorites"
                        value={!!sendToFavorites}
                        meta={reqCheckABox}
                      />
                    </div>
                    <div
                      className={showSendtoFavorites ? 'col-md-10 form__form-group' : 'hidden'}
                    >
                      <h3 className="subhead">
                        Send to Favorites
                      </h3>
                    </div>
                  </div>
                  <hr/>
                </Row>

                <Row className="col-md-12">
                  <div className="row">
                    <div className="col-md-1 form__form-group">
                      <TCheckBox
                        onChange={this.handleInputChange}
                        name="sendToMkt"
                        value={!!sendToMkt}
                      />
                    </div>
                    <div
                      className="col-md-11 form__form-group"
                    >
                      <h3 className="subhead">
                        Send this job to the Trelar Marketplace
                      </h3>
                    </div>
                  </div>
                  <br/>
                </Row>

                <Row className="col-md-12">
                  <hr/>
                </Row>

                <Row className="col-md-12 ">
                  <ButtonToolbar className="col-md-6 wizard__toolbar">
                    <Button
                      color="minimal"
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={onClose}
                    >
                      Cancel
                    </Button>
                  </ButtonToolbar>
                  <ButtonToolbar className="col-md-6 wizard__toolbar right-buttons">
                    <TSubmitButton
                      onClick={this.saveJob}
                      className="primaryButton"
                      loading={btnSubmitting}
                      loaderSize={10}
                      disabled={!sendToMkt && !sendToFavorites}
                      bntText="Send Job"
                    />
                  </ButtonToolbar>
                  <TSpinner loading={false}/>
                </Row>
              </form>
            </CardBody>
          </Card>
        </Col>
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

JobCreateFormTwo.propTypes = {
  onClose: PropTypes.func.isRequired,
  firstTabData: PropTypes.func.isRequired,
  jobId: PropTypes.number,
  updateJobView: PropTypes.func,
  saveJobDraftOrCopy: PropTypes.func.isRequired,
  copyJob: PropTypes.bool
};

JobCreateFormTwo.defaultProps = {
  jobId: null,
  updateJobView: null,
  copyJob: false
};

export default JobCreateFormTwo;
