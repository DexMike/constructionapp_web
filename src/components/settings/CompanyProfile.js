import React, { Component } from 'react';
import {withTranslation} from 'react-i18next';
import {
  Button,
  Col,
  Container,
  Row
} from 'reactstrap';
import * as PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import moment from 'moment';
import TField from '../common/TField';
import TSelect from '../common/TSelect';

import LookupsService from '../../api/LookupsService';
import AddressService from '../../api/AddressService';
import CompanyService from '../../api/CompanyService';
import TSpinner from '../common/TSpinner';
import GeoUtils from '../../utils/GeoUtils';
import './Settings.css';

class CompanyProfile extends Component {
  constructor(props) {
    super(props);
    const company = {
      id: 0,
      legalName: '',
      dba: '',
      addressId: '0',
      phone: '',
      url: '',
      fax: '',
      rating: 0,
      type: '0',
      dotNumber: ''
    };

    const address = {
      companyId: '',
      name: '',
      address1: '',
      address2: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US'
    };

    this.state = {
      ...company,
      ...address,
      // countries: [],
      states: [],
      countryStates: [],
      state: '',
      country: '',
      reqHandlerLegalName: {
        touched: false,
        error: ''
      },
      reqHandlerPhone: {
        touched: false,
        error: ''
      },
      reqHandlerAddress: {
        touched: false,
        error: ''
      },
      reqHandlerCity: {
        touched: false,
        error: ''
      },
      reqHandlerState: {
        touched: false,
        error: ''
      },
      reqHandlerZip: {
        touched: false,
        error: ''
      },
      loading: false,
      alert: false,
      error: false
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleStateChange = this.handleStateChange.bind(this);
    this.handleCountryChange = this.handleCountryChange.bind(this);
    this.saveCompany = this.saveCompany.bind(this);
  }

  async componentDidMount() {
    const { company, address } = this.props;
    await this.setCompany(company);
    await this.setAddress(address);
    await this.fetchLookupsValues();
  }

  async setCompany(companyProps) {
    const company = companyProps;
    Object.keys(company)
      .map((key) => {
        if (company[key] === null) {
          company[key] = '';
        }
        return true;
      });
    this.setState({
      ...company
    });
  }

  async setAddress(addressProps) {
    const { legalName } = this.state;
    const address = addressProps;
    Object.keys(address)
      .map((key) => {
        if (address[key] === null) {
          address[key] = '';
        }
        return true;
      });
    this.setState({
      ...address,
      legalName // For some reason this value was set to '' here
    });
  }

  setCountryStates(country) {
    const { states } = this.state;
    let {countryStates } = this.state;
    if (country === 'USA') {
      countryStates = states;
    } else {
      countryStates = [];
    }
    this.setState({
      countryStates
    });
  }

  setCompanyInfo() {
    const { company } = this.props;
    const {
      legalName,
      phone,
      url,
      fax
    } = this.state;
    const newCompany = company;

    newCompany.legalName = legalName;
    newCompany.phone = phone;
    newCompany.url = url;
    newCompany.fax = fax;
    return newCompany;
  }

  async setAddressInfo() {
    const { address } = this.props;
    const {
      address1,
      address2,
      city,
      state,
      zipCode,
      country
    } = this.state;
    const newAddress = address;

    newAddress.address1 = address1;
    newAddress.address2 = address2;
    newAddress.city = city;
    newAddress.state = state;
    newAddress.zipCode = zipCode;
    newAddress.country = country;
    try {
      const response = await GeoUtils.getCoordsFromAddress(`${address1}, ${city} ${state} ${zipCode}`);
      newAddress.latitude = response.lat;
      newAddress.longitude = response.lng;
    } catch (e) {
      // console.log(e);
    }
    return newAddress;
  }

  setCheckedStatus(state, checkboxClass) {
    const x = document.getElementsByClassName(checkboxClass);
    for (let i = 0; i < x.length; i += 1) {
      x[i].checked = state;
    }
  }

  async fetchLookupsValues() {
    const lookups = await LookupsService.getLookups();

    let countries = [];
    let states = [];
    let countryStates = [];
    Object.values(lookups)
      .forEach((itm) => {
        if (itm.key === 'Country') countries.push(itm);
        if (itm.key === 'States') states.push(itm);
      });

    countries = countries.map(countrie => ({
      value: String(countrie.val2),
      label: countrie.val1
    }));

    states = states.map(state => ({
      value: String(state.val2),
      label: state.val1
    }));

    countryStates = states;

    this.setState({
      // countries,
      states,
      countryStates
    });
  }

  handleInputChange(e) {
    const { value } = e.target;
    let reqHandler = '';

    if (e.target.name === 'legalName') {
      reqHandler = 'reqHandlerLegalName';
    }
    if (e.target.name === 'phone') {
      reqHandler = 'reqHandlerPhone';
    }

    if (e.target.name === 'address1') {
      reqHandler = 'reqHandlerAddress';
    }
    if (e.target.name === 'city') {
      reqHandler = 'reqHandlerCity';
    }
    if (e.target.name === 'state') {
      reqHandler = 'reqHandlerState';
    }
    if (e.target.name === 'zipCode') {
      reqHandler = 'reqHandlerZip';
    }

    this.setState({
      [reqHandler]: Object.assign({}, reqHandler, {
        touched: false
      }),
      [e.target.name]: value
    });
  }

  handleStateChange(e) {
    const reqHandler = 'reqHandlerState';
    this.setState({
      [reqHandler]: Object.assign({}, reqHandler, {
        touched: false
      }),
      state: e.value
    });
  }

  handleCountryChange(e) {
    this.setCountryStates(e.value);
    const reqHandler = 'reqHandlerCountry';
    this.setState({
      [reqHandler]: Object.assign({}, reqHandler, {
        touched: false
      }),
      country: e.value
    });
  }

  isFormValid() {
    const {
      legalName,
      phone,
      address1,
      city,
      state,
      zipCode,
      country
    } = this.state;
    let {
      reqHandlerLegalName,
      reqHandlerPhone,
      reqHandlerAddress,
      reqHandlerCity,
      reqHandlerState,
      reqHandlerZip
    } = this.state;
    let isValid = true;
    if (legalName === null || legalName.length === 0) {
      reqHandlerLegalName = {
        touched: true,
        error: 'Please enter company name'
      };
      isValid = false;
    }

    if (phone === null || phone.length === 0) {
      reqHandlerPhone = {
        touched: true,
        error: 'Please enter phone number'
      };
      isValid = false;
    }

    if (address1 === null || address1.length === 0) {
      reqHandlerAddress = {
        touched: true,
        error: 'Please enter main address'
      };
      isValid = false;
    }

    if (city === null || city.length === 0) {
      reqHandlerCity = {
        touched: true,
        error: 'Please enter city name'
      };
      isValid = false;
    }

    if (country === 'USA' && (state === null || state.length === 0)) {
      reqHandlerState = {
        touched: true,
        error: 'Please select a state'
      };
      isValid = false;
    }

    if (zipCode === null || zipCode.length === 0) {
      reqHandlerZip = {
        touched: true,
        error: 'Please enter zip code'
      };
      isValid = false;
    }

    this.setState({
      reqHandlerLegalName,
      reqHandlerPhone,
      reqHandlerAddress,
      reqHandlerState,
      reqHandlerCity,
      reqHandlerZip
    });
    if (isValid) {
      return true;
    }
    this.setState({ loading: false });
    return false;
  }

  async saveCompany() {
    this.setState({loading: true});
    if (!this.isFormValid()) {
      return;
    }
    let error = false;
    const company = this.setCompanyInfo();
    const address = await this.setAddressInfo();
    if (company && company.id) {
      company.modifiedOn = moment.utc().format();
      try {
        await CompanyService.updateCompany(company);
        await AddressService.updateAddress(address);
      } catch (err) {
        error = true;
        // console.log(err);
      }
    }
    this.setState({
      error,
      alert: true,
      loading: false
    });
  }

  render() {
    const { t } = { ...this.props };
    const translate = t;
    const {
      legalName,
      phone,
      url,
      fax,
      address1,
      address2,
      city,
      state,
      // country,
      zipCode,
      dotNumber,
      reqHandlerLegalName,
      reqHandlerPhone,
      reqHandlerAddress,
      reqHandlerCity,
      reqHandlerZip,
      error,
      alert,
      loading
    } = this.state;

    const {
      // countries,
      // states,
      countryStates
    } = this.state;

    const { company } = this.props;
    return (
      <Container>
        <Row className="tab-content-header">
          <Col md={12}>
            <span style={{fontWeight: 'bold', fontSize: 20}}>
              {company.legalName || ''}
            </span>
          </Col>
        </Row>
        <Row>
          <Col>
            {
              alert && (
                <div className={`alert alert-${error ? 'danger' : 'success'} p-2`} role="alert" style={{ width: '100%', color: '#FFF', marginTop: 16, borderLeft: 5, borderLeftColor: 'red' }}>
                  {
                    !error ? (
                      <span style={{ width: '70%' }}>
                        <span className="lnr lnr-checkmark-circle"/>
                        &nbsp;{t('Company Updated')}!
                      </span>
                    ) : (
                      <span style={{ width: '70%' }}>
                        <span className="lnr lnr-cross-circle"/>
                        &nbsp;{t('Error')}!
                        &nbsp;{t("The information couldn't be saved")}. {t('Please try again')}...
                      </span>
                    )
                  }
                  <div className="text-right" style={{ width: '30%' }}>
                    <button type="button" className="close" data-dismiss="alert" aria-label="Close" onClick={() => this.setState({ alert: false })}>
                      <span className="lnr lnr-cross"/>
                    </button>
                  </div>
                </div>
              )
            }
          </Col>
        </Row>
        <Row className="pt-2">
          <Col md={12}>&nbsp;</Col>
          <Col md={6}>
            <span>
              {translate('Company Name')}
            </span>
            <TField
              className="settings-input"
              input={{
                onChange: this.handleInputChange,
                name: 'legalName',
                value: legalName
              }}
              placeholder={translate('Company Name')}
              type="text"
              meta={reqHandlerLegalName}
            />
          </Col>
          <Col md={6}>
            <span>
              {translate('Website')}
            </span>
            <TField
              input={{
                onChange: this.handleInputChange,
                name: 'url',
                value: url
              }}
              placeholder={translate('Website')}
              type="text"
            />
          </Col>
        </Row>
        <Row className="pt-2">
          <Col md={6}>
            <span>
              {translate('Phone number')}
            </span>
            <TField
              input={{
                onChange: this.handleInputChange,
                name: 'phone',
                value: phone
              }}
              placeholder={translate('Phone number')}
              type="text"
              meta={reqHandlerPhone}
            />
          </Col>
          <Col md={6}>
            <span>
              Fax
            </span>
            <TField
              input={{
                onChange: this.handleInputChange,
                name: 'fax',
                value: fax
              }}
              placeholder="Fax"
              type="text"
            />
          </Col>
        </Row>
        <Row className="pt-2">
          <Col md={6}>
            <span>{translate('DOT Number')}</span>
            <TField
              input={{
                value: dotNumber,
                readOnly: true,
                disabled: true
              }}
              type="text"
            />
          </Col>
        </Row>
        <Row className="pt-4 pl-3 pr-3">
          <Col md={12} className="separator">
            <span className="sub-header">{translate('Company Address')}</span>
          </Col>
        </Row>
        <Row>
          <Col md={6} className="pt-4">
            <Row>
              <Col md={12}>
                <span>{translate('Address 1')}</span>
                <TField
                  input={{
                    onChange: this.handleInputChange,
                    name: 'address1',
                    value: address1
                  }}
                  placeholder={translate('Address 1')}
                  type="text"
                  meta={reqHandlerAddress}
                />
              </Col>
              <Col md={12} className="pt-2">
                <span>
                  {translate('Address 2')}
                </span>
                <TField
                  input={{
                    onChange: this.handleInputChange,
                    name: 'address2',
                    value: address2
                  }}
                  placeholder={translate('Address 2')}
                  type="text"
                />
              </Col>
              <Col md={6} className="pt-2">
                <span>
                  {translate('City')}
                </span>
                <TField
                  input={{
                    onChange: this.handleInputChange,
                    name: 'city',
                    value: city
                  }}
                  placeholder="City"
                  type="text"
                  meta={reqHandlerCity}
                />
              </Col>
              <Col md={3} className="pt-2">
                <span>
                  {translate('State')}
                </span>
                <TSelect
                  input={
                    {
                      onChange: this.handleStateChange,
                      name: 'state',
                      value: state
                    }
                  }
                  options={countryStates}
                  placeholder={translate('State')}
                />
              </Col>
              <Col md={3} className="pt-2">
                <span>
                  {translate('Zip Code')}
                </span>
                <TField
                  input={{
                    onChange: this.handleInputChange,
                    name: 'zipCode',
                    value: zipCode
                  }}
                  placeholder={translate('Zip Code')}
                  type="text"
                  meta={reqHandlerZip}
                />
              </Col>
              {
                /*
                  <Col md={12} className="pt-2">
                  <span>
                    Country
                  </span>
                  <TSelect
                    input={
                      {
                        onChange: this.handleCountryChange,
                        name: 'country',
                        value: country,
                        disabled: !admin
                      }
                    }
                    // meta={}
                    options={countries}
                    placeholder="Select a Country"
                  />
                </Col>
                */
              }
            </Row>
          </Col>
        </Row>
        <Row>
          <Col md={12} className="pt-4 text-right">
            <Link to="/">
              <Button className="mr-2">
                {translate('Cancel')}
              </Button>
            </Link>
            <Button
              disabled={loading}
              color="primary"
              onClick={this.saveCompany}
            >
              {
                loading ? (
                  <TSpinner
                    color="#808080"
                    loaderSize={10}
                    loading
                  />
                ) : translate('Save')
              }
            </Button>
          </Col>
        </Row>
      </Container>
    );
  }
}

CompanyProfile.propTypes = {
  company: PropTypes.shape({
    id: PropTypes.number,
    legalName: PropTypes.string,
    dba: PropTypes.string,
    addressId: PropTypes.number,
    phone: PropTypes.string,
    url: PropTypes.string,
    fax: PropTypes.string,
    rating: PropTypes.string,
    type: PropTypes.string
  }),
  address: PropTypes.shape({
    companyId: PropTypes.number,
    name: PropTypes.string,
    address1: PropTypes.string,
    address2: PropTypes.string,
    city: PropTypes.string,
    state: PropTypes.string,
    zipCode: PropTypes.string,
    country: PropTypes.string
  })
};

CompanyProfile.defaultProps = {
  company: {
    id: 0,
    legalName: '',
    dba: '',
    addressId: 0,
    phone: '',
    url: '',
    fax: '',
    rating: '0',
    type: 'Customer'
  },
  address: {
    companyId: 0,
    name: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US'
  }
};

export default withTranslation()(CompanyProfile);
