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
import TField from '../common/TField';
import TFieldNumber from '../common/TFieldNumber';
import TSelect from '../common/TSelect';
import TIntervalDatePicker from '../common/TIntervalDatePicker';
import MultiSelect from '../common/TMultiSelect';
import AddressService from '../../api/AddressService';
import CompanyService from '../../api/CompanyService';
import JobService from '../../api/JobService';
import LookupsService from '../../api/LookupsService';
import ProfileService from '../../api/ProfileService';
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
      address: {},
      company: {},
      profile: {},
      companyZipCode: '',
      lastZipCode: '',
      // Rate Type Button toggle
      // isAvailable: true,

      // TODO: Refactor to a single filter object
      // Filter defaults
      filters: {
        rateType: '',
        searchType: 'Carrier Job',
        startAvailability: null,
        endAvailability: null,
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
        sortBy: sortByList[0],
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
    const { intervals } = {...this.state};
    let { companyZipCode, lastZipCode, address, company, filters } = {...this.state};
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

    if (localStorage.getItem('filters')) {
      filters = JSON.parse(localStorage.getItem('filters'));
      // console.log('>>GOT SAVED FILTERS:', savedFilters);
    }

    this.setState({companyZipCode, lastZipCode, company, address, filters, profile});

    await this.fetchJobs();
    this.fetchFilterLists();
  }

  async componentWillReceiveProps(nextProps) {
    const { filters } = this.state;
    if (filters.rows !== nextProps.rows || filters.page !== nextProps.page) {
      filters.rows = nextProps.rows;
      filters.page = nextProps.page;
      this.setState({filters});
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

  saveFilters() {
    const { filters } = {...this.state};
    // don't save status
    delete filters.status;
    localStorage.setItem('filters', JSON.stringify(filters));
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
    const { lastZipCode, companyZipCode, filters, reqHandlerZip } = this.state;
    let { company, address, profile } = this.state;
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
        try { // Search for that new zip code's coordinates with MapBox API
          // TODO -> do this without MapBox
          /*
          const geoLocation = await GeoCodingService.getGeoCode(filters.zipCode);
          filters.companyLatitude = geoLocation.features[0].center[1];
          filters.companyLongitude = geoLocation.features[0].center[0];
          */
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
      } else {
        // console.log('not marketplace');
        if (profile.companyType === 'Carrier') {
          result = await JobService.getJobCarrierDashboardByFilters(filters);
        } else {
          result = await JobService.getJobDashboardByFilters(filters);
        }
      }
    } catch (err) {
      // console.log(err);
      return null;
    }

    const jobs = result.data;
    const { metadata } = result;
    const {returnJobs} = this.props;

    returnJobs(jobs, filters, metadata);
    this.setState({lastZipCode: filters.zipCode});
    return jobs;
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
    this.state = {filters};
    await this.fetchJobs();
  }

  async handleResetFilters() {
    // set values to default or last saved filter
    if (localStorage.getItem('filters')) {
      this.setState({filters: JSON.parse(localStorage.getItem('filters'))},
        async () => this.fetchJobs());
    } else {
      // defaults
      this.saveFilters();
      await this.fetchJobs();
    }
  }

  render() {
    const {
      // Lists
      intervals
      // filters
    } = this.state;
    // let start = filters.startAvailability;
    return (
      <Row>
        <Col md={12}>
          <Card>
            <CardBody>
              <form id="filter-form" className="form">
                <Col lg={12}>
                  <Row lg={12} id="filter-input-row">
                    <Col md="2">
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
                    </Col>
                  </Row>
                </Col>
                <Col lg={12} style={{background: '#F9F9F7'}}>
                  <Row>
                    <Col lg={9} />
                    <Col lg={3}>
                      <ButtonToolbar className="wizard__toolbar right-buttons">
                        <Button className="btn btn-secondary"
                                type="button"
                                onClick={this.handleResetFilters}
                        >
                          Reset
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
}

JobFilter.propTypes = {
  returnJobs: PropTypes.func.isRequired,
  rows: PropTypes.number,
  page: PropTypes.number
};

JobFilter.defaultProps = {
  rows: 5,
  page: 0
};

export default JobFilter;
