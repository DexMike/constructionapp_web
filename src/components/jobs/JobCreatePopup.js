import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Container,
  Row,
  Col,
  Card
} from 'reactstrap';
import JobCreateFormOne from './JobCreateFormOne';
import JobCreateFormTwo from './JobCreateFormTwo';
import ProfileService from '../../api/ProfileService';

class JobCreatePopup extends Component {
  constructor(props) {
    super(props);

    this.state = {
      page: 1,
      loaded: true
    };
    this.nextPage = this.nextPage.bind(this);
    this.previousPage = this.previousPage.bind(this);
    this.gotoPage.bind(this);
    this.firstPage = this.firstPage.bind(this);
    this.secondPage = this.secondPage.bind(this);
    this.closeNow = this.closeNow.bind(this);
  }

  async componentDidMount() {
    // this.setState({ loaded: true });
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

  closeNow() {
    const { toggle } = this.props;
    toggle();
  }

  render() {
    const { equipmentId, companyId, editDriverId } = this.props;
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
                  </div>

                  <div>
                    <hr />
                  </div>

                  <div className="wizard__form-wrapper">
                    {/* onSubmit={this.nextPage} */}
                    {page === 1
                      && (
                      <JobCreateFormOne
                        p={page}
                        equipmentId={equipmentId}
                        // companyId={companyId}
                        onTruckFullInfo={this.handleTruckSave}
                        handleSubmit={this.nextPage}
                        onClose={this.closeNow}
                        getTruckFullInfo={this.getTruckInfo}
                        passedTruckFullInfo={truckPassedInfo}
                        getAvailiabilityFullInfo={this.getAvailiabilityInfo}
                      />
                      )}
                    {page === 2
                      && (
                      <JobCreateFormTwo
                        p={page}
                        equipmentId={equipmentId}
                        onAvailabilityFullInfo={this.handleAvailabilitySave}
                        previousPage={this.previousPage}
                        handleSubmit={this.nextPage}
                        onClose={this.closeNow}
                        getAvailiabilityFullInfo={this.getAvailiabilityInfo}
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


/**/
JobCreatePopup.propTypes = {
  toggle: PropTypes.func.isRequired
};

JobCreatePopup.defaultProps = {
  //
};


export default JobCreatePopup;
