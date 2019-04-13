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
// import classnames from 'classnames';
import moment from 'moment';
// import { Select } from '@material-ui/core';
import NumberFormat from 'react-number-format';
import TSelect from '../common/TSelect';

import EquipmentService from '../../api/EquipmentService';
import LookupsService from '../../api/LookupsService';
import JobCreateForm from '../jobs/JobCreateForm';
// import truckImage from '../../img/belly-dump.jpg';
import truckImage from '../../img/default_truck.png';
import truckImage from '../../img/belly-dump.jpg';
import CompanyService from '../../api/CompanyService';
import AddressService from '../../api/AddressService';
import ProfileService from '../../api/ProfileService';
// import JobMaterialsService from '../../api/JobMaterialsService';
// import JobsService from '../../api/JobsService';
// import AgentService from '../../api/AgentService';
import MultiSelect from '../common/TMultiSelect';
import TIntervalDatePicker from '../common/TIntervalDatePicker';
import './Truck.css';
import GroupService from '../../api/GroupService';
import GroupListService from '../../api/GroupListService';

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
      goToDashboard: false,
      startDate: null,
      endDate: null,

      // TODO: Refactor to a single filter object
      // Filter values
      filters: {
        startAvailability: null,
        endAvailability: null,
        equipmentType: '',
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
    this.setState({loaded: true});
  }

  retrieveAllMaterials() {
    const {materialTypeList} = this.state;
    return materialTypeList;
  }

  async fetchFilterLists() {
    const {filters, materialTypeList, equipmentTypeList, rateTypeList} = this.state;
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

  async fetchFavoriteEquipments(equipments) {
    // we get all groups.companyId that have name 'Favorite'
    const groupsFavorites = await GroupListService.getGroupListsFavorites();

    if (groupsFavorites) {
      // if we find the equipment's companyId in
      // groupsFavorites we favorite it
      equipments.map((equipment) => {
        const newEquipment = equipment;
        if (groupsFavorites.includes(newEquipment.companyId)) {
          newEquipment.favorite = true;
        } else {
          newEquipment.favorite = false;
        }
        return newEquipment;
      });
      this.setState({equipments});
    }
  }

  async fetchEquipments() {
    const {filters} = this.state;
    const equipments = await EquipmentService.getEquipmentByFilters(filters);

    if (equipments) {
      // NOTE let's try not to use Promise.all and use full api calls
      // Promise.all(

      this.fetchFavoriteEquipments(equipments); // we fetch what equipments are favorite
      this.fetchEquipmentMaterials(equipments);

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
      this.setState({equipments});
    }
  }

  async handleFilterChange(e) {
    const {value} = e.target;
    const {filters} = this.state;
    filters[e.target.name] = value;
    await this.fetchEquipments();
    this.setState({filters});
  }

  async handleSelectFilterChange(option) {
    const {value, name} = option;
    const {filters} = this.state;
    filters[name] = value;
    await this.fetchEquipments();
    this.setState({filters});
  }

  handleMultiChange(data) {
    const {filters} = this.state;
    filters.materialType = data;
    this.setState({
      filters
    }, async function changed() {
      await this.fetchEquipments();
    });
  }

  handlePageClick(menuItem) {
    if (menuItem) {
      this.setState({[`goTo${menuItem}`]: true});
    }
  }

  async handleSetFavorite(companyId) {
    const {equipments} = this.state;

    try {
      const group = await GroupListService.getGroupListsByCompanyId(companyId);
      const profile = await ProfileService.getProfile();

      // we get check for groups.companyId = companyId that have name 'Favorite'
      group.map((item) => {
        if (item.name === 'Favorite') {
          return item.companyId;
        }
        return null;
      });

      // if we got a group with companyId
      if (group.length > 0) { // delete
        // first we delete the Group List
        await GroupListService.deleteGroupListById(group[0].groupId);
        // then the Group
        await GroupService.deleteGroupById(group[0].id);
      } else { // create "Favorite" Group record
        const groupData = {
          createdBy: profile.userId,
          companyId
        };
        await GroupListService.createFavoriteGroupList(groupData);
      }
      this.fetchFavoriteEquipments(equipments);
    } catch (error) {
      this.setState({equipments});
    }
  }

  handleEquipmentEdit(id) {
    const {equipments, filters} = this.state;

    const [selectedEquipment] = equipments.filter((equipment) => {
      if (id === equipment.id) {
        return equipment;
      }
      return false;
    }, id);
    // prevent dialog if no selected materials
    if (filters.materialType.length === 0) {
      const hauledMaterials = selectedEquipment.materials.match(/[^\r\n]+/g);
      const options = [];
      hauledMaterials.forEach((material) => {
        const m = {
          label: material,
          name: 'materialType',
          value: material
        };
        options.push(m);
      });
      filters.materialType = options;
      // alert('Please select a some materials');
      // return false;
    }
    this.setState({
      selectedEquipment,
      modal: true
    });
    return true;
  }

  async handleStartDateChange(e) {
    const {filters} = this.state;
    filters.startAvailability = e;
    await this.fetchEquipments();
    this.setState({filters});
  }

  async handleEndDateChange(e) {
    const {filters} = this.state;
    filters.endAvailability = e;
    await this.fetchEquipments();
    this.setState({filters});
  }

  async handleIntervalInputChange(e) {
    const {filters} = this.state;
    filters.startAvailability = e.start;
    filters.endAvailability = e.end;
    await this.fetchEquipments();
    this.setState({filters});
  }

  toggleAddJobModal() {
    const {modal, filters} = this.state;
    if (modal) {
      filters.materialType = [];
      this.setState({
        filters
      });
    }
    this.setState({
      modal: !modal
    });
  }

  toggleSelectMaterialsModal() {
    const {modalSelectMaterials} = this.state;
    this.setState({
      modalSelectMaterials: !modalSelectMaterials
    });
  }

  returnSelectedMaterials() {
    const {filters} = this.state;
    return filters.materialType;
  }

  preventModal() {
    this.setState({modal: false});
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
        <div className="modal__body" style={{padding: '25px 25px 20px 25px'}}>
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
    // let { modalSelectMaterials } = this.state;

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
        className="modal-dialog--primary modal-dialog--header form"
      >
        <div className="modal__header">
          <button type="button" className="lnr lnr-cross modal__close-btn"
                  onClick={this.toggleAddJobModal}
          />
          <div className="bold-text modal__title">Job Request</div>
        </div>
        <div className="modal__body" style={{padding: '25px 25px 20px 25px'}}>
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
          <h3 className="page-title">Truck Search</h3>
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
                  <Row lg={12} id="filter-input-row">
                    <Col>
                      <div className="filter-item-title">
                        Availability
                      </div>
                      <TIntervalDatePicker
                        startDate={startDate}
                        endDate={endDate}
                        name="dateInterval"
                        onChange={this.handleIntervalInputChange}
                        dateFormat="MM/dd/yy"
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
                        placeholder="Select materials"
                      />
                    </Col>
                    <Col>
                      <div className="filter-item-title">
                        Min Capacity
                      </div>
                      <input name="minCapacity"
                             className="filter-text"
                             type="text"
                             placeholder="Min # of tons"
                             value={filters.minCapacity}
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
    let imageTruck = '';

    // checking if there's an image for the truck
    if ((equipment.image).trim()) { // use of trim removes whitespace from img url
      imageTruck = equipment.image;
    } else {
      imageTruck = `${window.location.origin}/${truckImage}`;
    }

    return (
      <React.Fragment>
        <Row className="truck-card truck-details">
          <div className="col-md-12">
            <div className="row">
              <div className="col-md-3">
                <img width="100%" src={`${window.location.origin}/${truckImage}`} alt=""
                     styles="background-size:contain;"
                />
              </div>
              <div className="col-md-9">
                <div className="row truck-card">
                  <div className="col-md-9">
                    <h3 className="subhead">
                      {equipment.name} | {equipment.type} | <NumberFormat
                      value={equipment.maxCapacity}
                      displayType="text"
                      decimalSeparator="."
                      decimalScale={0}
                      fixedDecimalScale
                      thousandSeparator
                      prefix=" "
                      suffix=" Tons"
                    />
                    </h3>
                  </div>
                  <div className="col-md-3 button-card">
                    <Button
                      onClick={() => this.handleEquipmentEdit(equipment.id)}
                      className="btn btn-primary"
                      styles="margin:0px !important"
                    >
                      Request
                    </Button>
                    <Button
                      color="link"
                      onClick={() => this.handleSetFavorite(equipment.companyId)}
                      className="material-icons favoriteIcon"
                    >
                      {equipment.favorite ? 'favorite' : 'favorite_border'}
                    </Button>
                  </div>
                </div>
                <div className="row truck-card">
                  <div className="col-md-6">
                    <h3 className="subhead">Rates</h3>
                    <Row>
                      {(equipment.rateType === 'Both' || equipment.rateType === 'Hour') && (
                        <React.Fragment>
                          <div className="col-md-6">
                            Hourly Rate:
                          </div>
                          <div className="col-md-6">
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
                          </div>
                        </React.Fragment>
                      )}
                    </Row>
                    <Row>
                      <div className="col-md-6">
                        Hourly Minimum:
                      </div>
                      <div className="col-md-6">
                        <NumberFormat
                          value={equipment.minHours}
                          displayType="text"
                          decimalSeparator="."
                          decimalScale={2}
                          fixedDecimalScale
                          thousandSeparator
                          suffix=" hours min"
                        />
                      </div>
                    </Row>
                    {(equipment.rateType === 'Both' || equipment.rateType === 'Ton') && (
                      <React.Fragment>
                        <div className="row">
                          <div className="col-md-6">
                            Rate per Ton:
                          </div>
                          <div className="col-md-6">
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
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-md-6">
                            Minimum Tonnage Capacity:
                          </div>
                          <div className="col-md-6">
                            <NumberFormat
                              value={equipment.minCapacity}
                              displayType="text"
                              decimalSeparator="."
                              decimalScale={2}
                              fixedDecimalScale
                              thousandSeparator
                              suffix=" tons min"
                            />
                          </div>
                        </div>
                      </React.Fragment>
                    )}
                  </div>
                  <div className="col-md-6">
                    <h3 className="subhead">
                      Materials
                    </h3>
                    {equipment.materials ? equipment.materials.replace(/\n/g, ", ") : "Undefined"}
                  </div>
                </div>
              </div>
            </div>
          </div>
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
      <Container>
        <Card>
          <CardBody>
            <Row className="truck-card">
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
              <hr/>
            </Row>
            {
              equipments.map(equipment => (
                <React.Fragment key={equipment.id}>
                  {this.renderEquipmentRow(equipment)}
                </React.Fragment>
              ))
            }
          </CardBody>
        </Card>
      </Container>
    );
  }

  render() {
    const {loaded} = this.state;
    if (loaded) {
      return (
        <Container className="dashboard">
          {this.renderModal()}
          {this.renderGoTo()}
          {this.renderTitle()}
          <div className="truck-container">
            {this.renderFilter()}
            {/* {this.renderTable()} */}
            {this.renderEquipmentTable()}
          </div>
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
