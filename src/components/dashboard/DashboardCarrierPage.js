import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import {
  Card,
  CardBody,
  Col,
  Container,
  Row
} from 'reactstrap';

import TTable from '../common/TTable';
import TFormat from '../common/TFormat';
import moment from 'moment';
// import { Select } from '@material-ui/core';
import NumberFormat from 'react-number-format';
import TField from '../common/TField';
import TSelect from '../common/TSelect';
import TDateTimePicker from '../common/TDateTimePicker';
import TIntervalDatePicker from '../common/TIntervalDatePicker';
import MultiSelect from '../common/TMultiSelect';

import DashboardTitle, {DashboardObjectStatic} from './DashboardObjectStatic';

import AddressService from '../../api/AddressService';
import AgentService from '../../api/AgentService';
import CompanyService from '../../api/CompanyService';
import JobCreateForm from '../jobs/JobCreateForm';
import JobMaterialsService from '../../api/JobMaterialsService';
import JobService from '../../api/JobService';
import LookupsService from '../../api/LookupsService';
import ProfileService from '../../api/ProfileService';
import {DashboardObjectClickable} from "./DashboardObjectClickable";

class DashboardCarrierPage extends Component {
  constructor(props) {
    super(props);

    // NOTE: if you update this list you have to update
    // Orion.EquipmentDao.filtersOrderByClause
    const sortByList = ['Hourly ascending', 'Hourly descending',
      'Tonnage ascending', 'Tonnage descending'];

    this.state = {
      loaded: false,
      jobs: [],

      modal: false,
      goToDashboard: false,
      goToAddJob: false,
      goToUpdateJob: false,
      jobId: 0,
      // profile: null

      startDate: null,          // values for date control
      endDate: null,            // values for date control

      // Rate Type Button toggle
      isAvailable: true,

      // Look up lists
      equipmentTypeList: [],
      materialTypeList: [],
      rateTypeList: [],
      sortByList, // array from above
      // sortBy: 1,

      equipments: [],
      selectedEquipment: {},
      // TODO: Refactor to a single filter object
      // Filter values
      filters: {
        rateType: '',
        status: '',
        userId: '',
        searchType: 'Carrier Job',
        startAvailability: null,
        endAvailability: null,
        rate: '',
        minTons: '',
        minHours: '',
        minCapacity: '',
        equipmentType: '',
        numEquipments: '',
        zipCode: '',
        materialType: [],
        sortBy: sortByList[0]
      },

    };

    this.renderGoTo = this.renderGoTo.bind(this);
    this.handleJobEdit = this.handleJobEdit.bind(this);

    this.toggleAddJobModal = this.toggleAddJobModal.bind(this);
    this.handleFilterChange = this.handleFilterChange.bind(this);
    this.handleSelectFilterChange = this.handleSelectFilterChange.bind(this);
    this.handleStartDateChange = this.handleStartDateChange.bind(this);
    this.handleEndDateChange = this.handleEndDateChange.bind(this);
    this.handleMultiChange = this.handleMultiChange.bind(this);
    this.handleIntervalInputChange = this.handleIntervalInputChange.bind(this);
    this.returnSelectedMaterials = this.returnSelectedMaterials.bind(this);
    this.handleFilterChangeDelayed = this.handleFilterChangeDelayed.bind(this);
    this.handleFilterStatusChange = this.handleFilterStatusChange.bind(this);
  }

  async componentDidMount() {
    let {
      startDate,
      endDate,
      filters
    } = this.state;
    const profile = await ProfileService.getProfile();
    filters.userId = profile.userId;
    startDate = new Date();
    startDate.setHours(0, 0, 0); // 00:00:00
    endDate = new Date();
    endDate.setDate(startDate.getDate() + 7);
    endDate.setHours(23, 59, 59); // 23:59:59
    filters.startAvailability = startDate;
    filters.endAvailability = endDate;

    const jobs = await this.fetchJobs();
    this.fetchFilterLists();

    // if (jobs) {
    //   jobs.map(async (job) => {
    //     const newJob = job;
    //
    //     const company = await CompanyService.getCompanyById(newJob.companiesId);
    //     newJob.companyName = company.legalName;
    //
    //     const materialsList = await JobMaterialsService.getJobMaterialsByJobId(job.id);
    //     const materials = materialsList.map(materialItem => materialItem.value);
    //     newJob.material = this.equipmentMaterialsAsString(materials);
    //
    //     const address = await AddressService.getAddressById(newJob.startAddress);
    //     newJob.zip = address.zipCode;

    // this.setState({ loaded: true });
    //
    //     return newJob;
    //   });
    // }

    this.setState(
      {
        jobs,
        filters,
        loaded: true,
        startDate,
        endDate,
        isAvailable: true
      }
    );
  }

  retrieveAllMaterials() {
    const { materialTypeList } = this.state;
    return materialTypeList;
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

  async fetchFilterLists() {
    const { filters, materialTypeList, equipmentTypeList, rateTypeList } = this.state;
    const profile = await ProfileService.getProfile();

    if (profile.companyId) {
      const company = await CompanyService.getCompanyById(profile.companyId);
      if (company.addressId) {
        const address = await AddressService.getAddressById(company.addressId);
        filters.zipCode = address.zipCode ? address.zipCode : filters.zipCode;
      }
    }

    // TODO need to refactor above to do the filtering on the Orion
    // LookupDao Hibernate side

    const lookupEquipmentList = await LookupsService.getLookupsByType('EquipmentType');
    Object.values(lookupEquipmentList)
      .forEach((itm) => {
        equipmentTypeList.push(itm.val1);
      });

    const lookupMaterialTypeList = await LookupsService.getLookupsByType('MaterialType');
    Object.values(lookupMaterialTypeList)
      .forEach((itm) => {
        materialTypeList.push(itm.val1);
      });

    const lookupRateTypelist = await LookupsService.getLookupsByType('RateType');
    Object.values(lookupRateTypelist)
      .forEach((itm) => {
        rateTypeList.push(itm.val1);
      });

    [filters.equipmentType] = equipmentTypeList;
    [filters.materials] = materialTypeList;
    [filters.rateType] = rateTypeList;
    this.setState({
      filters,
      equipmentTypeList,
      materialTypeList,
      rateTypeList
    });
  }

  handlePageClick(menuItem) {
    if (menuItem) {
      this.setState({ [`goTo${menuItem}`]: true });
    }
  }

  async fetchJobs() {
    const { filters } = this.state;
    const jobs = await JobService.getJobDashboardByFilters(filters);
    this.setState({ jobs });
    return jobs;
  }

  handleFilterChangeDelayed(e) {
    const self = this;
    const { value } = e.target;
    const { filters } = this.state;

    if (self.state.typingTimeout) {
      clearTimeout(self.state.typingTimeout);
    }

    filters[e.target.name] = value;

    self.setState({
      typing: false,
      typingTimeout: setTimeout(async () => {
        await this.fetchJobs();
      }, 1000),
      filters
    });
  }

  async handleFilterChange(e) {
    const { value } = e.target;
    const { filters } = this.state;
    filters[e.target.name] = value;
    this.setState({ filters });
    await this.fetchJobs();
  }

  async handleFilterStatusChange({value, name}) {
    const { filters } = this.state;
    if (filters[name] === value) {
      filters[name] = "";
    } else {
      filters[name] = value;
    }
    this.setState({ filters });
    //console.log(filters);
    await this.fetchJobs();
  }

  async handleSelectFilterChange(option) {
    const { value, name } = option;
    const { filters } = this.state;
    filters[name] = value;
    this.setState({ filters });
    await this.fetchJobs();
  }

  handleMultiChange(data) {
    const { filters } = this.state;
    filters.materialType = data;
    this.setState({
      // selectedMaterials: data
      filters
    }, async function changed() {
      await this.fetchJobs();
      // console.log(this.state);
    });
    /**/
  }

  handlePageClick(menuItem) {
    if (menuItem) {
      this.setState({ [`goTo${menuItem}`]: true });
    }
  }

  handleJobEdit(id) {
    this.setState({
      goToUpdateJob: true,
      jobId: id
    });
  }

  // handleJobEdit(id) {
  //   const { jobs } = this.state;
  //   const [selectedJob] = jobs.filter((job) => {
  //     if (id === job.id) {
  //       return job;
  //     }
  //     return false;
  //   }, id);
  //   selectedJob.materials = ['Any'];
  //   this.setState({
  //     selectedJob,
  //     modal: true
  //   });
  // }

  async handleStartDateChange(e) {
    const { filters } = this.state;
    filters.startAvailability = e;
    this.setState({ filters });
    await this.fetchJobs();
  }

  async handleEndDateChange(e) {
    const { filters } = this.state;
    filters.endAvailability = e;
    this.setState({ filters });
    await this.fetchJobs();
  }

  async handleIntervalInputChange(e) {
    const { filters } = this.state;
    filters.startAvailability = e.start;
    filters.endAvailability = e.end;
    this.setState({ filters });
    await this.fetchJobs();
  }

  toggleAddJobModal() {
    const { modal } = this.state;
    this.setState({
      modal: !modal
    });
  }

  returnSelectedMaterials() {
    const { filters } = this.state;
    return filters.materialType;
  }

  // renderModal stolen from MarketplaceCarrierPage
  renderModal() {
    // const {
    //   // equipments,
    //   // startAvailability,
    //   // endAvailability,
    //   // equipmentType,
    //   // minCapacity,
    //   // materials,
    //   // zipCode,
    //   // rateType,
    //   modal,
    //   selectedEquipment
    // } = this.state;
    // return (
    //   <Modal
    //     isOpen={modal}
    //     toggle={this.toggleAddJobModal}
    //     className="modal-dialog--primary modal-dialog--header"
    //   >
    //     <div className="modal__header">
    //       <button type="button" className="lnr lnr-cross modal__close-btn"
    //               onClick={this.toggleAddJobModal}
    //       />
    //       <h4 className="bold-text modal__title">Job Request</h4>
    //     </div>
    //     <div className="modal__body" style={{ padding: '25px 25px 20px 25px' }}>
    //       <JobCreateForm
    //         selectedEquipment={selectedEquipment}
    //         closeModal={this.toggleAddJobModal}
    //         selectedMaterials={this.returnSelectedMaterials}
    //         getAllMaterials={this.retrieveAllMaterials}
    //       />
    //     </div>
    //   </Modal>
    // );
  }

  renderGoTo() {
    const status = this.state;
    if (status.goToDashboard) {
      return <Redirect push to="/"/>;
    }
    if (status.goToAddJob) {
      return <Redirect push to="/jobs/save"/>;
    }
    if (status.goToUpdateJob) {
      return <Redirect push to={`/jobs/save/${status.jobId}`}/>;
    }
    return false;
  }

  renderTitle() {
    return (
      <Row>
        <Col md={12}>
          <h3 className="page-title">Job Dashboard</h3>
        </Col>
      </Row>
    );
  }

  renderCards() {
    const { loaded, filters } = this.state;
    let { jobs } = this.state;

    let onOfferJobCount = 0;
    let publishedJobCount = 0;
    let acceptedJobCount = 0;
    let inProgressJobCount = 0;
    let completedJobCount = 0;
    let potentialIncome = 0;

    let jobsCompleted = 0;
    let totalEarnings = 0;
    let earningsPerJob = 0;
    let cancelledJobs = 0;
    let jobsPerTruck = 0;
    let idleTrucks = 0;
    let completedOffersPercent = 0;

    if (jobs) {
      jobs = jobs.map((job) => {
        const newJob = job;
        const tempRate = newJob.rate;
        if (newJob.status === 'On Offer') {
          onOfferJobCount += 1;
        }
        if (newJob.status === 'Published') {
          publishedJobCount += 1;
        }
        if (newJob.status === 'Booked') {
          acceptedJobCount += 1;
        }
        if (newJob.status === 'In Progress') {
          inProgressJobCount += 1;
        }
        if (newJob.status === 'Job Completed') {
          completedJobCount += 1;
        }
        if (newJob.rateType === 'Hour') {
          newJob.newSize = TFormat.asHours(newJob.rateEstimate);
          newJob.newRate = TFormat.asMoneyByHour(newJob.rate);
          newJob.estimatedIncome = TFormat.asMoney(
            (tempRate * newJob.rateEstimate) * 0.95
          );
        }
        if (newJob.rateType === 'Ton') {
          newJob.newSize = TFormat.asTons(newJob.rateEstimate);
          newJob.newRate = TFormat.asMoneyByTons(newJob.rate);
          newJob.estimatedIncome = TFormat.asMoney(
            (tempRate * newJob.rateEstimate) * 0.95
          );
        }

        newJob.newStartDate = TFormat.asDate(job.startTime);

        potentialIncome += (tempRate * newJob.rateEstimate) * 0.95;

        return newJob;
      });
    }

    jobsCompleted = onOfferJobCount * 20;
    // totalEarnings = TFormat.asMoney(potentialIncome * 3.14159);
    // earningsPerJob = TFormat.asMoney((potentialIncome * 3.14159) / (jobsCompleted));
    // cancelledJobs = 1;
    // jobsPerTruck = TFormat.asNumber(onOfferJobCount / 0.7);
    // idleTrucks = 1;

    // Jobs completed / Job offers responded to
    completedOffersPercent = TFormat.asPercent((completedJobCount / jobs.length) * 100, 2);

    potentialIncome = TFormat.asMoney(potentialIncome);

    // console.log(jobs);

    if (loaded) {
      return (
        <Container className="dashboard">
          {/*{this.renderGoTo()}*/}

          <div className="row">
            <DashboardObjectClickable title="New Offers" displayVal = {onOfferJobCount} value={"On Offer"} handle={this.handleFilterStatusChange} name={"status"} status={filters["status"]}/>
            <DashboardObjectClickable title="Published Jobs" displayVal = {publishedJobCount} value={"Published"} handle={this.handleFilterStatusChange} name={"status"} status={filters["status"]}/>
            <DashboardObjectClickable title="Booked Jobs" displayVal = {acceptedJobCount} value={"Booked"} handle={this.handleFilterStatusChange} name={"status"} status={filters["status"]}/>
            <DashboardObjectClickable title="Jobs in Progress" displayVal = {inProgressJobCount} value={"In Progress"} handle={this.handleFilterStatusChange} name={"status"} status={filters["status"]}/>
            <DashboardObjectClickable title="Completed Jobs" displayVal = {completedJobCount} value={"Job Completed"} handle={this.handleFilterStatusChange} name={"status"} status={filters["status"]}/>
            {/*<DashboardObjectStatic title="% Completed" displayVal = {completedOffersPercent}/>*/}
            <DashboardObjectStatic title={filters["status"] === "Job Completed"  ? "Earnings" : "Potential Earnings"} displayVal={potentialIncome}/>
          </div>
        </Container>
      );
    }
    return (
      <Container>
        Loading...
      </Container>
    );
  }

  renderFilter() {
    const {
      // Lists
      equipmentTypeList,
      materialTypeList,
      rateTypeList,
      startDate,
      endDate,

      // filters
      filters

    } = this.state;

    return (
      <Row>
        <Col md={12}>
          <Card>
            <CardBody>
              <form id="filter-form" className="form" onSubmit={e => this.saveCompany(e)}>
                <Col lg={12}>
                  <Row lg={12} id="filter-input-row">
                    <Col md="2">
                      <div className="filter-item-title">
                        Date Range
                      </div>
                      <TIntervalDatePicker
                        startDate={filters.startAvailability}
                        endDate={filters.endAvailability}
                        name="dateInterval"
                        onChange={this.handleIntervalInputChange}
                        dateFormat="MM/dd/yy"
                      />
                    </Col>
                    <Col md="1">
                      <div className="filter-item-title">
                        Rate Type
                      </div>
                      <TSelect
                        input={
                          {
                            onChange: this.handleSelectFilterChange,
                            name: 'rateType',
                            value: filters.rateType
                          }
                        }
                        meta={
                          {
                            touched: false,
                            error: 'Unable to select'
                          }
                        }
                        value={filters.rateType}
                        options={
                          rateTypeList.map(rateType => ({
                            name: 'rateType',
                            value: rateType,
                            label: rateType
                          }))
                        }
                        placeholder={rateTypeList[0]}
                      />
                    </Col>
                    <Col md="1">
                      <div className="filter-item-title">
                        Min Rate
                      </div>
                      <TField
                        input={
                          {
                            onChange: this.handleFilterChangeDelayed,
                            name: 'rate',
                            value: filters.rate
                          }
                        }
                        className="filter-text"
                        placeholder="Any"
                        type="number"
                      />
                    </Col>
                    <Col md="1">
                      <div className="filter-item-title">
                        Minimum
                      </div>
                      <TField
                        input={
                          {
                            onChange: this.handleFilterChangeDelayed,
                            name: 'minTons',
                            value: filters.minTons
                          }
                        }
                        className="filter-text"
                        placeholder="Any"
                        type="number"
                      />
                    </Col>
                    <Col md="2">
                      <div className="filter-item-title">
                        Truck Type
                      </div>
                      <TSelect
                        input={
                          {
                            onChange: this.handleSelectFilterChange,
                            name: 'equipmentType',
                            value: filters.equipmentType
                          }
                        }
                        meta={
                          {
                            touched: false,
                            error: 'Unable to select'
                          }
                        }
                        value={filters.equipmentType}
                        options={
                          equipmentTypeList.map(equipmentType => ({
                            name: 'equipmentType',
                            value: equipmentType,
                            label: equipmentType
                          }))
                        }
                        placeholder={equipmentTypeList[0]}
                      />
                    </Col>
                    <Col md="1">
                      <div className="filter-item-title">
                        # of Trucks
                      </div>
                      <TField
                        input={
                          {
                            onChange: this.handleFilterChangeDelayed,
                            name: 'numEquipments',
                            value: filters.numEquipments
                          }
                        }
                        className="filter-text"
                        placeholder="Any"
                        type="number"
                      />
                    </Col>
                    <Col md="1">
                      <div className="filter-item-title">
                        Zip Code
                      </div>
                      <input name="zipCode"
                             className="filter-text"
                             type="text"
                             placeholder="Zip Code"
                             value={filters.zipCode}
                             onChange={this.handleFilterChange}
                      />
                    </Col>
                    <Col md="3">
                      <div className="filter-item-title">
                        Materials
                      </div>
                      <MultiSelect
                        input={
                          {
                            onChange: this.handleMultiChange,
                            // onChange: this.handleSelectFilterChange,
                            name: 'materialType',
                            value: filters.materialType
                          }
                        }
                        meta={
                          {
                            touched: false,
                            error: 'Unable to select'
                          }
                        }
                        options={
                          materialTypeList.map(materialType => ({
                            name: 'materialType',
                            value: materialType.trim(),
                            label: materialType.trim()
                          }))
                        }
                        // placeholder="Materials"
                        placeholder={materialTypeList[0]}
                      />
                    </Col>
                  </Row>
                </Col>
                <br/>
              </form>
            </CardBody>
          </Card>
        </Col>
      </Row>
    );
  }

  renderJobList() {
    const { loaded } = this.state;
    let { jobs } = this.state;
    let onOfferJobCount = 0;
    let publishedJobCount = 0;
    let acceptedJobCount = 0;
    let inProgressJobCount = 0;
    let completedJobCount = 0;
    let potentialIncome = 0;

    let jobsCompleted = 0;
    let totalEarnings = 0;
    let earningsPerJob = 0;
    let cancelledJobs = 0;
    let jobsPerTruck = 0;
    let idleTrucks = 0;
    let completedOffersPercent = 0;

    jobs = jobs.map((job) => {
      const newJob = job;
      const tempRate = newJob.rate;
      if (newJob.status === 'On Offer') {
        onOfferJobCount += 1;
      }
      if (newJob.status === 'Published') {
        publishedJobCount += 1;
      }
      if (newJob.status === 'Booked') {
        acceptedJobCount += 1;
      }
      if (newJob.status === 'In Progress') {
        inProgressJobCount += 1;
      }
      if (newJob.status === 'Job Completed') {
        completedJobCount += 1;
      }
      if (newJob.rateType === 'Hour') {
        newJob.newSize = TFormat.asHours(newJob.rateEstimate);
        newJob.newRate = TFormat.asMoneyByHour(newJob.rate);
        newJob.estimatedIncome = TFormat.asMoney(
          (tempRate * newJob.rateEstimate) * 0.95
        );
      }
      if (newJob.rateType === 'Ton') {
        newJob.newSize = TFormat.asTons(newJob.rateEstimate);
        newJob.newRate = TFormat.asMoneyByTons(newJob.rate);
        // Job's Potencial Earnings
        newJob.estimatedIncome = TFormat.asMoney(
          (tempRate * newJob.rateEstimate) * 0.95
        );
      }

      newJob.newStartDate = TFormat.asDate(job.startTime);

      potentialIncome += (tempRate * newJob.rateEstimate) * 0.95;

      return newJob;
    });

    // jobsCompleted = onOfferJobCount * 20;
    potentialIncome = TFormat.asMoney(potentialIncome);

    // console.log(jobs);
    if (loaded) {
      const {filters} = this.state;
      return (
        <Container className="dashboard">
          <Row>
            <Col md={12}>
              <Card>
                <CardBody>
                  Displaying {jobs.length} of {jobs.length}
                  <TTable
                    columns={
                      [
                        // {
                        //   name: 'id',
                        //   displayName: 'Job Id'
                        // },
                        {
                          name: 'newStartDate',
                          displayName: 'Start Date'
                        },
                        {
                          name: 'name',
                          displayName: 'Job Name'
                        },
                        {
                          name: 'status',
                          displayName: 'Job Status'
                        },
                        {
                          name: 'legalName',
                          displayName: 'Customer'
                        },
                        {
                          name: 'zipCode',
                          displayName: 'Start Zip'
                        },
                        {
                          name: 'estimatedIncome',
                          displayName: filters.status === "Job Completed" ? "Earnings" : "Potential Earnings"
                        },
                        {
                          name: 'newRate',
                          displayName: 'Rate'
                        },
                        // {
                        //   name: 'name',
                        //   displayName: 'Job Name'
                        // },
                        // {
                        //   name: 'status',
                        //   displayName: 'Job Status'
                        // },


                        {
                          name: 'newSize',
                          displayName: 'Size'
                        },
                        {
                          // the materials needs to come from the the JobMaterials Table
                          name: 'materials',
                          displayName: 'Materials'
                        }
                      ]
                    }
                    data={jobs}
                    handleIdClick={this.handleJobEdit}
                  />
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      );
    }
    return (
      <Container>
        Loading...
      </Container>
    );
  }

  render() {
    const { loaded } = this.state;
    if (loaded) {
      return (
        <Container className="dashboard">
          {this.renderModal()}
          {this.renderGoTo()}
          {this.renderTitle()}
          {this.renderCards()}
          {this.renderFilter()}
          {this.renderJobList()}
        </Container>
      );
    }
    return (
      <Container className="dashboard">
        Loading...
      </Container>
    );
  }
}

export default DashboardCarrierPage;
