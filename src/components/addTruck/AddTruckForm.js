import React, {PureComponent} from 'react';
import {Col, Card, Row, Container} from 'reactstrap';
import PropTypes from 'prop-types';
import AddTruckFormOne from './AddTruckFormOne';
import AddTruckFormTwo from './AddTruckFormTwo';
import AddTruckFormThree from './AddTruckFormThree';
import AddTruckFormFour from './AddTruckFormFour';

// import TButtonToggle from '../common/TButtonToggle';


class AddTruckForm extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      page: 1,
      loaded: false,
      truckCachedInfo: {},
      availabilityCachedInfo: {},
      userCachedInfo: {},
      enableSecondTab: false,
      enableThirdTab: false,
      enableFourthTab: false,
      truckPassedInfo: {} // info that comes from the parent list
    };
    this.nextPage = this.nextPage.bind(this);
    this.previousPage = this.previousPage.bind(this);
    this.gotoPage.bind(this);
    this.firstPage = this.firstPage.bind(this);
    this.secondPage = this.secondPage.bind(this);
    this.thirdPage = this.thirdPage.bind(this);
    this.fourthPage = this.fourthPage.bind(this);
    this.handleTruckSave = this.handleTruckSave.bind(this);
    this.handleAvailabilitySave = this.handleAvailabilitySave.bind(this);
    this.handleUserSave = this.handleUserSave.bind(this);
    this.getTruckInfo = this.getTruckInfo.bind(this);
    this.getAvailiabilityInfo = this.getAvailiabilityInfo.bind(this);
    this.getUserInfo = this.getUserInfo.bind(this);
    this.closeNow = this.closeNow.bind(this);
    this.validateFormOneResults = this.validateFormOneResults.bind(this);
    this.validateFormTwoResults = this.validateFormTwoResults.bind(this);
    this.validateFormThreeResults = this.validateFormThreeResults.bind(this);
  }

  async componentDidMount() {
    const {incomingPage, passedInfo} = this.props;
    // this is to prevent mounting if we must go to page three
    if (incomingPage === 3) {
      this.setState({page: 3});
    } else {
      this.setState({page: 1});
    }
    const availableInfo = {
      info: {
        startDate: new Date(passedInfo.startAvailability),
        endDate: new Date(passedInfo.endAvailability),
        isAvailable: (passedInfo.currentAvailability === 1)
      }
    };

    // force load from previous page
    if (Object.keys(passedInfo).length) {
      this.setState({
        truckPassedInfo: passedInfo,
        enableSecondTab: true,
        enableThirdTab: true,
        enableFourthTab: false,
        availabilityCachedInfo: availableInfo
      });
    }
    this.setState({
      loaded: true
    });
  }

  getTruckInfo() {
    const {truckCachedInfo} = this.state;
    return truckCachedInfo;
  }

  getAvailiabilityInfo() {
    const {availabilityCachedInfo} = this.state;
    return availabilityCachedInfo;
  }

  getUserInfo() {
    const {userCachedInfo} = this.state;
    return userCachedInfo;
  }

  handleKeyPress(event) {
    if (event.key === 'Enter') {
      // not in use
    }
  }

  handleTruckSave(e) {
    // let's keep the info from the truck in memory
    const {truckCachedInfo, page} = this.state;
    truckCachedInfo.info = e;

    if (truckCachedInfo.info.redir) {
      this.setState({
        page: page + 1
      });
    }
  }

  handleAvailabilitySave(e) {
    // let's keep the info from the truck in memory
    const {availabilityCachedInfo, page} = this.state;
    availabilityCachedInfo.info = e;
    // not receiving the redir
    if (e.redir) {
      this.setState({page: page + 1});
    }
  }

  handleUserSave(e) {
    // let's keep the info from the truck in memory
    const {userCachedInfo, page} = this.state;
    userCachedInfo.info = e;
    if (e.redir) {
      this.setState({page: page + 1});
    }
  }

  gotoPage(pageNumber) {
    this.setState({page: pageNumber});
  }

  previousPage() {
    const {page} = this.state;
    if (page === 2) {
      this.setState({page: 1, validateOnTabOneClick: null});
    } else {
      this.setState({page: page - 1});
    }
  }

  nextPage() {
    const {page} = this.state;
    // just checking if the state changeo
    this.setState({page: page + 1});
  }

  firstPage() {
    const {editDriverId} = this.props;
    if (!editDriverId) { // we're coming from Drivers List, disable tabs other than 3
      this.setState({page: 1, validateOnTabOneClick: null});
    }
  }

  secondPage() {
    const {enableSecondTab} = this.state;
    const {editDriverId} = this.props;
    if (!editDriverId && enableSecondTab) {
      this.setState({page: 2});
    }
  }

  thirdPage() {
    const {enableThirdTab} = this.state;
    const {editDriverId} = this.props;
    if (!editDriverId && enableThirdTab) {
      this.setState({page: 3});
    }
  }

  fourthPage() {
    const {enableFourthTab} = this.state;
    const {editDriverId} = this.props;
    if (!editDriverId && enableFourthTab) {
      this.setState({page: 4});
    }
  }

  validateFormOneResults(res) {
    const {enableSecondTab} = this.state;
    if (res === false) {
      this.setState({enableSecondTab: false});
    } else if (res === true) {
      this.setState({enableSecondTab: true});
    } else if (enableSecondTab === true) {
      this.setState({page: 2});
    }
    this.setState({validateOnTabOneClick: res});
  }

  validateFormTwoResults(res) {
    const {enableSecondTab, enableThirdTab} = this.state;
    if (enableSecondTab === true) {
      if (res === false) {
        this.setState({enableThirdTab: false});
      } else if (res === true) {
        this.setState({enableThirdTab: true});
      } else if (enableThirdTab === true) {
        this.setState({page: 3});
      }
      this.setState({validateOnTabTwoClick: res});
    } else {
      this.validateFormOneResults(res);
    }
  }

  validateFormThreeResults(res) {
    const {enableSecondTab, enableThirdTab, enableFourthTab} = this.state;
    if (enableSecondTab === true && enableThirdTab === true) {
      if (res === false) {
        this.setState({enableFourthTab: false});
      }
      if (res === true) {
        this.setState({enableFourthTab: true});
      } else if (enableFourthTab === true) {
        this.setState({page: 4});
      }
      this.setState({validateOnTabThreeClick: res});
    } else if (enableSecondTab === false) {
      this.validateFormOneResults(res);
    } else if (enableSecondTab === true && enableThirdTab === false) {
      this.validateFormTwoResults(res);
    }
  }

  closeNow() {
    const {toggle} = this.props;
    toggle();
  }

  render() {
    const {equipmentId, companyId, editDriverId} = this.props;
    const {
      page,
      loaded,
      truckCachedInfo,
      availabilityCachedInfo,
      userCachedInfo,
      truckPassedInfo,
      validateOnTabOneClick,
      validateOnTabTwoClick,
      validateOnTabThreeClick
    } = this.state;

    if (loaded) {
      return (
        <Container className="dashboard">
          <Row>
            {/* <h1>TEST</h1> */}
            <Col md={12} lg={12}>
              <Card style={{paddingBottom: 0}}>
                <div className="wizard">
                  <div className="wizard__steps">
                    {/* onClick={this.gotoPage(1)} */}
                    <div
                      role="link"
                      tabIndex="0"
                      onKeyPress={this.handleKeyPress}
                      onClick={this.firstPage}
                      className={`wizard__step${page === 1 ? ' wizard__step--active' : ''}`}
                    >
                      <p>Truck</p>
                    </div>
                    <div
                      role="link"
                      tabIndex="0"
                      onKeyPress={this.handleKeyPress}
                      onClick={this.validateFormOneResults}
                      className={`wizard__step${page === 2 ? ' wizard__step--active' : ''}`}
                    >
                      <p>Schedule</p>
                    </div>
                    <div
                      role="link"
                      tabIndex="0"
                      onKeyPress={this.handleKeyPress}
                      onClick={this.validateFormTwoResults}
                      className={`wizard__step${page === 3 ? ' wizard__step--active' : ''}`}
                    >
                      <p>Driver</p>
                    </div>
                    <div
                      role="link"
                      tabIndex="0"
                      onKeyPress={this.handleKeyPress}
                      onClick={this.validateFormThreeResults}
                      className={`wizard__step${page === 4 ? ' wizard__step--active' : ''}`}
                    >
                      <p>Summary</p>
                    </div>
                  </div>

                  <div className="wizard__form-wrapper">
                    {/* onSubmit={this.nextPage} */}
                    {page === 1
                    && (
                      <AddTruckFormOne
                        p={page}
                        equipmentId={equipmentId}
                        // companyId={companyId}
                        onTruckFullInfo={this.handleTruckSave}
                        handleSubmit={this.nextPage}
                        onClose={this.closeNow}
                        getTruckFullInfo={this.getTruckInfo}
                        passedTruckFullInfo={truckPassedInfo}
                        // getAvailiabilityFullInfo={this.getAvailiabilityInfo}
                        // secondPage={this.secondPage}
                        validateResOne={this.validateFormOneResults}
                        validateOnTabOneClick={validateOnTabOneClick}
                      />
                    )}
                    {page === 2
                    && (
                      <AddTruckFormTwo
                        p={page}
                        equipmentId={equipmentId}
                        onAvailabilityFullInfo={this.handleAvailabilitySave}
                        previousPage={this.previousPage}
                        handleSubmit={this.nextPage}
                        onClose={this.closeNow}
                        getAvailiabilityFullInfo={this.getAvailiabilityInfo}
                        // thirdPage={this.thirdPage}
                        validateResTwo={this.validateFormTwoResults}
                        validateOnTabTwoClick={validateOnTabTwoClick}
                      />
                    )}
                    {page === 3
                    && (
                      <AddTruckFormThree
                        equipmentId={equipmentId}
                        // companyId={companyId}
                        previousPage={this.previousPage}
                        onUserFullInfo={this.handleUserSave}
                        onClose={this.closeNow}
                        handleSubmit={this.nextPage}
                        getUserFullInfo={this.getUserInfo}
                        // this is to track if we are editing
                        passedTruckFullInfoId={truckPassedInfo.driversId}
                        editDriverId={editDriverId}
                        // fourthPage={this.fourthPage}
                        validateResThree={this.validateFormThreeResults}
                        validateOnTabThreeClick={validateOnTabThreeClick}
                      />
                    )}
                    {page === 4
                    && (
                      <AddTruckFormFour
                        equipmentId={equipmentId}
                        companyId={companyId}
                        previousPage={this.previousPage}
                        truckFullInfo={truckCachedInfo}
                        availabilityFullInfo={availabilityCachedInfo}
                        userFullInfo={userCachedInfo}
                        onClose={this.closeNow}
                        getTruckFullInfo={this.getTruckInfo}
                        getAvailiabilityFullInfo={this.getAvailiabilityInfo}
                        getUserFullInfo={this.getUserInfo}
                      />
                    )}
                    {/* onSubmit={onSubmit} */}
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </Container>
      );
    }
    return (
      <Container className="dashboard">
        <Row>
          <Col md={12}>
            <Card>Loading...</Card>
          </Col>
        </Row>
      </Container>
    );
  }
}

AddTruckForm.propTypes = {
  equipmentId: PropTypes.number,
  companyId: PropTypes.number,
  incomingPage: PropTypes.number,
  toggle: PropTypes.func.isRequired,
  passedInfo: PropTypes.shape({
    info: PropTypes.object
  }),
  editDriverId: PropTypes.number
};

AddTruckForm.defaultProps = {
  equipmentId: 0,
  companyId: 0,
  incomingPage: 0,
  passedInfo: null,
  editDriverId: null
};

export default AddTruckForm;
