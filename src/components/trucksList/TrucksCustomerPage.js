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
import truckImage from '../../img/default_truck.png';
// import truckImage from '../../img/belly-dump.jpg';
import CompanyService from '../../api/CompanyService';
import AddressService from '../../api/AddressService';
import ProfileService from '../../api/ProfileService';
import MultiSelect from '../common/TMultiSelect';
import TIntervalDatePicker from '../common/TIntervalDatePicker';
import './Truck.css';
import GroupService from '../../api/GroupService';
import GroupListService from '../../api/GroupListService';
import EquipmentRow from './EquipmentRow';
import TFieldNumber from '../common/TFieldNumber';
import TField from '../common/TField';
// import GeoCodingService from '../../api/GeoCodingService';

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
        searchType: 'Customer Truck',
        userId: '',
        equipmentType: [],
        minCapacity: '',
        // materialType: '',
        materialType: [],
        zipCode: '',
        range: 50,
        rateType: '',
        currentAvailability: 1,
        sortBy: sortByList[0]
      },

      reqHandlerZip: {
        touched: false,
        error: ''
      },
      reqHandlerRange: {
        touched: false,
        error: ''
      }
    };

    this.renderGoTo = this.renderGoTo.bind(this);
    this.handleEquipmentEdit = this.handleEquipmentEdit.bind(this);
    this.toggleAddJobModal = this.toggleAddJobModal.bind(this);
    this.toggleSelectMaterialsModal = this.toggleSelectMaterialsModal.bind(this);
    this.retrieveAllMaterials = this.retrieveAllMaterials.bind(this);
    this.handleFilterChange = this.handleFilterChange.bind(this);
    this.handleSelectFilterChange = this.handleSelectFilterChange.bind(this);
    this.handleStartDateChange = this.handleStartDateChange.bind(this);
    this.handleEndDateChange = this.handleEndDateChange.bind(this);
    this.handleMultiChange = this.handleMultiChange.bind(this);
    this.handleMultiTruckChange = this.handleMultiTruckChange.bind(this);
    this.handleIntervalInputChange = this.handleIntervalInputChange.bind(this);
    this.returnSelectedMaterials = this.returnSelectedMaterials.bind(this);
  }

  async componentDidMount() {
    const { filters } = this.state;
    let { address, company } = this.state;
    // await this.fetchJobs();
    const profile = await ProfileService.getProfile();
    filters.userId = profile.userId;

    if (profile.companyId) {
      company = await CompanyService.getCompanyById(profile.companyId);
      if (company.addressId) {
        address = await AddressService.getAddressById(company.addressId);
        filters.zipCode = address.zipCode ? address.zipCode : filters.zipCode;
        filters.companyLatitude = address.latitude;
        filters.companyLongitude = address.longitude;
      }
    }

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
        if (itm.val1 !== 'Any') equipmentTypeList.push(itm.val1);
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

    [filters.equipments] = equipmentTypeList;
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
    const { filters, reqHandlerZip} = this.state;
    let { company, address, profile } = this.state;

    if (!profile) {
      profile = await ProfileService.getProfile();
      if (!company) {
        company = await CompanyService.getCompanyById(profile.companyId);
        if (!address) {
          address = await AddressService.getAddressById(company.addressId);
        }
      }
    }

    // if the filter zip code is not the same as the initial zip code (company's
    // zip code) or we don't have any coordinates on our db
    // we search for that zip code coordinates with MapBox API
    if ((address.zipCode !== filters.zipCode) || !filters.companyLatitude) {
      if (filters.zipCode.length > 0) {
        /*
        try {
          const geoLocation = await GeoCodingService.getGeoCode(filters.zipCode);
          filters.companyLatitude = geoLocation.features[0].center[1];
          filters.companyLongitude = geoLocation.features[0].center[0];
        } catch (e) {
          this.setState({
            reqHandlerZip: {
              ...reqHandlerZip,
              error: 'Invalid US Zip Code',
              touched: true
            }
          });
        }
        */
        this.setState({
          reqHandlerZip: {
            ...reqHandlerZip,
            error: 'Invalid US Zip Code',
            touched: true
          }
        });
      } else { // if the zipCode filter is empty, default the coordinates to user's address
        filters.companyLatitude = address.latitude;
        filters.companyLongitude = address.longitude;
        this.setState({
          reqHandlerZip: {
            ...reqHandlerZip,
            touched: false
          }
        });
      }
    }

    const equipments = await EquipmentService.getEquipmentByFilters(filters);

    if (equipments) {
      // NOTE let's try not to use Promise.all and use full api calls
      // Promise.all(

      this.fetchFavoriteEquipments(equipments); // we fetch what equipments are favorite
      // this.fetchEquipmentMaterials(equipments);

      equipments.map((equipment) => {
        const newEquipment = equipment;
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
    const self = this;
    let {value} = e.target;
    const {filters, reqHandlerZip, reqHandlerRange} = this.state;
    const filter = e.target.name;
    let invalidZip = false;
    let invalidRange = false;

    if (self.state.typingTimeout) {
      clearTimeout(self.state.typingTimeout);
    }

    if (filter === 'zipCode' && (value.length !== 5)) {
      this.setState({
        reqHandlerZip: {
          ...reqHandlerZip,
          error: 'Please enter a valid 5-digit Zip Code',
          touched: true
        }
      });
      invalidZip = true;
    } else {
      this.setState({
        reqHandlerZip: {
          ...reqHandlerZip,
          touched: false
        }
      });
      invalidZip = false;
    }

    if (filter === 'range' && (value > 999 || value < 0 || value.length === 0)) {
      value = '999';
      // this.setState({
      //   reqHandlerRange: {
      //     ...reqHandlerRange,
      //     error: 'Range can not be more than 999 and less than 0',
      //     touched: true
      //   }
      // });
      // invalidRange = true;
    } else {
      this.setState({
        reqHandlerRange: {
          ...reqHandlerRange,
          touched: false
        }
      });
      invalidRange = false;
    }

    filters[e.target.name] = value;

    self.setState({
      typing: false,
      typingTimeout: setTimeout(async () => {
        if (!invalidZip && !invalidRange) {
          await this.fetchEquipments();
        }
      }, 1000),
      filters
    });
    // await this.fetchEquipments();
  }

  async handleSelectFilterChange(option) {
    const {value, name} = option;
    const {filters} = this.state;
    filters[name] = value;
    this.setState({filters});
    await this.fetchEquipments();
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

  handleMultiTruckChange(data) {
    const {filters} = this.state;
    filters.equipmentType = data;
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
      const group = await GroupListService.getGroupListsByCompanyIdName(companyId);
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
        await GroupListService.deleteGroupListById(group[0].id);
        // then the Group
        await GroupService.deleteGroupById(group[0].groupId);
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
        backdrop="static"
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
        backdrop="static"
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
      filters,

      reqHandlerZip,
      reqHandlerRange

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
                        Availability
                      </div>
                      <TIntervalDatePicker
                        startDate={startDate}
                        endDate={endDate}
                        name="dateInterval"
                        onChange={this.handleIntervalInputChange}
                        dateFormat="m/d/Y"
                      />
                    </Col>
                    <Col md="2" id="truckTypeSelect">
                      <div className="filter-item-title">
                        Truck Type
                      </div>
                      <MultiSelect
                        input={
                          {
                            onChange: this.handleMultiTruckChange,
                            // onChange: this.handleSelectFilterChange,
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
                        options={
                          equipmentTypeList.map(equipmentType => ({
                            name: 'equipmentType',
                            value: equipmentType.trim(),
                            label: equipmentType.trim()
                          }))
                        }
                        // placeholder="Materials"
                        placeholder="Any"
                        id="truckTypeSelect"
                        horizontalScroll="true"
                        selectedItems={filters.equipmentType.length}
                      />
                    </Col>
                    <Col md="2">
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
                    <Col md="1">
                      <div className="filter-item-title">
                        Min Capacity
                      </div>
                      <TFieldNumber
                        className="filter-text"
                        input={
                          {
                            onChange: this.handleFilterChange,
                            name: 'minCapacity',
                            value: filters.minCapacity
                          }
                        }
                        placeholder="# of tons"
                        decimal
                        // meta={reqHandlerMinRate}
                      />
                    </Col>
                    <Col md="3" id="materialTypeSelect">
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
                        id="materialTypeSelect"
                        horizontalScroll="true"
                        selectedItems={filters.materialType.length}
                      />
                    </Col>
                    <Col md="1">
                      <div className="filter-item-title">
                        Zip Code
                      </div>
                      <TField
                        input={
                          {
                            onChange: this.handleFilterChange,
                            name: 'zipCode',
                            value: filters.zipCode
                          }
                        }
                        meta={reqHandlerZip}
                        className="filter-text"
                        placeholder="Any"
                        type="number"
                      />
                    </Col>
                    <Col md="1">
                      <div className="filter-item-title">
                        Range (mi)
                      </div>
                      <TField
                        input={
                          {
                            onChange: this.handleFilterChange,
                            name: 'range',
                            value: filters.range
                          }
                        }
                        meta={reqHandlerRange}
                        className="filter-text"
                        placeholder="Any"
                        type="number"
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
                <EquipmentRow
                  id={equipment.id}
                  companyId={equipment.companyId}
                  favorite={equipment.favorite}
                  rateType={equipment.rateType}
                  hourRate={equipment.hourRate}
                  minHours={equipment.minHours}
                  minCapacity={equipment.minCapacity}
                  image={equipment.image}
                  maxCapacity={equipment.maxCapacity}
                  type={equipment.type}
                  key={equipment.id}
                  tonRate={equipment.tonRate}
                  name={equipment.name}
                  materials={equipment.materials}
                  setFavorite={() => this.handleSetFavorite(equipment.companyId)}
                  requestEquipment={() => this.handleEquipmentEdit(equipment.id)}
                  distance={equipment.distance}
                />
              ))
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
      <Container className="container">
        <Row>
          <Col md={12}>
            <h3 className="page-title">Truck Search</h3>
          </Col>
        </Row>
        {this.renderLoader()}
      </Container>
    );
  }
}

export default TrucksCustomerPage;
