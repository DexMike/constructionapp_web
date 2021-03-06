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
import TTable from '../common/TTable';
import TField from '../common/TField';
import TFormat from '../common/TFormat';
import NumberFormatting from '../../utils/NumberFormatting';
import JobCreateFormOne from './JobCreateFormOne';
import JobCreateFormTwo from './JobCreateFormTwo';
import ProfileService from '../../api/ProfileService';
import JobService from '../../api/JobService';
import AddressService from '../../api/AddressService';
import JobMaterialsService from '../../api/JobMaterialsService';

class JobListResumePopup extends Component {
  constructor(props) {
    super(props);

    this.state = {
      jobs: [],
      loaded: false,
      goToJobDetail: false
    };
    this.closeNow = this.closeNow.bind(this);
    this.renderGoTo = this.renderGoTo.bind(this);
    this.handleJobClick = this.handleJobClick.bind(this);
  }

  async componentDidMount() {
    const { pausedJobs, profile } = this.props;
    this.setState({ jobs: pausedJobs, profile, loaded: true });
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.pausedJobs !== this.state.jobs) {
      this.setState({ jobs: prevProps.pausedJobs });
    }
  }

  closeNow() {
    const { toggle } = this.props;
    toggle();
  }

  handleJobClick(pausedJobId) {
    const { onJobSelect } = this.props;
    onJobSelect(pausedJobId);
  }

  renderGoTo() {
    const { goToJobDetail, jobs } = this.state;
    if (goToJobDetail) {
      return <Redirect push to={`/jobs/save/${jobs.id}`}/>;
    }
    return false;
  }

  render() {
    const { profile } = this.props;
    let { jobs } = this.state;

    jobs = jobs.map((job) => {
      const newJob = job;

      newJob.newStartDate = TFormat.asDateTime(job.startTime, profile.timeZone);
      newJob.newEndDate = TFormat.asDateTime(job.endTime, profile.timeZone);
      if (!job.companyCarrierLegalName) {
        newJob.companyCarrierLegalName = 'Unassigned';
      }

      return newJob;
    });

    const {
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
                          <Row className="col-md-12">
                            <TTable
                              columns={
                                [
                                  {
                                    name: 'name',
                                    displayName: 'Job Name'
                                  },
                                  {
                                    name: 'companyCarrierLegalName',
                                    displayName: 'Carrier'
                                  },
                                  {
                                    name: 'newStartDate',
                                    displayName: 'Start Date'
                                  },
                                  {
                                    name: 'newEndDate',
                                    displayName: 'End Date'
                                  }
                                ]
                              }
                              data={jobs}
                              handleIdClick={this.handleJobClick}
                              hidePagination
                            />
                          </Row>
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

JobListResumePopup.propTypes = {
  pausedJobs: PropTypes.array,
  profile: PropTypes.object,
  toggle: PropTypes.func.isRequired,
  onJobSelect: PropTypes.func.isRequired
};

JobListResumePopup.defaultProps = {
  pausedJobs: null,
  profile: null
};


export default JobListResumePopup;
