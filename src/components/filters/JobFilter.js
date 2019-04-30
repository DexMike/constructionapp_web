import React, {Component} from 'react';
import {
  Card,
  CardBody,
  Col,
  Row
} from 'reactstrap';
import PropTypes from 'prop-types';
import TField from '../common/TField';
import TSelect from '../common/TSelect';
import TIntervalDatePicker from '../common/TIntervalDatePicker';
import MultiSelect from '../common/TMultiSelect';
import AddressService from '../../api/AddressService';
import CompanyService from '../../api/CompanyService';
import JobService from '../../api/JobService';
import LookupsService from '../../api/LookupsService';
import ProfileService from '../../api/ProfileService';

class JobFilter extends Component {
  constructor(props) {
    super(props);

    // NOTE: if you update this list you have to update
    // Orion.EquipmentDao.filtersOrderByClause
    const sortByList = ['Hourly ascending', 'Hourly descending',
      'Tonnage ascending', 'Tonnage descending'];

    // Comment
    this.state = {
      // Look up lists
      equipmentTypeList: [],
      materialTypeList: [],
      rateTypeList: [],
      startDate: null, // values for date control
      endDate: null, // values for date control

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
        materialType: [],
        sortBy: sortByList[0]
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
    let {
      startDate,
      endDate
    } = this.state;
    const {filters} = this.state;
    const profile = await ProfileService.getProfile();
    filters.userId = profile.userId;
    startDate = new Date();
    startDate.setHours(0, 0, 0);
    endDate = new Date();
    endDate.setHours(23, 59, 59); // 23:59:59
    endDate.setDate(endDate.getDate() + 7);
    this.setState(
      {
        filters,
        startDate,
        endDate
      }
    );
    await this.fetchJobs();
    this.fetchFilterLists();
  }

  getUTCStartInterval(s) {
    if (s) {
      const timeZoneOffset = s.getTimezoneOffset() / 60;
      // if behind
      if (timeZoneOffset > 0) {
        s.setHours(24 - timeZoneOffset, 0, 0); // 00:00:00s
        s.setDate(s.getDate() - 1);
      } else { // if ahead
        s.setHours(-1 * timeZoneOffset, 0, 0); // 00:00:00
      }
    }
    return s;
  }

  getUTCEndInterval(endDate) {
    if (endDate) {
      const timeZoneOffset = endDate.getTimezoneOffset() / 60;
      if (timeZoneOffset > 0) {
        endDate.setHours(23 - timeZoneOffset, 59, 59); // 23:59:59
      } else { // if ahead
        endDate.setDate(endDate.getDate() + 1);
        endDate.setHours(-1 * (timeZoneOffset + 1), 59, 59); // 23:59:59
      }
    }
    return endDate;
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

  async fetchJobs() {
    const {filters, startDate, endDate} = this.state;
    filters.startAvailability = this.getUTCStartInterval(startDate);
    filters.endAvailability = this.getUTCEndInterval(endDate);
    console.log(filters);
    const jobs = await JobService.getJobDashboardByFilters(filters);
    const {returnJobs} = this.props;
    returnJobs(jobs, filters);
    return jobs;
  }

  handleFilterChangeDelayed(e) {
    const self = this;
    const {value} = e.target;
    const {filters} = this.state;

    if (self.state.typingTimeout) {
      clearTimeout(self.state.typingTimeout);
    }

    filters[e.target.name] = value;

    self.setState({
      typing: false,
      typingTimeout: setTimeout(async () => {
        await this.fetchJobs();
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
    const {start} = e;
    if (e.start) {
      start.setHours(0, 0, 0);
    }
    const {end} = e;
    if (e.end) {
      end.setHours(23, 59, 59); // 23:59:59
    }
    this.setState({startDate: start, endDate: end});
    await this.fetchJobs();
  }

  async filterWithStatus(filters) {
    this.state = {filters}
    await this.fetchJobs();
  }

  render() {
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
              <form id="filter-form" className="form">
                <Col lg={12}>
                  <Row lg={12} id="filter-input-row">
                    <Col md="2">
                      <div className="filter-item-title">
                        Date Range
                      </div>
                      <TIntervalDatePicker
                        startDate={startDate}
                        endDate={endDate}
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
                      <TField
                        input={
                          {
                            onChange: this.handleFilterChangeDelayed,
                            name: 'rate',
                            value: filters.rate
                          }
                        }
                        className="filter-text"
                        placeholder="Any"
                        type="number"
                      />
                    </Col>
                    <Col md="1">
                      <div className="filter-item-title">
                        Min Capacity
                      </div>
                      <TField
                        input={
                          {
                            onChange: this.handleFilterChangeDelayed,
                            name: 'minTons',
                            value: filters.minTons
                          }
                        }
                        className="filter-text"
                        placeholder="# of tons"
                        type="number"
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
                      <TField
                        input={
                          {
                            onChange: this.handleFilterChangeDelayed,
                            name: 'numEquipments',
                            value: filters.numEquipments
                          }
                        }
                        className="filter-text"
                        placeholder="Any"
                        type="number"
                      />
                    </Col>
                    <Col md="1">
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
                    <Col md="3">
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
  returnJobs: PropTypes.func.isRequired
};

JobFilter.defaultProps = {};

export default JobFilter;
