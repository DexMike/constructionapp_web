import React, {Component} from 'react';
import {Link, Redirect} from 'react-router-dom';
import moment from 'moment';
import CloneDeep from 'lodash.clonedeep';
import PropTypes from 'prop-types';
import {
  Container,
  Row,
  Col,
  Card,
  CardBody
} from 'reactstrap';
import JobMaterials from './JobWizardTabs/JobMaterials';
import PickupAndDelivery from './JobWizardTabs/PickupAndDelivery';
import TruckSpecs from './JobWizardTabs/TruckSpecs';
import HaulRate from './JobWizardTabs/HaulRate';
import ProfileService from '../../api/ProfileService';
import JobService from '../../api/JobService';
import AddressService from '../../api/AddressService';
import JobMaterialsService from '../../api/JobMaterialsService';
import TField from '../common/TField';
import TDateTimePicker from '../common/TDateTimePicker';
import TSpinner from '../common/TSpinner';
import LookupsService from '../../api/LookupsService';

class JobWizard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      name: '',
      jobStartDate: null,
      jobEndDate: null,
      poNumber: '',
      reqHandlerJobName: {
        touched: false,
        error: ''
      },
      reHandlerStartDate: {
        touched: false,
        error: ''
      },
      reHandlerEndDate: {
        touched: false,
        error: ''
      },
      tabMaterials: {
        quantityType: 'ton',
        quantity: '34',
        allMaterials: [],
        selectedMaterial: {
          value: '',
          label: ''
        },
        estimatedMaterialPricing: '',
        reqHandlerMaterials: {
          touched: false,
          error: ''
        },
        reqHandlerQuantity: {
          touched: false,
          error: ''
        }
      },
      tabPickupDelivery: {
        allUSstates: [],
        allAddresses: [],
        selectedStartAddressId: 0,
        selectedEndAddressId: 0,
        startLocationAddressName: '',
        endLocationAddressName: '',
        endLocationAddress1: '7756 Northcross Drive',
        endLocationAddress2: '',
        endLocationCity: 'Austin',
        endLocationState: 'Texas',
        endLocationZip: '78757',
        endLocationLatitude: 0,
        endLocationLongitude: 0,
        startLocationAddress1: '74 Julius Street',
        startLocationAddress2: '',
        startLocationCity: 'Austin',
        startLocationState: 'Texas',
        startLocationZip: '78702',
        startLocationLatitude: 0,
        startLocationLongitude: 0,
        reqHandlerSameAddresses: {
          touched: false,
          error: ''
        },
        reqHandlerStartAddressName: {
          touched: false,
          error: ''
        },
        reqHandlerStartAddress: {
          touched: false,
          error: ''
        },
        reqHandlerStartCity: {
          touched: false,
          error: ''
        },
        reqHandlerStartState: {
          touched: false,
          error: ''
        },
        reqHandlerStartZip: {
          touched: false,
          error: ''
        },
        reqHandlerEndAddressName: {
          touched: false,
          error: ''
        },
        reqHandlerEndAddress: {
          touched: false,
          error: ''
        },
        reqHandlerEndCity: {
          touched: false,
          error: ''
        },
        reqHandlerEndState: {
          touched: false,
          error: ''
        },
        reqHandlerEndZip: {
          touched: false,
          error: ''
        }
      },
      tabTruckSpecs: {
        truckQuantity: '',
        allTruckTypes: [],
        selectedTruckTypes: [],
        reqHandlerTruckType: {
          touched: false,
          error: ''
        }
      },
      tabHaulRate: {
        payType: 'ton',
        ratePerPayType: '',
        rateCalcOpen: false,
        rateCalculator: {
          estimateTypeRadio: 'ton',
          rateTypeRadio: 'ton',
          estimatedTons: '',
          estimatedHours: '10',
          ratePerTon: '',
          ratePerHour: '',
          invalidAddress: false,
          truckCapacity: 22,
          travelTime: null,
          distance: null,
        }
      },
      // old stuff
      page: 1,
      job: [],
      loaded: false,
      validateFormOne: false,
      firstTabInfo: {},
      profile: [],
      goToJobDetail: false
    };
    this.nextPage = this.nextPage.bind(this);
    this.previousPage = this.previousPage.bind(this);
    this.gotoPage.bind(this);
    this.firstPage = this.firstPage.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleChildInputChange = this.handleChildInputChange.bind(this);
    this.closeNow = this.closeNow.bind(this);
    this.getTruckTypes = this.getTruckTypes.bind(this);
    this.saveJobDraftOrCopy = this.saveJobDraftOrCopy.bind(this);
    this.renderGoTo = this.renderGoTo.bind(this);
    this.updateJobView = this.updateJobView.bind(this);
    this.validateMaterialsPage = this.validateMaterialsPage.bind(this);
    this.clearValidationMaterialsPage = this.clearValidationMaterialsPage.bind(this);
    this.jobStartDateChange = this.jobStartDateChange.bind(this);
    this.jobEndDateChange = this.jobEndDateChange.bind(this);
  }

  async componentDidMount() {
    const {tabMaterials, tabPickupDelivery, tabTruckSpecs} = this.state;
    const profile = await ProfileService.getProfile();

    // MATERIAL TAB DATA
    let allMaterials = await LookupsService.getLookupsByType('MaterialType');
    allMaterials = allMaterials.map(material => ({
      value: material.val1,
      label: material.val1
    }));

    tabMaterials.allMaterials = allMaterials;

    // PICKUP AND DELIVERY TAB DATA
    // addresses
    const addressesResponse = await AddressService.getAddressesByCompanyId(profile.companyId);
    const allAddresses = addressesResponse.data.map(address => ({
      value: String(address.id),
      label: `${address.name} - ${address.address1} ${address.city} ${address.zipCode}`
    }));

    tabPickupDelivery.allAddresses = allAddresses;
    // US states
    let states = await LookupsService.getLookupsByType('States');
    states = states.map(state => ({
      value: String(state.val1),
      label: state.val1
    }));

    tabPickupDelivery.allUSstates = states;

    // TRUCK SPECS TAB DATA

    const allTruckTypes = await this.getTruckTypes();
    // we map the selected truck types to the allTruckTypes array to get the Lookup value
    // const selectedTruckTypes = await JobService.getMaterialsByJobId(p.id);
    const selectedTruckTypes = [];
    const mapSelectedTruckTypes = [];
    // Object.values(selectedTruckTypes)
    //   .forEach((itm) => {
    //     let inside = {};
    //     Object.keys(allTruckTypes).map((propKey) => {
    //       if (allTruckTypes[propKey].label === itm) {
    //         inside = {
    //           label: itm,
    //           value: allTruckTypes[propKey].value
    //         };
    //         return inside;
    //       }
    //       return null;
    //     });
    //     mapSelectedTruckTypes.push(inside);
    //   });

    tabTruckSpecs.allTruckTypes = allTruckTypes;
    tabTruckSpecs.selectedTruckTypes = selectedTruckTypes;

    this.setState({profile, loaded: true, tabMaterials, tabPickupDelivery, tabTruckSpecs});
  }

  async getTruckTypes() {
    const truckTypes = await LookupsService.getLookupsByType('EquipmentType');
    const allTruckTypes = [];
    Object.values(truckTypes).forEach((itm) => {
      const inside = {
        label: itm.val1,
        value: String(itm.id)
      };
      allTruckTypes.push(inside);
    });
    // console.log('>>>GOT TRUCK TYPES', allTruckTypes);
    return allTruckTypes;
  }

  jobStartDateChange(data) {
    // return false;
    const {reqHandlerStartDate} = this.state;
    this.setState({
      jobStartDate: data,
      reqHandlerStartDate: Object.assign({}, reqHandlerStartDate, {
        touched: false
      })
    });
  }

  jobEndDateChange(data) {
    // return false;
    const {reqHandlerEndDate} = this.state;
    this.setState({
      jobEndDate: data,
      reqHandlerEndDate: Object.assign({}, reqHandlerEndDate, {
        touched: false
      })
    });
  }

  validateMaterialsPage() {
    debugger;
    this.clearValidationMaterialsPage();
    debugger;
    const {tabMaterials} = {...this.state};
    let isValid = true;
    if (!tabMaterials.selectedMaterial || tabMaterials.selectedMaterial.length === 0) {
      tabMaterials.reqHandlerMaterials = {
        ...tabMaterials.reqHandlerMaterials,
        touched: true,
        error: 'Required input'
      };
      this.setState({
        tabMaterials
      });
      isValid = false;
    }

    if (!tabMaterials.quantity || tabMaterials.quantity.length === 0) {
      tabMaterials.reqHandlerQuantity = {
        ...tabMaterials.reqHandlerQuantity,
        touched: true,
        error: 'Required input'
      };
      this.setState({
        tabMaterials
      });
      isValid = false;
    }

    return isValid;
  }

  clearValidationMaterialsPage() {
    const {
      tabMaterials
    } = {...this.state};
    tabMaterials.reqHandlerMaterials.touched = false;
    tabMaterials.reqHandlerQuantity.touched = false;
    this.setState({
      tabMaterials
    });
  }

  updateJobView(newJob) {
    const {updateJobView, updateCopiedJob} = this.props;
    if (newJob.copiedJob) {
      updateCopiedJob(newJob);
    }
    if (updateJobView) {
      updateJobView(newJob, null);
    }
  }

  handleInputChange(e) {
    if (e.target.name === 'name') {
      this.setState({
        name: e.target.value,
        reqHandlerJobName: {
          touched: true
        }
      });
    } else {
      const {value} = e.target;
      this.setState({[e.target.name]: value});
    }
  }

  handleChildInputChange(key, val) {
    this.setState({[key]: val});
  }

  async saveJobMaterials(jobId, material) {
    // const profile = await ProfileService.getProfile();
    const {profile} = this.state;
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

  // Used to either store a Copied or 'Saved' job to the database
  async saveJobDraftOrCopy(e) {
    const {copyJob} = this.props;
    const {profile} = this.state;
    const d = e;

    // start location
    let startAddress = {
      id: null
    };
    if (d.selectedStartAddressId > 0) {
      startAddress.id = d.selectedStartAddressId;
    }
    if (d.selectedStartAddressId === 0 && d.startLocationAddressName.length > 0) {
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
    }
    // end location
    let endAddress = {
      id: null
    };
    if (d.selectedEndAddressId > 0) {
      endAddress.id = d.selectedEndAddressId;
    }
    if (d.selectedEndAddressId === 0 && d.endLocationAddressName.length > 0) {
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
    }

    let rateType = '';
    let rate = 0;
    if (d.selectedRatedHourOrTon && d.selectedRatedHourOrTon.length > 0) {
      if (d.selectedRatedHourOrTon === 'ton') {
        rateType = 'Ton';
        rate = Number(d.rateByTonValue);
        // d.rateEstimate = d.rateEstimate;
      } else {
        rateType = 'Hour';
        rate = Number(d.rateByHourValue);
        // d.rateEstimate = d.estimatedHours;
      }
    }

    const calcTotal = d.rateEstimate * rate;
    const rateTotal = Math.round(calcTotal * 100) / 100;

    if (d.jobDate && Object.prototype.toString.call(d.jobDate) === '[object Date]') {
      d.jobDate = moment(d.jobDate).format('YYYY-MM-DD HH:mm');
      d.jobDate = moment.tz(
        d.jobDate,
        profile.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone
      ).utc().format();
    } else if (d.job.startTime) {
      d.jobDate = moment(d.job.startTime).format('YYYY-MM-DD HH:mm');
      d.jobDate = moment.tz(
        d.jobDate,
        profile.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone
      ).utc().format();
    } else {
      d.jobDate = '';
    }

    if (!d.truckType || d.truckType.lenght === 0) {
      d.truckType = '';
    } else {
      d.truckType = d.truckType.value;
    }

    const job = {
      companiesId: profile.companyId,
      name: d.name,
      status: 'Saved',
      startAddress: startAddress.id,
      endAddress: endAddress.id,
      startTime: d.jobDate,
      equipmentType: d.truckType,
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

    let newJob = [];
    if (d.job.id) { // UPDATING 'Saved' JOB
      newJob = CloneDeep(job);
      newJob.id = d.job.id;
      delete newJob.createdBy;
      delete newJob.createdOn;
      await JobService.updateJob(newJob);
    } else { // CREATING NEW 'Saved' JOB
      newJob = await JobService.createJob(job);
    }

    // add material
    if (newJob) {
      if (Object.keys(d.selectedMaterials).length > 0) { // check if there's materials to add
        this.saveJobMaterials(newJob.id, d.selectedMaterials.value);
      }
      if (Object.keys(d.selectedTrucks).length > 0) {
        this.saveJobTrucks(newJob.id, d.selectedTrucks);
      }
    }

    if (d.job.id) { // we're updating a Saved job, reload the view with new data
      this.updateJobView(newJob);
      this.closeNow();
    } else {
      if (copyJob) { // user clicked on Copy Job, then tried to Save a new Job, reload the view with new data
        newJob.copiedJob = true;
        this.updateJobView(newJob);
        this.closeNow();
      } else { // user clicked on Save Job, go to new Job's Detail page
        this.setState({
          job: newJob,
          goToJobDetail: true
        });
      }
    }
  }


  closeNow() {
    const {toggle} = this.props;
    toggle();
  }

  firstPage() {
    this.setState({page: 1});
  }

  nextPage() {
    const {page} = this.state;
    // just checking if the state changeo
    this.setState({page: page + 1});
  }

  previousPage() {
    const {page} = this.state;
    this.setState({page: page - 1});
  }

  gotoPage(pageNumber) {
    this.setState({page: pageNumber});
  }

  renderGoTo() {
    const {goToJobDetail, job} = this.state;
    if (goToJobDetail) {
      return <Redirect push to={`/jobs/save/${job.id}`}/>;
    }
    return false;
  }

  renderTabs() {
    const {
      page,
      loaded
    } = this.state;
    if (loaded) {
      return (
        <div className="wizard__steps">
          {/* onClick={this.gotoPage(1)} */}
          <div
            role="link"
            tabIndex="0"
            onKeyPress={this.handleKeyPress}
            onClick={this.setState({page: 1})}
            className={`wizard__step${page === 1 ? ' wizard__step--active-sub-tabs' : ''}`}
          >
            <p>Materials</p>
          </div>
          {/*<div*/}
          {/*  role="link"*/}
          {/*  tabIndex="0"*/}
          {/*  onKeyPress={this.handleKeyPress}*/}
          {/*  onClick={this.setState({page: 2})}*/}
          {/*  className={`wizard__step${page === 2 ? ' wizard__step--active-sub-tabs' : ''}`}*/}
          {/*>*/}
          {/*  <p>Pickup / Delivery</p>*/}
          {/*</div>*/}
          {/*<div*/}
          {/*  role="link"*/}
          {/*  tabIndex="0"*/}
          {/*  // onKeyPress={this.handleKeyPress}*/}
          {/*  // onClick={this.validateFormOne}*/}
          {/*  className={`wizard__step${page === 2 ? ' wizard__step--active-sub-tabs' : ''}`}*/}
          {/*>*/}
          {/*  <p>Truck Specs</p>*/}
          {/*</div>*/}
          {/*<div*/}
          {/*  role="link"*/}
          {/*  tabIndex="0"*/}
          {/*  // onKeyPress={this.handleKeyPress}*/}
          {/*  // onClick={this.validateFormOne}*/}
          {/*  className={`wizard__step${page === 2 ? ' wizard__step--active-sub-tabs' : ''}`}*/}
          {/*>*/}
          {/*  <p>Haul Rate</p>*/}
          {/*</div>*/}
          {/*<div*/}
          {/*  role="link"*/}
          {/*  tabIndex="0"*/}
          {/*  // onKeyPress={this.handleKeyPress}*/}
          {/*  // onClick={this.validateFormOne}*/}
          {/*  className={`wizard__step${page === 2 ? ' wizard__step--active-sub-tabs' : ''}`}*/}
          {/*>*/}
          {/*  <p>Summary</p>*/}
          {/*</div>*/}
          {/*<div*/}
          {/*  role="link"*/}
          {/*  tabIndex="0"*/}
          {/*  // onKeyPress={this.handleKeyPress}*/}
          {/*  // onClick={this.validateFormOne}*/}
          {/*  className={`wizard__step${page === 2 ? ' wizard__step--active' : ''}`}*/}
          {/*>*/}
          {/*  <p>Send</p>*/}
          {/*</div>*/}
        </div>
      );
    }
    return (
      <Container className="dashboard">
        <Row>
          <Col md={12}>
            <Card>Loading...</Card>
          </Col>
        </Row>
      </Container>
    );
  }

  renderJobDetails() {
    const {
      jobStartDate,
      jobEndDate,
      profile,
      poNumber,
      name,
      reqHandlerJobName,
      reqHandlerStartDate,
      reqHandlerEndDate,
      loaded
    } = this.state;
    if (loaded) {
      return (
        <Col md={12} lg={12}>
          <Card>
            <CardBody>
              {/* this.handleSubmit  */}
              <form
                className="form form--horizontal addtruck__form"
                // onSubmit={e => this.saveTruck(e)}
                autoComplete="off"
              >
                <Row className="col-md-12">
                  <div className="col-md-12 form__form-group">
                    <span className="form__form-group-label">Job Name</span>
                    {
                      /*
                      <input
                      name="name"
                      type="text"
                      value={name}
                      onChange={this.handleInputChange}
                      placeholder="Job Name"
                      meta={reqHandlerJobName}
                    />
                      */
                    }
                    <TField
                      input={
                        {
                          onChange: this.handleInputChange,
                          name: 'name',
                          value: name
                        }
                      }
                      placeholder="Job Name"
                      type="text"
                      meta={reqHandlerJobName}
                      id="jobname"
                    />
                  </div>
                </Row>
                <Row className="col-md-12">
                  <div className="col-md-4 form__form-group">
                    <span className="form__form-group-label">Start Date / Time&nbsp;
                    </span>
                    <TDateTimePicker
                      input={
                        {
                          onChange: this.jobStartDateChange,
                          name: 'jobStartDate',
                          value: jobStartDate,
                          givenDate: jobStartDate
                        }
                      }
                      placeholder="Date and time of job"
                      defaultDate={jobStartDate}
                      onChange={this.jobStartDateChange}
                      dateFormat="Y-m-d H:i"
                      showTime
                      meta={reqHandlerStartDate}
                      id="jobstartdatetime"
                      profileTimeZone={profile.timeZone}
                    />
                  </div>
                  <div className="col-md-4 form__form-group">
                    <span className="form__form-group-label">End Date / Time&nbsp;
                    </span>
                    <TDateTimePicker
                      input={
                        {
                          onChange: this.jobEndDateChange,
                          name: 'jobEndDate',
                          value: jobEndDate,
                          givenDate: jobEndDate
                        }
                      }
                      placeholder="Date and time of job"
                      defaultDate={jobEndDate}
                      onChange={this.jobEndDateChange}
                      dateFormat="Y-m-d H:i"
                      showTime
                      meta={reqHandlerEndDate}
                      id="jobstartdatetime"
                      profileTimeZone={profile.timeZone}
                    />
                  </div>
                  <div className="col-md-4 form__form-group">
                    <span className="form__form-group-label">PO Number</span>
                    {
                      /*
                      <input
                      name="name"
                      type="text"
                      value={name}
                      onChange={this.handleInputChange}
                      placeholder="Job Name"
                      meta={reqHandlerJobName}
                    />
                      */
                    }
                    <TField
                      input={
                        {
                          onChange: this.handleInputChange,
                          name: 'poNumber',
                          value: poNumber
                        }
                      }
                      placeholder="PO Number"
                      type="text"
                      // meta={reqHandlerJobName}
                      id="poNumber"
                    />
                  </div>
                </Row>
                <Row className="col-md-12">
                  <div className="col-md-8 form__form-group">
                    <span className="form__form-group-label">
                    <span className="form-small-label">Your current time zone is set to&nbsp;
                      {profile.timeZone
                        ? moment().tz(profile.timeZone).format('z')
                        : moment().tz(Intl.DateTimeFormat().resolvedOptions().timeZone).format('z')
                      }. Your timezone can be changed in <Link to="/settings"><span>User Settings</span></Link>.
                      </span>
                    </span>
                  </div>
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

  render() {
    const {equipmentId, companyId, editDriverId, updateJobView, copyJob} = this.props;
    const {
      page,
      loaded,
      tabMaterials,
      tabPickupDelivery,
      tabTruckSpecs,
      tabHaulRate
    } = this.state;
    if (loaded) {
      return (
        <Container className="dashboard">
          <div className="dashboard dashboard__job-create" style={{width: 800}}>
            {/*{this.renderGoTo()}*/}
            <Row>
              {/* <h1>TEST</h1> */}
              <Col md={12} lg={12}>
                <Card style={{paddingBottom: 0}}>
                  <div className="wizard">
                    <div className="wizard__steps">
                      {/* onClick={this.gotoPage(1)} */}
                      <div
                        className="wizard__step wizard__step--active"
                      >
                        <p>Create Job</p>
                      </div>
                    </div>
                    <div className="wizard__form-wrapper">
                      <div className="dashboard dashboard__job-create-section">
                        {this.renderJobDetails()}
                      </div>
                      {/* onSubmit={this.nextPage} */}
                      {/*{page === 1*/}
                      {/*&& (*/}
                      {/*  <JobCreateFormOne*/}
                      {/*    p={page}*/}
                      {/*    onClose={this.closeNow}*/}
                      {/*    gotoSecond={this.saveAndGoToSecondPage}*/}
                      {/*    firstTabData={this.getFirstTabInfo}*/}
                      {/*    validateOnTabClick={validateFormOne}*/}
                      {/*    validateRes={this.validateFormOneRes}*/}
                      {/*    saveJobDraftOrCopy={this.saveJobDraftOrCopy}*/}
                      {/*    updateJobView={this.updateJobView}*/}
                      {/*    copyJob={copyJob}*/}
                      {/*  />*/}
                      {/*)}*/}
                      {/*{page === 2*/}
                      {/*&& (*/}
                      {/*  <JobCreateFormTwo*/}
                      {/*    p={page}*/}
                      {/*    onClose={this.closeNow}*/}
                      {/*    firstTabData={this.getFirstTabInfo}*/}
                      {/*    jobId={job.id}*/}
                      {/*    saveJobDraftOrCopy={this.saveJobDraftOrCopy}*/}
                      {/*    updateJobView={this.updateJobView}*/}
                      {/*    copyJob={copyJob}*/}
                      {/*  />*/}
                      {/*)}*/}
                      {/*/!* onSubmit={onSubmit} *!/*/}
                    </div>
                    <div className="dashboard dashboard__job-create-section">
                      {/*{this.renderTabs()}*/}
                      {page === 2
                      && <JobMaterials
                        data={tabMaterials}
                        handleInputChange={this.handleChildInputChange}
                      />}
                      {page === 2
                      && <PickupAndDelivery
                        data={tabPickupDelivery}
                        handleInputChange={this.handleChildInputChange}
                      />}
                      {page === 2
                      && <TruckSpecs
                        data={tabTruckSpecs}
                        handleInputChange={this.handleChildInputChange}
                      />}
                      {page === 1
                      && <HaulRate
                        data={tabHaulRate}
                        tabMaterials={tabMaterials}
                        tabPickupDelivery={tabPickupDelivery}
                        handleInputChange={this.handleChildInputChange}
                      />}
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>
          </div>
        </Container>
      );
    }
    return (
      <Container className="dashboard">
        <Row>
          <Col md={12}>
            <Card>Loading...</Card>
          </Col>
        </Row>
      </Container>
    );
  }
}

JobWizard.propTypes = {
  toggle: PropTypes.func.isRequired,
  jobId: PropTypes.number,
  updateJobView: PropTypes.func,
  copyJob: PropTypes.bool,
  updateCopiedJob: PropTypes.func
};

JobWizard.defaultProps = {
  jobId: null,
  updateJobView: null,
  copyJob: false,
  updateCopiedJob: null
};


export default JobWizard;
