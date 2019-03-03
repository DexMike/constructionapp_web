import React, { PureComponent } from 'react';
import { Col, Card, Row, Container } from 'reactstrap';
import PropTypes from 'prop-types';
import AddTruckFormOne from './AddTruckFormOne';
import AddTruckFormTwo from './AddTruckFormTwo';
import AddTruckFormThree from './AddTruckFormThree';
import AddTruckFormFour from './AddTruckFormFour';


class AddTruckForm extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      page: 1,
      loaded: false,
      truckCachedInfo: {},
      availabilityCachedInfo: {},
      userCachedInfo: {}
    };
    this.nextPage = this.nextPage.bind(this);
    this.previousPage = this.previousPage.bind(this);
    this.gotoPage.bind(this);
    this.handleTruckSave = this.handleTruckSave.bind(this);
    this.handleAvailabilitySave = this.handleAvailabilitySave.bind(this);
    this.handleUserSave = this.handleUserSave.bind(this);
    // // console.log(props);
  }

  async componentDidMount() {
    const { incomingPage } = this.props;
    // this is to prevent mounting if we must go to page three
    if (incomingPage === 3) {
      this.setState({ page: 3, loaded: true });
    } else {
      this.setState({ page: 1, loaded: true });
    }
  }

  handleKeyPress(event) {
    if (event.key === 'Enter') {
      // // // console.log('enter press here!');
    }
  }

  handleTruckSave(e) {
    // console.log(e);
    // let's keep the info from the truck in memory
    const { truckCachedInfo, page } = this.state;
    truckCachedInfo.info = e;
    this.setState({ page: page + 1 });
  }

  handleAvailabilitySave(e) {
    // console.log(e);
    // let's keep the info from the truck in memory
    const { availabilityCachedInfo, page } = this.state;
    availabilityCachedInfo.info = e;
    this.setState({ page: page + 1 });
  }

  handleUserSave(e) {
    // console.log(e);
    // let's keep the info from the truck in memory
    const { userCachedInfo, page } = this.state;
    userCachedInfo.info = e;
    this.setState({ page: page + 1 });
  }

  gotoPage(pageNumber) {
    // // // console.log(40);
    this.setState({ page: pageNumber });
  }

  previousPage() {
    const { page } = this.state;
    this.setState({ page: page - 1 });
  }

  nextPage() {
    const { page } = this.state;
    // just checking if the state changed
    this.setState({ page: page + 1 });
  }

  render() {
    const { company } = this.props;
    const {
      page,
      loaded,
      truckCachedInfo,
      availabilityCachedInfo,
      userCachedInfo
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
                      className={`wizard__step${page === 1 ? ' wizard__step--active' : ''}`}
                    >
                      <p>Add Truck</p>
                    </div>
                    <div
                      role="link"
                      tabIndex="0"
                      onKeyPress={this.handleKeyPress}
                      className={`wizard__step${page === 2 ? ' wizard__step--active' : ''}`}
                    >
                      <p>Add Schedule</p>
                    </div>
                    <div
                      role="link"
                      tabIndex="0"
                      onKeyPress={this.handleKeyPress}
                      className={`wizard__step${page === 3 ? ' wizard__step--active' : ''}`}
                    >
                      <p>Add Driver</p>
                    </div>
                    <div
                      role="link"
                      tabIndex="0"
                      onKeyPress={this.handleKeyPress}
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
                        company={company}
                        onTruckFullInfo={this.handleTruckSave}
                        handleSubmit={this.nextPage}
                      />
                      )}
                    {page === 2
                      && (
                      <AddTruckFormTwo
                        p={page}
                        // onSubmit={this.nextPage}
                        company={company}
                        onTruckFullInfo={this.handleTruckSave}
                        onAvailabilityFullInfo={this.handleAvailabilitySave}
                        previousPage={this.previousPage}
                        handleSubmit={this.nextPage}
                      />
                      )}
                    {page === 3
                      && (
                        <AddTruckFormThree
                          previousPage={this.previousPage}
                          company={company}
                          onUserFullInfo={this.handleUserSave}
                          // onDriverSave={this.nextPage}
                          handleSubmit={this.nextPage}
                          // truckFullInfo={truckCachedInfo}
                        />
                      )}
                    {page === 4
                      && (
                      <AddTruckFormFour
                        previousPage={this.previousPage}
                        truckFullInfo={truckCachedInfo}
                        availabilityFullInfo={availabilityCachedInfo}
                        userFullInfo={userCachedInfo}
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
  incomingPage: PropTypes.number // ,
  // handleTruckSave: PropTypes.func.isRequired
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
  incomingPage: 0
  // id: null
};

export default AddTruckForm;
