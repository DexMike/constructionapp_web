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

class JobCreatePopup extends Component {
  constructor(props) {
    super(props);

    this.state = {
      page: 1,
      loaded: true,
      validateFormOne: false,
      firstTabInfo: {}
    };
    this.nextPage = this.nextPage.bind(this);
    this.previousPage = this.previousPage.bind(this);
    this.gotoPage.bind(this);
    this.firstPage = this.firstPage.bind(this);
    this.closeNow = this.closeNow.bind(this);
    this.saveAndGoToSecondPage = this.saveAndGoToSecondPage.bind(this);
    this.getFirstTabInfo = this.getFirstTabInfo.bind(this);
    this.validateFormOne = this.validateFormOne.bind(this);
    this.validateFormOneRes = this.validateFormOneRes.bind(this);
  }

  async componentDidMount() {
    // this.setState({ loaded: true });
  }

  getFirstTabInfo() {
    const { firstTabInfo } = this.state;
    return firstTabInfo;
  }

  saveAndGoToSecondPage(e) {
    this.setState({ firstTabInfo: e });
    this.setState({ page: 2 });
  }

  validateFormOne() {
    this.setState({ validateFormOne: true });
  }

  validateFormOneRes(res) {
    this.setState({ validateFormOne: res });
  }

  closeNow() {
    const { toggle } = this.props;
    toggle();
  }

  firstPage() {
    this.setState({ page: 1 });
  }

  nextPage() {
    const { page } = this.state;
    // just checking if the state changeo
    this.setState({ page: page + 1 });
  }

  previousPage() {
    const { page } = this.state;
    this.setState({ page: page - 1 });
  }

  gotoPage(pageNumber) {
    this.setState({ page: pageNumber });
  }

  render() {
    const { equipmentId, companyId, editDriverId } = this.props;
    const {
      page,
      loaded,
      validateFormOne
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
                      <p>Create Job</p>
                    </div>
                    <div
                      role="link"
                      tabIndex="0"
                      onKeyPress={this.handleKeyPress}
                      onClick={this.validateFormOne}
                      className={`wizard__step${page === 2 ? ' wizard__step--active' : ''}`}
                    >
                      <p>Send Job</p>
                    </div>
                  </div>
                  <div className="wizard__form-wrapper">
                    {/* onSubmit={this.nextPage} */}
                    {page === 1
                      && (
                      <JobCreateFormOne
                        p={page}
                        onClose={this.closeNow}
                        gotoSecond={this.saveAndGoToSecondPage}
                        firstTabData={this.getFirstTabInfo}
                        validateOnTabClick={validateFormOne}
                        validateRes={this.validateFormOneRes}
                      />
                      )}
                    {page === 2
                      && (
                      <JobCreateFormTwo
                        p={page}
                        onClose={this.closeNow}
                        firstTabData={this.getFirstTabInfo}
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
