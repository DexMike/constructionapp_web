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
import TSelect from '../common/TSelect';
import TSubmitButton from '../common/TSubmitButton';
import TDateTimePicker from '../common/TDateTimePicker';
import JobCreateFormOne from './JobCreateFormOne';
import JobCreateFormTwo from './JobCreateFormTwo';
import ProfileService from '../../api/ProfileService';
import JobService from '../../api/JobService';
import AddressService from '../../api/AddressService';
import JobMaterialsService from '../../api/JobMaterialsService';
import LookupsService from '../../api/LookupsService';

class JobPausePopup extends Component {
  constructor(props) {
    super(props);

    this.state = {
      job: [],
      producerName: '',
      jobEndDate: null,
      jobStartDate: null,
      jobId: null,
      loaded: false,
      pauseReason: '',
      reqHandlerPauseReason: {
        touched: false,
        error: ''
      }
    };
    this.closeNow = this.closeNow.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.clearValidationLabels = this.clearValidationLabels.bind(this);
    this.isJobValid = this.isJobValid.bind(this);
    this.handlePauseJob = this.handlePauseJob.bind(this);
    this.handlePauseReasonInputChange = this.handlePauseReasonInputChange.bind(this);
  }

  async componentDidMount() {
    this.setState({loaded: true });
  }

  async componentDidUpdate(prevProps, prevState) {
    // console.log(prevProps);
    if ((prevProps.job !== this.state.job)) {
      const job = prevProps.job;
      const jobEndDate = job.endTime;
      const jobStartDate = job.startTime;
      const producerName = job.company.legalName;
      this.setState({ job, jobEndDate, jobStartDate, producerName });
    }
  }

  closeNow() {
    const { toggle } = this.props;
    toggle();
  }

  handleInputChange(e) {
    const {job, reqHandlerRate} = this.state;
    const { value } = e.target;
    job.rate = value;
    this.setState({
      job,
      reqHandlerRate: Object.assign({}, reqHandlerRate, {
        touched: false
      })
    });
  }

  handlePauseReasonInputChange(e) {
    const {reqHandlerPauseReason} = this.state;
    reqHandlerPauseReason.touched = false;
    this.setState({
      pauseReason: e.target.value,
      reqHandlerPauseReason
    });
  }

  clearValidationLabels() {
    const {
      reqHandlerRate,
      reqHandlerEndDate
    } = this.state;
    reqHandlerRate.touched = false;
    reqHandlerEndDate.touched = false;
    this.setState({
      reqHandlerRate,
      reqHandlerEndDate
    });
  }

  isJobValid() {
    this.clearValidationLabels();
    const {
      job,
      jobStartDate,
      jobEndDate,
      reqHandlerRate,
      reqHandlerEndDate
    } = {...this.state};
    let isValid = true;
    const currDate = new Date();
    // console.log(job.rate);
    if (!job.rate || job.rate === '' || job.rate < 1) {
      this.setState({
        reqHandlerRate: {
          ...reqHandlerRate,
          touched: true,
          error: 'Required input'
        }
      });
      isValid = false;
    }

    // console.log(jobEndDate);
    if (!jobEndDate || jobEndDate === '') {
      this.setState({
        reqHandlerEndDate: {
          ...reqHandlerEndDate,
          touched: true,
          error: 'Required input'
        }
      });
      isValid = false;
    }

    if (jobEndDate && (new Date(jobEndDate).getTime() <= currDate.getTime())) {
      this.setState({
        reqHandlerEndDate: {
          ...reqHandlerEndDate,
          touched: true,
          error: 'The end date of the job can not be set in the past or equivalent to the current date and time'
        }
      });
      isValid = false;
    }

    if (jobEndDate && (new Date(jobEndDate).getTime() <= new Date(jobStartDate).getTime())) {
      this.setState({
        reqHandlerEndDate: {
          ...reqHandlerEndDate,
          touched: true,
          error: 'The end date of the job can not be set in the past of or equivalent to the start date'
        }
      });
      isValid = false;
    }

    return isValid;
  }

  async handlePauseJob() {
    const { updatePausedJob } = this.props;
    const { job, pauseReason, reqHandlerPauseReason } = this.state;
    let pausedJob = [];

    if (pauseReason === '') {
      this.setState({
        reqHandlerPauseReason: {
          ...reqHandlerPauseReason,
          touched: true,
          error: 'You must provide the reason for pausing the job'
        }
      });
    } else {
      this.setState({btnSubmitting: true});

      pausedJob = await JobService.pauseJob(job.id, pauseReason);

      updatePausedJob(pausedJob);
      this.setState({btnSubmitting: false});
      this.closeNow();
    }
  }

  render() {
    const {
      job,
      producerName,
      loaded,
      reqHandlerPauseReason,
      btnSubmitting,
      pauseReason
    } = this.state;
    if (loaded) {
      return (
        <Container className="dashboard">
          <div className="dashboard dashboard__job-create" style={{width: 900}}>
            <Card style={{paddingBottom: 0}}>
              <div className="wizard">
                <div className="wizard__steps">
                  <div
                    className="wizard__step wizard__step--active"
                  >
                    <p>Pause Job: {job.name}</p>
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
                            <Row className="col-md-12" style={{paddingTop: 15, paddingBottom: 15}}>
                              <span className="form__form-group-label">
                                Reason for putting the job on hold&nbsp;
                                <span className="form-small-label">This will be shared with the carrier {producerName} who is assigned to this job.</span>
                              </span>
                              <TField
                                input={
                                  {
                                    onChange: this.handlePauseReasonInputChange,
                                    name: 'pauseReason',
                                    value: pauseReason
                                  }
                                }
                                type="text"
                                meta={reqHandlerPauseReason}
                              />
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
                              <TSubmitButton
                                loading={btnSubmitting}
                                className="primaryButton"
                                loaderSize={10}
                                onClick={this.handlePauseJob}
                                bntText="Pause Job"
                              />
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

JobPausePopup.propTypes = {
  job: PropTypes.object,
  profile: PropTypes.object,
  toggle: PropTypes.func.isRequired,
  updatePausedJob: PropTypes.func
};

JobPausePopup.defaultProps = {
  jobId: null,
  profile: null,
  updatePausedJob: null
};


export default JobPausePopup;
