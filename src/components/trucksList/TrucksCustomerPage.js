import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import {
  Button,
  Card,
  CardBody,
  Col,
  Container,
  Modal,
  Row
} from 'reactstrap';
// import classnames from 'classnames';
import moment from 'moment';
// import { Select } from '@material-ui/core';
import NumberFormat from 'react-number-format';
import TSelect from '../common/TSelect';

import EquipmentService from '../../api/EquipmentService';
import LookupsService from '../../api/LookupsService';
import JobCreateForm from '../jobs/JobCreateForm';
import JobCreatePopup from '../jobs/JobCreatePopup';

import truckImage from '../../img/default_truck.png';
import CompanyService from '../../api/CompanyService';
import AddressService from '../../api/AddressService';
import ProfileService from '../../api/ProfileService';
// import JobMaterialsService from '../../api/JobMaterialsService';
// import JobsService from '../../api/JobsService';
// import AgentService from '../../api/AgentService';
import MultiSelect from '../common/TMultiSelect';
import TIntervalDatePicker from '../common/TIntervalDatePicker';
import './Truck.css';

class TrucksCustomerPage extends Component {
  constructor(props) {
    super(props);

    // NOTE: if you update this list you have to update
    // Orion.EquipmentDao.filtersOrderByClause
    const sortByList = ['Hourly ascending', 'Hourly descending',
      'Tonnage ascending', 'Tonnage descending'];

    // Comment
    this.state = {
      loaded: false,

      // Look up lists
      equipmentTypeList: [],
      materialTypeList: [],
      rateTypeList: [],
      sortByList,

      equipments: [],
      selectedEquipment: {},

      modal: false,
      modalSelectMaterials: false,
      modalAddJob: false,
      goToDashboard: false,
      startDate: null,
      endDate: null,

      // TODO: Refactor to a single filter object
      // Filter values
      filters: {
        startAvailability: null,
        endAvailability: null,
        truckType: '',
        minCapacity: '',
        // materialType: '',
        materialType: [],
        zipCode: '',
        rateType: '',
        sortBy: sortByList[0]
      }
    };

    this.renderGoTo = this.renderGoTo.bind(this);
    this.handleEquipmentEdit = this.handleEquipmentEdit.bind(this);
    this.toggleAddJobModal = this.toggleAddJobModal.bind(this);
    this.toggleNewJobModal = this.toggleNewJobModal.bind(this);
    this.handleFilterChange = this.handleFilterChange.bind(this);
    this.handleSelectFilterChange = this.handleSelectFilterChange.bind(this);
    this.handleStartDateChange = this.handleStartDateChange.bind(this);
    this.handleEndDateChange = this.handleEndDateChange.bind(this);
    this.handleMultiChange = this.handleMultiChange.bind(this);
    this.handleIntervalInputChange = this.handleIntervalInputChange.bind(this);
    this.returnSelectedMaterials = this.returnSelectedMaterials.bind(this);
    this.retrieveAllMaterials = this.retrieveAllMaterials.bind(this);
    this.toggleSelectMaterialsModal = this.toggleSelectMaterialsModal.bind(this);
  }

  async componentDidMount() {
    // await this.fetchJobs();
    await this.fetchEquipments();
    await this.fetchFilterLists();
    this.setState({ loaded: true });
  }

  retrieveAllMaterials() {
    const { materialTypeList } = this.state;
    return materialTypeList;
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

    // const lookups = await LookupsService.getLookups();
    //
    // Object.values(lookups)
    //   .forEach((itm) => {
    //     if (itm.key === 'EquipmentType') equipmentTypeList.push(itm.val1);
    //   });
    // Object.values(lookups)
    //   .forEach((itm) => {
    //     if (itm.key === 'MaterialType') materialTypeList.push(itm.val1);
    //   });
    //
    // Object.values(lookups)
    //   .forEach((itm) => {
    //     if (itm.key === 'RateType') rateTypeList.push(itm.val1);
    //   });

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

    [filters.truckType] = equipmentTypeList;
    [filters.materials] = materialTypeList;
    [filters.rateType] = rateTypeList;
    this.setState({
      filters,
      equipmentTypeList,
      materialTypeList,
      rateTypeList
    });
  }

  async fetchEquipments() {
    const { filters } = this.state;
    const equipments = await EquipmentService.getEquipmentByFilters(filters);

    if (equipments) {
      // NOTE let's try not to use Promise.all and use full api calls
      // Promise.all(
      equipments.map((equipment) => {
        const newEquipment = equipment;
        //     const company = await CompanyService.getCompanyById(newEquipment.companyId);
        //     newEquipment.companyName = company.legalName;
        // console.log(companyName);
        // console.log(job.companyName)
        // const materialsList = await EquipmentMaterialsService
        // .getEquipmentMaterialsByJobId(job.id);
        // const materials = materialsList.map(materialItem => materialItem.value);
        // newJob.material = this.equipmentMaterialsAsString(materials);
        // console.log(companyName);
        // console.log(job.material);
        newEquipment.modifiedOn = moment(equipment.modifiedOn)
          .format();
        newEquipment.createdOn = moment(equipment.createdOn)
          .format();
        return newEquipment;
      });
      this.setState({ equipments });
    }
  }

  async handleFilterChange(e) {
    const { value } = e.target;
    const { filters } = this.state;
    filters[e.target.name] = value;
    await this.fetchEquipments();
    this.setState({ filters });
  }

  async handleSelectFilterChange(option) {
    const { value, name } = option;
    const { filters } = this.state;
    filters[name] = value;
    await this.fetchEquipments();
    this.setState({ filters });
  }

  handleMultiChange(data) {
    const { filters } = this.state;
    filters.materialType = data;
    this.setState({
      // selectedMaterials: data
      filters
    }, async function changed() {
      await this.fetchEquipments();
      // console.log(this.state);
    });
    /**/
  }

  handlePageClick(menuItem) {
    if (menuItem) {
      this.setState({ [`goTo${menuItem}`]: true });
    }
  }

  handleEquipmentEdit(id) {
    const { equipments } = this.state;
    const [selectedEquipment] = equipments.filter((equipment) => {
      if (id === equipment.id) {
        return equipment;
      }
      return false;
    }, id);
    selectedEquipment.materials = ['Any'];
    this.setState({
      selectedEquipment,
      modal: true
    });
  }

  async handleStartDateChange(e) {
    const { filters } = this.state;
    filters.startAvailability = e;
    await this.fetchEquipments();
    this.setState({ filters });
  }

  async handleEndDateChange(e) {
    const { filters } = this.state;
    filters.endAvailability = e;
    await this.fetchEquipments();
    this.setState({ filters });
  }

  async handleIntervalInputChange(e) {
    const { filters } = this.state;
    filters.startAvailability = e.start;
    filters.endAvailability = e.end;
    await this.fetchEquipments();
    this.setState({ filters });
  }

  toggleAddJobModal() {
    const { modal } = this.state;
    this.setState({
      modal: !modal
    });
  }

  toggleSelectMaterialsModal() {
    // console.log(274);
    const { modalSelectMaterials } = this.state;
    this.setState({
      modalSelectMaterials: !modalSelectMaterials
    });
  }

  toggleNewJobModal() {
    const { modalAddJob } = this.state;
    this.setState({
      modalAddJob: !modalAddJob
    });
  }

  returnSelectedMaterials() {
    const { filters } = this.state;
    return filters.materialType;
  }

  preventModal() {
    this.setState({ modal: false });
  }

  renderGoTo() {
    const status = this.state;
    if (status.goToDashboard) {
      return <Redirect push to="/"/>;
    }
    // if (status.goToAddJob) {
    //   return <Redirect push to="/jobs/save"/>;
    // }
    // if (status.goToUpdateJob) {
    //   return <Redirect push to={`/jobs/save/${status.jobId}`}/>;
    // }
    return false;
  }

  // renderSelectMaterialModal
  renderSelectMaterialModal() {
    const {
      modalSelectMaterials,
      toggleSelectMaterialsModal
    } = this.state;
    return (
      <Modal
        isOpen={modalSelectMaterials}
        toggle={this.toggleAddJobModal}
        className="modal-dialog--primary modal-dialog--header"
      >
        <div className="modal__header">
          <button
            type="button"
            className="lnr lnr-cross modal__close-btn"
            onClick={!toggleSelectMaterialsModal}
          />
          <h4 className="bold-text modal__title white_title">
            Select material
          </h4>
        </div>
        <div className="modal__body" style={{ padding: '25px 25px 20px 25px' }}>
          Please select a material type for this job
        </div>

        <Row className="col-md-12">
          <div className="col-md-6">
            &nbsp;
          </div>
          <div className="col-md-6">
            <Button
              color="primary"
              onClick={!toggleSelectMaterialsModal}
              type="button"
              className="next float-right"
            >
              Close
            </Button>
          </div>
        </Row>
      </Modal>
    );
  }

  renderModal() {
    const {
      modal,
      selectedEquipment,
      materialTypeList
      // equipments
    } = this.state;
    let { modalSelectMaterials } = this.state;

    const mats = this.returnSelectedMaterials();

    if (mats.length < 1 && modal && materialTypeList.length > 0) {
      // console.log(367);
      // this.toggleSelectMaterialsModal();
      // modalSelectMaterials = !modalSelectMaterials;
      this.preventModal();
      return false;
      // alert('Please select a material type for this job');
    }

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

  renderNewJobModal() {
    const {
      modalAddJob
    } = this.state;
    return (
      <Modal
        isOpen={modalAddJob}
        toggle={this.toggleAddJobModal}
        className="modal-dialog--primary modal-dialog--header"
      >
        <JobCreatePopup
          toggle={this.toggleAddJobModal}
        />
      </Modal>
    );
  }

  renderBreadcrumb() {
    return (
      <div>
        <button type="button" className="app-link"
                onClick={() => this.handlePageClick('Dashboard')}
        >
          Dashboard
        </button>
        &#62;Find a Truck
        <button type="button" className="app-link"
                onClick={this.toggleNewJobModal}
        >
          ADD A JOB
        </button>
      </div>
    );
  }

  renderTitle() {
    return (
      <Row>
        <Col md={12}>
          <h3 className="page-title">Find a Truck</h3>
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
                  <Row lg={12} style={{ background: '#eef4f8' }}>
                    <Col sm="3" className="filter-item-title">
                      Availability
                    </Col>
                    <Col className="filter-item-title">
                      Truck Type
                    </Col>
                    <Col className="filter-item-title">
                      Min Capacity
                    </Col>
                    <Col className="filter-item-title">
                      Materials
                    </Col>
                    <Col className="filter-item-title">
                      Zip Code
                    </Col>
                    <Col className="filter-item-title">
                      Rate Type
                    </Col>
                  </Row>
                  <Row lg={12} id="filter-input-row">
                    <Col sm="3">
                      <TIntervalDatePicker
                        startDate={startDate}
                        endDate={endDate}
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
                            name: 'truckType',
                            value: filters.truckType
                          }
                        }
                        meta={
                          {
                            touched: false,
                            error: 'Unable to select'
                          }
                        }
                        value={filters.truckType}
                        options={
                          equipmentTypeList.map(equipmentType => ({
                            name: 'truckType',
                            value: equipmentType,
                            label: equipmentType
                          }))
                        }
                        placeholder={equipmentTypeList[0]}
                      />
                    </Col>
                    <Col>
                      <input name="minCapacity"
                             className="filter-text"
                             type="text"
                             placeholder="Min # of tons"
                             value={filters.minCapacity}
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
                        placeholder="Select materials"
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

  renderEquipmentRow(equipment) {
    return (
      <React.Fragment>
        <Row md={12} style={{ width: '100%' }}>
          {/* 100 85 */}
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
              {/* <Col md={6} className="customer-truck-results-title> */}
              {/* Company: {equipment.companyName} */}
              {/* </Col> */}
            </Row>
            {/* <Row style={{borderBottom: '3px solid rgb(199, 221, 232)'}}> */}
            {/* <Col> */}
            {/* TODO needs API for equipment materials */}
            {/* Materials Hauled */}
            {/* </Col> */}
            {/* </Row> */}
            <Row>
              <Col>
                {/* HMA */}
                <br/>
                {/* Stone */}
                <br/>
                {/* Sand */}
                <br/>
              </Col>
              <Col>
                {/* Gravel */}
                <br/>
                {/* Recycling */}
                <br/>
              </Col>
              <Col>
                <Button
                  onClick={() => this.handleEquipmentEdit(equipment.id)}
                  className="primaryButton"
                  style={{ marginTop: '10px' }}
                >
                  Add a Truck
                </Button>
              </Col>
            </Row>
          </Col>
        </Row>
        <hr/>
      </React.Fragment>
    );
  }

  renderEquipmentTable() {
    const {
      sortByList,
      filters,
      equipments
    } = this.state;

    return (
      <Row>
        <Col md={12}>
          <Card>
            <CardBody>
              <Row>
                <Col md={6} id="equipment-display-count">
                  Displaying&nbsp;
                  {equipments.length}
                  &nbsp;of&nbsp;
                  {equipments.length}
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
  }

  render() {
    const { loaded } = this.state;
    if (loaded) {
      return (
        <Container className="dashboard">
          {this.renderModal()}
          {this.renderNewJobModal()}
          {this.renderGoTo()}
          {this.renderBreadcrumb()}
          {this.renderTitle()}
          {this.renderFilter()}
          {/* {this.renderTable()} */}
          {this.renderEquipmentTable()}
        </Container>
      );
    }
    return (
      <div>
        Loading...
      </div>
    );
  }
}

export default TrucksCustomerPage;
