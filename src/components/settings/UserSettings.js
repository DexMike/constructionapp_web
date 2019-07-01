import { Auth } from 'aws-amplify';
import React, { Component } from 'react';
import {
  Button,
  Col,
  Container,
  Row,
  Modal
} from 'reactstrap';
import * as PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import moment from 'moment';
import EyeIcon from 'mdi-react/EyeIcon';
// import CloneDeep from 'lodash.clonedeep';
// import TFormat from '../common/TFormat';
import TField from '../common/TField';
import TSelect from '../common/TSelect';

import UserService from '../../api/UserService';
import LookupsService from '../../api/LookupsService';
import AddressService from '../../api/AddressService';
import './Settings.css';
import ProfileService from "../../api/ProfileService";
import i18n from "i18next";


class UserSettings extends Component {
  constructor(props) {
    super(props);
    const user = {
      companyId: '',
      firstName: '',
      lastName: '',
      email: '',
      mobilePhone: '',
      phone: '',
      preferredLanguage: ''
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
      modal: false,
      ...user,
      ...address,
      languages: [],
      // countries: [],
      states: [],
      countryStates: [],
      timeZones: [],
      state: '',
      country: '',
      timeZone: '',
      reqHandlerFName: {
        touched: false,
        error: ''
      },
      reqHandlerLName: {
        touched: false,
        error: ''
      },
      reqHandlerPhone: {
        touched: false,
        error: ''
      },
      reqHandlerLanguage: {
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
      showOldPassword: false,
      showNewPassword: false,
      showConfirmationPassword: false,
      oldPassword: '',
      newPassword: '',
      passwordConfirmation: '',
      reqHandlerOldPassword: {
        touched: false,
        error: ''
      },
      reqHandlerNewPassword: {
        touched: false,
        error: ''
      },
      reqHandlerPasswordConfirmation: {
        touched: false,
        error: ''
      },
      showResetPasswordError: false,
      errorMessage: ''
    };
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handlePreferredLangChange = this.handlePreferredLangChange.bind(this);
    this.handleStateChange = this.handleStateChange.bind(this);
    this.handleCountryChange = this.handleCountryChange.bind(this);
    this.handleTimeZoneChange = this.handleTimeZoneChange.bind(this);
    this.saveUser = this.saveUser.bind(this);
    this.toggle = this.toggle.bind(this);
  }

  async componentDidMount() {
    const { user, address } = this.props;
    await this.setUser(user);
    await this.setAddress(address);
    await this.fetchLookupsValues();
  }

  async setUser(userProps) {
    const user = userProps;
    Object.keys(user)
      .map((key) => {
        if (user[key] === null) {
          user[key] = '';
        }
        return true;
      });
    this.setState({
      ...user
    });
  }

  async setAddress(addressProps) {
    const address = addressProps;
    Object.keys(address)
      .map((key) => {
        if (address[key] === null) {
          address[key] = '';
        }
        return true;
      });
    this.setState({
      ...address
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

  setUserInfo() {
    const { user } = this.props;
    const {
      firstName,
      lastName,
      email,
      mobilePhone,
      phone,
      preferredLanguage
    } = this.state;
    const newUser = user;

    newUser.firstName = firstName;
    newUser.lastName = lastName;
    newUser.email = email;
    newUser.mobilePhone = mobilePhone;
    newUser.phone = phone;
    newUser.preferredLanguage = preferredLanguage;
    return newUser;
  }

  setAddressInfo() {
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
    return newAddress;
  }

  async fetchLookupsValues() {
    const lookups = await LookupsService.getLookups();

    let languages = [];
    let countries = [];
    let states = [];
    let countryStates = [];
    Object.values(lookups)
      .forEach((itm) => {
        if (itm.key === 'Language') languages.push(itm);
        if (itm.key === 'Country') countries.push(itm);
        if (itm.key === 'States') states.push(itm);
      });

    languages = languages.map(language => ({
      value: String(language.val1),
      label: language.val1
    }));

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
      languages,
      // countries,
      states,
      countryStates
    });
  }

  toggle() {
    this.setState(prevState => ({
      modal: !prevState.modal
    }));
  }

  handleInputChange(e) {
    const { value } = e.target;
    let reqHandler = '';

    if (e.target.name === 'firstName') {
      reqHandler = 'reqHandlerFName';
    }
    if (e.target.name === 'lastName') {
      reqHandler = 'reqHandlerLName';
    }
    if (e.target.name === 'mobilePhone') {
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

    if (e.target.name === 'oldPassword') {
      reqHandler = 'reqHandlerOldPassword';
    }
    if (e.target.name === 'newPassword') {
      reqHandler = 'reqHandlerNewPassword';
    }
    if (e.target.name === 'passwordConfirmation') {
      reqHandler = 'reqHandlerPasswordConfirmation';
    }

    this.setState({
      [reqHandler]: Object.assign({}, reqHandler, {
        touched: false
      }),
      [e.target.name]: value
    });
  }

  async handlePreferredLangChange(e) {
    const reqHandler = 'reqHandlerLanguage';
    this.setState({
      [reqHandler]: Object.assign({}, reqHandler, {
        touched: false
      }),
      preferredLanguage: e.value
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

  handleTimeZoneChange(e) {
    const reqHandler = 'reqHandlerTimezone';
    this.setState({
      [reqHandler]: Object.assign({}, reqHandler, {
        touched: false
      }),
      timeZone: e.value
    });
  }

  isFormValid() {
    const {
      firstName,
      lastName,
      mobilePhone,
      address1,
      city,
      state,
      zipCode,
      country
    } = this.state;
    let {
      reqHandlerFName,
      reqHandlerLName,
      reqHandlerPhone,
      reqHandlerAddress,
      reqHandlerCity,
      reqHandlerState,
      reqHandlerZip
    } = this.state;
    let isValid = true;
    if (firstName === null || firstName.length === 0) {
      reqHandlerFName = {
        touched: true,
        error: 'Please enter user first name'
      };
      isValid = false;
    }

    if (lastName === null || lastName.length === 0) {
      reqHandlerLName = {
        touched: true,
        error: 'Please enter user last name'
      };
      isValid = false;
    }

    if (mobilePhone === null || mobilePhone.length === 0) {
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
        error: 'Please select a State'
      };
      isValid = false;
    }

    if (zipCode === null || zipCode.length === 0) {
      reqHandlerZip = {
        touched: true,
        error: 'Please enter Zip code'
      };
      isValid = false;
    }

    this.setState({
      reqHandlerFName,
      reqHandlerLName,
      reqHandlerPhone,
      reqHandlerAddress,
      reqHandlerState,
      reqHandlerCity,
      reqHandlerZip
    });
    if (isValid) {
      return true;
    }

    return false;
  }

  async saveUser() {
    if (!this.isFormValid()) {
      return;
    }
    // const profile = await ProfileService.getProfile();
    // const user = await UserService.getUserById(profile.userId);
    // user.preferredLanguage = e.value;
    // await UserService.updateUser(user);
    const user = this.setUserInfo();

    const address = this.setAddressInfo();
    if (user && user.id) {
      user.modifiedOn = moment()
        .unix() * 1000;
      try {
        await UserService.updateUser(user);
        const {preferredLanguage} = this.state;
        i18n.changeLanguage(preferredLanguage);
        this.setState({preferredLanguage});
        await AddressService.updateAddress(address);
        // console.log('Updated');
      } catch (err) {
        console.log(err);
      }
    }
  }

  async changeUserPassword() {
    const { oldPassword, newPassword, passwordConfirmation } = this.state;
    let {
      reqHandlerOldPassword,
      reqHandlerNewPassword,
      reqHandlerPasswordConfirmation
    } = this.state;
    let isValid = true;

    if (oldPassword === null || oldPassword.length === 0) {
      reqHandlerOldPassword = {
        touched: true,
        error: 'Please enter your current password'
      };
      isValid = false;
    }

    if (newPassword === null || newPassword.length === 0) {
      reqHandlerNewPassword = {
        touched: true,
        error: 'Please enter your new password'
      };
      isValid = false;
    }

    if (passwordConfirmation === null || passwordConfirmation.length === 0
      || passwordConfirmation !== newPassword) {
      reqHandlerPasswordConfirmation = {
        touched: true,
        error: "Passwords don't match"
      };
      isValid = false;
    }

    this.setState({
      reqHandlerOldPassword,
      reqHandlerNewPassword,
      reqHandlerPasswordConfirmation
    });
    if (isValid) {
      let showResetPasswordError = false;
      let errorMessage = '';
      try {
        await Auth.currentAuthenticatedUser()
          .then(user => Auth.changePassword(user, oldPassword, newPassword))
          .then(() => {
            showResetPasswordError = false;
            this.toggle();
          })
          .catch((error) => {
            errorMessage = error.message;
            showResetPasswordError = true;
          });
      } catch (e) {
        errorMessage = 'Please try again after some time...';
        showResetPasswordError = true;
      }
      this.setState({
        oldPassword: '',
        newPassword: '',
        passwordConfirmation: '',
        showResetPasswordError,
        errorMessage
      });
      return true;
    }

    return false;
  }

  renderModal() {
    const {
      showOldPassword,
      showNewPassword,
      showConfirmationPassword,
      modal,
      oldPassword,
      newPassword,
      passwordConfirmation,
      reqHandlerOldPassword,
      reqHandlerNewPassword,
      reqHandlerPasswordConfirmation,
      showResetPasswordError,
      errorMessage
    } = this.state;
    return (
      <Modal isOpen={modal} toggle={this.toggle} className="password-reset-modal">
        <form autoComplete="new-password" className="form">
          <Row>
            <Col className="text-left" md={12} style={{fontSize: 16}}>
              <strong><Trans>Change Password</Trans></strong>
            </Col>
            <Col md={12}>
              {
                showResetPasswordError
                  ? (
                    <div className="alert alert-danger p-1" role="alert">
                      <p style={{color: '#FFF'}}><strong>Error! </strong>{errorMessage}</p>
                    </div>
                  ) : null
              }
            </Col>
            <Col md={12} className="text-left pt-2 form__form-group">
              <span>
                <Trans>Current Password</Trans>
              </span>
              <div className="form__form-group-field">
                <input
                  name="oldPassword"
                  type={showOldPassword ? 'text' : 'password'}
                  placeholder="Enter Current Password"
                  value={oldPassword}
                  onChange={this.handleInputChange}
                />
                <button
                  type="button"
                  className={`form__form-group-button${showOldPassword ? ' active' : ''}`}
                  onClick={() => this.setState({ showOldPassword: !showOldPassword })}
                >
                  <EyeIcon/>
                </button>
              </div>
              {
                reqHandlerOldPassword.touched
                  ? (
                    <span style={{color: '#D32F2F'}}>
                      {reqHandlerOldPassword.error}
                    </span>
                  )
                  : null
              }
            </Col>
            <Col md={12} className="text-left pt-2 form__form-group">
              <span className="pt-2">
                <Trans>New Password</Trans>
              </span>
              <div className="form__form-group-field">
                <input
                  name="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="Enter New Password"
                  value={newPassword}
                  onChange={this.handleInputChange}
                />
                <button
                  type="button"
                  className={`form__form-group-button${showNewPassword ? ' active' : ''}`}
                  onClick={() => this.setState({ showNewPassword: !showNewPassword })}
                >
                  <EyeIcon/>
                </button>
              </div>
              {
                reqHandlerNewPassword.touched
                  ? (
                    <span style={{color: '#D32F2F'}}>
                      {reqHandlerNewPassword.error}
                    </span>
                  )
                  : null
                }
            </Col>
            <Col md={12} className="text-left pt-2 form__form-group">
              <span className="pt-2">
                <Trans>Confirm Password</Trans>
              </span>
              <div className="form__form-group-field">
                <input
                  name="passwordConfirmation"
                  type={showConfirmationPassword ? 'text' : 'password'}
                  placeholder="Enter Current Password"
                  value={passwordConfirmation}
                  onChange={this.handleInputChange}
                />
                <button
                  type="button"
                  className={`form__form-group-button${showConfirmationPassword ? ' active' : ''}`}
                  onClick={() => this.setState({
                    showConfirmationPassword: !showConfirmationPassword
                  })}
                >
                  <EyeIcon/>
                </button>
              </div>
              {
                reqHandlerPasswordConfirmation.touched
                  ? (
                    <span style={{color: '#D32F2F'}}>
                      {reqHandlerPasswordConfirmation.error}
                    </span>
                  )
                  : null
              }
            </Col>
            <Col md={12} className="pt-4 text-right">
              <Button onClick={() => {
                this.toggle();
                this.setState({
                  showResetPasswordError: false
                });
              }}
              >
                <Trans>Cancel</Trans>
              </Button>
              <Button
                color="primary"
                onClick={() => {
                  this.changeUserPassword();
                }
              }
              >
                <Trans>Save</Trans>
              </Button>
            </Col>
          </Row>
        </form>
      </Modal>
    );
  }

  render() {
    const { user, admin } = this.props;
    const {
      firstName,
      lastName,
      // email,
      mobilePhone,
      phone,
      preferredLanguage,
      reqHandlerFName,
      reqHandlerLName,
      // reqHandlerEmail,
      reqHandlerPhone,
      reqHandlerLanguage,
      address1,
      address2,
      city,
      state,
      // country,
      zipCode,
      reqHandlerAddress,
      reqHandlerCity,
      reqHandlerZip,
      timeZone
    } = this.state;

    const {
      languages,
      // countries,
      countryStates,
      // states,
      timeZones
    } = this.state;
    return (
      <Container>
        <Row className="tab-content-header">
          {this.renderModal()}
          <Col md={6}>
            <span style={{fontWeight: 'bold', fontSize: 20}}>
              <Trans>{ admin ? 'Admin' : 'User' }</Trans> - {user.firstName} {user.lastName}
            </span>
          </Col>
          <Col md={6} className="text-right">
            <strong><Trans>Email</Trans>:</strong> {user.email}
          </Col>
        </Row>
        <Row className="pt-2">
          <Col md={12}>&nbsp;</Col>
          <Col md={6}>
            <span>
              <Trans>First Name</Trans>
            </span>
            <TField
              className="settings-input"
              input={{
                onChange: this.handleInputChange,
                name: 'firstName',
                value: firstName
              }}
              placeholder="First Name"
              type="text"
              meta={reqHandlerFName}
            />
          </Col>
          <Col md={6}>
            <span>
            <Trans>Last Name</Trans>
            </span>
            <TField
              input={{
                onChange: this.handleInputChange,
                name: 'lastName',
                value: lastName
              }}
              placeholder="Last Name"
              type="text"
              meta={reqHandlerLName}
            />
          </Col>
        </Row>
        <Row className="pt-2">
          <Col md={6}>
            <span>
            <Trans>Mobile Phone</Trans>
            </span>
            <TField
              input={{
                onChange: this.handleInputChange,
                name: 'mobilePhone',
                value: mobilePhone
              }}
              placeholder="Mobile Phone"
              type="text"
              meta={reqHandlerPhone}
            />
          </Col>
          <Col md={6}>
            <span>
            <Trans>Work Phone</Trans>
            </span>
            <TField
              input={{
                onChange: this.handleInputChange,
                name: 'phone',
                value: phone
              }}
              placeholder="Work Phone"
              type="text"
            />
          </Col>
        </Row>
        <Row className="pt-4 pl-3 pr-3">
          <Col md={12} className="separator">
            <span className="sub-header"><Trans>Company Address</Trans></span>
          </Col>
        </Row>
        <Row>
          <Col md={6} className="pt-4">
            <Row>
              <Col md={12}>
                <span><Trans>Address #1</Trans></span>
                <TField
                  input={{
                    onChange: this.handleInputChange,
                    name: 'address1',
                    value: address1,
                    disabled: !admin
                  }}
                  placeholder="Address 1"
                  type="text"
                  meta={reqHandlerAddress}
                />
              </Col>
              <Col md={12} className="pt-2">
                <span>
                  <Trans>Address #2</Trans>
                </span>
                <TField
                  input={{
                    onChange: this.handleInputChange,
                    name: 'address2',
                    value: address2,
                    disabled: !admin
                  }}
                  placeholder="Address 2"
                  type="text"
                />
              </Col>
              <Col md={6} className="pt-2">
                <span>
                  <Trans>City</Trans>
                </span>
                <TField
                  input={{
                    onChange: this.handleInputChange,
                    name: 'city',
                    value: city,
                    disabled: !admin
                  }}
                  placeholder="City"
                  type="text"
                  meta={reqHandlerCity}
                />
              </Col>
              <Col md={3} className="pt-2">
                <span>
                  <Trans>State</Trans>
                </span>
                <TSelect
                  input={
                    {
                      onChange: this.handleStateChange,
                      name: 'state',
                      value: state,
                      disabled: !admin
                    }
                  }
                  options={countryStates}
                  placeholder="State"
                />
              </Col>
              <Col md={3} className="pt-2">
                <span>
                  <Trans>Zip Code</Trans>
                </span>
                <TField
                  input={{
                    onChange: this.handleInputChange,
                    name: 'zipCode',
                    value: zipCode,
                    disabled: !admin
                  }}
                  placeholder="Zip Code"
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
          <Col md={6} className="pt-4">
            <Row>
              <Col md={12}>
                <span>
                  <Trans>Time Zone</Trans>
                </span>
                <TSelect
                  input={
                    {
                      onChange: this.handleTimeZoneChange,
                      name: 'timeZone',
                      value: timeZone,
                      disabled: !admin
                    }
                  }
                  // meta={}
                  options={timeZones}
                  placeholder="Select a Time Zone"
                />
              </Col>
              <Col md={12} className="pt-2">
                <span >
                  <Trans>Primary Language</Trans>
                </span>
                <TSelect
                  input={
                    {
                      onChange: this.handlePreferredLangChange,
                      name: 'preferredLanguage',
                      value: preferredLanguage
                    }
                  }
                  meta={reqHandlerLanguage}
                  value={preferredLanguage}
                  options={languages}
                  placeholder="Select a language"
                />
              </Col>
            </Row>
          </Col>
        </Row>
        <Row className="mt-4 line-separator">
          <Col md={2} className="pt-4">
            <Button onClick={this.toggle}><Trans>Change Password</Trans></Button>
          </Col>
        </Row>
        <Row>
          <Col md={12} className="text-right">
            <Link to="/">
              <Button className="mr-2">
              <Trans>Cancel</Trans>
              </Button>
            </Link>
            <Button
              color="primary"
              onClick={this.saveUser}
            >
              <Trans>Save</Trans>
            </Button>
          </Col>
        </Row>
      </Container>
    );
  }
}

UserSettings.propTypes = {
  user: PropTypes.shape({
    companyId: PropTypes.number,
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    email: PropTypes.string,
    mobilePhone: PropTypes.string,
    phone: PropTypes.string,
    preferredLanguage: PropTypes.string
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
  }),
  admin: PropTypes.bool
};

UserSettings.defaultProps = {
  user: {
    companyId: 0,
    firstName: '',
    lastName: '',
    email: '',
    mobilePhone: '',
    phone: '',
    preferredLanguage: ''
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
  },
  admin: false
};

export default UserSettings;
