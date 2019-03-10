import React, { PureComponent } from 'react';
import { Col, Card, Row, Container } from 'reactstrap';
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
  }

  async componentDidMount() {
    const { incomingPage, passedInfo } = this.props;
    // this is to prevent mounting if we must go to page three
    if (incomingPage === 3) {
      this.setState({ page: 3, loaded: true });
    } else {
      this.setState({ page: 1, loaded: true });
    }

    // force load from previous page
    if (Object.keys(passedInfo).length > 0) {
      this.setState({ truckPassedInfo: passedInfo });
    }
  }

  getTruckInfo() {
    const { truckCachedInfo } = this.state;
    return truckCachedInfo;
  }

  getAvailiabilityInfo() {
    const { availabilityCachedInfo } = this.state;
    return availabilityCachedInfo;
  }

  getUserInfo() {
    const { userCachedInfo } = this.state;
    return userCachedInfo;
  }

  handleKeyPress(event) {
    if (event.key === 'Enter') {
      // not in use
    }
  }

  handleTruckSave(e) {
    // let's keep the info from the truck in memory
    const { truckCachedInfo, page } = this.state;
    truckCachedInfo.info = e;

    // also set availability info
    const availableInfo = {
      info: {
        startDate: e.startAvailability,
        endDate: e.endAvailability,
        isAvailable: e.currentAvailability
      }
    };

    this.setState({ availabilityCachedInfo: availableInfo });

    if (truckCachedInfo.info.redir) {
      this.setState({
        page: page + 1
      });
    }
  }

  handleAvailabilitySave(e) {
    // let's keep the info from the truck in memory
    const { availabilityCachedInfo, page } = this.state;
    availabilityCachedInfo.info = e;
    console.log(e);
    // not receiving the redir
    if (e.redir) {
      this.setState({ page: page + 1 });
    }
  }

  handleUserSave(e) {
    // // console.log('>USER SAVE', e);
    // let's keep the info from the truck in memory
    const { userCachedInfo, page } = this.state;
    userCachedInfo.info = e;
    if (e.redir) {
      this.setState({ page: page + 1 });
    }
  }

  gotoPage(pageNumber) {
    this.setState({ page: pageNumber });
  }

  previousPage() {
    const { page } = this.state;
    this.setState({ page: page - 1 });
  }

  nextPage() {
    const { page } = this.state;
    // just checking if the state changeo
    this.setState({ page: page + 1 });
  }

  firstPage() {
    this.setState({ page: 1 });
  }

  secondPage() {
    this.setState({ page: 2 });
  }

  thirdPage() {
    this.setState({ page: 3 });
  }

  fourthPage() {
    this.setState({ page: 4 });
  }

  closeNow() {
    const { toggle } = this.props;
    toggle();
  }

  render() {
    const { company } = this.props;
    const {
      page,
      loaded,
      truckCachedInfo,
      availabilityCachedInfo,
      userCachedInfo,
      truckPassedInfo
    } = this.state;
    if (loaded) {
      return (
        <Container className="dashboard">
          <Row>
            {/* <h1>TEST</h1> */}
            <Col md={12} lg={12}>
              <Card>
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
                      <p>Add Truck</p>
                    </div>
                    <div
                      role="link"
                      tabIndex="0"
                      onKeyPress={this.handleKeyPress}
                      onClick={this.secondPage}
                      className={`wizard__step${page === 2 ? ' wizard__step--active' : ''}`}
                    >
                      <p>Add Schedule</p>
                    </div>
                    <div
                      role="link"
                      tabIndex="0"
                      onKeyPress={this.handleKeyPress}
                      onClick={this.thirdPage}
                      className={`wizard__step${page === 3 ? ' wizard__step--active' : ''}`}
                    >
                      <p>Add Driver</p>
                    </div>
                    <div
                      role="link"
                      tabIndex="0"
                      onKeyPress={this.handleKeyPress}
                      onClick={this.fourthPage}
                      className={`wizard__step${page === 4 ? ' wizard__step--active' : ''}`}
                    >
                      <p>Summary</p>
                    </div>
                  </div>

                  <div>
                    <hr />
                  </div>

                  <div className="wizard__form-wrapper">
                    {/* onSubmit={this.nextPage} */}
                    {page === 1
                      && (
                      <AddTruckFormOne
                        p={page}
                        company={company}
                        onTruckFullInfo={this.handleTruckSave}
                        handleSubmit={this.nextPage}
                        onClose={this.closeNow}
                        getTruckFullInfo={this.getTruckInfo}
                        passedTruckFullInfo={truckPassedInfo}
                      />
                      )}
                    {page === 2
                      && (
                      <AddTruckFormTwo
                        p={page}
                        // onSubmit={this.nextPage}
                        company={company}
                        // what about this? do we need it?
                        // onTruckFullInfo={this.handleTruckSave}
                        onAvailabilityFullInfo={this.handleAvailabilitySave}
                        previousPage={this.previousPage}
                        handleSubmit={this.nextPage}
                        onClose={this.closeNow}
                        getAvailiabilityFullInfo={this.getAvailiabilityInfo}
                      />
                      )}
                    {page === 3
                      && (
                        <AddTruckFormThree
                          previousPage={this.previousPage}
                          company={company}
                          onUserFullInfo={this.handleUserSave}
                          onClose={this.closeNow}
                          handleSubmit={this.nextPage}
                          getUserFullInfo={this.getUserInfo}
                          // this is to track if we are editing
                          passedTruckFullInfoId={truckPassedInfo.driversId}
                        />
                      )}
                    {page === 4
                      && (
                      <AddTruckFormFour
                        company={company}
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
      <Container>
        Loading...
      </Container>
    );
  }
}

AddTruckForm.propTypes = {
  company: PropTypes.shape({
    id: PropTypes.number,
    page: PropTypes.number
  }),
  // id: PropTypes.number,
  incomingPage: PropTypes.number,
  toggle: PropTypes.func.isRequired,
  passedInfo: PropTypes.shape({
    info: PropTypes.object
  })
};

AddTruckForm.defaultProps = {
  company: PropTypes.shape({
    id: PropTypes.number,
    page: PropTypes.number
  })
  // onSubmit: PropTypes.func.isRequired
};

AddTruckForm.defaultProps = {
  company: null,
  incomingPage: 0,
  passedInfo: null
  // id: null
};

export default AddTruckForm;
