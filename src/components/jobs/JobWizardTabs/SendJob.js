import React, {PureComponent} from 'react';
import moment from 'moment';
import {
  Card,
  CardBody,
  Col,
  Button,
  ButtonToolbar,
  Row
} from 'reactstrap';
import PropTypes from 'prop-types';
import ProfileService from '../../../api/ProfileService';
import AddressService from '../../../api/AddressService';
import JobService from '../../../api/JobService';
import BidService from '../../../api/BidService';
// import GroupService from '../../api/GroupService';
import TCheckBox from '../../common/TCheckBox';
import TwilioService from '../../../api/TwilioService';
import "../jobs.css";
// import GroupListService from '../../api/GroupListService';
import JobMaterialsService from '../../../api/JobMaterialsService';
import TSpinner from '../../common/TSpinner';
import TSubmitButton from '../../common/TSubmitButton';
import CompanyService from '../../../api/CompanyService';

class SendJob extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      loaded: false,
      btnSubmitting: false,
      profile: null,
      reqCheckABox: {
        touched: false,
        error: ''
      }
    };
    this.handleSendToFavorites = this.handleSendToFavorites.bind(this);
    this.handleSendToMkt = this.handleSendToMkt.bind(this);
  }

  async componentDidMount() {
    const {data, handleInputChange, tabMaterials} = {...this.props};

    const profile = await ProfileService.getProfile();
    const filters = {
      material: tabMaterials.selectedMaterial.value
    };

    const allCompanies = await CompanyService.getFavoritesNonFavoritesCompaniesByUserId(
      profile.userId,
      filters
    );

    // get favorite companies for this carrier
    data.favoriteCompanies = allCompanies.filter(x => x.isFavorite === 'Favorite');

    // get non favorite companies for this carrier
    const biddersIdsNotFavorites = allCompanies.filter(x => x.isFavorite === 'Non Favorite');

    // are there any favorite companies?
    if (data.favoriteCompanies.length > 0) {
      // get the phone numbers from the admins
      data.favoriteAdminTels = data.favoriteCompanies.map(x => (x.adminPhone ? x.adminPhone : null));
      // remove null values
      Object.keys(data.favoriteAdminTels).forEach(
        key => (data.favoriteAdminTels[key] === null) && delete data.favoriteAdminTels[key]
      );
      data.showSendtoFavorites = true;
    }

    if (biddersIdsNotFavorites.length > 0) {
      // get the phone numbers from the admins
      data.nonFavoriteAdminTels = biddersIdsNotFavorites.map(x => (x.adminPhone ? x.adminPhone : null));
      // remove null values
      Object.keys(data.nonFavoriteAdminTels).forEach(
        key => (data.nonFavoriteAdminTels[key] === null) && delete data.nonFavoriteAdminTels[key]
      );
    }

    handleInputChange('tabSend', data);

    this.setState({
      profile,
      loaded: true
    });
  }

  isFormValid() {
    let isValid = true;
    const {data} = {...this.state};
    const {reqCheckABox} = this.state;

    if (data.showSendtoFavorites) {
      // We're showing both checkboxes, allow to check at least one of them
      if (data.sendToMkt === 0 && data.sendToFavorites === 0) {
        this.setState({
          reqCheckABox: {
            ...reqCheckABox,
            touched: true,
            error: 'You have to select at least one option'
          }
        });
        isValid = false;
      }
    }
    return isValid;
  }

  handleSendToMkt(e) {
    const {data, handleInputChange} = {...this.props};
    const {reqCheckABox} = {...this.state};

    const value = e.target.checked ? Number(1) : Number(0);

    data.sendToMkt = value;
    handleInputChange('tabSend', data);

    this.setState({
      reqCheckABox: {
        ...reqCheckABox,
        touched: false
      }
    });
  }

  handleSendToFavorites(e) {
    const {data, handleInputChange} = {...this.props};
    const {reqCheckABox} = {...this.state};

    const value = e.target.checked ? Number(1) : Number(0);

    data.sendToFavorites = value;
    handleInputChange('tabSend', data);

    this.setState({
      reqCheckABox: {
        ...reqCheckABox,
        touched: false
      }
    });
  }

  renderDeliveryCosts() {
    const {data, tabMaterials} = {...this.props};
    const {rateCalculator} = {...data};


    let haulCostPerTonHour = 0;
    let oneWayCostPerTonHourPerMile = 0;
    let deliveredPricePerTon = 0;
    let deliveredPriceJob = 0;
    let estimatedCostForJob = 0;
    const sufficientInfo = (parseFloat(data.avgTimeEnroute) + parseFloat(data.avgTimeReturn)) * parseFloat(data.ratePerPayType);
    if (sufficientInfo > 0) {
      haulCostPerTonHour = ((sufficientInfo) / parseFloat(data.rateCalculator.truckCapacity)).toFixed(2);
      oneWayCostPerTonHourPerMile = (parseFloat(haulCostPerTonHour) / parseFloat(data.avgDistanceEnroute)).toFixed(2);
      deliveredPricePerTon = (parseFloat(tabMaterials.estMaterialPricing) + parseFloat(haulCostPerTonHour)).toFixed(2);
      estimatedCostForJob = (parseFloat(haulCostPerTonHour) * parseFloat(tabMaterials.quantity)).toFixed(2);
      debugger;
      if (tabMaterials.quantityType === 'ton') {
        deliveredPriceJob = (parseFloat(deliveredPricePerTon) * parseFloat(tabMaterials.quantity)).toFixed(2);
      } else {
        const oneLoad = parseFloat(rateCalculator.loadTime) + parseFloat(rateCalculator.unloadTime)
          + parseFloat(rateCalculator.travelTimeReturn) + parseFloat(rateCalculator.travelTimeEnroute);
        const numTrips = Math.floor(parseFloat(data.rateCalculator.estimatedHours) / oneLoad);
        const estimatedTons = (numTrips * parseFloat(data.rateCalculator.truckCapacity)).toFixed(2);
        deliveredPriceJob = (deliveredPricePerTon * estimatedTons).toFixed(2);
      }
    }

    return (
      <React.Fragment>
        <Row className="col-md-12">
          <hr/>
        </Row>
        <Row className="col-md-12">
          <Row className="col-md-12">
            {tabMaterials.estMaterialPricing > 0 &&
            <div className="col-md-6 form__form-group">
              <Row className="col-md-12 ">
                <span className="form__form-group-label">Delivered Price</span>
              </Row>
              <Row className="col-md-12" style={{marginTop: -20}}>
                <hr/>
              </Row>
            </div>
            }
            <div className="col-md-6 form__form-group">
              <Row className="col-md-12 ">
                <span className="form__form-group-label">Haul Costs</span>
              </Row>
              <Row className="col-md-12" style={{marginTop: -20}}>
                <hr/>
              </Row>
            </div>
          </Row>
          <Row className="col-md-12">
            {tabMaterials.estMaterialPricing > 0 &&
            <div className="col-md-6 form__form-group">
              <Row className="col-md-12">
                <div className="col-md-7 form__form-group" style={{marginLeft: -20}}>
                  <span className="form__form-group-label">Material Price per ton</span>
                </div>
                <div className="col-md-1 form__form-group">
                    <span style={{
                      marginLeft: 40,
                      position: 'absolute'
                    }}
                    >
                      $
                    </span>
                </div>
                <div className="col-md-3 form__form-group">
                    <span style={{
                      marginLeft: 30,
                      position: 'absolute'
                    }}
                    >
                      {tabMaterials.estMaterialPricing}
                    </span>
                </div>
              </Row>
              <Row className="col-md-12">
                <div className="col-md-7 form__form-group" style={{marginLeft: -20}}>
                  <span className="form__form-group-label">Delivered Price per ton</span>
                </div>
                <div className="col-md-1 form__form-group">
                    <span style={{
                      marginLeft: 40,
                      position: 'absolute'
                    }}
                    >
                      $
                    </span>
                </div>
                <div className="col-md-3 form__form-group">
                    <span style={{
                      marginLeft: 30,
                      position: 'absolute'
                    }}
                    >
                      {deliveredPricePerTon}
                    </span>
                </div>
              </Row>
              <Row className="col-md-12">
                <div className="col-md-7 form__form-group" style={{marginLeft: -20}}>
                  <span className="form__form-group-label">Delivered Price for job</span>
                </div>
                <div className="col-md-1 form__form-group">
                    <span style={{
                      marginLeft: 40,
                      position: 'absolute'
                    }}
                    >
                      $
                    </span>
                </div>
                <div className="col-md-3 form__form-group">
                    <span style={{
                      marginLeft: 30,
                      position: 'absolute'
                    }}
                    >
                      {deliveredPriceJob}
                    </span>
                </div>
              </Row>
            </div>
            }
            <div className="col-md-6 form__form-group">
              <Row className="col-md-12">
                <div className="col-md-7 form__form-group" style={{marginLeft: -20}}>
                  <span className="form__form-group-label">One way cost / {tabMaterials.quantityType} / mile</span>
                </div>
                <div className="col-md-1 form__form-group">
                    <span style={{
                      marginLeft: 40,
                      position: 'absolute'
                    }}
                    >
                      $
                    </span>
                </div>
                <div className="col-md-3 form__form-group">
                    <span style={{
                      marginLeft: 30,
                      position: 'absolute'
                    }}
                    >
                      {oneWayCostPerTonHourPerMile}
                    </span>
                </div>
              </Row>
              <Row className="col-md-12">
                <div className="col-md-7 form__form-group" style={{marginLeft: -20}}>
                  <span className="form__form-group-label">Haul Cost per {tabMaterials.quantityType}</span>
                </div>
                <div className="col-md-1 form__form-group">
                    <span style={{
                      marginLeft: 40,
                      position: 'absolute'
                    }}
                    >
                      $
                    </span>
                </div>
                <div className="col-md-3 form__form-group">
                    <span style={{
                      marginLeft: 30,
                      position: 'absolute'
                    }}
                    >
                      {haulCostPerTonHour}
                    </span>
                </div>
              </Row>
              <Row className="col-md-12">
                <div className="col-md-7 form__form-group" style={{marginLeft: -20}}>
                  <span className="form__form-group-label">Estimated Cost for Job</span>
                </div>
                <div className="col-md-1 form__form-group">
                    <span style={{
                      marginLeft: 40,
                      position: 'absolute'
                    }}
                    >
                      $
                    </span>
                </div>
                <div className="col-md-3 form__form-group">
                    <span style={{
                      marginLeft: 30,
                      position: 'absolute'
                    }}
                    >
                      {estimatedCostForJob}
                    </span>
                </div>
              </Row>
            </div>
          </Row>
        </Row>
      </React.Fragment>
    );
  }

  render() {
    const {
      reqCheckABox,
      loaded,
      btnSubmitting
    } = this.state;
    const {data, saveJob, onClose} = {...this.props};
    if (loaded) {
      return (
        <Col md={12} lg={12}>
          <Card>
            <CardBody>
              <form
                className="form form--horizontal addtruck__form"
              >
                <Row className="col-md-12">
                  <h3 className="subhead">
                    Thanks for creating a new job! How do you want to send this?
                  </h3>
                </Row>

                <Row className="col-md-12">
                  <div className="row">
                    <div
                      className={data.showSendtoFavorites ? 'col-md-1 form__form-group' : 'hidden'}
                    >
                      <TCheckBox
                        onChange={this.handleSendToFavorites}
                        name="sendToFavorites"
                        value={!!data.sendToFavorites}
                        meta={reqCheckABox}
                      />
                    </div>
                    <div
                      className={data.showSendtoFavorites ? 'col-md-10 form__form-group' : 'hidden'}
                    >
                      <h3 className="subhead">
                        Send to Favorites
                      </h3>
                    </div>
                  </div>
                  <hr/>
                </Row>

                <Row className="col-md-12">
                  <div className="row">
                    <div className="col-md-1 form__form-group">
                      <TCheckBox
                        onChange={this.handleSendToMkt}
                        name="sendToMkt"
                        value={!!data.sendToMkt}
                      />
                    </div>
                    <div
                      // className="col-md-6 form__form-group"
                      className={data.showSendtoFavorites ? 'col-md-11 form__form-group' : 'col-md-11 form__form-group'}
                    >
                      <h3 className="subhead">
                        Send this job to the Trelar Marketplace
                      </h3>
                    </div>
                  </div>
                  <br/>
                </Row>

                <Row className="col-md-12">
                  <hr/>
                </Row>

                <Row className="col-md-12 ">
                  <ButtonToolbar className="col-md-6 wizard__toolbar">
                    <Button
                      color="minimal"
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={onClose()}
                    >
                      Cancel
                    </Button>
                  </ButtonToolbar>
                  <ButtonToolbar className="col-md-6 wizard__toolbar right-buttons">
                    <TSubmitButton
                      onClick={saveJob}
                      className="primaryButton"
                      loading={btnSubmitting}
                      loaderSize={10}
                      disabled={!data.sendToMkt && !data.sendToFavorites}
                      bntText="Send Job"
                    />
                  </ButtonToolbar>
                  <TSpinner loading={false}/>
                </Row>
              </form>
              {this.renderDeliveryCosts()}
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

SendJob.propTypes = {
  data: PropTypes.shape({
    sendToMkt: PropTypes.number,
    sendToFavorites: PropTypes.number,
    showSendtoFavorites: PropTypes.number,
    favoriteCompanies: PropTypes.array,
    favoriteAdminTels: PropTypes.array,
    nonFavoriteAdminTels: PropTypes.array
  }),
  handleInputChange: PropTypes.func.isRequired,
  tabMaterials: PropTypes.shape({
    materialType: PropTypes.string,
    quantityType: PropTypes.string,
    quantity: PropTypes.string,
    allMaterials: PropTypes.array,
    selectedMaterial: PropTypes.shape({
      value: PropTypes.string,
      label: PropTypes.string
    }),
    estMaterialPricing: PropTypes.string,
    reqHandlerMaterials: PropTypes.shape({
      touched: PropTypes.bool,
      error: PropTypes.string
    }),
    reqHandlerQuantity: PropTypes.shape({
      touched: PropTypes.bool,
      error: PropTypes.string
    })
  })
  // onClose: PropTypes.func.isRequired,
  // firstTabData: PropTypes.func.isRequired,
  // jobId: PropTypes.number,
  // updateJobView: PropTypes.func,
  // saveJobDraftOrCopy: PropTypes.func.isRequired,
  // copyJob: PropTypes.bool
};

SendJob.defaultProps = {
  // jobId: null,
  // updateJobView: null,
  // copyJob: false
  data: null,
  tabMaterials: null
};

export default SendJob;
