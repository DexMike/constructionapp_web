import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import {
  Card,
  CardBody,
  Col,
  Button,
  Container,
  Modal,
  Row
} from 'reactstrap';
// import classnames from 'classnames';
import moment from 'moment';
// import { Select } from '@material-ui/core';
import TField from '../common/TField';
import TSelect from '../common/TSelect';
import TTable from '../common/TTable';
import TFormat from '../common/TFormat';
import TDateTimePicker from '../common/TDateTimePicker';
import TIntervalDatePicker from '../common/TIntervalDatePicker';
import MultiSelect from '../common/TMultiSelect';

import AddressService from '../../api/AddressService';
import AgentService from '../../api/AgentService';
import CompanyService from '../../api/CompanyService';
import EquipmentService from '../../api/EquipmentService';
import JobService from '../../api/JobService';
import JobCreateForm from '../jobs/JobCreateForm';
import JobMaterialsService from '../../api/JobMaterialsService';
import LookupsService from '../../api/LookupsService';
import ProfileService from '../../api/ProfileService';

import truckImage from '../../img/default_truck.png';

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
      selectedJob: {},

      // Look up lists
      equipmentTypeList: [],
      materialTypeList: [],
      rateTypeList: [],
      sortByList, // array from above
      // sortBy: 1,

      equipments: [],
      selectedEquipment: {},

      modal: false,
      goToDashboard: false,
      startDate: null,          // values for date control
      endDate: null,            // values for date control

      // Rate Type Button toggle
      isAvailable: true,

      // TODO: Refactor to a single filter object
      // Filter values
      filters: {
        rateType: '',

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

      }

      // ...equipment
      // goToAddJob: false,
      // goToUpdateJob: false,
      // goToCreateJob: false,
      // jobId: 0

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

    await this.fetchJobs();
    await this.fetchFilterLists();

    if (jobs) {
      // Promise.all(
      jobs.map(async (job) => {
        const newJob = job;

        const company = await CompanyService.getCompanyById(newJob.companiesId);
        newJob.companyName = company.legalName;

        const materialsList = await JobMaterialsService.getJobMaterialsByJobId(job.id);
        const materials = materialsList.map(materialItem => materialItem.value);
        newJob.material = this.equipmentMaterialsAsString(materials);

        const address = await AddressService.getAddressById(newJob.startAddress);
        newJob.zip = address.zipCode;

        return newJob;
      });
      // );

    }

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

  availableButtonColor(isAvailable) {
    return isAvailable ? 'success' : 'minimal';
  }

  unavailableButtonColor(isAvailable) {
    return isAvailable ? 'success' : 'minimal';
  }

  makeAvailable() {
    const {
      isAvailable
    } = this.state;
    // console.log(`Before swap: ${isAvailable}`);
    const newValue = !isAvailable;
    // console.log(`switching makeAvailable to ${newValue}`);
    this.setState({ isAvailable: newValue });
  }

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
          newJobs[key].materials = truckMaterials.map(e => e.material).join('\n');
        }
      } catch (error) {
        newJobs[key].materials = '';
      }
    }
    this.setState({ jobs: newJobs });
  }

  async fetchJobs() {
    const { filters } = this.state;
    const jobs = await JobService.getJobByFilters(filters);

    if (jobs) {
      this.fetchJobMaterials(jobs);

      this.fetchJobMaterials(jobs);

      jobs.map(async (job) => {
        const newJob = job;

        const address = await AddressService.getAddressById(newJob.startAddress);
        newJob.zip = address.zipCode;
        newJob.modifiedOn = moment(job.modifiedOn)
          .format();
        newJob.createdOn = moment(job.createdOn)
          .format();

        return newJob;
      });
      this.setState({ jobs });
    }
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
    const { jobs } = this.state;
    const [selectedJob] = jobs.filter((job) => {
      if (id === job.id) {
        return job;
      }
      return false;
    }, id);
    selectedJob.materials = ['Any'];
    this.setState({
      selectedJob,
      modal: true
    });
  }

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

  renderGoTo() {
    const status = this.state;
    if (status.goToDashboard) {
      return <Redirect push to="/"/>;
    }
    return false;
  }

  renderModal() {
    const {
      // equipments,
      // startAvailability,
      // endAvailability,
      // equipmentType,
      // minCapacity,
      // materials,
      // zipCode,
      // rateType,
      modal,
      selectedEquipment
    } = this.state;
    return (
      <Modal
        isOpen={modal}
        toggle={this.toggleAddJobModal}
        className="modal-dialog--primary modal-dialog--header"
      >
        <div className="modal__header">
          <button type="button" className="lnr lnr-cross modal__close-btn"
                  onClick={this.toggleAddJobModal}
          />
          <h4 className="bold-text modal__title">Job Request</h4>
        </div>
        <div className="modal__body" style={{ padding: '25px 25px 20px 25px' }}>
          <JobCreateForm
            selectedEquipment={selectedEquipment}
            closeModal={this.toggleAddJobModal}
            selectedMaterials={this.returnSelectedMaterials}
            getAllMaterials={this.retrieveAllMaterials}
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
          newJob.estimatedIncome = TFormat.asMoney(tempRate * newJob.rateEstimate);
        }
        if (newJob.rateType === 'Ton') {
          newJob.newSize = TFormat.asTons(newJob.rateEstimate);
          newJob.newRate = TFormat.asMoneyByTons(newJob.rate);
          newJob.estimatedIncome = TFormat.asMoney(tempRate * newJob.rateEstimate);
        }

        newJob.newStartDate = TFormat.asDate(job.startTime);

        return newJob;
      });
    }

    return (
      <Container className="dashboard">
        <Row>
          <Col md={12}>
            <Card>
              <CardBody>
                Carrier
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
                        name: 'estimatedIncome',
                        displayName: 'Est. Income'
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
                        name: 'zip',
                        displayName: 'Zip Code'
                      },
                      {
                        // the materials needs to come from the the JobMaterials Table
                        name: 'materials',
                        displayName: 'Materials'
                      },
                      {
                        name: 'status',
                        displayName: 'Truck Type'
                      },
                      {
                        name: 'numEquipments',
                        displayName: 'Number of Trucks'
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

  renderToggle() {
    const {
      // Lists
      rateTypeList,
      // isAvailable,
      filters
    } = this.state;

    return (
      <Row>
        <Col md={12}>
          <Card>
            <CardBody>

              <Col sm="12" md={{ size: 2, offset: 5 }}>

                <Col>
                Select by:

                  {/* <Button color={this.availableButtonColor(isAvailable)}
                          type="button"
                          onClick={this.makeAvailable}
                          className="previous">
                    Hour
                  </Button>
                  <Button color={this.unavailableButtonColor(!isAvailable)}
                          type="button"
                          onClick={this.makeAvailable}
                          className="previous">
                    Ton
                    </Button> */}

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
              </Col>
            </CardBody>
          </Card>
        </Col>
      </Row>
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

                  {/* <Col>
                    Select by:
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
                  </Col> */}

                </Col>

                <Col lg={12}>
                  <Row lg={12} style={{ background: '#eef4f8' }}>
                    <Col className="filter-item-title">
                      Date Range
                    </Col>
                    <Col className="filter-item-title">
                      Rate Type
                    </Col>
                    <Col className="filter-item-title">
                      Min Rate
                    </Col>
                    <Col className="filter-item-title">
                      Minimum
                    </Col>
                    <Col className="filter-item-title">
                      Truck Type
                    </Col>
                    <Col className="filter-item-title">
                      # of Trucks
                    </Col>
                    <Col className="filter-item-title">
                      Zip Code
                    </Col>
                    <Col className="filter-item-title">
                      Materials
                    </Col>
                  </Row>
                  <Row lg={12} id="filter-input-row">
                    {/*
                    <Col>
                      <TDateTimePicker
                          input={
                            {
                              onChange: this.handleStartDateChange,
                              name: 'startAvailability',
                              value: { startDate },
                              givenDate: new Date(startDate).getTime()
                            }
                          }
                          onChange={this.handleStartDateChange}
                          dateFormat="MM-dd-yy"
                      />
                    </Col>
                      <TDateTimePicker
                          input={
                            {
                              className: 'filter-text',
                              onChange: this.handleEndDateChange,
                              name: 'endAvailability',
                              value: { endDate },
                              givenDate: new Date(endDate).getTime()
                            }
                          }
                          onChange={this.handleEndDateChange}
                          dateFormat="MM-dd-yy"
                      />
                    */}
                    <Col>
                      <TIntervalDatePicker
                        startDate={filters.startAvailability}
                        endDate={filters.endAvailability}
                        name="dateInterval"
                        onChange={this.handleIntervalInputChange}
                        dateFormat="MM/dd/yy"
                      />

                    </Col>
                    <Col>
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
                      <input name="zipCode"
                             className="filter-text"
                             type="text"
                             placeholder="Zip Code"
                             value={filters.zipCode}
                             onChange={this.handleFilterChange}
                      />
                    </Col>
                    <Col>
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

  /* renderEquipmentRow(equipment) {
    return (
      <React.Fragment>
        <Row md={12} style={{ width: '100%' }}>
          <Col md={2}>
            <img width="118" height="100" src={`${window.location.origin}/${truckImage}`} alt=""
                 style={{ width: '118px' }}
            />
          </Col>

          <Col md={4}>
            <Row lg={4} sm={8} style={{ background: '#c7dde8' }}>
              <Col className="customer-truck-results-title">
                Type: {equipment.type}
              </Col>
              <Col className="customer-truck-results-title">
                Capacity:
                <NumberFormat
                  value={equipment.maxCapacity}
                  displayType="text"
                  decimalSeparator="."
                  decimalScale={0}
                  fixedDecimalScale
                  thousandSeparator
                  prefix=" "
                  suffix=" Tons"
                />
              </Col>
            </Row>
            <Row style={{ borderBottom: '3px solid rgb(199, 221, 232)' }}>
              <Col>
                Rate
              </Col>
              <Col>
                Minimum
              </Col>
            </Row>
            {(equipment.rateType === 'Both' || equipment.rateType === 'Hour') && (
              <Row>
                <Col>

                  <span>
                    <NumberFormat
                      value={equipment.hourRate}
                      displayType="text"
                      decimalSeparator="."
                      decimalScale={2}
                      fixedDecimalScale
                      thousandSeparator
                      prefix="$ "
                      suffix=" / Hour"
                    />
                  </span>

                </Col>
                <Col>
                  <NumberFormat
                    value={equipment.minHours}
                    displayType="text"
                    decimalSeparator="."
                    decimalScale={2}
                    fixedDecimalScale
                    thousandSeparator
                    suffix=" hours min"
                  />
                </Col>
              </Row>
            )}
            {(equipment.rateType === 'Both' || equipment.rateType === 'Ton') && (
              <Row>
                <Col>

                  <span>
                    <NumberFormat
                      value={equipment.tonRate}
                      displayType="text"
                      decimalSeparator="."
                      decimalScale={2}
                      fixedDecimalScale
                      thousandSeparator
                      prefix="$ "
                      suffix=" / Ton"
                    />
                  </span>

                </Col>
                <Col>
                  <NumberFormat
                    value={equipment.minCapacity}
                    displayType="text"
                    decimalSeparator="."
                    decimalScale={2}
                    fixedDecimalScale
                    thousandSeparator
                    suffix=" tons min"
                  />
                </Col>
              </Row>
            )}
          </Col>

          <Col md={6}>
            <Row style={{ background: '#c7dde8' }}>
              <Col className="customer-truck-results-title">
                Name: {equipment.name}
              </Col>
              {// <Col md={6} className="customer-truck-results-title> }
              {// Company: {equipment.companyName} }
              {// </Col> }
            </Row>
            {// <Row style={{borderBottom: '3px solid rgb(199, 221, 232)'}}> }
            {// <Col> }
            {// TODO needs API for equipment materials }
            {// Materials Hauled }
            {// </Col> }
            {// </Row> }
            <Row>
              <Col>
                {// HMA //}
                <br/>
                {// Stone //}
                <br/>
                {// Sand //}
                <br/>
              </Col>
              <Col>
                {// Gravel //}
                <br/>
                {// Recycling //}
                <br/>
              </Col>
              <Col>
                <button type="button"
                        className="btn btn-primary"
                        onClick={() => this.handleJobEdit(job.id)}
                        style={{ marginTop: '10px' }}
                >
                  Request
                </button>
              </Col>
            </Row>
          </Col>
        </Row>
        <hr/>
      </React.Fragment>
    );
  } */

  /* renderEquipmentTable() {
    const {
      sortByList,
      filters,
      equipments,
      jobs
    } = this.state;

    return (
      <Row>
        <Col md={12}>
          <Card>
            <CardBody>
              <Row>
                <Col md={6} id="equipment-display-count">
                  Displaying&nbsp;
                  {jobs.length}
                  &nbsp;of&nbsp;
                  {jobs.length}
                </Col>
                <Col md={6}>
                  <Row>
                    <Col md={6} id="sortby">Sort By</Col>
                    <Col md={6}>
                      <TSelect
                        input={
                          {
                            onChange: this.handleSelectFilterChange,
                            name: 'sortBy',
                            value: filters.sortBy
                          }
                        }
                        meta={
                          {
                            touched: false,
                            error: 'Unable to select'
                          }
                        }
                        value={filters.sortBy}
                        options={
                          sortByList.map(sortBy => ({
                            name: 'sortBy',
                            value: sortBy,
                            label: sortBy
                          }))
                        }
                        placeholder={sortByList[0]}
                      />
                    </Col>
                  </Row>
                </Col>
              </Row>

              <Row style={{ marginTop: '10px' }}>
                {
                  equipments.map(equipment => (
                    <React.Fragment key={equipment.id}>
                      {this.renderEquipmentRow(equipment)}
                    </React.Fragment>
                  ))
                }
              </Row>

            </CardBody>
          </Card>
        </Col>
      </Row>
    );
  } */

  render() {
    const { loaded } = this.state;
    if (loaded) {
      return (
        <Container className="dashboard">
          {/*/!*{this.renderModal()}*!/*/}
          {/*{this.renderGoTo()}*/}
          {/*{this.renderTitle()}*/}
          {/*{this.renderFilter()}*/}
          {/* {this.renderTable()} */}
          {/* {this.renderEquipmentTable()} */}
          {/*{this.renderJobList()}*/}
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
