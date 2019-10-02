import React, { Component } from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';
import { Col, Row, Button, Container } from 'reactstrap';
import TFormat from '../common/TFormat';
import TSpinner from '../common/TSpinner';
import GeoUtils from '../../utils/GeoUtils';
import AddressService from '../../api/AddressService';
import UserService from '../../api/UserService';
import LookupsService from '../../api/LookupsService';
import SelectField from '../common/TSelect';
import TField from '../common/TField';
import TAlert from '../common/TAlert';

import './Address.scss';

class AddressForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loaded: false,
      loading: false,
      alert: null,
      actionStatus: null,
      states: [],
      address: {},
      reqHandlerName: {
        touched: false,
        error: ''
      },
      reqHandlerType: {
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
      reqHandlerZipCode: {
        touched: false,
        error: ''
      }
    };
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleStateChange = this.handleStateChange.bind(this);
    this.saveAddress = this.saveAddress.bind(this);
    this.onDismiss = this.onDismiss.bind(this);
  }

  async componentDidMount() {
    let { address } = this.state;
    const { addressId, profile } = this.props;
    this.mounted = true;
    await this.fetchLookupsValues();
    if (addressId) {
      address = await AddressService.getAddressById(addressId); 
      this.fetchForeignValues(address);
    } else {
      address = AddressService.getDefaultAddress();
    }
    address.companyId = profile.companyId;
    this.setState({
      address,
      loaded: true
    });
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  onDismiss() {
    this.setState({ alert: null });
  }

  async fetchLookupsValues() {
    let lookups;
    try {
      lookups = await LookupsService.getLookupsByType('States');
    } catch (e) {
      // console.log(e);
    }

    let states = [];
    if (lookups && lookups.length > 0) {
      states = lookups.map(state => ({
        value: String(state.val1),
        label: state.val1
      }));
    }

    if (this.mounted) {
      this.setState({
        loaded: true,
        states
      });
    }
  }

  async fetchForeignValues(address) {
    let createdByName = 'Not defined';
    let modifiedByName = 'Not defined';
    if (address.createdBy) {
      try {
        const user = await UserService.getUserById(address.createdBy);
        createdByName = `${user.firstName} ${user.lastName}`;
      } catch (e) {
        createdByName = address.createdBy;
      }
    }
    if (address.modifiedBy) {
      try {
        const user = await UserService.getUserById(address.modifiedBy);
        modifiedByName = `${user.firstName} ${user.lastName}`;
      } catch (e) {
        modifiedByName = address.modifiedBy;
      }
    }

    if (this.mounted) {
      this.setState({
        createdByName,
        modifiedByName
      });
    }
  }

  async saveAddress() {
    const { profile, toggle } = this.props;
    const { address } = this.state;
    this.setState({loading: true});
    if (!this.isFormValid()) {
      this.setState({loading: false});
      return;
    }

    const addressString = `${address.address1}, ${address.city}, ${address.state}, ${address.zipCode}, ${address.country}`;
    let response;
    try {
      response = await GeoUtils.getCoordsFromAddress(addressString);      
      // console.log(response);
    } catch (e) {
      this.setState({
        alert: "The system couldn't get the address latitude and longitude. Please try again...",
        actionStatus: false,
        loading: false
      });
      return;
    }

    if (response.lat && response.lng) {
      address.latitude = response.lat;
      address.longitude = response.lng;
    } else {
      this.setState({
        alert: "The system couldn't get the address latitude and longitude. Please try editing some inputs...",
        actionStatus: false,
        loading: false
      });
      return;
    }

    if (address.id) {
      address.modifiedBy = profile.userId;
      address.modifiedOn = moment.tz(
        profile.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone
      ).utc().format();
      try {
        await AddressService.updateAddress(address);
        this.setState({
          alert: 'The information has been successfully updated.',
          actionStatus: true,
          loading: false
        });
        // toggle();
      } catch (e) {
        this.setState({
          alert: "The information couldn't be updated. Please try again...",
          actionStatus: false,
          loading: false
        });
        // console.log(e);
      }
    } else {
      address.createdBy = profile.userId;
      address.createdOn = moment.tz(
        profile.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone
      ).utc().format();
      address.modifiedBy = profile.userId;
      address.modifiedOn = moment.tz(
        profile.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone
      ).utc().format();
      try {
        await AddressService.createAddress(address);
        this.setState({
          alert: 'The information has been successfully saved.',
          actionStatus: true,
          loading: false
        });
        // toggle();
      } catch (e) {
        this.setState({
          alert: "The information couldn't be saved. Please try again...",
          actionStatus: false,
          loading: false
        });
        // console.log(e);
      }
    }
  }

  isFormValid() {
    const { address } = this.state;
    let {
      reqHandlerName,
      reqHandlerType,
      reqHandlerAddress,
      reqHandlerCity,
      reqHandlerState,
      reqHandlerZipCode
    } = this.state;
    let isValid = true;

    if (address.name === null || address.name.length === 0) {
      reqHandlerName = {
        touched: true,
        error: 'Please enter address name'
      };
      isValid = false;
    }

    if (address.type === null || address.type.length === 0) {
      reqHandlerType = {
        touched: true,
        error: 'Please enter address type'
      };
      isValid = false;
    }

    if (address.address1 === null || address.address1.length === 0) {
      reqHandlerAddress = {
        touched: true,
        error: 'Please enter main address'
      };
      isValid = false;
    }

    if (address.city === null || address.city.length === 0) {
      reqHandlerCity = {
        touched: true,
        error: 'Please enter a city name'
      };
      isValid = false;
    }

    // if (address.state === null || address.state.length === 0) {
    //   reqHandlerState = {
    //     touched: true,
    //     error: 'Please select a State'
    //   };
    //   isValid = false;
    // }

    if (address.zipCode === null || address.zipCode.length === 0) {
      reqHandlerZipCode = {
        touched: true,
        error: 'Please enter a Zipcode'
      };
      isValid = false;
    }

    this.setState({
      reqHandlerName,
      reqHandlerType,
      reqHandlerAddress,
      reqHandlerCity,
      reqHandlerState,
      reqHandlerZipCode
    });

    if (isValid) {
      return true;
    }

    return false;
  }

  async handleDelete(addressId) {
    const { toggle } = this.props;
    try {
      await AddressService.deleteAddressById(addressId);
      toggle();
    } catch (e) {
      // console.log(e);
    }
  }

  handleStateChange(e) {
    this.setState(prevState => ({
      address: {
        ...prevState.address,
        state: e ? e.value : ''
      }
    }));
  }

  handleInputChange(e) {
    const { value } = e.target;
    const { name } = e.target;
    this.setState(prevState => ({
      address: {
        ...prevState.address,
        [name]: value
      }
    }));
  }

  renderAddressForm() {
    const { toggle, addressId, profile } = this.props;
    const {
      loading,
      alert,
      actionStatus,
      address,
      states,
      createdByName,
      modifiedByName,
      reqHandlerName,
      reqHandlerAddress,
      reqHandlerType,
      reqHandlerCity,
      reqHandlerState,
      reqHandlerZipCode
    } = this.state;
    return (
      <Container className="address-form form">
        <Row className="form-title">
          <Col md={12}>
            { !addressId ? 'Create Address' : 'Update Address' }
          </Col>
        </Row>
        <Row className="form-content">
          <Col md={12}>
            <TAlert
              color={actionStatus ? 'success' : 'danger'}
              visible={actionStatus != null}
              onDismiss={this.onDismiss}
            >
              <p>
                <span className="bold-text">
                  {actionStatus ? 'Success!' : 'Error!'}
                </span>
                &nbsp;
                {alert}
              </p>
            </TAlert>
          </Col>
          {
            addressId ? (
              <Col md={12} className="text-right">
                <span className="form__form-group-label">
                  ( latitude: {address.latitude}, longitude: {address.longitude} )
                </span>
              </Col>
            ) : ''
          }
          <Col md={12}>
            <div>
              <span className="form__form-group-label">Address Name&nbsp;</span>
              <span className="form-group-label-min">( required )</span>
            </div>
            <TField
              input={{
                onChange: this.handleInputChange,
                name: 'name',
                value: address.name
              }}
              placeholder="Name"
              type="text"
              meta={reqHandlerName}
            />
          </Col>
          <Col md={6}>
            <div>
              <span className="form__form-group-label">Address 1&nbsp;</span>
              <span className="form-group-label-min">( required )</span>
            </div>
            <TField
              input={{
                onChange: this.handleInputChange,
                name: 'address1',
                value: address.address1
              }}
              placeholder="Address 1"
              type="text"
              meta={reqHandlerAddress}
            />
          </Col>
          <Col md={6}>
            <span className="form__form-group-label">Address 2</span>
            <TField
              input={{
                onChange: this.handleInputChange,
                name: 'address2',
                value: address.address2
              }}
              placeholder="Address 2"
              type="text"
              // meta={}
            />
          </Col>
          {
            /*
            <Col md={6}>
                <span className="form__form-group-label">Address 3</span>
                <TField
                  input={{
                    onChange: this.handleInputChange,
                    name: 'address3',
                    value: address.address3
                  }}
                  placeholder="Address 3"
                  type="text"
                  // meta={reqHandlerName}
                />
              </Col>
              <Col md={6}>
                <span className="form__form-group-label">Address 4</span>
                <TField
                  input={{
                    onChange: this.handleInputChange,
                    name: 'address4',
                    value: address.address4
                  }}
                  placeholder="Address 4"
                  type="text"
                  // meta={reqHandlerName}
                />
              </Col>
            */
          }
          <Col md={6}>
            <div>
              <span className="form__form-group-label">City&nbsp;</span>
              <span className="form-group-label-min">( required )</span>
            </div>
            <TField
              input={{
                onChange: this.handleInputChange,
                name: 'city',
                value: address.city
              }}
              placeholder="City"
              type="text"
              meta={reqHandlerCity}
            />
          </Col>
          <Col md={6}>
            <div>
              <span className="form__form-group-label">State&nbsp;</span>
              <span className="form-group-label-min">( required )</span>
            </div>
            <SelectField
              input={
                {
                  onChange: this.handleStateChange,
                  name: 'state',
                  value: address.state
                }
              }
              meta={reqHandlerState}
              value={address.state}
              options={states}
              placeholder="Select a State"
            />
          </Col>
          <Col md={6}>
            <div>
              <span className="form__form-group-label">Zip Code&nbsp;</span>
              <span className="form-group-label-min">( required )</span>
            </div>
            <TField
              input={{
                onChange: this.handleInputChange,
                name: 'zipCode',
                value: address.zipCode
              }}
              placeholder="Name"
              type="text"
              meta={reqHandlerZipCode}
            />
          </Col>
          <Col md={6}>
            <div>
              <span className="form__form-group-label">Address Type&nbsp;</span>
              <span className="form-group-label-min">( required )</span>
            </div>
            <TField
              input={{
                onChange: this.handleInputChange,
                name: 'type',
                value: address.type
              }}
              placeholder="Type"
              type="text"
              meta={reqHandlerType}
            />
          </Col>
          <Col md={12}>
            <span className="form__form-group-label">Notes</span>
            <textarea
              name="note"
              component="textarea"
              value={address.note}
              onChange={this.handleInputChange}
            />
          </Col>
          {
            addressId ? (
              <React.Fragment>
                <Col md={12} className="form-details">
                  <Row>
                    <Col md={6}>
                      <span className="form__form-group-label">Created On</span>
                      <input
                        disabled
                        readOnly
                        value={TFormat.asDateTime(address.createdOn, profile.timeZone)}
                      />
                    </Col>
                    <Col md={6}>
                      <span className="form__form-group-label">Created By</span>
                      <input
                        disabled
                        readOnly
                        value={createdByName}
                      />
                    </Col>
                    <Col md={6}>
                      <span className="form__form-group-label">Last Modified</span>
                      <input
                        disabled
                        readOnly
                        value={TFormat.asDateTime(address.modifiedOn, profile.timeZone)}
                      />
                    </Col>
                    <Col md={6}>
                      <span className="form__form-group-label">Modified By</span>
                      <input
                        disabled
                        readOnly
                        value={modifiedByName}
                      />
                    </Col>
                  </Row>
                </Col>
              </React.Fragment>
            ) : ''
          }
          <Col md={12} className="form-controls">
            <Row>
              <Col md={6}>
                {
                  addressId ? (
                    <Button
                      disabled={loading}
                      onClick={() => this.handleDelete(addressId)}
                    >
                      Delete Address
                    </Button>
                  ) : ''
                }
              </Col>
              <Col md={6} className="text-right">
                <Button
                  disabled={loading}
                  className="btn btn-outline-primary"
                  onClick={toggle}
                >
                  { actionStatus && actionStatus === true ? 'OK' : 'Cancel'}
                </Button>
                {
                  actionStatus !== true && (
                    <Button
                      disabled={loading}
                      className="btn btn-primary"
                      onClick={this.saveAddress}
                    >
                      {
                        loading ? (
                          <TSpinner
                            color="#808080"
                            loaderSize={10}
                            loading
                          />
                        ) : 'Save Address'
                      }
                    </Button>
                  )
                }
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>
    );
  }

  render() {
    const { loaded } = this.state;
    if (loaded) {
      return (
        <React.Fragment>
          {this.renderAddressForm()}
        </React.Fragment>
      );
    }
    return (
      <React.Fragment>
        <Col md={12}>
          &nbsp;
        </Col>
      </React.Fragment>
    );
  }
}

AddressForm.propTypes = {
  addressId: PropTypes.number,
  companyId: PropTypes.number
};

AddressForm.defaultProps = {
  addressId: null,
  companyId: null
};

export default AddressForm;
