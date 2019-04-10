import React, {Component} from 'react';
import {Redirect} from 'react-router-dom';
import {
  Button,
  Card,
  CardBody,
  Col,
  Container,
  Modal,
  Row
} from 'reactstrap';
import moment from 'moment';

// import PropTypes from 'prop-types';
import TTable from '../common/TTable';
import TFormat from '../common/TFormat';
import TField from '../common/TField';
import TSelect from '../common/TSelect';
import TDateTimePicker from '../common/TDateTimePicker';
import TIntervalDatePicker from '../common/TIntervalDatePicker';
import MultiSelect from '../common/TMultiSelect';

import AddressService from '../../api/AddressService';
import AgentService from '../../api/AgentService';
import CompanyService from '../../api/CompanyService';
import JobCreateForm from '../jobs/JobCreateForm';
import JobMaterialsService from '../../api/JobMaterialsService';
import JobService from '../../api/JobService';
import LookupsService from '../../api/LookupsService';
import ProfileService from '../../api/ProfileService';

import JobCreatePopup from '../jobs/JobCreatePopup';

import {useTranslation} from "react-i18next";
import {DashboardObject, DashboardObjectClickable} from "./DashboardObjectClickable";
import {DashboardObjectStatic} from "./DashboardObjectStatic";

function PageTitle() {
  const {t} = useTranslation();
  return (
    <Row>
      <Col md={12}>
        <h3 className="page-title">{t("Jobs")}</h3>
      </Col>
    </Row>
  )
}

function AddJobButton({handle}) {
  const {t} = useTranslation();
  return (
    <Button
      onClick={handle}
      type="button"
      className="primaryButton"
    >
      {t("ADD A JOB")}
    </Button>
  )
}

class DashboardCustomerPage extends Component {
  constructor(props) {
    super(props);

    // NOTE: if you update this list you have to update
    // Orion.EquipmentDao.filtersOrderByClause
    const sortByList = ['Hourly ascending', 'Hourly descending',
      'Tonnage ascending', 'Tonnage descending'];

    this.state = {
      loaded: false,
      jobs: [],
      goToDashboard: false,
      goToAddJob: false,
      goToUpdateJob: false,
      jobId: 0,
      modalAddJob: false,

      startDate: null,          // values for date control
      endDate: null,            // values for date control

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
        startAvailability: null,
        endAvailability: null,
        rate: '',
        minTons: '',
        minHours: '',
        minCapacity: '',

        equipmentType: '',
        numEquipments: '',
        zipCode: '',
        distance: '',
        materialType: [],

        sortBy: sortByList[0]

      },
    };

    this.renderGoTo = this.renderGoTo.bind(this);
    this.handleJobEdit = this.handleJobEdit.bind(this);
    this.toggleNewJobModal = this.toggleNewJobModal.bind(this);

    // this.toggleAddJobModal = this.toggleAddJobModal.bind(this);
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

    startDate = new Date();
    startDate.setHours(0, 0, 0); // 00:00:00
    endDate = new Date();
    endDate.setDate(startDate.getDate() + 7);
    endDate.setHours(23, 59, 59); // 23:59:59
    filters.startAvailability = startDate;
    filters.endAvailability = endDate;

    const jobs = await this.fetchJobs();

    this.setState(
      {
        jobs,
        filters,
        loaded: true,
        startDate,
        endDate
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
      this.setState({[`goTo${menuItem}`]: true});
    }
  }

  async fetchJobs() {
    const { filters } = this.state;
    const jobs = await JobService.getJobDashboardByFilters(filters);
    await this.fetchFilterLists();

    // if (jobs) {
    //   await this.fetchFilterLists();
    //
    //   jobs.map(async (job) => {
    //     const newJob = job;
    //
    //     const company = await CompanyService.getCompanyById(newJob.companiesId);
    //     newJob.companyName = company.legalName;
    //
    //     const materialsList = await JobMaterialsService.getJobMaterialsByJobId(job.id);
    //     const materials = materialsList.map(materialItem => materialItem.value);
    //     newJob.materials = this.equipmentMaterialsAsString(materials);
    //
    //     const address = await AddressService.getAddressById(newJob.startAddress);
    //     newJob.zip = address.zipCode;
    //
    //     // Todo do a real distance calculation from profile.company.zip
    //     newJob.distance = (address.zipCode + 1) / 3000;
    //
    //     this.setState({loaded: true});
    //
    //     return newJob;
    //   });
    // }

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

  async handleFilterStatusChange({value, name}) {
    const { filters } = this.state;
    if (filters[name] === value) {
      filters[name] = "";
    } else {
      filters[name] = value;
    }
    this.setState({ filters });
    console.log(filters);
    //await this.fetchJobs();

    // implement backend query for status before fetching to avoid bugs
  }

  async handleFilterChange(e) {
    const { value } = e.target;
    const { filters } = this.state;
    filters[e.target.name] = value;
    await this.fetchJobs();
    this.setState({ filters });
  }

  async handleSelectFilterChange(option) {
    const { value, name } = option;
    const { filters } = this.state;
    filters[name] = value;
    await this.fetchJobs();
    this.setState({ filters });
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

  handleJobEdit(id) {
    console.log(id);
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
    await this.fetchJobs();
    this.setState({ filters });
  }

  async handleEndDateChange(e) {
    const { filters } = this.state;
    filters.endAvailability = e;
    await this.fetchJobs();
    this.setState({ filters });
  }

  async handleIntervalInputChange(e) {
    const { filters } = this.state;
    filters.startAvailability = e.start;
    filters.endAvailability = e.end;
    await this.fetchJobs();
    this.setState({ filters });
  }

  async toggleNewJobModal() {
    const {modalAddJob} = this.state;
    if (modalAddJob) {
      const jobs = await this.fetchJobs();
      this.setState({jobs, loaded: true});
    }
    this.setState({
      modalAddJob: !modalAddJob
    });
  }

  returnSelectedMaterials() {
    const { filters } = this.state;
    return filters.materialType;
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

  renderNewJobModal() {
    const {
      modalAddJob
    } = this.state;
    return (
      <Modal
        isOpen={modalAddJob}
        toggle={this.toggleNewJobModal}
        className="modal-dialog--primary modal-dialog--header"
      >
        <JobCreatePopup
          toggle={this.toggleNewJobModal}
        />
      </Modal>
    );
  }

  renderTitle() {
    return (
      <Row>
        <Col md={10}>
          <h3 className="page-title">Job Dashboard</h3>
        </Col>
        <Col md={2}>
          <AddJobButton handle={this.toggleNewJobModal}/>
        </Col>
      </Row>
    );
  }

  renderCards() {
    const {loaded, filters} = this.state;
    let {jobs} = this.state;
    let newJobCount = 0;
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
      if (newJob.status === 'New') {
        newJobCount += 1;
      }
      if (newJob.status === 'Accepted') {
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
        newJob.estimatedIncome = TFormat.asMoney(tempRate * newJob.rateEstimate);
      }
      if (newJob.rateType === 'Ton') {
        newJob.newSize = TFormat.asTons(newJob.rateEstimate);
        newJob.newRate = TFormat.asMoneyByTons(newJob.rate);
        newJob.estimatedIncome = TFormat.asMoney(tempRate * newJob.rateEstimate);
      }
      newJob.newRate = `$${newJob.rate}`;

      // newJob.newStartDate = moment(job.startTime).format("MM/DD/YYYY");
      newJob.newStartDate = TFormat.asDate(job.startTime);

      potentialIncome += tempRate * newJob.rateEstimate;

      return newJob;
    });

    jobsCompleted = newJobCount * 20;
    totalEarnings = TFormat.asMoney(potentialIncome * 3.14159);
    earningsPerJob = TFormat.asMoney((potentialIncome * 3.14159) / (jobsCompleted));
    cancelledJobs = 1;
    jobsPerTruck = TFormat.asNumber(newJobCount / 0.7);
    idleTrucks = 1;

    // Jobs completed / Job offers responded to
    completedOffersPercent = TFormat.asPercent((completedJobCount / jobs.length) * 100, 2);

    potentialIncome = TFormat.asMoney(potentialIncome);

    if (loaded) {
      return (
        <Container className="dashboard">
          <div className="row">
            <DashboardObjectClickable title="Offered Jobs" displayVal = {newJobCount} value={"Pending"} handle={this.handleFilterStatusChange} name={"status"} status={filters["status"]}/>
            <DashboardObjectClickable title="Jobs in Progress" displayVal = {inProgressJobCount} value={"In Progress"} handle={this.handleFilterStatusChange} name={"status"} status={filters["status"]}/>
            <DashboardObjectClickable title="Booked Jobs" displayVal = {acceptedJobCount} value={"Accepted"} handle={this.handleFilterStatusChange} name={"status"} status={filters["status"]}/>
            <DashboardObjectClickable title="Completed Jobs" displayVal={completedJobCount} value={"Job Completed"} handle={this.handleFilterStatusChange} name={"status"} status={filters["status"]}/>
            <DashboardObjectStatic title="% Completed" displayVal = {completedOffersPercent} value={"% Completed"}/>
          </div>
        </Container>
      );
    }
    return (
      <Container className="dashboard">
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
                    <Col>
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
                    <Col>
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
                    <Col>
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
                    <Col>
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
                    <Col>
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
                    <Col>
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
                    <Col>
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
                    <Col>
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
    const {loaded} = this.state;
    let {jobs} = this.state;
    let newJobCount = 0;
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
      if (newJob.status === 'New') {
        newJobCount += 1;
      }
      if (newJob.status === 'Accepted') {
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
        newJob.estimatedIncome = TFormat.asMoney(tempRate * newJob.rateEstimate);
      }
      if (newJob.rateType === 'Ton') {
        newJob.newSize = TFormat.asTons(newJob.rateEstimate);
        newJob.newRate = TFormat.asMoneyByTons(newJob.rate);
        newJob.estimatedIncome = TFormat.asMoney(tempRate * newJob.rateEstimate);
      }
      newJob.newRate = `$${newJob.rate}`;

      // newJob.newStartDate = moment(job.startTime).format("MM/DD/YYYY");
      newJob.newStartDate = TFormat.asDate(job.startTime);

      potentialIncome += tempRate * newJob.rateEstimate;

      return newJob;
    });

    jobsCompleted = newJobCount * 20;
    totalEarnings = TFormat.asMoney(potentialIncome * 3.14159);
    earningsPerJob = TFormat.asMoney((potentialIncome * 3.14159) / (jobsCompleted));
    cancelledJobs = 1;
    jobsPerTruck = TFormat.asNumber(newJobCount / 0.7);
    idleTrucks = 1;

    // Jobs completed / Job offers responded to
    completedOffersPercent = TFormat.asPercent((completedJobCount / jobs.length) * 100, 2);

    potentialIncome = TFormat.asMoney(potentialIncome);

    if (loaded) {
      return (
        <Container className="dashboard">
          <Row>
            <Col md={12}>
              <Card>
                <CardBody>
                  Displaying {newJobCount} of {newJobCount}
                  <TTable
                    columns={
                      [
                        // {
                        //   name: 'id',
                        //   displayName: 'Job Id'
                        // },
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
                          name: 'newSize',
                          displayName: 'Size'
                        },
                        {
                          name: 'newStartDate',
                          displayName: 'Start Date'
                        },
                        {
                          name: 'zipCode',
                          displayName: 'Start Zip'
                        },
                        {
                          name: 'newRate',
                          displayName: 'Rate'
                        },
                        // {
                        //   name: 'estimatedIncome',
                        //   displayName: 'Est. Income'
                        // },
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
      <Container className="dashboard">
        Loading...
      </Container>
    );
  }

  render() {
    const { loaded } = this.state;
    if (loaded) {
      return (
        <Container className="dashboard">
          {/*{this.renderModal()}*/}
          {this.renderNewJobModal()}
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

// DashboardCustomerPage.propTypes = {
//   companyId: PropTypes.number.isRequired
// };

export default DashboardCustomerPage;
