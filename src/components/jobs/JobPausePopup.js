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

class JobResumePopup extends Component {
  constructor(props) {
    super(props);

    this.state = {
      page: 1,
      job: [],
      jobEndDate: null,
      jobStartDate: null,
      jobId: null,
      loaded: false,
      validateFormOne: false,
      firstTabInfo: {},
      goToJobDetail: false,
      pauseReason: '',
      pauseReasons: [],
      reqHandlerPause: {
        touched: false,
        error: ''
      }
    };
    this.closeNow = this.closeNow.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSelectPauseReason = this.handleSelectPauseReason.bind(this);
    this.jobEndDateChange = this.jobEndDateChange.bind(this);
    this.clearValidationLabels = this.clearValidationLabels.bind(this);
    this.isJobValid = this.isJobValid.bind(this);
    this.handlePauseJob = this.handlePauseJob.bind(this);
  }

  async componentDidMount() {
    const {pauseReasons} = this.state;
    try {
      const lookups = await LookupsService.getLookupsCarrierCancelReasons();
      if (Object.keys(lookups).length > 0) {
        Object.values(lookups).forEach((itm) => {
          pauseReasons.push({
            value: itm.val1,
            label: itm.val1
          });
        });
      }
    } catch (err) {
      console.error(err);
    }
    pauseReasons.push({
      value: 'Other',
      label: 'Other'
    });
    this.setState({ pauseReasons, loaded: true });
  }

  async componentDidUpdate(prevProps, prevState) {
    console.log(prevProps);
    if ((prevProps.job !== this.state.job)) {
      const job = prevProps.job;
      const jobEndDate = job.endTime;
      const jobStartDate = job.startTime;
      this.setState({ job, jobEndDate, jobStartDate });
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

  handleSelectPauseReason(option) {
    const {value} = option;
    const {reqHandlerPause} = this.state;
    let {pauseReason/* , showOtherReasonInput */} = this.state;
    reqHandlerPause.touched = false;
    pauseReason = value;
    /* if (cancelReason === 'Other') {
      showOtherReasonInput = true;
    } else {
      showOtherReasonInput = false;
    } */
    this.setState({pauseReason, /* showOtherReasonInput, */reqHandlerPause});
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

  async handlePauseJob() {
    const { profile, updatePausedJob } = this.props;
    const { job, pauseReason, reqHandlerPause } = this.state;
    let { jobEndDate } = this.state;
    let newJob = [];
    const envString = (process.env.APP_ENV === 'Prod') ? '' : `[Env] ${process.env.APP_ENV} - `;

    /* if (!this.isJobValid()) {
      this.setState({btnSubmitting: false});
      return;
    } */

    if (pauseReason === '') {
      this.setState({
        reqHandlerPause: {
          ...reqHandlerPause,
          touched: true,
          error: 'You must provide the reason for pausing the job'
        }
      });
    } else {
      this.setState({btnSubmitting: true});

      // updating job
      newJob = CloneDeep(job);
      /* jobEndDate = moment(jobEndDate).format('YYYY-MM-DD HH:mm');
      newJob.endTime = moment.tz(
        jobEndDate,
        profile.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone
      ).utc().format(); */
      newJob.status = 'Paused';
      newJob.pauseReason = pauseReason;
      newJob.modifiedBy = profile.userId;
      newJob.modifiedOn = moment.utc().format();
      newJob = await JobService.updateJob(newJob);

      const cancelledSms = `${envString}Job ${newJob.name} has been paused please log into your Trelar Account to continue this job.`;

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
          + `Cancel Reason: ${newJob.pauseReason}<br>`
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

      updatePausedJob(newJob);
      this.setState({btnSubmitting: false});
      this.closeNow();
    }
  }

  render() {
    const { profile } = this.props;
    const {
      job,
      jobEndDate,
      loaded,
      reqHandlerPause,
      btnSubmitting,
      pauseReason,
      pauseReasons
    } = this.state;
    console.log(job);
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
                                Reason for cancelling&nbsp;
                                <span className="form-small-label">This will be shared with the carrier {job.company.legalName} who is assigned to this job.</span>
                              </span>
                              <TSelect
                                input={
                                  {
                                    onChange: this.handleSelectPauseReason,
                                    name: 'pauseReason',
                                    value: pauseReason
                                  }
                                }
                                meta={reqHandlerPause}
                                value={pauseReason}
                                options={pauseReasons}
                                placeholder="Please select your reason for pausing this job"
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

JobResumePopup.propTypes = {
  job: PropTypes.object,
  profile: PropTypes.object,
  toggle: PropTypes.func.isRequired,
  updatePausedJob: PropTypes.func
};

JobResumePopup.defaultProps = {
  jobId: null,
  profile: null,
  updatePausedJob: null
};


export default JobResumePopup;
