/* eslint-disable no-multiple-empty-lines,
no-trailing-spaces,
object-curly-spacing,
no-unused-vars,
spaced-comment,
react/jsx-closing-bracket-location,
semi, quotes, no-empty,
react/no-string-refs, indent,
prefer-const, comma-dangle, padded-blocks,
react/jsx-one-expression-per-line,
space-before-function-paren,
keyword-spacing, no-multi-spaces */
import React, {Component} from 'react';
import {
  Button,
  ButtonToolbar,
  Card,
  CardBody,
  Col,
  Row
} from 'reactstrap';
import * as PropTypes from 'prop-types';
import moment from 'moment';
import CloneDeep from 'lodash.clonedeep';
import TField from '../common/TField';
import TFieldNumber from '../common/TFieldNumber';
import TSelect from '../common/TSelect';
import TIntervalDatePicker from '../common/TIntervalDatePicker';
import TMultiSelect from '../common/TMultiSelect';
import AddressService from '../../api/AddressService';
import CompanyService from '../../api/CompanyService';
import ReportsService from '../../api/ReportsService';
import LookupsService from '../../api/LookupsService';
import ProfileService from '../../api/ProfileService';
import GeoUtils from '../utils/GeoUtils';
import './Filters.css';

class DailyReportFilter extends Component {
  constructor(props) {
    super(props);

    this.timeRanges = [
      {
        name: 'Custom',
        value: 0
      },
      {
        name: 'Last Week',
        value: 7
      },
      {
        name: 'Last 30 days',
        value: 30
      },
      {
        name: 'Last 60 days',
        value: 60
      },
      {
        name: 'Last 90 days',
        value: 90
      }
      // { name: 'Next Week', value: -7 },
      // { name: 'Next 30 days', value: -30 },
      // { name: 'Next 60 days', value: -60 },
      // { name: 'Next 90 days', value: -90 }
    ];

    this.timeRangesComp = [
      {
        name: 'Custom',
        value: 0
      },
      {
        name: 'Previous Week',
        value: 7
      },
      {
        name: 'Previous 30 days',
        value: 30
      },
      {
        name: 'Previous 60 days',
        value: 60
      },
      {
        name: 'Previous 90 days',
        value: 90
      }
      // { name: 'Next Week', value: -7 },
      // { name: 'Next 30 days', value: -30 },
      // { name: 'Next 60 days', value: -60 },
      // { name: 'Next 90 days', value: -90 }
    ];

    // NOTE: if you update this list you have to update
    // Orion.EquipmentDao.filtersOrderByClause
    const sortByList = ['Hourly ascending', 'Hourly descending',
      'Tonnage ascending', 'Tonnage descending'];

    // the sunday from last week
    const startDate = moment().subtract(30, 'days').hours(0)
      .minutes(0)
      .seconds(0)
      .toDate();

    // the saturday from next week
    const endDate = moment().hours(0)
      .minutes(0)
      .seconds(0)
      .toDate();

    // Comment
    this.state = {
      // Look up lists
      equipmentTypeList: [],
      materialTypeList: [],
      rateTypeList: [],
      statesTypeList: [], // this is the full list of states
      statusTypeList: [],
      companiesTypelist: [],
      intervals: {
        startInterval: startDate,
        endInterval: endDate
      },
      address: {},
      company: {},
      profile: {},
      companyZipCode: '',
      lastZipCode: '',
      loaded: false,
      selectIndex: 0, // Parameter for setting the dropdown default option.
      selectedRange: 0, // Parameter for setting startDate.
      selectIndexComp: 3, // Parameter for setting the dropdown default option.
      selectedRangeComp: 0, // Parameter for setting startDate.
      companyType: '',

      // TODO: Refactor to a single filter object
      // Filter defaults
      filters: {
        companies: [],
        states: [],
        zipCode: '',
        range: 500,

        statuses: [],
        materials: [],
        equipments: [], //this one is missing in orion
        rateTypes: [],
        rate: 0,
        truckTypes: [],
        timeRange: 0,
        startAvailability: startDate,
        endAvailability: endDate,
        page: 0,
        rows: 10,
        companyLatitude: 30.356855,
        companyLongitude: -97.737251,
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

    this.handleFilterChange = this.handleFilterChange.bind(this);
    this.handleSelectFilterChange = this.handleSelectFilterChange.bind(this);
    this.handleMultiChange = this.handleMultiChange.bind(this);
    this.handleMultiTruckChange = this.handleMultiTruckChange.bind(this);
    this.handleIntervalInputChange = this.handleIntervalInputChange.bind(this);
    this.handleFilterChangeDelayed = this.handleFilterChangeDelayed.bind(this);
    this.handleResetFilters = this.handleResetFilters.bind(this);
    this.handleRangeFilterChange = this.handleRangeFilterChange.bind(this);

    this.getUTCStartInterval = this.getUTCStartInterval.bind(this);
    this.getUTCEndInterval = this.getUTCEndInterval.bind(this);
  }

  async componentDidMount() {
    const {intervals, selectIndex, selectIndexComp} = {...this.state};
    let {
      companyZipCode,
      lastZipCode,
      address,
      company,
      filters,
      selectedRange,
      selectedRangeComp
    } = {...this.state};
    const profile = await ProfileService.getProfile();
    filters.userId = profile.userId;

    const startAv = new Date(intervals.startInterval);
    const endAv = new Date(intervals.endInterval);
    filters.startAvailability = this.getUTCStartInterval(startAv);
    filters.endAvailability = this.getUTCEndInterval(endAv);
    filters.companyType = profile.companyType;

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

    // This should save the filters, there's no need to save at every change
    if (localStorage.getItem('filters')) {
      filters = JSON.parse(localStorage.getItem('filters'));
    }

    selectedRange = this.timeRanges[selectIndex].value;
    selectedRangeComp = this.timeRangesComp[selectIndexComp].value;

    await this.fetchJobsAndLoads();
    await this.fetchLookups();
    let allCompanies = await this.fetchCompanies();
    this.fetchFilterLists();

    this.setState({
      companyZipCode,
      lastZipCode,
      company,
      address,
      filters,
      profile,
      selectedRange,
      loaded: true,
      companiesTypelist: allCompanies,
      companyType: profile.companyType
    });
  }

  async componentWillReceiveProps(nextProps) {
    const {filters} = this.state;
    if (filters.rows !== nextProps.rows || filters.page !== nextProps.page) {
      filters.rows = nextProps.rows;
      filters.page = nextProps.page;
      this.setState({filters});
      await this.fetchJobsAndLoads();
    }
  }

  getUTCStartInterval(s) {
    if (s) {
      let timeZoneOffset = s.getTimezoneOffset() / 60;
      if (timeZoneOffset < 0) {
        timeZoneOffset = Math.ceil(timeZoneOffset);
      } else {
        timeZoneOffset = Math.floor(timeZoneOffset);
      }
      const min = Math.abs(s.getTimezoneOffset() % 60);
      // if behind
      if (timeZoneOffset > 0) {
        if (min > 0) {
          s.setHours(23 - timeZoneOffset, min, 0); // 00:00:00s
        } else {
          s.setHours(24 - timeZoneOffset, min, 0); // 00:00:00s
        }
        s.setDate(s.getDate() - 1);
      } else { // if ahead
        s.setHours(-1 * timeZoneOffset, min, 0); // 00:00:00
      }
    }
    return s;
  }

  getUTCEndInterval(endDate) {
    if (endDate) {
      let timeZoneOffset = endDate.getTimezoneOffset() / 60;
      if (timeZoneOffset < 0) {
        timeZoneOffset = Math.ceil(timeZoneOffset);
      } else {
        timeZoneOffset = Math.floor(timeZoneOffset);
      }
      const min = Math.abs(endDate.getTimezoneOffset() % 60);
      if (timeZoneOffset > 0) {
        endDate.setHours(23 - timeZoneOffset, 59 - min, 59); // 23:59:59
      } else { // if ahead
        endDate.setDate(endDate.getDate() + 1);
        endDate.setHours(-1 * (timeZoneOffset + 1), 59 + min, 59); // 23:59:59
      }
    }
    return endDate;
  }

  getValues(collection) {
    let newCollection = [];
    if (collection.length > 0) {
      for (const item of collection) {
        newCollection.push(item.value);
      }
    }
    return newCollection;
  }

  async fetchFilterLists() {
    const {filters, materialTypeList, equipmentTypeList, rateTypeList} = this.state;

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
    const materialTypes = materialTypeList.map(materialType => ({
      name: 'materialType',
      value: materialType.trim(),
      label: materialType.trim()
    }));

    const lookupRateTypelist = await LookupsService.getLookupsByType('RateType');
    Object.values(lookupRateTypelist)
      .forEach((itm) => {
        rateTypeList.push(itm.val1);
      });

    // [filters.materials] = materialTypeList;
    // [filters.rateType] = rateTypeList;
    this.setState({
      filters,
      equipmentTypeList,
      materialTypeList: materialTypes,
      rateTypeList
    });
  }

  async fetchStates() {
    const lookups = await LookupsService.getLookups();
    let statesTypeList = [];
    let statusTypeList = [];
    Object.values(lookups)
      .forEach((itm) => {
        if (itm.key === 'States') statesTypeList.push(itm);
        if (itm.key === 'JobStatus') statusTypeList.push(itm);
      });
    statesTypeList = statesTypeList.map(state => ({
      value: String(state.val1),
      label: state.val1
    }));
    statusTypeList = statusTypeList.map(state => ({
      value: String(state.val1),
      label: state.val1
    }));
    this.setState({ statesTypeList, statusTypeList });
  }

  async fetchCompanies() {
    const filter = {};
    let companies = await CompanyService.getCompaniesByFilters(filter);
    companies = companies.data.map(co => ({
      value: String(co.id),
      label: co.legalName
    }));
    return companies;
  }

  // TODO -> this shouldn't write to state again
  async fetchLookups() {
    const lookups = await LookupsService.getLookups();
    let statesTypeList = [];
    let statusTypeList = [];
    Object.values(lookups)
      .forEach((itm) => {
        if (itm.key === 'States') statesTypeList.push(itm);
        if (itm.key === 'JobStatus') statusTypeList.push(itm);
      });
    statesTypeList = statesTypeList.map(state => ({
      value: String(state.val2), // this should map addresses.state
      label: state.val1
    }));
    statusTypeList = statusTypeList.map(state => ({
      value: String(state.val1),
      label: state.val1
    }));
    this.setState({ statesTypeList, statusTypeList });
  }

  async fetchJobsAndLoads() {
    const {
      lastZipCode,
      companyZipCode,
      filters,
      reqHandlerZip
    } = this.state;
    const {
      type,
      returnProducers,
      returnProducts,
      returnProjects,
      onReturnFilters,
      fetching
    } = this.props;
    fetching(true);
    let {company, address, profile} = this.state;
    const marketplaceUrl = '/marketplace';
    const url = window.location.pathname;

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
        try { // Search for that new zip code's coordinates
          const geoLocation = await GeoUtils.getCoordsFromAddress(`${filters.zipCode}, US`);
          filters.companyLatitude = geoLocation.lat;
          filters.companyLongitude = geoLocation.lng;
        } catch (e) {
          fetching(false);
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

    let result = [];
    let resultLoads = [];

    // for multifields we have to extract just the values
    const allFilters = CloneDeep(filters);
    allFilters.companies = this.getValues(allFilters.companies);
    allFilters.states = this.getValues(allFilters.states);
    allFilters.statuses = this.getValues(allFilters.statuses);
    allFilters.materials = this.getValues(allFilters.materials);
    allFilters.equipments = this.getValues(allFilters.equipments);
    allFilters.rateTypes = this.getValues(allFilters.rateTypes);

    try {
      result = await ReportsService.getJobsDailyReport(allFilters);
      resultLoads = await ReportsService.getLoadsDailyReport(allFilters);
    } catch (err) {
      // console.log(err);
      alert('Unable to obtain info');
      fetching(false);
      return null;
    }

    // data for Carrier Reports page
    if (type === 'Carrier') {
      try {
        let resultProducers = [];
        let resultProducts = [];
        let resultProjects = [];
        resultProducers = await ReportsService.getProducersComparisonReport(filters);
        resultProducts = await ReportsService.getProductsComparisonReport(filters);
        resultProjects = await ReportsService.getProjectComparisonReport(filters);
        const producers = resultProducers.data;
        const {metadataProducer} = resultProducers;
        const products = resultProducts.data;
        const {metadataProduct} = resultProducts;
        const projects = resultProjects.data;
        const {metadataProject} = resultProjects;

        returnProducers(producers, filters, metadataProducer);
        returnProducts(products, filters, metadataProduct);
        returnProjects(projects, filters, metadataProject);
      } catch (err) {
        // console.log(err);
        fetching(false);
        return null;
      }
    } else {
      const {metadata} = result;
      onReturnFilters(result, resultLoads, filters/*, metadata*/);
    }

    const jobs = result.data;
    const {metadata} = result;

    //onReturnFilters(result, filters/*, metadata*/);
    fetching(false);
    this.setState({lastZipCode: filters.zipCode});
    return jobs;
  }

  saveFilters() {
    const {filters} = {...this.state};
    // don't save status
    delete filters.status;
    localStorage.setItem('filters', JSON.stringify(filters));
  }

  async handleFilterChangeDelayed(e) {
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
          await this.fetchJobsAndLoads();
        }
      }, 1000),
      filters
    }, function saved() {
      this.saveFilters();
    });
  }

  async handleFilterChange(e) {
    const {value} = e.target;
    const {filters} = this.state;
    filters[e.target.name] = value;
    await this.fetchJobsAndLoads();
    this.setState({filters}, function saved() {
      this.saveFilters();
    });
  }

  async handleSelectFilterChange(option) {
    const {value, name} = option;
    const {filters} = this.state;
    filters[name] = value;
    this.setState({filters}, function saved() {
      this.saveFilters();
    });
    await this.fetchJobsAndLoads();
  }

  async handleMultiChange(data, meta) {
    // console.log("TCL: handleMultiChange -> data", data)
    const {filters} = this.state;
    switch(meta) {
      case 'status':
        filters.statuses = data;
        break;
      case 'materials':
        filters.materials = data;
        break;
      case 'states':
        filters.states = data;
        break;
      case 'companies':
        filters.companies = data;
        break;
      default:
    }

    await this.fetchJobsAndLoads();
    this.setState({
      filters
    }, function changed() {
      this.saveFilters();
    });
  }

  handleMultiTruckChange(data) {
    const {filters} = this.state;
    filters.equipmentType = data;
    this.setState({
      filters
    }, async function changed() {
      await this.fetchJobsAndLoads();
      this.saveFilters();
    });
  }

  async handleIntervalInputChange(e) {
    console.log("TCL: handleIntervalInputChange -> e", e)
    const {filters, intervals} = {...this.state};
    let sAv = null;
    if (e.start) {
      sAv = new Date(e.start);
    }
    let endAv = null;
    if (e.end) {
      endAv = new Date(e.end);
    }
    filters.startAvailability = this.getUTCStartInterval(sAv);
    filters.endAvailability = this.getUTCEndInterval(endAv);

    const {start} = e;
    const {end} = e;
    if (start) {
      start.setHours(0, 0, 0);
    }
    if (end) {
      end.setHours(23, 59, 59); // 23:59:59
    }
    intervals.startInterval = start;
    intervals.endInterval = end;
    this.setState({intervals, filters}, function saved() {
      this.saveFilters();
    });

    await this.fetchJobsAndLoads();
  }

  async filterWithStatus(filters) {
    this.state = {filters};
    await this.fetchJobsAndLoads();
  }

  async handleRangeFilterChange(option) {
    const { value, name } = option;
    const { intervals, filters } = this.state;
    let {
      selectedRange,
      selectIndex
    } = this.state;

    selectIndex = this.timeRanges.findIndex(x => x.name === name);
    selectedRange = value;
    const currentDate = moment(new Date())
      .hours(0)
      .minutes(0)
      .seconds(0)
      .toDate();
    const startDate = moment(new Date())
      .hours(0)
      .minutes(0)
      .seconds(0)
      .toDate();
    const endDate = currentDate;
    startDate.setDate(currentDate.getDate() - selectedRange);
    if (name === 'Custom') {
      intervals.startInterval = this.startDate;
      intervals.endInterval = this.endDate;
      filters.startAvailability = this.startDate;
      filters.endAvailability = this.endDate;
    } else {
      intervals.startInterval = startDate;
      intervals.endInterval = endDate;
      filters.startAvailability = startDate;
      filters.endAvailability = endDate;
    }

    this.setState({intervals, filters, selectIndex}, function saved() {
      this.saveFilters();
    });
    await this.fetchJobsAndLoads();
  }

  async handleResetFilters() {
    // set values to default or last saved filter
    if (localStorage.getItem('filters')) {
      this.setState({filters: JSON.parse(localStorage.getItem('filters'))},
        async () => this.fetchJobsAndLoads());
    } else {
      // defaults
      this.saveFilters();
      await this.fetchJobsAndLoads();
    }
  }

  render() {
    const {
      loaded,
      // Lists
      equipmentTypeList,
      materialTypeList,
      rateTypeList,
      intervals,
      
      statesTypeList,
      statusTypeList,
      companiesTypelist,
      // filters
      companyZipCode,
      filters,
      reqHandlerZip,
      reqHandlerRange,
      selectIndex,
      selectIndexComp
    } = this.state;
    // let start = filters.startAvailability;
console.log("TCL: render -> intervals", intervals)
    // Row 1: Company, State, Zip, Range
    // Row 2: Status, Material, Rate Type, Rate, Tons, TruckType
    // Row 3: Time Range, Range, Reset
    return (
      <Row>
        <Col md={12}>
          <Card>
            <CardBody>
              <form id="filter-form" className="form">
                {/*Row 1: Company, State, Zip, Range */}

                <div className="flex-daily-report-container-1">
                  <div className="filter-item" id="companySelect">
                    <div className="filter-item-title">
                      Companies
                    </div>
                    <TMultiSelect
                      input={
                        {
                          onChange: this.handleMultiChange,
                          name: 'companies', // this is the meta value
                          value: filters.companies
                        }
                      }
                      meta={
                        {
                          touched: false,
                          error: 'Unable to select'
                        }
                      }
                      options={
                        companiesTypelist
                      }
                      placeholder="Any"
                      // placeholder={materialTypeList[0]}
                      id="companySelect"
                      horizontalScroll="true"
                      // selectedItems={filters.materialType.length}
                    />
                    {/*
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
                    */}

                  </div>
                  <div className="filter-item" id="materialTypeSelect">
                    <div className="filter-item-title">
                      State
                    </div>
                    <TMultiSelect
                      input={
                        {
                          onChange: this.handleMultiChange,
                          name: 'states', // this is the meta value
                          value: filters.states
                        }
                      }
                      meta={
                        {
                          touched: false,
                          error: 'Unable to select'
                        }
                      }
                      options={
                        statesTypeList
                      }
                      placeholder="Any"
                      // placeholder={materialTypeList[0]}
                      id="materialTypeSelect"
                      horizontalScroll="true"
                      // selectedItems={filters.materialType.length}
                    />
                  </div>
                  <div className="filter-item">
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
                  <div className="filter-item">
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
                </div>

                {/*Row 2: Status, Material, Rate Type, Rate, Tons, TruckType*/}

                <div className="flex-daily-report-container-2">
                  <div className="filter-item" id="statusSelect">
                    <div className="filter-item-title">
                      Status
                    </div>
                    <TMultiSelect
                      input={
                        {
                          onChange: this.handleMultiChange,
                          name: 'status',
                          value: filters.statuses
                        }
                      }
                      meta={
                        {
                          touched: false,
                          error: 'Unable to select'
                        }
                      }
                      options={statusTypeList}
                      placeholder="Any"
                      // placeholder={materialTypeList[0]}
                      id="statusSelect"
                      horizontalScroll="true"
                      // selectedItems={filters.materialType.length}
                    />
                  </div>
                  <div className="filter-item" id="materialTypeSelect">
                    <div className="filter-item-title">
                      Materials
                    </div>
                    <TMultiSelect
                      input={
                        {
                          onChange: this.handleMultiChange,
                          name: 'materials',
                          value: filters.materials
                        }
                      }
                      meta={
                        {
                          touched: false,
                          error: 'Unable to select'
                        }
                      }
                      options={materialTypeList}
                      placeholder="Any"
                      // placeholder={materialTypeList[0]}
                      id="materialTypeSelect"
                      horizontalScroll="true"
                      // selectedItems={filters.materialType.length}
                    />
                  </div>
                  <div className="filter-item">
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
                  </div>
                  <div className="filter-item">
                    <div className="filter-item-title">
                      Rate
                    </div>
                    <TFieldNumber
                      input={
                        {
                          onChange: this.handleFilterChangeDelayed,
                          name: 'rate',
                          value: filters.rate
                        }
                      }
                      decimal
                      className="filter-text"
                      placeholder="Any"
                      currency
                    />
                  </div>
                  <div className="filter-item">
                    <div className="filter-item-title">
                      Min Capacity
                    </div>
                    <TFieldNumber
                      input={
                        {
                          onChange: this.handleFilterChangeDelayed,
                          name: 'minTons',
                          value: filters.minTons
                        }
                      }
                      className="filter-text"
                      placeholder="#"
                    />
                  </div>
                  <div className="filter-item" id="truckTypeSelect">
                    <div className="filter-item-title">
                      Truck Type
                    </div>
                    <TMultiSelect
                      input={
                        {
                          onChange: this.handleMultiTruckChange,
                          // onChange: this.handleSelectFilterChange,
                          name: 'equipmentType',
                          value: filters.equipments
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
                      // selectedItems={filters.equipmentType.length}
                    />
                  </div>

                  {/*Row 3: Time Range, Range, Reset*/}

                  <div className="filter-item">
                    <div className="filter-item-title">
                      Day Range
                    </div>
                    <TSelect
                      input={
                        {
                          onChange: this.handleRangeFilterChange,
                          name: this.timeRanges[selectIndex].name,
                          value: this.timeRanges[selectIndex].value
                        }
                      }
                      value={this.timeRanges[selectIndex].value.toString()}
                      options={
                        this.timeRanges.map(timeRange => ({
                          name: timeRange.name,
                          value: timeRange.value.toString(),
                          label: timeRange.name
                        }))
                      }
                      placeholder={this.timeRanges[selectIndex].name}
                    />
                  </div>
                  <div className="filter-item">
                    <div className="filter-item-title">
                      Date Range
                    </div>
                    <TIntervalDatePicker
                      startDate={intervals.startInterval}
                      endDate={intervals.endInterval}
                      name="dateInterval"
                      onChange={this.handleIntervalInputChange}
                      dateFormat="m/d/Y"
                    />
                  </div>
                  <div className="filter-item-button">
                    <button
                      className="btn btn-secondary"
                      type="button"
                      onClick={this.handleResetFilters}
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </form>
            </CardBody>
          </Card>
        </Col>
      </Row>
    );
  }
}

DailyReportFilter.propTypes = {
  onReturnFilters: PropTypes.func.isRequired,
  rows: PropTypes.number,
  page: PropTypes.number,
  type: PropTypes.string,

  //optional
  returnProducers: PropTypes.func,
  returnProducts: PropTypes.func,
  returnProjects: PropTypes.func

};

DailyReportFilter.defaultProps = {
  rows: 10,
  page: 0,
  type: null
};

export default DailyReportFilter;
