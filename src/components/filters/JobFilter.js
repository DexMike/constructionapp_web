import React, {Component} from 'react';
import {
  Card,
  CardBody,
  Col,
  Row
} from 'reactstrap';
import PropTypes from 'prop-types';
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
import GeoCodingService from '../../api/GeoCodingService';

class JobFilter extends Component {
  constructor(props) {
    super(props);

    // NOTE: if you update this list you have to update
    // Orion.EquipmentDao.filtersOrderByClause
    const sortByList = ['Hourly ascending', 'Hourly descending',
      'Tonnage ascending', 'Tonnage descending'];

    const startDate = new Date();
    startDate.setHours(0, 0, 0);
    const endDate = new Date();
    endDate.setHours(23, 59, 59); // 23:59:59
    endDate.setDate(endDate.getDate() + 14);
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
      company: {},
      profile: {},
      // Rate Type Button toggle
      // isAvailable: true,

      // TODO: Refactor to a single filter object
      // Filter values
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
        equipmentType: '',
        numEquipments: '',
        zipCode: '',
        range: 50,
        materialType: [],
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
    this.handleIntervalInputChange = this.handleIntervalInputChange.bind(this);
    this.handleFilterChangeDelayed = this.handleFilterChangeDelayed.bind(this);
    this.getUTCStartInterval = this.getUTCStartInterval.bind(this);
    this.getUTCEndInterval = this.getUTCEndInterval.bind(this);
  }

  async componentDidMount() {
    const {
      intervals,
      filters,
    } = this.state;
    let { address, company } = this.state;
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
        filters.companyLatitude = address.latitude;
        filters.companyLongitude = address.longitude;
      }
    }

    this.setState({company, address, filters, profile});
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

  async fetchFilterLists() {
    const {filters, materialTypeList, equipmentTypeList, rateTypeList} = this.state;

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

  async fetchJobs() {
    const { filters, reqHandlerZip } = this.state;
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
    } else if (profile.companyType === 'Customer') { // Customer Job Dashboard
      filters.createdBy = profile.userId;
    } else if (profile.companyType === 'Carrier' && url === marketplaceUrl) { // Marketplace
      filters.status = 'Published';
      filters.isMarketplaceView = true;
      filters.isFavorited = 0;
    }

    // if the filter zip code is not the same as the initial zip code (company's
    // zip code) or we don't have any coordinates on our db
    // we search for that zip code coordinates with MapBox API
    if ((address.zipCode !== filters.zipCode) || !filters.companyLatitude) {
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
    }

    const result = await JobService.getJobDashboardByFilters(filters);
    const jobs = result.data;
    const { metadata } = result;
    const {returnJobs} = this.props;

    returnJobs(jobs, filters, metadata);
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
    });
  }

  async handleFilterChange(e) {
    const {value} = e.target;
    const {filters} = this.state;
    filters[e.target.name] = value;
    await this.fetchJobs();
    this.setState({filters});
  }

  async handleSelectFilterChange(option) {
    const {value, name} = option;
    const {filters} = this.state;
    filters[name] = value;
    this.setState({filters});
    await this.fetchJobs();
  }

  handleMultiChange(data) {
    const {filters} = this.state;
    filters.materialType = data;
    this.setState({
      filters
    }, async function changed() {
      await this.fetchJobs();
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
    this.setState({intervals, filters});
    await this.fetchJobs();
  }

  async filterWithStatus(filters) {
    this.state = {filters};
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
      filters,
      reqHandlerZip,
      reqHandlerRange
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
                        dateFormat="MM/dd/yy"
                      />
                    </Col>
                    <Col md="1">
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
                    </Col>
                    <Col md="1">
                      <div className="filter-item-title">
                        Min Rate
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
                      />
                    </Col>
                    <Col md="1">
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
                        placeholder="# of tons"
                      />
                    </Col>
                    <Col md="2">
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
                    <Col md="1">
                      <div className="filter-item-title">
                        # of Trucks
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
                        placeholder="Any"
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
                        placeholder="Any"
                        type="number"
                      />
                    </Col>
                    <Col md="1">
                      <div className="filter-item-title">
                        Range
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
                        placeholder="50"
                        type="number"
                      />
                    </Col>
                    <Col md="2">
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
