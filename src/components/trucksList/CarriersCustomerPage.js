import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import {
  Button,
  Card,
  CardBody,
  Col,
  Container,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
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
// import TIntervalDatePicker from '../common/TIntervalDatePicker';
import './Truck.css';
import GroupService from '../../api/GroupService';
import GroupListService from '../../api/GroupListService';
import CarrierRow from './CarrierRow';
// import GeoCodingService from '../../api/GeoCodingService';
import GeoUtils from '../../utils/GeoUtils';
import BidService from '../../api/BidService';

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
      // startDate: null,
      // endDate: null,

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
        numEquipments: ''
      },
      reqHandlerZip: {
        touched: false,
        error: ''
      },
      reqHandlerRange: {
        touched: false,
        error: ''
      },
      unfavoriteModal: false,
      selectedGroup: null,
      selectedCarrierId: null
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
    this.toggleUnfavoriteModal = this.toggleUnfavoriteModal.bind(this);
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

    this.setState({
      companyZipCode,
      lastZipCode,
      company,
      address,
      profile,
      loaded: true
    });
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
    this.setState({ filters }, async function search() {
      await this.fetchCarriers();
    });
  }

  retrieveCarrier(equipment) {
    return equipment;
  }

  retrieveAllMaterials() {
    const { materialTypeList } = this.state;
    return materialTypeList;
  }

  async fetchFilterLists() {
    const { filters, materialTypeList, equipmentTypeList, rateTypeList } = this.state;

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
    const { profile } = this.state;

    // we get all groups.companyId that have name 'Favorite'
    const groupsFavorites = await GroupListService.getGroupListsFavorites(profile.companyId);

    carriers.map((carrier) => {
      const newCarrier = carrier;
      newCarrier.favorite = false;
      return newCarrier;
    });

    if (groupsFavorites) {
      // if we find the equipment's companyId in
      // groupsFavorites we favorite it
      carriers.map((carrier) => {
        const newCarrier = carrier;
        if (groupsFavorites.includes(newCarrier.id)) {
          newCarrier.favorite = true;
        }
        return newCarrier;
      });
    }

    this.setState({ carriers });
  }

  convertCarrierEquipmentsToCarrierItems(carrierEquipmentResults) {
    const carriers2 = new Map();
    carrierEquipmentResults.forEach((item) => {
      const key = item.carrierId;
      const collection = carriers2.get(key);
      if (!collection) {
        carriers2.set(key, [item]);
      } else {
        collection.push(item);
      }
    });
    const carriers3 = [];
    carriers2.forEach((carriers2item) => {
      // console.log(carriers2item);
      const carrierItem = {
        id: carriers2item[0].carrierId,
        legalName: carriers2item[0].legalName,
        distance: carriers2item[0].distance,
        carrierMaterials: [],
        equipmentTypes: []
      };
      carriers2item.forEach((carrierEquipment) => {
        const { equipmentType, equipmentMaterial } = carrierEquipment;

        if (carrierItem.equipmentTypes.length <= 0) {
          carrierItem.equipmentTypes.push({
            equipmentType,
            count: 1
          });
        } else {
          let equipmentTypeMatch = false;
          carrierItem.equipmentTypes = carrierItem.equipmentTypes.map((equipmentTypeItem) => {
            const newEquipmentTypeItem = {...equipmentTypeItem};
            if (newEquipmentTypeItem.equipmentType === equipmentType) {
              equipmentTypeMatch = true;
              newEquipmentTypeItem.count += 1;
            }
            return newEquipmentTypeItem;
          });
          if (!equipmentTypeMatch) {
            carrierItem.equipmentTypes.push({
              equipmentType,
              count: 1
            });
          }
        }

        let materialMatch = false;
        carrierItem.carrierMaterials.forEach((carrierMaterialItem) => {
          if (carrierMaterialItem === equipmentMaterial) {
            materialMatch = true;
          }
        }, materialMatch);
        if (!materialMatch) {
          carrierItem.carrierMaterials.push(equipmentMaterial);
        }
      });
      // for (let i = 0; i < carriers2item.length; i += 1) {
      // }
      carriers3.push(carrierItem);
    });
    // console.log(carriers3);
    return carriers3;
  }

  convertCarrierEquipmentsToCarrierItemsV2(carrierEquipmentResults) {
    const { filters } = this.state;
    const carriers2 = new Map();
    const carriers3 = [];
    const carriers4 = [];

    carrierEquipmentResults.forEach((item) => {
      const key = item.carrierId;
      const collection = carriers2.get(key);
      if (!collection) {
        carriers2.set(key, [item]);
      } else {
        collection.push(item);
      }
    });

    carriers2.forEach((carriers2item) => {
      const carrierItem = {
        id: carriers2item[0].carrierId,
        legalName: carriers2item[0].legalName,
        distance: carriers2item[0].distance,
        carrierMaterials: [],
        equipmentTypes: []
      };

      carriers2item.forEach((carrierEquipment) => {
        const { equipmentType, equipmentMaterial, legalName } = carrierEquipment;

        // equipments
        if (carrierItem.equipmentTypes.length <= 0) {
          carrierItem.equipmentTypes.push({
            legalName,
            equipmentType,
            count: 1
          });
        } else {
          let equipmentTypeMatch = false;
          carrierItem.equipmentTypes = carrierItem.equipmentTypes.map((equipmentTypeItem) => {
            const newEquipmentTypeItem = {...equipmentTypeItem};
            if (newEquipmentTypeItem.equipmentType === equipmentType) {
              equipmentTypeMatch = true;
              newEquipmentTypeItem.count += 1;
            }
            return newEquipmentTypeItem;
          });
          if (!equipmentTypeMatch) {
            carrierItem.equipmentTypes.push({
              legalName,
              equipmentType,
              count: 1
            });
          }
        }

        // materials
        carrierItem.carrierMaterials.push(equipmentMaterial);
        // remove duplicates
        carrierItem.carrierMaterials = carrierItem.carrierMaterials.reduce(
          (a, b) => { if (a.indexOf(b) < 0)a.push(b); return a; }, []
        );
      });

      // Join all of the equipment materials for the carrier and make it an array
      const carrierMaterials = carrierItem.carrierMaterials.join(', ').split(', ');
      // remove duplicates
      carrierItem.carrierMaterials = carrierMaterials.filter(
        (item, pos) => carrierMaterials.indexOf(item) === pos
      );

      carriers3.push(carrierItem);
    });

    if (filters.materialType.length > 0) { // if filtering by materials
      carriers3.filter((carrier) => {
        let materialsFoundCount = 0;
        filters.materialType.forEach((material) => {
          carrier.carrierMaterials.forEach((carrierMaterial) => {
            if (material.value === carrierMaterial) {
              materialsFoundCount += 1;
            }
            return false;
          });
        });
        if (materialsFoundCount === filters.materialType.length) {
          carriers4.push(carrier);
        }
        return false;
      });
      return carriers4;
    }

    return carriers3;
  }

  async fetchCarriers() {
    const { lastZipCode, companyZipCode, filters, reqHandlerZip } = this.state;
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
        try {
          // Search for that new zip code's coordinates with Here.com API,
          // had to add 'US' to specify country
          const geoCode = await GeoUtils.getCoordsFromAddress(`${filters.zipCode}, US`);
          filters.companyLatitude = geoCode.lat;
          filters.companyLongitude = geoCode.lng;
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

    const carrierEquipmentResults = await CompanyService.getCarriersByFiltersV2(filters);
    const carriers = this.convertCarrierEquipmentsToCarrierItemsV2(carrierEquipmentResults);
    if (carriers) {
      // NOTE let's try not to use Promise.all and use full api calls
      // Promise.all(

      await this.fetchFavoriteCarriers(carriers); // we fetch what carriers are favorite
      // this.fetchCarrierMaterials(carriers);

      carriers.map((equipment) => {
        const newCarrier = equipment;
        newCarrier.modifiedOn = moment(equipment.modifiedOn)
          .format();
        newCarrier.createdOn = moment(equipment.createdOn)
          .format();
        return newCarrier;
      });
      // this.setState({ carriers });
    }
    this.setState({ lastZipCode: filters.zipCode });
  }

  async handleSelectFilterChange(option) {
    const { value, name } = option;
    const { filters } = this.state;
    filters[name] = value;
    this.setState({ filters });
    await this.fetchCarriers();
  }

  handleMultiChange(data) {
    const { filters } = this.state;
    filters.materialType = data;
    this.setState({
      filters
    }, async function changed() {
      await this.fetchCarriers();
    });
  }

  handleMultiTruckChange(data) {
    const { filters } = this.state;
    filters.equipmentType = data;
    this.setState({
      filters
    }, async function changed() {
      await this.fetchCarriers();
    });
  }

  handlePageClick(menuItem) {
    if (menuItem) {
      this.setState({ [`goTo${menuItem}`]: true });
    }
  }

  async handleUnfavoriteCompany() {
    const { profile, selectedCarrierId, selectedGroup, carriers } = this.state;
    try {
      await GroupListService.deleteGroupListById(selectedGroup.id);
      await GroupService.deleteGroupById(selectedGroup.groupId);
      await BidService
        .updateUnfavoritedCompanyBids(profile.companyId, selectedCarrierId);
    } catch (e) {
      // console.log(e);
    }
    this.fetchFavoriteCarriers(carriers);
    this.toggleUnfavoriteModal(null, null);
  }

  async handleSetFavorite(companyId) {
    const { carriers, profile } = this.state;

    try {
      const group = await GroupListService.getGroupListsByCompanyId(companyId, profile.companyId);

      // we get check for groups.companyId = companyId that have name 'Favorite'
      group.map((item) => {
        if (item.name === 'Favorite') {
          return item.companyId;
        }
        return null;
      });
      // if we got a group with companyId
      if (group.length > 0) { 
        // delete
        this.toggleUnfavoriteModal(group[0], companyId);
      } else { // create "Favorite" Group record
        const groupData = {
          createdBy: profile.userId,
          companyId
        };
        await GroupListService.createFavoriteGroupList(groupData);
        this.fetchFavoriteCarriers(carriers);
      }
    } catch (error) {
      this.setState({ carriers });
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
    const { filters } = this.state;
    filters.startAvailability = e;
    await this.fetchCarriers();
    this.setState({ filters });
  }

  async handleEndDateChange(e) {
    const { filters } = this.state;
    filters.endAvailability = e;
    await this.fetchCarriers();
    this.setState({ filters });
  }

  async handleIntervalInputChange(e) {
    const { filters } = this.state;
    filters.startAvailability = e.start;
    filters.endAvailability = e.end;
    await this.fetchCarriers();
    this.setState({ filters });
  }

  handleFilterChangeDelayed(e) {
    /* const {filters} = this.state;
    filters.name = e.target.value;
    this.setState({filters}, async function search() {
      await this.fetchCarriers();
    }); */
    const self = this;
    const { value } = e.target;
    const { filters, reqHandlerZip, reqHandlerRange } = this.state;
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
    const { value } = e.target;
    const { filters } = this.state;
    filters[e.target.name] = value;
    this.setState({ filters });
    await this.fetchCarriers();
  }

  handleNumChange(e) {
    const { filters } = this.state;
    filters.numEquipments = e.target.value;
    this.setState({ filters }, async function search() {
      await this.fetchCarriers();
    });
    // this.setState({filters});
  }

  toggleAddJobModal() {
    const { modal, filters } = this.state;
    if (modal) {
      // filters.materialType = [];
      this.setState({
        filters
      });
    }
    this.setState({
      modal: !modal
    });
  }

  toggleSelectMaterialsModal() {
    const { modalSelectMaterials } = this.state;
    this.setState({
      modalSelectMaterials: !modalSelectMaterials
    });
  }

  toggleUnfavoriteModal(group, selectedCarrierId) {
    const { unfavoriteModal } = this.state;
    this.setState({
      unfavoriteModal: !unfavoriteModal,
      selectedGroup: group,
      selectedCarrierId
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
      selectedCarrier,
      materialTypeList
      // carriers
    } = this.state;

    const mats = this.returnSelectedMaterials();

    /* if (mats.length < 1 && modal && materialTypeList.length > 0) {
      // this.toggleSelectMaterialsModal();
      // modalSelectMaterials = !modalSelectMaterials;
      // this.preventModal();
      return false;
      // alert('Please select a material type for this job');
    } */

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
        <div className="modal__body" style={{ paddingTop: '25px', paddingRight: '0px' }}>
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
      // startDate,
      // endDate,

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
                <div className="flex-carrier-filters">
                  <div id="materialTypeSelect">
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
                      placeholder="Any"
                      // placeholder={materialTypeList[0]}
                      id="materialTypeSelect"
                      horizontalScroll="true"
                      selectedItems={filters.materialType.length}
                    />
                  </div>
                  <div id="truckTypeSelect">
                    {/* TODO: There will be changes for Truck Type and Number of trucks */}
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
                  </div>
                  <div>
                    <div className="filter-item-title">
                      Number of trucks
                    </div>
                    <input
                      name="numEquipments"
                      type="number"
                      placeholder="Any"
                      value={filters.numEquipments}
                      onChange={this.handleNumChange}
                    />
                  </div>
                  <div>
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
                      placeholder="Any"
                    />
                  </div>
                  <div>
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
                  </div>
                  <div>
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
                  </div>
                  <div>
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
                  </div>
                  {/* <Col md="4">
                    <div className="filter-item-title">
                      Availability
                    </div>
                    <TIntervalDatePicker
                      startDate={startDate}
                      endDate={endDate}
                      name="dateInterval"
                      onChange={this.handleIntervalInputChange}
                      dateFormat='m/d/Y'
                    />
                  </Col> */}
                </div>
                <div className="flex-reverse">
                  <Button
                    onClick={() => this.clear()}
                    className="btn btn-primary"
                  >
                    Reset Filters
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>
        </Col>
      </Row>
    );
  }

  renderUnfavoriteModal() {
    const { unfavoriteModal, selectedFavoriteCompanyId, selectedFavoriteCompanyName } = this.state;
    return (
      <React.Fragment>
        <Modal isOpen={unfavoriteModal} toggle={this.toggleUnfavoriteModal} className="status-modal">
          <ModalHeader toggle={this.toggleModal} style={{ backgroundColor: '#006F53' }} className="text-left">
            <div style={{ fontSize: 16, color: '#FFF' }}>
              Are you sure you want to unfavorite &apos;{selectedFavoriteCompanyName}&apos;?
            </div>
          </ModalHeader>
          <ModalBody className="text-left">
            <p>
              If you do, they will not be able to auto
              accept any currently posted or future jobs that you send to your favorites group.
              They will have to request the job and get your approval.
            </p>
          </ModalBody>
          <ModalFooter>
            <Row>
              <Col md={12} className="text-right">
                <Button color="secondary" onClick={this.toggleUnfavoriteModal}>
                  No, keep as a favorite
                </Button>
                &nbsp;
                <Button
                  color="primary"
                  onClick={() => this.handleUnfavoriteCompany()}
                >
                  Yes, unfavorite
                </Button>
              </Col>
            </Row>
          </ModalFooter>
        </Modal>
      </React.Fragment>
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
                  equipmentTypes={c.equipmentTypes}
                  materials={c.carrierMaterials}
                  setFavorite={() => {
                    this.handleSetFavorite(c.id);
                    this.setState({ selectedFavoriteCompanyName: c.legalName });
                  }}
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
    const { loaded } = this.state;
    if (loaded) {
      return (
        <Container className="dashboard">
          {this.renderUnfavoriteModal()}
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
