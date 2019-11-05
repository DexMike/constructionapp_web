import React, {PureComponent} from 'react';
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
// import GroupService from '../../api/GroupService';
import TCheckBox from '../../common/TCheckBox';
import '../jobs.css';
// import GroupListService from '../../api/GroupListService';
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

    const allCompanies = await CompanyService.getFavoritesByUserId(
      profile.userId,
      filters
    );

    // get favorite companies for this carrier
    data.favoriteCompanies = allCompanies;

    // are there any favorite companies?
    if (data.favoriteCompanies.length > 0) {
      // get the phone numbers from the admins
      data.favoriteAdminTels = data.favoriteCompanies.map(
        x => (x.adminPhone ? x.adminPhone : null)
      );
      // remove null values
      Object.keys(data.favoriteAdminTels).forEach(
        key => (data.favoriteAdminTels[key] === null) && delete data.favoriteAdminTels[key]
      );
      data.showSendtoFavorites = true;
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

  render() {
    const {
      reqCheckABox,
      loaded,
      btnSubmitting
    } = this.state;
    const {data, saveJob, sendJob, goBack, onClose, jobRequest} = {...this.props};
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
                    {!jobRequest
                      ? 'Thanks for creating a new job! How do you want to send this?'
                      : 'Thanks for requesting a new job! The requested carrier will be notified after you press send job.'
                    }
                  </h3>
                </Row>
                {!jobRequest
                && (
                  <React.Fragment>
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
                  </React.Fragment>
                )
                }
              </form>
              <Row className="col-md-12">
                <hr/>
              </Row>

              <Row className="col-md-12 ">
                <ButtonToolbar className="col-md-4 wizard__toolbar">
                  <Button
                    color="minimal"
                    className="btn btn-outline-secondary"
                    type="button"
                    onClick={onClose}
                  >
                    Cancel
                  </Button>
                </ButtonToolbar>
                <ButtonToolbar className="col-md-8 wizard__toolbar right-buttons">
                  <Button color="primary" type="button"
                          className="previous"
                          onClick={goBack}
                  >
                    Back
                  </Button>
                  {!jobRequest && (
                    <Button
                      color="outline-primary"
                      className="next"
                      onClick={saveJob}
                    >
                      Save Job & Close
                    </Button>
                  )
                  }
                  <TSubmitButton
                    onClick={sendJob}
                    className="primaryButton"
                    loading={btnSubmitting}
                    loaderSize={10}
                    disabled={!data.sendToMkt && !data.sendToFavorites}
                    bntText="Send Job"
                  />
                </ButtonToolbar>
                <TSpinner loading={false}/>
              </Row>
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
  // handleInputChange: PropTypes.func.isRequired,
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
