import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import moment from 'moment';
import CloneDeep from 'lodash.clonedeep';
import PropTypes from 'prop-types';
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  ButtonToolbar,
  Button
} from 'reactstrap';
import TField from '../common/TField';
import JobCreateFormOne from './JobCreateFormOne';
import JobCreateFormTwo from './JobCreateFormTwo';
import ProfileService from '../../api/ProfileService';
import JobService from '../../api/JobService';
import AddressService from '../../api/AddressService';
import JobMaterialsService from '../../api/JobMaterialsService';

class JobResumePopup extends Component {
  constructor(props) {
    super(props);

    this.state = {
      page: 1,
      job: [],
      loaded: false,
      validateFormOne: false,
      firstTabInfo: {},
      profile: [],
      goToJobDetail: false
    };
    this.closeNow = this.closeNow.bind(this);
    this.renderGoTo = this.renderGoTo.bind(this);
  }

  async componentDidMount() {
    const { job, profile } = this.props;
    this.setState({ job, profile, loaded: true });
  }

  closeNow() {
    const { toggle } = this.props;
    toggle();
  }

  renderGoTo() {
    const { goToJobDetail, job } = this.state;
    if (goToJobDetail) {
      return <Redirect push to={`/jobs/save/${job.id}`}/>;
    }
    return false;
  }

  render() {
    const { profile } = this.props;
    const {
      job,
      loaded
    } = this.state;
    if (loaded) {
      return (
        <Container className="dashboard">
          {/* {this.renderGoTo()} */}
          <div className="dashboard dashboard__job-create" style={{width: 900}}>
            <Card style={{paddingBottom: 0}}>
              <div className="wizard">
                <div className="wizard__steps">
                  <div
                    className="wizard__step wizard__step--active"
                  >
                    <p>Resume a Job</p>
                  </div>
                </div>
                <div className="wizard__form-wrapper">
                  <div className="dashboard dashboard__job-create-section" style={{width: '100%'}}>
                    <Col md={12} lg={12}>
                      <Card>
                        <CardBody>
                          <form
                            className="form form--horizontal addtruck__form"
                            // onSubmit={e => this.saveTruck(e)}
                            autoComplete="off"
                          >
                            <Row className="col-md-12">
                              <div className="col-md-6 form__form-group">
                                <span className="form__form-group-label">Tonnage</span>
                                <TField
                                  input={
                                    {
                                      onChange: this.handleInputChange,
                                      name: 'name',
                                      // value: name
                                    }
                                  }
                                  placeholder="Job Name"
                                  type="text"
                                  // meta={reqHandlerJobName}
                                  id="jobname"
                                />
                              </div>
                              <div className="col-md-6 form__form-group">
                                <span className="form__form-group-label">End Date</span>
                                <TField
                                  input={
                                    {
                                      onChange: this.handleInputChange,
                                      name: 'name',
                                      // value: name
                                    }
                                  }
                                  placeholder="Job Name"
                                  type="text"
                                  // meta={reqHandlerJobName}
                                  id="jobname"
                                />
                              </div>
                            </Row>
                          </form>
                          <Row className="col-md-12">
                            <hr/>
                          </Row>
                          <Row className="col-md-12">
                            <ButtonToolbar className="col-md-6 wizard__toolbar">
                              <Button color="minimal" className="btn btn-outline-secondary"
                                      type="button"
                                      onClick={this.closeNow}
                              >
                                Cancel
                              </Button>
                            </ButtonToolbar>
                            <ButtonToolbar className="col-md-6 wizard__toolbar right-buttons">
                              <Button
                                color="primary"
                                className="next"
                                // onClick={this.nextPage}
                              >
                                Next
                              </Button>
                            </ButtonToolbar>
                          </Row>
                        </CardBody>
                      </Card>
                    </Col>
                  </div>
                </div>
              </div>
            </Card>
          </div>
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

JobResumePopup.propTypes = {
  job: PropTypes.object,
  profile: PropTypes.object,
  toggle: PropTypes.func.isRequired
};

JobResumePopup.defaultProps = {
  job: null,
  profile: null
};


export default JobResumePopup;
