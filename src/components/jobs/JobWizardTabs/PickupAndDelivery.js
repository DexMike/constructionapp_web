import React, {PureComponent} from 'react';
import {withTranslation} from 'react-i18next';
import {
  Card,
  CardBody,
  Col,
  Row
} from 'reactstrap';
import PropTypes from 'prop-types';
import SelectField from '../../common/TSelect';
import '../jobs.css';
import TField from '../../common/TField';
import TSpinner from '../../common/TSpinner';
import GeoUtils from "../../../utils/GeoUtils";


class PickupAndDelivery extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      loaded: false
    };
    this.toggleNewStartAddress = this.toggleNewStartAddress.bind(this);
    this.toggleNewEndAddress = this.toggleNewEndAddress.bind(this);
    this.handleStartAddressIdChange = this.handleStartAddressIdChange.bind(this);
    this.handleEndAddressIdChange = this.handleEndAddressIdChange.bind(this);
    this.handleStartAddressChange = this.handleStartAddressChange.bind(this);
    this.handleStartStateChange = this.handleStartStateChange.bind(this);
    this.handleEndStateChange = this.handleEndStateChange.bind(this);
    this.handleEndAddressChange = this.handleEndAddressChange.bind(this);
  }

  async componentDidMount() {
    this.setState({loaded: true});
  }

  componentWillReceiveProps(nextProps) {
    const {data} = {...nextProps};
    this.setState({data: {...data}});
  }

  async componentWillUnmount() {
    const {data, handleInputChange} = {...this.props};

    let startString;
    if (data.selectedStartAddressId > 0) {
      const startAddress = data.allAddresses.find(item => item.value === data.selectedStartAddressId);
      startString = startAddress.label;
    } else {
      startString = `${data.startLocationAddress1} ${data.startLocationCity} ${data.startLocationState} ${data.startLocationZip}`;
    }
    let endString;
    if (data.selectedEndAddressId > 0) {
      const endAddress = data.allAddresses.find(item => item.value === data.selectedEndAddressId);
      endString = endAddress.label;
    } else {
      endString = `${data.endLocationAddress1} ${data.endLocationCity} ${data.endLocationState} ${data.endLocationZip}`;
    }
    let startCoordinates;
    let endCoordinates;
    try {
      startCoordinates = await GeoUtils.getCoordsFromAddress(startString);
      endCoordinates = await GeoUtils.getCoordsFromAddress(endString);
    } catch (err) {
      console.error(err);
    }
    data.endGPS = endCoordinates;
    data.startGPS = startCoordinates;
    data.startLocationLatitude = startCoordinates.lat;
    data.startLocationLongitude = startCoordinates.lng;
    data.endLocationLatitude = endCoordinates.lat;
    data.endLocationLongitude = endCoordinates.lng;
    if (data.startLocationLatitude && data.startLocationLongitude
      && data.endLocationLatitude && data.endLocationLongitude) {
      const waypoint0 = `${data.startLocationLatitude},${data.startLocationLongitude}`;
      const waypoint1 = `${data.endLocationLatitude},${data.endLocationLongitude}`;
      const travelInfoEnroute = await GeoUtils.getDistance(waypoint0, waypoint1);
      const travelInfoReturn = await GeoUtils.getDistance(waypoint1, waypoint0);
      data.avgDistanceEnroute = (travelInfoEnroute.distance * 0.000621371192).toFixed(2);
      data.avgDistanceReturn = (travelInfoReturn.distance * 0.000621371192).toFixed(2);
      data.avgTimeEnroute = (parseInt(travelInfoEnroute.travelTime) / 3600).toFixed(2);
      data.avgTimeReturn = (parseInt(travelInfoReturn.travelTime) / 3600).toFixed(2);
    }
    debugger;
    handleInputChange('tabPickupDelivery', data);
  }

  handleStartAddressIdChange(e) {
    const {data} = {...this.props};
    const {handleInputChange} = {...this.props};

    data.reqHandlerSameAddresses.touched = false;

    if (Number(e.value) !== 0) {
      data.startLocationAddress1 = '';
      data.startLocationAddress2 = '';
      data.startLocationCity = '';
      data.startLocationState = '';
      data.startLocationZip = '';
      data.selectedStartAddressId = e.value;
      data.reqHandlerStartAddress.touched = false;
      data.reqHandlerStartCity.touched = false;
      data.reqHandlerStartState.touched = false;
      data.reqHandlerStartZip.touched = false;
    } else if (Number(e.value) === 0) {
      data.selectedStartAddressId = Number(e.value);
      data.reqHandlerStartAddress.touched = true;
      data.reqHandlerStartCity.touched = true;
      data.reqHandlerStartState.touched = true;
      data.reqHandlerStartZip.touched = true;
    }
    handleInputChange('tabPickupDelivery', data);
  }

  handleEndAddressIdChange(e) {
    const {data} = {...this.props};
    const {handleInputChange} = {...this.props};

    data.reqHandlerSameAddresses.touched = false;

    if (Number(e.value) !== 0) {
      data.endLocationAddress1 = '';
      data.endLocationAddress2 = '';
      data.endLocationCity = '';
      data.endLocationState = '';
      data.endLocationZip = '';
      data.selectedEndAddressId = e.value;
      data.reqHandlerEndAddress.touched = false;
      data.reqHandlerEndCity.touched = false;
      data.reqHandlerEndState.touched = false;
      data.reqHandlerEndZip.touched = false;
    } else if (Number(e.value) === 0) {
      data.selectedEndAddressId = Number(e.value);
      data.reqHandlerEndAddress.touched = true;
      data.reqHandlerEndCity.touched = true;
      data.reqHandlerEndState.touched = true;
      data.reqHandlerEndZip.touched = true;
    }
    handleInputChange('tabPickupDelivery', data);
  }

  handleStartStateChange(e) {
    const {data} = {...this.props};
    const {handleInputChange} = {...this.props};
    data.reqHandlerStartState.touched = false;
    data.startLocationState = e.value;
    handleInputChange('tabPickupDelivery', data);
  }

  handleEndStateChange(e) {
    const {data} = {...this.props};
    const {handleInputChange} = {...this.props};
    data.reqHandlerEndState.touched = false;
    data.endLocationState = e.value;
    handleInputChange('tabPickupDelivery', data);
  }

  handleStartAddressChange(e) {
    const {data} = {...this.props};
    const {handleInputChange} = {...this.props};

    data.reqHandlerSameAddresses.touched = false;

    switch (e.target.name) {
      case 'startLocationAddressName':
        data.startLocationAddressName = e.target.value;
        data.reqHandlerStartAddressName.touched = false;
        break;
      case 'startLocationAddress1':
        data.startLocationAddress1 = e.target.value;
        data.reqHandlerStartAddress.touched = false;
        break;
      case 'startLocationAddress2':
        data.startLocationAddress2 = e.target.value;
        break;
      case 'startLocationCity':
        data.startLocationCity = e.target.value;
        data.reqHandlerStartCity.touched = false;
        break;
      case 'startLocationState':
        data.startLocationState = e.target.value;
        data.reqHandlerStartState.touched = false;
        break;
      case 'startLocationZip':
        data.startLocationZip = e.target.value;
        data.reqHandlerStartZip.touched = false;
        break;
      default:
    }
    handleInputChange('tabPickupDelivery', data);
  }

  toggleNewStartAddress() {
    const {data} = {...this.props};
    const {handleInputChange} = {...this.props};
    data.selectedStartAddressId = 0;
    handleInputChange('tabPickupDelivery', data);
  }

  toggleNewEndAddress() {
    const {data} = {...this.props};
    const {handleInputChange} = {...this.props};
    data.selectedEndAddressId = 0;
    handleInputChange('tabPickupDelivery', data);
  }

  handleEndAddressChange(e) {
    const {data} = {...this.props};
    const {handleInputChange} = {...this.props};
    data.reqHandlerSameAddresses.touched = false;

    switch (e.target.name) {
      case 'endLocationAddressName':
        data.endLocationAddressName = e.target.value;
        data.reqHandlerEndAddressName.touched = false;
        break;
      case 'endLocationAddress1':
        data.endLocationAddress1 = e.target.value;
        data.reqHandlerEndAddress.touched = false;
        break;
      case 'endLocationAddress2':
        data.endLocationAddress2 = e.target.value;
        break;
      case 'endLocationCity':
        data.endLocationCity = e.target.value;
        data.reqHandlerEndCity.touched = false;
        break;
      case 'endLocationState':
        data.endLocationState = e.target.value;
        data.reqHandlerEndState.touched = false;
        break;
      case 'endLocationZip':
        data.endLocationZip = e.target.value;
        data.reqHandlerEndZip.touched = false;
        break;
      default:
    }
    handleInputChange('tabPickupDelivery', data);
  }


  render() {
    const { t } = { ...this.props };
    const translate = t;
    const {loaded} = {...this.state};
    const {data} = {...this.props};
    if (loaded && data) {
      return (
        <Col md={12} lg={12}>
          <Card>
            <CardBody>
              {/* this.handleSubmit  */}
              <form
                className="form form--horizontal addtruck__form"
                // onSubmit={e => this.saveTruck(e)}
                autoComplete="off"
              >
                <Row className="col-md-12">
                  <hr/>
                  {/* <hr className="bighr"/> */}
                </Row>

                <Row className="col-md-12 rateTab">
                  <div className="col-md-6">
                    <h3 className="subhead">
                      {translate('Start Location')}&nbsp;
                      <span style={{fontSize: 12, color: 'rgb(101, 104, 119)'}}> ( {translate('required')} )</span>
                    </h3>
                    <small>
                      {translate('Select a starting address')}:
                    </small>
                    <div
                      id="starting_id"
                    >
                      <SelectField
                        input={
                          {
                            onChange: this.handleStartAddressIdChange,
                            name: 'selectedStartAddress',
                            value: data.selectedStartAddressId
                          }
                        }
                        // meta={reqHandlerMaterials}
                        value={data.selectedStartAddressId}
                        options={data.allAddresses}
                        placeholder={translate('Select a location')}
                        meta={data.reqHandlerSameAddresses}
                      />
                    </div>
                    <div>
                      &nbsp;
                    </div>
                    <small>
                      {translate('Or create a new one')}:
                    </small>
                    <div
                      onKeyPress={this.handleKeyPress}
                      onClick={() => this.toggleNewStartAddress()}
                      role="link"
                      tabIandex="0"
                    >
                      <div
                        id="starting"
                        className={`${data.selectedStartAddressId === 0 ? 'shown' : 'fifty'}`}
                      >
                        <div className="form__form-group">
                          <TField
                            input={
                              {
                                onChange: this.handleStartAddressChange,
                                name: 'startLocationAddressName',
                                value: data.startLocationAddressName
                              }
                            }
                            placeholder={translate('Address Name')}
                            type="text"
                            meta={data.reqHandlerStartAddressName}
                          />
                        </div>
                        <div className="form__form-group">
                          <TField
                            input={
                              {
                                onChange: this.handleStartAddressChange,
                                name: 'startLocationAddress1',
                                value: data.startLocationAddress1
                              }
                            }
                            placeholder={translate('Address 1')}
                            type="text"
                            meta={data.reqHandlerStartAddress}
                          />
                        </div>
                        <div className="form__form-group">
                          <input
                            name="startLocationAddress2"
                            type="text"
                            value={data.startLocationAddress2}
                            onChange={this.handleStartAddressChange}
                            placeholder={translate('Address 2')}
                          />
                        </div>
                        <div className="form__form-group">
                          <TField
                            input={
                              {
                                onChange: this.handleStartAddressChange,
                                name: 'startLocationCity',
                                value: data.startLocationCity
                              }
                            }
                            placeholder={translate('City')}
                            type="text"
                            meta={data.reqHandlerStartCity}
                          />
                        </div>
                        <div className="form__form-group">
                          <SelectField
                            input={
                              {
                                onChange: this.handleStartStateChange,
                                name: 'startLocationState',
                                value: data.startLocationState
                              }
                            }
                            placeholder={translate('State')}
                            meta={data.reqHandlerStartState}
                            value={data.startLocationState}
                            options={data.allUSstates}
                          />
                        </div>
                        <div className="form__form-group">
                          <TField
                            input={
                              {
                                onChange: this.handleStartAddressChange,
                                name: 'startLocationZip',
                                value: data.startLocationZip
                              }
                            }
                            placeholder={translate('Zip Code')}
                            type="text"
                            meta={data.reqHandlerStartZip}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <h3 className="subhead">
                      {translate('End Location')}&nbsp;
                      <span style={{fontSize: 12, color: 'rgb(101, 104, 119)'}}> ( {translate('required')} )</span>
                    </h3>
                    <small>
                      {translate('Select an ending address')}:
                    </small>
                    <div
                      id="ending_id"
                    >
                      <SelectField
                        input={
                          {
                            onChange: this.handleEndAddressIdChange,
                            name: 'selectedEndAddress',
                            value: data.selectedEndAddressId
                          }
                        }
                        // meta={reqHandlerMaterials}
                        value={data.selectedEndAddressId}
                        options={data.allAddresses}
                        placeholder={translate('Select a location')}
                      />
                    </div>
                    <div>
                      &nbsp;
                    </div>
                    <small>
                      {translate('Or create a new one')}:
                    </small>
                    <div
                      onKeyPress={this.handleKeyPress}
                      onClick={this.toggleNewEndAddress}
                      role="link"
                      tabIndex="0"
                    >
                      <div
                        id="ending"
                        className={`${data.selectedEndAddressId === 0 ? 'shown' : 'fifty'}`}
                      >
                        <div className="form__form-group">
                          <TField
                            input={
                              {
                                onChange: this.handleEndAddressChange,
                                name: 'endLocationAddressName',
                                value: data.endLocationAddressName
                              }
                            }
                            placeholder={translate('Address Name')}
                            type="text"
                            meta={data.reqHandlerEndAddressName}
                          />
                        </div>
                        <div className="form__form-group">
                          <TField
                            input={
                              {
                                onChange: this.handleEndAddressChange,
                                name: 'endLocationAddress1',
                                value: data.endLocationAddress1
                              }
                            }
                            placeholder={translate('Address 1')}
                            type="text"
                            meta={data.reqHandlerEndAddress}
                          />
                        </div>
                        <div className="form__form-group">
                          <input
                            name="endLocationAddress2"
                            type="text"
                            value={data.endLocationAddress2}
                            onChange={this.handleEndAddressChange}
                            placeholder={translate('Address 2')}
                            autoComplete="new-password"
                          />
                        </div>
                        <div className="form__form-group">
                          <TField
                            input={
                              {
                                onChange: this.handleEndAddressChange,
                                name: 'endLocationCity',
                                value: data.endLocationCity
                              }
                            }
                            placeholder={translate('City')}
                            type="text"
                            meta={data.reqHandlerEndCity}
                          />
                        </div>
                        <div className="form__form-group">
                          <SelectField
                            input={
                              {
                                onChange: this.handleEndStateChange,
                                name: 'endLocationState',
                                value: data.endLocationState
                              }
                            }
                            placeholder={translate('State')}
                            meta={data.reqHandlerEndState}
                            value={data.endLocationState}
                            options={data.allUSstates}
                          />
                        </div>
                        <div className="form__form-group">
                          <TField
                            input={
                              {
                                onChange: this.handleEndAddressChange,
                                name: 'endLocationZip',
                                value: data.endLocationZip
                              }
                            }
                            placeholder={translate('Zip Code')}
                            type="text"
                            meta={data.reqHandlerEndZip}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </Row>
              </form>
            </CardBody>
          </Card>
        </Col>
      );
    }
    return (
      <Col md={12}>
        <Card style={{paddingBottom: 0}}>
          <CardBody>
            <Row className="col-md-12"><TSpinner loading/></Row>
          </CardBody>
        </Card>
      </Col>
    );
  }
}

PickupAndDelivery.propTypes = {
  data: PropTypes.shape({
    selectedStartAddressId: PropTypes.number,
    selectedEndAddressId: PropTypes.number,
    endLocationLatitude: PropTypes.number,
    endLocationLongitude: PropTypes.number,
    startLocationLatitude: PropTypes.number,
    startLocationLongitude: PropTypes.number,
    allUSstates: PropTypes.array,
    allAddresses: PropTypes.array,
    startLocationAddressName: PropTypes.string,
    endLocationAddressName: PropTypes.string,
    endLocationAddress1: PropTypes.string,
    endLocationAddress2: PropTypes.string,
    endLocationCity: PropTypes.string,
    endLocationState: PropTypes.string,
    endLocationZip: PropTypes.string,
    startLocationAddress1: PropTypes.string,
    startLocationAddress2: PropTypes.string,
    startLocationCity: PropTypes.string,
    startLocationState: PropTypes.string,
    startLocationZip: PropTypes.string,
    reqHandlerSameAddresses: PropTypes.shape({
      touched: PropTypes.bool,
      error: PropTypes.string
    }),
    reqHandlerStartAddressName: PropTypes.shape({
      touched: PropTypes.bool,
      error: PropTypes.string
    }),
    reqHandlerStartAddress: PropTypes.shape({
      touched: PropTypes.bool,
      error: PropTypes.string
    }),
    reqHandlerStartCity: PropTypes.shape({
      touched: PropTypes.bool,
      error: PropTypes.string
    }),
    reqHandlerStartState: PropTypes.shape({
      touched: PropTypes.bool,
      error: PropTypes.string
    }),
    reqHandlerStartZip: PropTypes.shape({
      touched: PropTypes.bool,
      error: PropTypes.string
    }),
    reqHandlerEndAddressName: PropTypes.shape({
      touched: PropTypes.bool,
      error: PropTypes.string
    }),
    reqHandlerEndAddress: PropTypes.shape({
      touched: PropTypes.bool,
      error: PropTypes.string
    }),
    reqHandlerEndCity: PropTypes.shape({
      touched: PropTypes.bool,
      error: PropTypes.string
    }),
    reqHandlerEndState: PropTypes.shape({
      touched: PropTypes.bool,
      error: PropTypes.string
    }),
    reqHandlerEndZip: PropTypes.shape({
      touched: PropTypes.bool,
      error: PropTypes.string
    })
  })
};

PickupAndDelivery.defaultProps = {
  data: null
};

export default withTranslation()(PickupAndDelivery);
