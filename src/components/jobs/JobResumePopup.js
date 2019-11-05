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
import TSubmitButton from '../common/TSubmitButton';
import TDateTimePicker from '../common/TDateTimePicker';
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
      // job: [],
      job: {
        rate: 0,
        rateType: '',
        endTime: null
      },
      jobEndDate: null,
      jobId: null,
      loaded: false,
      validateFormOne: false,
      firstTabInfo: {},
      goToJobDetail: false,
      reqHandlerRate: {
        touched: false,
        error: ''
      },
      reqHandlerEndDate: {
        touched: false,
        error: ''
      }
    };
    this.closeNow = this.closeNow.bind(this);
    this.renderGoTo = this.renderGoTo.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.jobEndDateChange = this.jobEndDateChange.bind(this);
    this.clearValidationLabels = this.clearValidationLabels.bind(this);
    this.isJobValid = this.isJobValid.bind(this);
    this.handleResumeJob = this.handleResumeJob.bind(this);
  }

  async componentDidMount() {
    this.setState({ loaded: true });
  }

  async componentDidUpdate(prevProps, prevState) {
    if ((prevProps.jobId !== this.state.jobId)) {
      const job = await JobService.getJobById(prevProps.jobId);
      const jobEndDate = job.endTime;
      const jobStartDate = job.startTime;
      this.setState({ job, jobEndDate, jobStartDate, jobId: job.id });
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

  jobEndDateChange(data) {
    const {reqHandlerEndDate} = this.state;
    this.setState({
      jobEndDate: data,
      reqHandlerEndDate: Object.assign({}, reqHandlerEndDate, {
        touched: false
      })
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
    console.log(job.rate);
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

    console.log(jobEndDate);
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


  async handleResumeJob() {
    const { profile, updateResumedJob } = this.props;
    const { job } = this.state;
    let { jobEndDate } = this.state;
    let newJob = [];
    const envString = (process.env.APP_ENV === 'Prod') ? '' : `[Env] ${process.env.APP_ENV} - `;

    if (!this.isJobValid()) {
      this.setState({btnSubmitting: false});
      return;
    }

    this.setState({btnSubmitting: true});

    // updating job
    newJob = CloneDeep(job);
    jobEndDate = moment(jobEndDate).format('YYYY-MM-DD HH:mm');
    newJob.endTime = moment.tz(
      jobEndDate,
      profile.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone
    ).utc().format();
    newJob.status = 'In Progress';
    newJob.modifiedBy = profile.userId;
    newJob.modifiedOn = moment.utc().format();
    newJob = await JobService.updateJob(newJob);

    const cancelledSms = `${envString}Job ${newJob.name} has been resumed please log into your Trelar Account to continue this job.`;

    // Notify Carrier about resumed job
    try {
      // await this.notifyAdminViaSms(cancelledSms, companyCarrierData.id); // TODO
    } catch (err) {
      console.error(err);
    }

    // sending an email to CSR
    /* const cancelJobEmail = {
      toEmail: 'csr@trelar.com',
      toName: 'Trelar CSR',
      subject: `${envString}Trelar Job Cancelled`,
      isHTML: true,
      body: 'A producer cancelled a job on Trelar.<br><br>'
        + `Producer Company Name: ${job.company.legalName}<br>`
        + `Cancel Reason: ${newJob.cancelReason}<br>`
        + `Job Name: ${newJob.name}<br>`
        // TODO: since this is going to Trelar CSR where do we set the timezone for HQ?
        + `Start Date of Job: ${TFormat.asDateTime(newJob.startTime)}<br>`
        + `Time of Job Cancellation: ${TFormat.asDateTime(newJob.dateCancelled)}<br>`
        + `Carrier(s) Affected: ${companyCarrierData.legalName}<br>`
        + `${allocatedDriversNames}`,
      recipients: [
        {name: 'CSR', email: 'csr@trelar.com'}
      ],
      attachments: []
    };
    await EmailService.sendEmail(cancelJobEmail); */

    if (typeof updateResumedJob === 'function') {
      updateResumedJob(newJob);
      this.setState({btnSubmitting: false});
      this.closeNow();
    } else {
      this.setState({ goToUpdateJob: true });
    }
  }


  renderGoTo() {
    const { job, goToUpdateJob } = this.state;
    if (goToUpdateJob) {
      return <Redirect push to={`/jobs/save/${job.id}`}/>;
    }
    return false;
  }

  render() {
    const { profile } = this.props;
    const {
      job,
      jobEndDate,
      loaded,
      reqHandlerRate,
      reqHandlerEndDate,
      btnSubmitting
    } = this.state;
    if (loaded) {
      return (
        <Container className="dashboard">
          {this.renderGoTo()}
          <div className="dashboard dashboard__job-create" style={{width: 900}}>
            <Card style={{paddingBottom: 0}}>
              <div className="wizard">
                <div className="wizard__steps">
                  <div
                    className="wizard__step wizard__step--active"
                  >
                    <p>Resume a Job: {job.name}</p>
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
                                <span className="form__form-group-label">{job && job.rateType === 'Ton' ? 'Tonnage' : 'Hours'}</span>
                                <TField
                                  input={
                                    {
                                      onChange: this.handleInputChange,
                                      name: 'name',
                                      value: job.rate
                                    }
                                  }
                                  placeholder="Job Name"
                                  type="text"
                                  meta={reqHandlerRate}
                                  id="jobname"
                                />
                              </div>
                              <div className="col-md-6 form__form-group">
                                <span className="form__form-group-label">End Date / Time</span>
                                <TDateTimePicker
                                  input={
                                    {
                                      onChange: this.jobEndDateChange,
                                      name: 'jobEndDate',
                                      value: jobEndDate,
                                      givenDate: jobEndDate
                                    }
                                  }
                                  placeholder="Date and time of job"
                                  defaultDate={jobEndDate}
                                  onChange={this.jobEndDateChange}
                                  dateFormat="m/d/Y h:i K"
                                  showTime
                                  meta={reqHandlerEndDate}
                                  id="jobenddatetime"
                                  profileTimeZone={profile.timeZone}
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
                              <TSubmitButton
                                loading={btnSubmitting}
                                className="primaryButton"
                                loaderSize={10}
                                onClick={this.handleResumeJob}
                                bntText="Resume Job"
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

JobResumePopup.propTypes = {
  jobId: PropTypes.number,
  profile: PropTypes.object,
  toggle: PropTypes.func.isRequired,
  updateResumedJob: PropTypes.func
};

JobResumePopup.defaultProps = {
  jobId: null,
  profile: null,
  updateResumedJob: null
};


export default JobResumePopup;
