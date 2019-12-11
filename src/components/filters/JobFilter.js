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
import { withTranslation } from 'react-i18next';
import TSpinner from '../common/TSpinner';
import TField from '../common/TField';
import TFieldNumber from '../common/TFieldNumber';
import TSelect from '../common/TSelect';
import TIntervalDatePicker from '../common/TIntervalDatePicker';
import MultiSelect from '../common/TMultiSelect';
import GeoUtils from '../../utils/GeoUtils';
import AddressService from '../../api/AddressService';
import CompanyService from '../../api/CompanyService';
import JobService from '../../api/JobService';
import LookupsService from '../../api/LookupsService';
import ProfileService from '../../api/ProfileService';
import './Filters.css';
// import GeoCodingService from '../../api/GeoCodingService';

class JobFilter extends Component {
  constructor(props) {
    super(props);

    // NOTE: if you update this list you have to update
    // Orion.EquipmentDao.filtersOrderByClause
    const sortByList = ['Hourly ascending', 'Hourly descending',
      'Tonnage ascending', 'Tonnage descending'];

    // the sunday from last week
    const startDate = moment()
      .startOf('week')
      .add(-1, 'weeks')
      .hours(0)
      .minutes(0)
      .seconds(0)
      .toDate();
    // the saturday from next week
    const endDate = moment()
      .endOf('week')
      .add(1, 'weeks')
      .hours(23)
      .minutes(59)
      .seconds(59)
      .toDate();
    // Comment
    this.state = {
      // Look up lists
      equipmentTypeList: [],
      materialTypeList: [],
      rateTypeList: [],
      intervals: {
        startInterval: startDate,
        endInterval: endDate
      },
      resetIntervals: {
        startInterval: startDate,
        endInterval: endDate
      },
      address: {},
      company: {},
      profile: {},
      companyZipCode: '',
      lastZipCode: '',
      loaded: false,

      // TODO: Refactor to a single filter object
      // Filter defaults
      filters: {
        rateType: '',
        searchType: 'Carrier Job',
        startAvailability: startDate,
        endAvailability: endDate,
        rate: '',
        minTons: '',
        minHours: '',
        minCapacity: '',
        userId: '',
        numEquipments: '',
        zipCode: '',
        range: 50,
        materialType: [],
        equipmentType: [],
        isMarketplaceView: false,
        status: '',
        sortBy: '',
        order: '',
        page: 0,
        rows: 5
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
    this.getUTCStartInterval = this.getUTCStartInterval.bind(this);
    this.getUTCEndInterval = this.getUTCEndInterval.bind(this);
    this.handleResetFilters = this.handleResetFilters.bind(this);
  }

  async componentDidMount() {
    const {isMarketplace} = this.props;
    const {intervals} = {...this.state};
    let {companyZipCode, lastZipCode, address, company, filters} = {...this.state};
    const profile = await ProfileService.getProfile();
    filters.userId = profile.userId;

    const startAv = new Date(intervals.startInterval);
    const endAv = new Date(intervals.endInterval);
    filters.startAvailability = this.getUTCStartInterval(startAv);
    filters.endAvailability = this.getUTCEndInterval(endAv);

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
    if (localStorage.getItem('dashboardFilters') && !isMarketplace) {
      filters = JSON.parse(localStorage.getItem('dashboardFilters'));
      // console.log('>>GOT SAVED FILTERS:', savedFilters); 
      intervals.startInterval = this.parseStringToDate(filters.startAvailability);
      intervals.endInterval = moment(filters.endAvailability).endOf('day').toDate();
    }
    if (localStorage.getItem('marketFilters') && isMarketplace) {
      filters = JSON.parse(localStorage.getItem('marketFilters'));
      // console.log('>>GOT SAVED FILTERS:', savedFilters);
      intervals.startInterval = this.parseStringToDate(filters.startAvailability);
      intervals.endInterval = moment(filters.endAvailability).endOf('day').toDate();
    }
    await this.fetchFilterLists();
    this.setState({
      intervals,
      filters,
      loaded: true
    });
    await this.fetchJobs();
    this.setState({
      companyZipCode,
      lastZipCode,
      company,
      address,
      profile
    });
  }

  async componentWillReceiveProps(nextProps) {
    const {filters} = {...this.state};
    const newFilters = filters;
    if (filters.rows !== nextProps.rows || filters.page !== nextProps.page) {
      newFilters.rows = nextProps.rows;
      newFilters.page = nextProps.page;
      if (!nextProps.isMarketplace) {
        localStorage.setItem('dashboardFilters', JSON.stringify(newFilters));
      } else {
        localStorage.setItem('marketFilters', JSON.stringify(newFilters));
      }      
      this.setState({ filters: newFilters });
      await this.fetchJobs();
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

  parseStringToDate(stringDate) {
    const dTimezone = new Date();
    const offset = dTimezone.getTimezoneOffset() / 60;
    const date = new Date(Date.parse(stringDate));
    date.setHours(date.getHours() + offset);
    return date;
  }

  saveFilters() {
    const { isMarketplace } = this.props;
    const {filters} = {...this.state};
    // don't save status
    // delete filters.status;
    if (!isMarketplace) {
      localStorage.setItem('dashboardFilters', JSON.stringify(filters));
    } else {
      localStorage.setItem('marketFilters', JSON.stringify(filters));
    }
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

    const lookupRateTypelist = await LookupsService.getLookupsByType('RateType');
    Object.values(lookupRateTypelist)
      .forEach((itm) => {
        rateTypeList.push(itm.val1);
      });

    [filters.materials] = materialTypeList;
    [filters.rateType] = rateTypeList;
    this.setState({
      filters,
      equipmentTypeList,
      materialTypeList,
      rateTypeList
    });
  }

  async fetchJobs() {
    const {lastZipCode, companyZipCode, filters, reqHandlerZip} = this.state;
    let {company, address, profile} = this.state;
    const { isLoading } = this.props;
    if (isLoading) {
      isLoading(true);
    }
    const marketplaceUrl = '/marketplace';
    const url = window.location.pathname;
    if (!profile || Object.keys(profile).length === 0) {
      profile = await ProfileService.getProfile();
      if (!company || Object.keys(company).length === 0) {
        company = await CompanyService.getCompanyById(profile.companyId);
        if (!address || Object.keys(address).length === 0) {
          address = await AddressService.getAddressById(company.addressId);
        }
      }
    }

    if (profile.companyType === 'Carrier' && url !== marketplaceUrl) { // Carrier Job Dashboard
      filters.companyCarrierId = profile.companyId;
      filters.isMarketplaceView = false;
    } else if (profile.companyType === 'Customer') { // Customer Job Dashboard
      filters.companiesId = profile.companyId;
      filters.isMarketplaceView = false;
    } else if (profile.companyType === 'Carrier' && url === marketplaceUrl) { // Marketplace
      filters.companyCarrierId = profile.companyId;
      filters.isMarketplaceView = true;
      filters.isFavorited = 0;
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

    let result = [];

    try {
      // TODO: Change to switch cases
      if (filters.isMarketplaceView) {
        // console.log('marketplace');
        result = await JobService.getMarketplaceJobsByFilters(filters);
      } else if (profile.companyType === 'Carrier') {
        filters.isAdmin = profile.isAdmin;
        result = await JobService.getJobCarrierDashboardByFilters(filters);
      } else {
        result = await JobService.getJobDashboardByFilters(filters);
      }
    } catch (err) {
      // console.log(err);
      return null;
    }

    const jobs = result.data;
    const {metadata} = result;
    const {returnJobs} = this.props;
    this.saveFilters();
    returnJobs(jobs, filters, metadata);
    this.setState({lastZipCode: filters.zipCode});
    if (isLoading) {
      isLoading(false);
    }
    return jobs;
  }

  async handleFilterChangeDelayed(e) {
    const self = this;
    let {value} = e.target;
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
          await this.fetchJobs();
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
    await this.fetchJobs();
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
    await this.fetchJobs();
  }

  handleMultiChange(data) {
    const {filters} = this.state;
    filters.materialType = data;
    this.setState({
      filters
    }, async function changed() {
      await this.fetchJobs();
      this.saveFilters();
    });
  }

  handleMultiTruckChange(data) {
    const {filters} = this.state;
    filters.equipmentType = data;
    this.setState({
      filters
    }, async function changed() {
      await this.fetchJobs();
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

    await this.fetchJobs();
  }

  async filterWithStatus(filters) {
    this.setState({filters});
    await this.fetchJobs();
  }

  async handleResetFilters() {
    const { filters, companyZipCode } = this.state;
    const resetFilters = filters;
    const resetIntervals = {
      startInterval: moment().startOf('week').add(-1, 'weeks').hours(0)
        .minutes(0)
        .seconds(0)
        .toDate(),
      endInterval: moment().endOf('week').add(1, 'weeks').hours(23)
        .minutes(59)
        .seconds(59)
        .toDate()
    };
    resetFilters.startAvailability = resetIntervals.startInterval;
    resetFilters.endAvailability = resetIntervals.endInterval;
    resetFilters.rate = '';
    resetFilters.rateType = 'Any';
    resetFilters.minCapacity = '';
    resetFilters.minTons = '';
    resetFilters.minHours = '';
    resetFilters.materials = '';
    resetFilters.materialType = [];
    resetFilters.equipmentType = [];
    resetFilters.numEquipments = '';
    resetFilters.range = '50';
    resetFilters.zipCode = companyZipCode;

    this.setState({
      filters: resetFilters,
      intervals: resetIntervals
    }, function saved() {
      this.saveFilters();
    });

    await this.fetchJobs();
  }

  render() {
    const {
      // Lists
      equipmentTypeList,
      materialTypeList,
      rateTypeList,
      intervals,
      // filters
      companyZipCode,
      filters,
      reqHandlerZip,
      reqHandlerRange,
      loaded
    } = this.state;
    // let start = filters.startAvailability;
    console.log(563, this.props);
    const {t} = {...this.props};
    if (loaded) {
      return (
        <Row>
          <Col md={12}>
            <Card>
              <CardBody>
                <form className="form">
                  <div className="flex-job-filters">
                    <div>
                      <div className="filter-item-title">
                        {t('Date Range')}
                      </div>
                      <TIntervalDatePicker
                        startDate={intervals.startInterval}
                        endDate={intervals.endInterval}
                        name="dateInterval"
                        onChange={this.handleIntervalInputChange}
                        dateFormat="m/d/Y"
                        isCustom
                      />
                    </div>
                    <div>
                      <div className="filter-item-title">
                      {t('Rate Type')}
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
                    <div>
                      <div className="filter-item-title">
                        {t('Min Rate')}
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
                        placeholder={t('Any')}
                        currency
                      />
                    </div>
                    <div>
                      <div className="filter-item-title">
                        {t('Min Capacity')}
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
                    <div id="truckTypeSelect">
                      <div className="filter-item-title">
                        {t('Truck Type')}
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
                        placeholder={t('Any')}
                        id="truckTypeSelect"
                        horizontalScroll="true"
                        selectedItems={filters.equipmentType}
                      />
                    </div>
                    <div>
                      <div className="filter-item-title">
                        {t('# of Trucks')}
                      </div>
                      <TFieldNumber
                        input={
                          {
                            onChange: this.handleFilterChangeDelayed,
                            name: 'numEquipments',
                            value: filters.numEquipments
                          }
                        }
                        className="filter-text"
                        placeholder={t('Any')}
                      />
                    </div>
                    <div>
                      <div className="filter-item-title">
                        {t('Zip Code')}
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
                        {t('Range')} (mi)
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
                        placeholder={t('Any')}
                        type="number"
                      />
                    </div>
                    <div id="materialTypeSelect" >
                      <div className="filter-item-title">
                        {t('Materials')}
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
                        placeholder={t('Any')}
                        // placeholder={materialTypeList[0]}
                        id="materialTypeSelect"
                        horizontalScroll="true"
                        selectedItems={filters.materialType}
                      />
                    </div>
                  </div>
                  <Col lg={12} style={{background: '#F9F9F7', paddingTop: 8}}>
                    <Row>
                      <Col lg={9}/>
                      <Col lg={3}>
                        <ButtonToolbar className="wizard__toolbar right-buttons">
                          <Button className="btn btn-secondary"
                                  type="button"
                                  onClick={this.handleResetFilters}
                          >
                            {t('Reset')}
                          </Button>
                        </ButtonToolbar>
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
    return (
      <Row>
        <Col md={12} className="text-center">
          <Card>
            <CardBody>
              <TSpinner
                loading
              />
            </CardBody>
          </Card>
        </Col>
      </Row>
    );
  }
}

JobFilter.propTypes = {
  returnJobs: PropTypes.func.isRequired,
  rows: PropTypes.number,
  page: PropTypes.number,
  isMarketplace: PropTypes.bool
};

JobFilter.defaultProps = {
  rows: 5,
  page: 0,
  isMarketplace: false
};

export default JobFilter;
