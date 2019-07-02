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

import TField from '../common/TField';
import TSelect from '../common/TSelect';
import LookupsService from '../../api/LookupsService';
import JobCreateFormCarrier from '../jobs/JobCreateFormCarrier';

import CompanyService from '../../api/CompanyService';
import AddressService from '../../api/AddressService';
import ProfileService from '../../api/ProfileService';
import MultiSelect from '../common/TMultiSelect';
import TIntervalDatePicker from '../common/TIntervalDatePicker';
import './Truck.css';
import GroupService from '../../api/GroupService';
import GroupListService from '../../api/GroupListService';
import CarrierRow from './CarrierRow';
import GeoCodingService from '../../api/GeoCodingService';

class CarriersCustomerPage extends Component {
  constructor(props) {
    super(props);

    // NOTE: if you update this list you have to update
    // Orion.CarrierDao.filtersOrderByClause
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

      carriers: [],
      selectedCarrier: 0,

      modal: false,
      goToDashboard: false,
      startDate: null,
      endDate: null,

      company: {},
      profile: {},
      address: {},
      companyZipCode: '',
      lastZipCode: '',

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
        sortBy: sortByList[0],
        // carriers custom page
        name: '',
        numEquipments: 0
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
    this.handleCarrierEdit = this.handleCarrierEdit.bind(this);
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
    this.retrieveCarrier = this.retrieveCarrier.bind(this);
    this.handleFilterChangeDelayed = this.handleFilterChangeDelayed.bind(this);
    this.handleNumChange = this.handleNumChange.bind(this);
    this.clear = this.clear.bind(this);
  }

  async componentDidMount() {
    const { filters } = this.state;
    let { companyZipCode, lastZipCode, address, company } = this.state;
    // await this.fetchJobs();
    const profile = await ProfileService.getProfile();
    filters.userId = profile.userId;

    if (profile.companyId) {
      company = await CompanyService.getCompanyById(profile.companyId);
      if (company.addressId) {
        address = await AddressService.getAddressById(company.addressId);
        filters.zipCode = address.zipCode ? address.zipCode : filters.zipCode;
        companyZipCode = address.zipCode ? address.zipCode : 'Any'; // 'default' zipCode
        lastZipCode = address.zipCode ? address.zipCode : 'Any'; // used for comparing while changing the zip code
        filters.companyLatitude = address.latitude;
        filters.companyLongitude = address.longitude;
      }
    }

    this.setState({companyZipCode, lastZipCode, company, address, profile, loaded: true});
    await this.fetchCarriers();
    await this.fetchFilterLists();
  }

  clear() {
    const { address } = this.state;
    const filters = {
      startAvailability: null,
      endAvailability: null,
      searchType: 'Customer Truck',
      userId: '',
      equipmentType: [],
      minCapacity: '',
      // materialType: '',
      materialType: [],
      zipCode: address.zipCode,
      range: 50,
      rateType: '',
      currentAvailability: 1,
      // carriers custom page
      name: '',
      numEquipments: 0
    };
    this.setState({filters}, async function search() {
      await this.fetchCarriers();
    });
  }

  retrieveCarrier(equipment) {
    return equipment;
  }

  retrieveAllMaterials() {
    const {materialTypeList} = this.state;
    return materialTypeList;
  }

  async fetchFilterLists() {
    const {filters, materialTypeList, equipmentTypeList, rateTypeList} = this.state;

    // TODO need to refactor above to do the filtering on the Orion
    // LookupDao Hibernate side

    /**/
    const lookupCarrierList = await LookupsService.getLookupsByType('CarrierType');
    Object.values(lookupCarrierList)
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

    const lookupEquipmentList = await LookupsService.getLookupsByType('EquipmentType');
    Object.values(lookupEquipmentList)
      .forEach((itm) => {
        if (itm.val1 !== 'Any') equipmentTypeList.push(itm.val1);
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

  async fetchFavoriteCarriers(carriers) {
    // we get all groups.companyId that have name 'Favorite'
    const groupsFavorites = await GroupListService.getGroupListsFavorites();

    if (groupsFavorites) {
      // if we find the equipment's companyId in
      // groupsFavorites we favorite it
      carriers.map((carrier) => {
        const newCarrier = carrier;
        if (groupsFavorites.includes(newCarrier.id)) {
          newCarrier.favorite = true;
        } else {
          newCarrier.favorite = false;
        }
        return newCarrier;
      });
      this.setState({carriers});
    }
  }

  async fetchCarriers() {
    const {lastZipCode, companyZipCode, filters, reqHandlerZip} = this.state;
    let { company, address, profile } = this.state;
    // const carriers = await CarrierService.getCarrierByFiltersCarrier(filters);

    if (!profile) {
      profile = await ProfileService.getProfile();
      if (!company) {
        company = await CompanyService.getCompanyById(profile.companyId);
        if (!address) {
          address = await AddressService.getAddressById(company.addressId);
        }
      }
    }

    // if we are changing the zip code
    // or we don't have any coordinates on our db
    if ((lastZipCode !== filters.zipCode) || !filters.companyLatitude) {
      if (filters.zipCode.length > 0 && (companyZipCode !== filters.zipCode)) {
        try { // Search for that new zip code's coordinates with MapBox API
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
      } else {
        // if the zipCode filter is empty, or it is the same as the initial code,
        // default the coordinates to user's address
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

    const carriers = await CompanyService.getCarriersByFilters(filters);

    if (carriers) {
      // NOTE let's try not to use Promise.all and use full api calls
      // Promise.all(

      this.fetchFavoriteCarriers(carriers); // we fetch what carriers are favorite
      // this.fetchCarrierMaterials(carriers);

      carriers.map((equipment) => {
        const newCarrier = equipment;
        newCarrier.modifiedOn = moment(equipment.modifiedOn)
          .format();
        newCarrier.createdOn = moment(equipment.createdOn)
          .format();
        return newCarrier;
      });
      this.setState({carriers});
    }
    this.setState({lastZipCode: filters.zipCode});
  }

  async handleSelectFilterChange(option) {
    const {value, name} = option;
    const {filters} = this.state;
    filters[name] = value;
    this.setState({filters});
    await this.fetchCarriers();
  }

  handleMultiChange(data) {
    const {filters} = this.state;
    filters.materialType = data;
    this.setState({
      filters
    }, async function changed() {
      await this.fetchCarriers();
    });
  }

  handleMultiTruckChange(data) {
    const {filters} = this.state;
    filters.equipmentType = data;
    this.setState({
      filters
    }, async function changed() {
      await this.fetchCarriers();
    });
  }

  handlePageClick(menuItem) {
    if (menuItem) {
      this.setState({[`goTo${menuItem}`]: true});
    }
  }

  async handleSetFavorite(companyId) {
    const {carriers} = this.state;

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
      this.fetchFavoriteCarriers(carriers);
    } catch (error) {
      this.setState({carriers});
    }
  }

  handleCarrierEdit(selectedCarrier) {
    this.setState({
      selectedCarrier,
      modal: true
    });
    return true;
  }

  async handleStartDateChange(e) {
    const {filters} = this.state;
    filters.startAvailability = e;
    await this.fetchCarriers();
    this.setState({filters});
  }

  async handleEndDateChange(e) {
    const {filters} = this.state;
    filters.endAvailability = e;
    await this.fetchCarriers();
    this.setState({filters});
  }

  async handleIntervalInputChange(e) {
    const {filters} = this.state;
    filters.startAvailability = e.start;
    filters.endAvailability = e.end;
    await this.fetchCarriers();
    this.setState({filters});
  }

  handleFilterChangeDelayed(e) {
    /* const {filters} = this.state;
    filters.name = e.target.value;
    this.setState({filters}, async function search() {
      await this.fetchCarriers();
    }); */
    const self = this;
    const {value} = e.target;
    const {filters, reqHandlerZip, reqHandlerRange} = this.state;
    const filter = e.target.name;
    let invalidZip = false;
    let invalidRange = false;

    if (self.state.typingTimeout) {
      clearTimeout(self.state.typingTimeout);
    }

    if (filter === 'zipCode') {
      this.setState({
        reqHandlerZip: {
          ...reqHandlerZip,
          touched: false
        }
      });
      invalidZip = false;
    }

    if (filter === 'range' && (value.length > 3 || value < 0)) {
      this.setState({
        reqHandlerRange: {
          ...reqHandlerRange,
          error: 'Range can not be more than 999 and less than 0',
          touched: true
        }
      });
      invalidRange = true;
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
          await this.fetchCarriers();
        }
      }, 1000),
      filters
    });
    // this.setState({filters});
  }

  async handleFilterChange(e) {
    const {value} = e.target;
    const {filters} = this.state;
    filters[e.target.name] = value;
    this.setState({filters});
    await this.fetchCarriers();
  }

  handleNumChange(e) {
    const {filters} = this.state;
    filters.numEquipments = e.target.value;
    this.setState({filters}, async function search() {
      await this.fetchCarriers();
    });
    // this.setState({filters});
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
      selectedCarrier,
      materialTypeList
      // carriers
    } = this.state;

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
      >
        <div className="modal__header">
          <button type="button" className="lnr lnr-cross modal__close-btn"
                  onClick={this.toggleAddJobModal}
          />
          <div className="bold-text modal__title">Job Request</div>
        </div>
        <div className="modal__body" style={{padding: '25px 25px 20px 25px'}}>
          <JobCreateFormCarrier
            selectedCarrierId={selectedCarrier}
            closeModal={this.toggleAddJobModal}
            selectedMaterials={this.returnSelectedMaterials}
            // getAllMaterials={this.retrieveAllMaterials}
          />
        </div>
      </Modal>
    );
  }

  renderTitle() {
    return (
      <Row>
        <Col md={12}>
          <h3 className="page-title">Carrier Search</h3>
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
      companyZipCode,
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
                    <Col md="4" id="materialTypeSelect">
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
                        placeholder="Any"
                        id="truckTypeSelect"
                        horizontalScroll="true"
                        selectedItems={filters.equipmentType.length}
                      />
                    </Col>
                    <Col md="2">
                      <div className="filter-item-title">
                        Number of trucks
                      </div>
                      <input
                        name="numEquipments"
                        type="number"
                        placeholder="#"
                        value={filters.numEquipments}
                        onChange={this.handleNumChange}
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
                        Zip Code
                      </div>
                      <TField
                        input={
                          {
                            onChange: this.handleFilterChangeDelayed,
                            name: 'zipCode',
                            value: filters.zipCode
                          }
                        }
                        meta={reqHandlerZip}
                        className="filter-text"
                        placeholder={companyZipCode}
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
                            onChange: this.handleFilterChangeDelayed,
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

                <Col lg={12}>
                  <Row lg={12} id="filter-input-row">
                    <Col md="4">
                      <div className="filter-item-title">
                        Search by name
                      </div>
                      <input
                        name="name"
                        type="text"
                        placeholder="Name"
                        value={filters.name}
                        onChange={this.handleFilterChangeDelayed}
                      />
                    </Col>
                    <Col md="4">
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
                    <Col md="4" className="">
                      <Button
                        onClick={() => this.clear()}
                        className="btn btn-primary float-right mt-20"
                        styles="margin:0px !important"
                      >
                        Reset Filters
                      </Button>
                    </Col>
                  </Row>
                </Col>

              </form>
            </CardBody>
          </Card>
        </Col>
      </Row>
    );
  }

  renderCarrierTable() {
    const {
      sortByList,
      filters,
      carriers
    } = this.state;

    
    return (
      <Container>
        <Card>
          <CardBody>
            <Row className="truck-card">
              <Col md={6} id="equipment-display-count">
                Displaying&nbsp;
                {carriers.length}
                &nbsp;of&nbsp;
                {carriers.length}
              </Col>
              <Col md={6}>
                <Row>
                  {/*
                  <Col md={6} id="sortby">Sort By</Col>
                  */}
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
            {/**/
              carriers.map(c => (
                <CarrierRow
                  key={c.id}
                  carrierId={c.id}
                  carrierName={c.legalName}
                  favorite={c.favorite}
                  setFavorite={() => this.handleSetFavorite(c.id)}
                  requestEquipment={() => this.handleCarrierEdit(c.id)}
                  distance={c.distance}
                />
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
          <div>
            {this.renderFilter()}
            {/* {this.renderTable()} */}
            {this.renderCarrierTable()}
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

export default CarriersCustomerPage;