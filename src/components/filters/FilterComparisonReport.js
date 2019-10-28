/* eslint-disable no-multiple-empty-lines,
no-trailing-spaces,
object-curly-spacing,
no-unused-vars,
spaced-comment,
react/jsx-closing-bracket-location,
semi, quotes, no-empty,
react/no-string-refs,
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
import GeoUtils from "../utils/GeoUtils";
import TField from '../common/TField';
import TFieldNumber from '../common/TFieldNumber';
import TSelect from '../common/TSelect';
import TIntervalDatePicker from '../common/TIntervalDatePicker';
import TMultiSelect from '../common/TMultiSelect';

import AddressService from '../../api/AddressService';
import CompanyService from '../../api/CompanyService';
// import JobService from '../../api/JobService';
import LookupsService from '../../api/LookupsService';
import ProfileService from '../../api/ProfileService';
import ReportsService from "../../api/ReportsService";

import './Filters.css';

function formatNumber(number) {
  return Math.floor(number)
    .toString()
    .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
}

function bracketsFormatter(params) {
  return `(${params.value})`;
}

function currencyFormatter(params) {
  if (params) {
    let number = params.toFixed(2);
    return `$ ${formatNumber(number)}`;
  }
  return `$ 0.00`;
}

function percentFormatter(params) {
  return `${formatNumber(params.value * 100)}%`;
}

function realRound(value, decimals) {
  return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}

class FilterComparisonReport extends Component {
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
        name: 'Disabled',
        value: -1
      },
      {
        name: 'Custom',
        value: 0
      },
      {
        name: 'Comparison last Week',
        value: 7
      },
      {
        name: 'Comparison 30 days',
        value: 30
      },
      {
        name: 'Comparison 60 days',
        value: 60
      },
      {
        name: 'Comparison 90 days',
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

    // the sunday from last week
    const startDateComp = moment().subtract(60, 'days').hours(0)
      .minutes(0)
      .seconds(0)
      .toDate();

    // the saturday from next week
    const endDateComp = moment().subtract(30, 'days').hours(0)
      .minutes(0)
      .seconds(0)
      .toDate();

    // const startDateComp = startDate;
    // const endDateComp = endDate;

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
        endInterval: endDate,
        startIntervalComp: startDateComp,
        endIntervalComp: endDateComp
      },
      address: {},
      company: {},
      profile: {},
      companyZipCode: '',
      lastZipCode: '',
      loaded: false,
      selectIndex: 0, // Parameter for setting the dropdown default option.
      selectedRange: 0, // Parameter for setting startDate.
      selectIndexComp: 0, // Parameter for setting the dropdown default option.
      selectedRangeComp: 0, // Parameter for setting startDate.

      // TODO: Refactor to a single filter object
      // Filter defaults
      filters: {
        companyType: null,
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
        startAvailDateComp: startDateComp,
        endAvailDateComp: endDateComp,
        page: 0,
        rows: 10,
        companyLatitude: 30.356855,
        companyLongitude: -97.737251,

        // searchType: 'Carrier Job',
        // minTons: '',
        // minHours: '',
        // minCapacity: '',
        // userId: '',
        // numEquipments: '',
        // materialType: [],
        // equipmentType: [],
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
    // this.handleMultiTruckChange = this.handleMultiTruckChange.bind(this);
    this.handleIntervalInputChange = this.handleIntervalInputChange.bind(this);
    this.handleIntervalComparisonInputChange = this.handleIntervalComparisonInputChange.bind(this);
    this.handleFilterChangeDelayed = this.handleFilterChangeDelayed.bind(this);
    this.handleResetFilters = this.handleResetFilters.bind(this);
    this.handleRangeFilterChange = this.handleRangeFilterChange.bind(this);
    this.handleRangeComparisonFilterChange = this.handleRangeComparisonFilterChange.bind(this);
    // Date Range and Comparison Date range
    this.getUTCStartInterval = this.getUTCStartInterval.bind(this);
    this.getUTCEndInterval = this.getUTCEndInterval.bind(this);
    this.getUTCStartIntervalComp = this.getUTCStartInterval.bind(this);
    this.getUTCEndIntervalComp = this.getUTCEndInterval.bind(this);

  }

  async componentDidMount() {
    const {intervals, selectIndex, selectIndexComp} = {...this.state};
    const { type } = this.props;
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
    // startInterval: startDate,
    //   endInterval: endDate

    const startAv = new Date(intervals.startInterval);
    const endAv = new Date(intervals.endInterval);
    filters.startAvailability = this.getUTCStartInterval(startAv);
    filters.endAvailability = this.getUTCEndInterval(endAv);

    const startAvComp = new Date(intervals.startIntervalComp);
    const endAvComp = new Date(intervals.endIntervalComp);
    filters.startAvailabilityComp = this.getUTCStartInterval(startAvComp);
    filters.endAvailabilityComp = this.getUTCEndInterval(endAvComp);

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

    //default range -?-
    selectedRange = this.timeRanges[selectIndex].value;
    selectedRangeComp = this.timeRanges[selectIndexComp].value;

    // get the data
    // TODO create 3:
    await this.fetchCarrierData();

    await this.fetchStates();
    await this.fetchLookups();
    let allCompanies = await this.fetchCompanies();
    
    this.fetchFilterLists();
    if (type === 'Producer' || type === 'Customer') {
      filters.companyType = 'Customer';
    }
    if (type === 'Carrier') {
      filters.companyType = 'Carrier';
    }
    this.setState({
      companyZipCode,
      lastZipCode,
      company,
      address,
      filters,
      profile,
      selectedRange,
      loaded: true,
      companiesTypelist: allCompanies
    });
  }

  async componentWillReceiveProps(nextProps) {
    const {filters} = this.state;
    if (filters.rows !== nextProps.rows || filters.page !== nextProps.page) {
      filters.rows = nextProps.rows;
      filters.page = nextProps.page;
      this.setState({filters});
      // TODO
      await this.fetchCarrierData();
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

  getUTCStartIntervalComp(s) {
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

  getUTCEndIntervalComp(endDate) {
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

  getIds(collection) {
    let newCollection = [];
    for (const item of collection) {
      newCollection.push(Number(item.id));
    }
    return newCollection;
  }

  async fetchFilterLists() {
    const {filters, materialTypeList, rateTypeList} = this.state;
    let { equipmentTypeList } = this.state;

    // TODO need to refactor above to do the filtering on the Orion
    // LookupDao Hibernate side

    const lookupEquipmentList = await LookupsService.getLookupsByType('EquipmentType');
    equipmentTypeList = lookupEquipmentList.map(eq => ({
      id: eq.id,
      value: eq.val1.trim(),
      label: eq.val1.trim()
    }));

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
      id: co.id,
      value: co.legalName,
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

  // merged in fetchCarrierData from fetchProducerData so we can just share
  async fetchCarrierData() {
    const {
      lastZipCode,
      companyZipCode,
      filters,
      reqHandlerZip
    } = this.state;
    const {
      type,
      returnCarriers,
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
    // WE MUST clone the object if we are going to change the info
    const allFilters = {...filters};
   
    //extract ids from collections
    allFilters.companies = this.getIds(allFilters.companies);
    allFilters.states = this.getValues(allFilters.states);
    allFilters.materials = this.getValues(allFilters.materials);
    allFilters.truckTypes = this.getIds(allFilters.equipments);
    allFilters.rateTypes = this.getValues(allFilters.rateTypes);
    allFilters.compare = true;
    

    if (type === 'Carrier') {
      
      try {        
        allFilters.companyType = 'Carrier';
        
        let resultCarriers = [];
        // let resultProducers = [];
        let resultProducts = [];
        let resultProjects = [];

        resultCarriers = await ReportsService.getCarriersComparisonReport(allFilters);
        // resultProducers = await ReportsService.getProducersComparisonReport(allFilters);
        resultProducts = await ReportsService.getProductsComparisonReport(allFilters);
        //projects should NOT have comparisonData
        allFilters.compare = false;
        resultProjects = await ReportsService.getProjectComparisonReport(allFilters);

        let carriers = resultCarriers.data;
        const metadataCarriers = resultCarriers;
        // let producers = resultProducers.data;
        // const metadataProducer = resultProducers.metadata;
        let products = resultProducts.data;
        const metadataProduct = resultProducts.metadata;
        let projects = resultProjects.data;
        const metadataProject = resultProjects.metadata;

        //Maping comparison
        carriers = this.mapObject(carriers);
        // producers = this.mapObject(producers);
        products = this.mapObject(products);
        projects = this.mapObject(projects);

        returnCarriers(carriers, allFilters, metadataCarriers);
        // returnProducers(producers, allFilters, metadataProducer);
        returnProducts(products, allFilters, metadataProduct);
        returnProjects(projects, allFilters, metadataProject);

      } catch (err) {
        fetching(false);
        return null;
      }
    } else if (type === 'Producer' || type === 'Customer') {
      allFilters.companyType = 'Customer';
      try {
        let resultCarriers = [];
        // let resultProducers = [];
        let resultProducts = [];
        let resultProjects = [];

        resultCarriers = await ReportsService.getCarriersComparisonReport(allFilters);
        // resultProducers = await ReportsService.getProducersComparisonReport(filters);
        resultProducts = await ReportsService.getProductsComparisonReport(allFilters);
        //projects should NOT have comparisonData
        allFilters.compare = false;
        resultProjects = await ReportsService.getProjectComparisonReport(allFilters);

        let carriers = resultCarriers.data;
        const metadataCarriers = resultCarriers.metadata;
        // const producers = resultProducers.data;
        // const {metadataProducer} = resultProducers;
        let products = resultProducts.data;
        const metadataProduct = resultProducts.metadata;
        let projects = resultProjects.data;
        const metadataProject = resultProjects.metadata;
        //Maping comparison
        carriers = this.mapObject(carriers);
        products = this.mapObject(products);
        projects = this.mapObject(projects);

        returnCarriers(carriers, allFilters, metadataCarriers);
        // returnProducers(producers, filters, metadataProducer);
        returnProducts(products, allFilters, metadataProduct);
        returnProjects(projects, allFilters, metadataProject);
      } catch (err) {
        fetching(false);
        return null;
      }
    } else if (type === 'Contractor') {
      allFilters.companyType = 'Contractor';        
      try {
        let resultCarriers = [];
        // let resultProducers = [];
        let resultProducts = [];
        let resultProjects = [];

        resultCarriers = await ReportsService.getCarriersComparisonReport(allFilters);
        // resultProducers = await ReportsService.getProducersComparisonReport(allFilters);
        resultProducts = await ReportsService.getProductsComparisonReport(allFilters);
        //projects should NOT have comparisonData
        allFilters.compare = false;
        resultProjects = await ReportsService.getProjectComparisonReport(allFilters);

        let carriers = resultCarriers.data;
        const metadataCarriers = resultCarriers.metadata;
        // let producers = resultProducers.data;
        // const metadataProducer = resultProducers.metadata;
        let products = resultProducts.data;
        const metadataProduct = resultProducts.metadata;
        let projects = resultProjects.data;
        const metadataProject = resultProjects.metadata;

        //Maping comparison
        // producers = this.mapObject(producers);
        carriers = this.mapObject(carriers);
        products = this.mapObject(products);
        projects = this.mapObject(projects);

        returnCarriers(carriers, allFilters, metadataCarriers);
        // returnProducers(producers, allFilters, metadataProducer);
        returnProducts(products, allFilters, metadataProduct);
        returnProjects(projects, allFilters, metadataProject);
      } catch (err) {
        fetching(false);
        return null;
      }
    } else {
      const {metadata} = result;
      onReturnFilters(result, resultLoads, allFilters/*, metadata*/);
    }

    const jobs = result.data;
    const {metadata} = result;

    //onReturnFilters(result, filters/*, metadata*/);
    fetching(false);
    this.setState({lastZipCode: filters.zipCode});
    return jobs;
  }

  mapObject(object) {
    const currencyKeys = ['avgEarningsHour', 'avgEarningsHourComp', 'totEarnings', 'totEarningsComp',
      'avgEarningsJob', 'avgEarningsJobComp', 'avgEarningsTon', 'avgEarningsTonComp'];
    let mappedObject = object;
    
    let maxTotEarnings = 0;
    let maxNumJobs = 0;
    let maxNumLoads = 0;
    let maxTonsDelivered = 0;
    let maxAvgEarningsHours = 0;
    let maxAvgEarningsJob = 0;
    let maxAvgEarningsTon = 0;
    let maxAvgMilesTraveled = 0;
    let maxCostPerTonMile = 0;

    //we need to get the maximums
    for (const obj of mappedObject) {
      if (Number(obj.totEarnings) > maxTotEarnings) {
        maxTotEarnings = obj.totEarnings;
      }
      if (Number(obj.numJobs) > maxNumJobs) {
        maxNumJobs = obj.numJobs;
      }
      if (Number(obj.numLoads) > maxNumLoads) {
        maxNumLoads = obj.numLoads;
      }
      if (Number(obj.tonsDelivered) > maxTonsDelivered) {
        maxTonsDelivered = obj.tonsDelivered;
      }
      if (Number(obj.avgEarningsHour) > maxAvgEarningsHours) {
        maxAvgEarningsHours = obj.avgEarningsHour;
      }
      if (Number(obj.avgEarningsJob) > maxAvgEarningsJob) {
        maxAvgEarningsJob = obj.avgEarningsJob;
      }
      if (Number(obj.avgEarningsTon) > maxAvgEarningsTon) {
        maxAvgEarningsTon = obj.avgEarningsTon;
      }
      if (Number(obj.avgMilesTraveled) > maxAvgMilesTraveled) {
        maxAvgMilesTraveled = obj.avgMilesTraveled;
      }
      if (Number(obj.costPerTonMile) > maxCostPerTonMile) {
        maxCostPerTonMile = obj.costPerTonMile;
      }

      // we should consider the comparison values as well,
      // so that the greatest value makes the biggest bar
      if (Number(obj.totEarningsComp) > maxTotEarnings) {
        maxTotEarnings = obj.totEarningsComp;
      }
      if (Number(obj.numJobsComp) > maxNumJobs) {
        maxNumJobs = obj.numJobsComp;
      }
      if (Number(obj.numLoadsComp) > maxNumLoads) {
        maxNumLoads = obj.numLoadsComp;
      }
      if (Number(obj.tonsDeliveredComp) > maxTonsDelivered) {
        maxTonsDelivered = obj.tonsDeliveredComp;
      }
      if (Number(obj.avgEarningsHourComp) > maxAvgEarningsHours) {
        maxAvgEarningsHours = obj.avgEarningsHourComp;
      }
      if (Number(obj.avgEarningsJobComp) > maxAvgEarningsJob) {
        maxAvgEarningsJob = obj.avgEarningsJobComp;
      }
      if (Number(obj.avgEarningsTonComp) > maxAvgEarningsTon) {
        maxAvgEarningsTon = obj.avgEarningsTonComp;
      }
      if (Number(obj.avgMilesTraveledComp) > maxAvgMilesTraveled) {
        maxAvgMilesTraveled = obj.avgMilesTraveledComp;
      }
      if (Number(obj.costPerTonMileComp) > maxCostPerTonMile) {
        maxCostPerTonMile = obj.costPerTonMileComp;
      }
    }

    mappedObject.map((item) => {
      const newObject = item;
     
      // no nulls on screen
      Object.keys(item)
        .map((key) => {
          if (typeof item[key] === 'number') {
            item[key] = realRound(item[key], 2);
          }
          if (item[key] === null) {
            item[key] = 0;
          }
          return true;
        });
        

      // totEarnings
      newObject.avgTotEarningsComparison = {
        total: newObject.totEarnings,
        totalComp: newObject.totEarningsComp,
        max: maxTotEarnings,
        type: 'price'
      };

      // totalJobs
      newObject.totalJobsComparison = {
        total: newObject.numJobs,
        totalComp: newObject.numJobsComp,
        max: maxNumJobs,
        type: 'integer'
      };
      
      // totalJobs
      newObject.totalLoadsComparison = {
        total: newObject.numLoads,
        totalComp: newObject.numLoadsComp,
        max: maxNumLoads,
        type: 'integer'
      };

      // totalTons
      newObject.avgTonsDeliveredComparison = {
        total: newObject.tonsDelivered,
        totalComp: newObject.tonsDeliveredComp,
        max: maxTonsDelivered,
        type: 'number'
      }

      // totalTons
      newObject.avgEarningsHourComparison = {
        total: newObject.avgEarningsHour,
        totalComp: newObject.avgEarningsHourComp,
        max: maxAvgEarningsHours,
        type: 'price'
      }

      // totalJob
      newObject.avgEarningsJobComparison = {
        total: newObject.avgEarningsJob,
        totalComp: newObject.avgEarningsJobComp,
        max: maxAvgEarningsJob,
        type: 'price'
      }

      // totalTons
      newObject.avgEarningsTonComparison = {
        total: newObject.avgEarningsTon,
        totalComp: newObject.avgEarningsTonComp,
        max: maxAvgEarningsTon,
        type: 'price'
      }

      // totalMiles
      newObject.avgMilesTraveledComparison = {
        total: newObject.avgMilesTraveled,
        totalComp: newObject.avgMilesTraveledComp,
        max: maxAvgMilesTraveled,
        type: 'number'
      } 

      // totalTons
      newObject.costPerTonMileComparison = {
        total: newObject.costPerTonMile,
        totalComp: newObject.costPerTonMileComp,
        max: maxCostPerTonMile,
        type: 'price'
      }

      //totEarnings as number:
      newObject.totEarningsNum = this.checkForString(newObject.totEarnings);
      newObject.totEarningsNumComp = this.checkForString(newObject.totEarningsComp);
      newObject.avgEarningsHourNum = this.checkForString(newObject.avgEarningsHour);
      newObject.avgEarningsTonNum = this.checkForString(newObject.avgEarningsTon);
      newObject.avgEarningsJobNum = this.checkForString(newObject.avgEarningsJob);
      
      // return newObject;
    });
    return mappedObject;
  }

  checkForString(val) {
    if (typeof val === 'string') {
      return Number(val.replace(/[^0-9]/g, ''));
    }
    return val;
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
          await this.fetchCarrierData();
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
    await this.fetchCarrierData();
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
    await this.fetchCarrierData();
  }

  async handleMultiChange(data, name) {
    // console.log("TCL: handleMultiChange -> data", data)
    const {filters} = this.state;
    switch(name) {
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
      case 'equipments':
        filters.equipments = data;
        break;
      default:
    }

    await this.fetchCarrierData();
    this.setState({
      filters
    }, function changed() {
      this.saveFilters();
    });
  }

  async handleIntervalInputChange(e) {
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

    await this.fetchCarrierData();
  }

  async handleIntervalComparisonInputChange(e) {
    // console.log("TCL: handleIntervalComparisonInputChange -> e", e)
    const {filters, intervals} = {...this.state};
    let sAv = null;
    if (e.start) {
      sAv = new Date(e.start);
    }
    let endAv = null;
    if (e.end) {
      endAv = new Date(e.end);
    }
    filters.startAvailDateComp = this.getUTCStartInterval(sAv);
    filters.endAvailDateComp = this.getUTCEndInterval(endAv);

    const {start} = e;
    const {end} = e;
    if (start) {
      start.setHours(0, 0, 0);
    }
    if (end) {
      end.setHours(23, 59, 59); // 23:59:59
    }
    intervals.startIntervalComp = start;
    intervals.endIntervalComp = end;
    this.setState({intervals, filters}, function saved() {
      this.saveFilters();
    });

    await this.fetchCarrierData();
  }

  async filterWithStatus(filters) {
    this.state = {filters};
    await this.fetchCarrierData();
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
      intervals.startInterval = startDate;
      intervals.endInterval = endDate;
      filters.startAvailability = startDate;
      filters.endAvailability = endDate;
    } else {
      intervals.startInterval = startDate;
      intervals.endInterval = endDate;
      filters.startAvailability = startDate;
      filters.endAvailability = endDate;
    }
    this.setState({
      intervals,
      filters,
      selectIndex
    }, function saved() {
      this.saveFilters();
    });
    await this.fetchCarrierData();
  }

  async handleRangeComparisonFilterChange(option) {
    const { value, name } = option;
    const { intervals, filters } = this.state;
    let {
      selectedRangeComp,
      selectIndexComp
    } = this.state;

    selectIndexComp = this.timeRangesComp.findIndex(x => x.name === name);
    selectedRangeComp = value;
    const currentDateComp = moment(new Date())
      .hours(0)
      .minutes(0)
      .seconds(0)
      .toDate();
    let startDateComp = moment(new Date())
      .hours(0)
      .minutes(0)
      .seconds(0)
      .toDate();
    let endDateComp = currentDateComp;

    startDateComp.setDate(intervals.startInterval.getDate() - selectedRangeComp);
    if (name === 'Custom') {
      intervals.startIntervalComp = this.startDate;
      intervals.endIntervalComp = this.endDate;
      filters.startAvailDateComp = this.startDate;
      filters.endAvailDateComp = this.endDate;
    } else {
      intervals.startIntervalComp = startDateComp;
      intervals.endIntervalComp = endDateComp;
      filters.startAvailDateComp = startDateComp;
      filters.endAvailDateComp = endDateComp;
    }

    this.setState({
      intervals,
      filters,
      selectedRangeComp,
      selectIndexComp}, function saved() {
      this.saveFilters();
    });
    await this.fetchCarrierData();
  }

  async handleResetFilters() {
    // set values to default or last saved filter
    if (localStorage.getItem('filters')) {
      this.setState({filters: JSON.parse(localStorage.getItem('filters'))},
        async () => this.fetchCarrierData());
    } else {
      // defaults
      this.saveFilters();
      await this.fetchCarrierData();
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
    const {
      showComparison,
    } = this.props;
    // let start = filters.startAvailability;
    
    // console.log("TCL: render -> intervals", intervals)

    // Row 1: Company, State, Zip, Range
    // Row 2: Status, Material, Rate Type, Rate, Tons, TruckType
    // Row 3: Time Range, Range,
    //        if showComparison: Time RangeComp, RangeComp,
    //        Reset
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
                      identifier="companieso"
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
                      selectedItems={filters.materialType}
                      name="companies"
                    />

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
                      id="materialTypeSelect"
                      horizontalScroll="true"
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
                      selectedItems={filters.materialType}
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
                      selectedItems={filters.materialType}
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
                          onChange: this.handleMultiChange,
                          name: 'equipments',
                          value: filters.equipments
                        }
                      }
                      meta={
                        {
                          touched: false,
                          error: 'Unable to select'
                        }
                      }
                      options={equipmentTypeList}
                      // placeholder="Materials"
                      placeholder="Any"
                      id="truckTypeSelect"
                      horizontalScroll="true"
                      selectedItems={filters.equipmentType}
                    />
                  </div>

                  {/*Row 3: Time Range, Range, [Time Range, Range, ], Reset*/}

                  <div className="filter-item">
                    <div className="filter-item-title">
                      {
                        showComparison === true && 'Baseline '
                      }
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
                      {
                        showComparison === true && 'Baseline '
                      }
                      Date Range
                    </div>
                    <TIntervalDatePicker
                      startDate={intervals.startInterval}
                      endDate={intervals.endInterval}
                      name="dateInterval"
                      onChange={this.handleIntervalInputChange}
                      dateFormat="m/d/Y"
                      isCustom={
                        this.timeRanges[selectIndex].name !== 'Custom'
                      }
                    />
                  </div>
                  {/*Comparison*/}
                  { showComparison === true && (
                    <React.Fragment>
                      <div className="filter-item">
                        <div className="filter-item-title">
                          Comparison Day Range
                        </div>
                        <TSelect
                        input={
                          {
                            onChange: this.handleRangeComparisonFilterChange,
                            name: this.timeRangesComp[selectIndexComp].name,
                            value: this.timeRangesComp[selectIndexComp].value
                          }
                        }
                        value={this.timeRangesComp[selectIndexComp].value.toString()}
                        options={
                          this.timeRangesComp.map(timeRangeComp => ({
                            name: timeRangeComp.name,
                            value: timeRangeComp.value.toString(),
                            label: timeRangeComp.name
                          }))
                        }
                        placeholder={this.timeRangesComp[selectIndexComp].name}
                        />
                      </div>
                      <div className="filter-item">
                        <div className="filter-item-title">
                          Comparison Date Range
                        </div>
                        <TIntervalDatePicker
                          startDate={intervals.startIntervalComp}
                          endDate={intervals.endIntervalComp}
                          name="dateIntervalComp"
                          onChange={this.handleIntervalComparisonInputChange}
                          dateFormat="m/d/Y"
                          isCustom={
                            this.timeRangesComp[selectIndexComp].name !== 'Custom'
                          }
                        />
                      </div>
                    </React.Fragment>
                  )
                  }
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

FilterComparisonReport.propTypes = {
  // onReturnFilters: PropTypes.func.isRequired,
  rows: PropTypes.number,
  page: PropTypes.number,
  type: PropTypes.string,
  showComparison: PropTypes.bool,

  returnCarriers: PropTypes.func,
  returnProducers: PropTypes.func,
  returnProducts: PropTypes.func,
  returnProjects: PropTypes.func
};

FilterComparisonReport.defaultProps = {
  rows: 10,
  page: 0,
  type: null,
  showComparison: false,
  returnCarriers: null,
  returnProducers: null,
  returnProducts: null,
  returnProjects: null
};

export default FilterComparisonReport;
