import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import {
  Card,
  CardBody,
  Col,
  Container,
  Modal,
  Row
} from 'reactstrap';

import moment from 'moment';
// import { Select } from '@material-ui/core';
import TField from '../common/TField';
import TSelect from '../common/TSelect';
import TTable from '../common/TTable';
import TFormat from '../common/TFormat';
import TIntervalDatePicker from '../common/TIntervalDatePicker';
import MultiSelect from '../common/TMultiSelect';

import AddressService from '../../api/AddressService';
import CompanyService from '../../api/CompanyService';
import JobService from '../../api/JobService';
import LookupsService from '../../api/LookupsService';
import JobViewForm from './JobViewForm';
import JobMaterialsService from '../../api/JobMaterialsService';
import ProfileService from '../../api/ProfileService';

class MarketplaceCarrierPage extends Component {
  constructor(props) {
    super(props);

    // NOTE: if you update this list you have to update
    // Orion.EquipmentDao.filtersOrderByClause
    const sortByList = ['Hourly ascending', 'Hourly descending',
      'Tonnage ascending', 'Tonnage descending'];

    // Comment
    this.state = {
      loaded: false,
      jobs: [],
      jobId: 0,

      // Look up lists
      equipmentTypeList: [],
      materialTypeList: [],
      rateTypeList: [],
      // sortBy: 1,

      modal: false,
      goToDashboard: false,
      startDate: null, // values for date control
      endDate: null, // values for date control

      // Rate Type Button toggle
      // isAvailable: true,

      // TODO: Refactor to a single filter object
      // Filter values
      filters: {
        rateType: '',
        searchType: "Carrier Job",
        startAvailability: null,
        endAvailability: null,
        rate: '',
        minTons: '',
        minHours: '',
        minCapacity: '',
        userId: '',
        equipmentType: '',
        numEquipments: '',
        zipCode: '',
        materialType: [],

        sortBy: sortByList[0]

      }

      // ...equipment
      // goToAddJob: false,
      // goToUpdateJob: false,
      // goToCreateJob: false,
      // jobId: 0

    };

    this.renderGoTo = this.renderGoTo.bind(this);
    // this.handleJobEdit = this.handleJobEdit.bind(this);

    this.toggleAddJobModal = this.toggleAddJobModal.bind(this);
    this.handleFilterChange = this.handleFilterChange.bind(this);
    this.handleSelectFilterChange = this.handleSelectFilterChange.bind(this);
    this.handleStartDateChange = this.handleStartDateChange.bind(this);
    this.handleEndDateChange = this.handleEndDateChange.bind(this);
    this.handleMultiChange = this.handleMultiChange.bind(this);
    this.handleIntervalInputChange = this.handleIntervalInputChange.bind(this);
    this.returnSelectedMaterials = this.returnSelectedMaterials.bind(this);
    this.toggleViewJobModal = this.toggleViewJobModal.bind(this);
    this.toggleViewJobModalClear = this.toggleViewJobModalClear.bind(this);
    this.handleFilterChangeDelayed = this.handleFilterChangeDelayed.bind(this);
  }

  async componentDidMount() {
    let {
      startDate,
      endDate
    } = this.state;
    const { filters } = this.state;
    const profile = await ProfileService.getProfile();
    filters.userId = profile.userId;
    startDate = new Date();
    startDate.setHours(0, 0, 0); // 00:00:00
    endDate = new Date();
    endDate.setDate(startDate.getDate() + 7);
    endDate.setHours(23, 59, 59); // 23:59:59
    filters.startAvailability = startDate;
    filters.endAvailability = endDate;


    // await this.fetchJobs();
    const jobs = await this.fetchJobs();
    this.fetchFilterLists();

    // if (jobs) {
    //   this.fetchJobMaterials(jobs);
    //
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
    //
    //     return newJob;
    //   });
    // }

    this.setState(
      {
        loaded: true,
        jobs,
        filters,
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

  // availableButtonColor(isAvailable) {
  //   return isAvailable ? 'success' : 'minimal';
  // }
  //
  // unavailableButtonColor(isAvailable) {
  //   return isAvailable ? 'success' : 'minimal';
  // }
  //
  // makeAvailable() {
  //   const {
  //     isAvailable
  //   } = this.state;
  //   // console.log(`Before swap: ${isAvailable}`);
  //   const newValue = !isAvailable;
  //   // console.log(`switching makeAvailable to ${newValue}`);
  //   this.setState({ isAvailable: newValue });
  // }

  async fetchJobMaterials(jobs) {
    const newJobs = jobs;
    /* eslint-disable no-await-in-loop */
    for (const [key, value] of Object.entries(jobs)) {
      try {
        let truckMaterials = await
          JobMaterialsService.getJobMaterialsByJobId(value.id);
        truckMaterials = truckMaterials.map(material => ({
          material: material.value
        }));

        if ((truckMaterials[0].material).includes('Any')) { // If we have 'Any', show all materials
          let allMaterials = await LookupsService.getLookupsByType('MaterialType'); // Get all materials from Lookups
          allMaterials = allMaterials.map(item => item.val1); // Get only val1 values
          allMaterials = allMaterials.filter(e => e !== 'Any'); // All materials, but 'Any'
          newJobs[key].materials = allMaterials.join(', \n');
        } else {
          newJobs[key].materials = truckMaterials.map(e => e.material)
            .join('\n');
        }
      } catch (error) {
        newJobs[key].materials = '';
      }
    }
    this.setState({ jobs: newJobs });
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
      filters
    }, async function changed() {
      await this.fetchJobs();
    });
  }

  handlePageClick(menuItem) {
    if (menuItem) {
      this.setState({ [`goTo${menuItem}`]: true });
    }
  }

  /* handleJobEdit(id) {
    const { jobs } = this.state;
    const [selectedJob] = jobs.filter((job) => {
      if (id === job.id) {
        return job;
      }
      return false;
    }, id);
    // selectedJob.materials = ['Any'];
    this.setState({
      // selectedJob,
      modal: true
    });
  } */

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

  async toggleViewJobModal() {
    const { modal } = this.state;
    this.setState({ modal: !modal });
    await this.fetchJobs();
  }

  async toggleViewJobModalClear(id) {
    const { modal } = this.state;
    this.setState({
      // equipmentId: 0, // reset equipmentID, not companyID
      // selectedItemData: {},
      modal: !modal,
      jobId: id
    });
  }

  renderGoTo() {
    const status = this.state;
    if (status.goToDashboard) {
      return <Redirect push to="/"/>;
    }
    return false;
  }

  renderModal() {
    const {
      modal,
      jobId
    } = this.state;
    return (
      <Modal
        isOpen={modal}
        toggle={this.toggleViewJobModal}
        className="modal-dialog--primary modal-dialog--header"
      >
        <div className="modal__header">
          <button type="button" className="lnr lnr-cross modal__close-btn"
                  onClick={this.toggleViewJobModal}
          />
          <div className="bold-text modal__title">Marketplace Detail</div>
        </div>
        <div className="modal__body" style={{ padding: '25px 25px 20px 25px' }}>
          <JobViewForm
            jobId={jobId}
            closeModal={this.toggleViewJobModal}
            toggle={this.toggleViewJobModal}
          />
        </div>
      </Modal>
    );
  }

  renderTitle() {
    return (
      <Row>
        <Col md={12}>
          <h3 className="page-title">Find a Job</h3>
        </Col>
      </Row>
    );
  }

  renderJobList() {
    let {
      jobs
    } = this.state;

    if (jobs) {
      jobs = jobs.map((job) => {
        const newJob = job;

        // const company = await CompanyService.getCompanyById(newJob.companiesId);
        // newJob.companyName = company.legalName;
        //
        // // console.log(companyName);
        // // console.log(job.companyName);
        //
        // const materialsList = await JobMaterialsService.getJobMaterialsByJobId(job.id);
        // const materials = materialsList.map(materialItem => materialItem.value);
        // newJob.material = this.equipmentMaterialsAsString(materials);
        // console.log(companyName);
        // console.log(job.material);
        //
        // const address = await AddressService.getAddressById(newJob.startAddress);
        // newJob.zip = address.zipCode;

        const tempRate = newJob.rate;
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

        return newJob;
      });
    } else {
      // console.log("MarketPlaceCarrierPage: no Jobs");
      jobs = [];
    }

    return (
      <Container className="dashboard">
        <Row>
          <Col md={12}>
            <Card>
              <CardBody>
                Carrier Market Place
                <TTable
                  columns={
                    [
                      {
                        name: 'id',
                        displayName: 'Job Id'
                      },
                      {
                        name: 'newStartDate',
                        displayName: 'Start Date'
                      },
                      {
                        name: 'estimatedIncome',
                        displayName: 'Potencial Earnings'
                      },
                      {
                        name: 'newRate',
                        displayName: 'Hourly Rate'
                      },
                      {
                        name: 'newSize',
                        displayName: 'Min Hours'
                      },
                      {
                        name: 'zipCode',
                        displayName: 'Zip Code'
                      },
                      {
                        // the materials needs to come from the the JobMaterials Table
                        name: 'materials',
                        displayName: 'Materials'
                      },
                      {
                        name: 'equipmentType',
                        displayName: 'Truck Type'
                      },
                      {
                        name: 'numEquipments',
                        displayName: 'Number of Trucks'
                      }
                    ]
                  }
                  data={jobs}
                  handleIdClick={this.toggleViewJobModalClear}
                />

              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  renderFilter() {
    const {
      // Lists
      equipmentTypeList,
      materialTypeList,
      rateTypeList,

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
                        Materials ({this.returnSelectedMaterials().length})
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

  render() {
    const { loaded } = this.state;
    if (loaded) {
      return (
        <Container className="dashboard">
          {this.renderModal()}
          {this.renderGoTo()}
          {this.renderTitle()}
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

export default MarketplaceCarrierPage;
