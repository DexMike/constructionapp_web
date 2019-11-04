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
        endTime: Date()
      },
      jobEndDate: null,
      jobId: null,
      loaded: false,
      validateFormOne: false,
      firstTabInfo: {},
      profile: [],
      goToJobDetail: false
    };
    this.closeNow = this.closeNow.bind(this);
    this.renderGoTo = this.renderGoTo.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.jobEndDateChange = this.jobEndDateChange.bind(this);
    this.clearValidationLabels = this.clearValidationLabels.bind(this);
    this.handleResumeJob = this.handleResumeJob.bind(this);
  }

  async componentDidMount() {
    const { profile } = this.props;
    this.setState({ profile, loaded: true });
  }

  async componentDidUpdate(prevProps, prevState) {
    console.log(prevProps);
    if ((prevProps.jobId !== this.state.jobId)) {
      const job = await JobService.getJobById(prevProps.jobId);
      console.log(job);
      const jobEndDate = job.endTime;
      console.log(jobEndDate);
      const jobStartDate = job.startTime;
      this.setState({ job, jobEndDate, jobStartDate, jobId: job.id });
    }
  }

  closeNow() {
    const { toggle } = this.props;
    toggle();
  }

  handleInputChange(e) {
    const { value } = e.target;
    this.setState({ [e.target.name]: value });
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

  async validateSend() {
    this.clearValidationLabels();
    const {
      jobStartDate,
      jobEndDate,
      reqHandlerRate,
      reqHandlerEndDate
    } = {...this.state};
    let isValid = true;
    if (!reqHandlerRate || reqHandlerRate > '0') {
      this.setState({
        reqHandlerEndDate: {
          ...reqHandlerEndDate,
          touched: true,
          error: 'Required input'
        }
      });
      isValid = false;
    }
    if (!jobEndDate) {
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
    this.clearValidationLabels();
    const {
      job,
      jobEndDate,
      
      reqHandlerRate,
      reqHandlerEndDate,
      profile
    } = this.state;
    let newJob = [];
    const envString = (process.env.APP_ENV === 'Prod') ? '' : `[Env] ${process.env.APP_ENV} - `;
    const currDate = new Date();

    if (!jobEndDate) {
      this.setState({
        reqHandlerEndDate: {
          ...reqHandlerEndDate,
          touched: true,
          error: 'Required input'
        }
      });
    } else if (jobEndDate && (new Date(jobEndDate).getTime() <= currDate.getTime())) {
      this.setState({
        reqHandlerEndDate: {
          ...reqHandlerEndDate,
          touched: true,
          error: 'The end date of the job can not be set in the past or equivalent to the current date and time'
        }
      });
    } else if (jobEndDate && (new Date(jobEndDate).getTime() <= new Date(jobStartDate).getTime())) {
      this.setState({
        reqHandlerEndDate: {
          ...reqHandlerEndDate,
          touched: true,
          error: 'The end date of the job can not be set in the past of or equivalent to the start date'
        }
      });
    } else {
      this.setState({btnSubmitting: true});

      console.log('resuming job:', job);
      console.log(jobEndDate);



      // updating job
      /* newJob = CloneDeep(job);
      delete newJob.company;
      newJob.startAddress = newJob.startAddress.id;
      newJob.endAddress = newJob.endAddress.id;
      newJob.status = 'In Progress';
      newJob.dateCancelled = moment.utc().format();
      newJob.modifiedBy = profile.userId;
      newJob.modifiedOn = moment.utc().format();
      newJob = await JobService.updateJob(newJob);

      const cancelledSms = `${envString}Your booked job ${newJob.name} for ${TFormat.asDateTime(newJob.startTime)} has been cancelled by ${job.company.legalName}.
      The reason for cancellation is: ${newJob.cancelReason}.`; // TODO: do we need to check for this field's length?

      // Notify Carrier about cancelled job
      try {
        await this.notifyAdminViaSms(cancelledSms, companyCarrierData.id);
      } catch (err) {
        console.error(err);
      }

      // get allocated drivers for this job, and send sms to those drivers
      const allocatedDrivers = await JobService.getAllocatedDriversInfoByJobId(job.id);
      let allocatedDriversNames = '';
      if (allocatedDrivers.length > 0) {
        allocatedDriversNames = allocatedDrivers.map(driver => `${driver.firstName} ${driver.lastName}`);
        allocatedDriversNames = `Drivers affected: ${allocatedDriversNames.join(', ')}`;

        const cancelledDriversSms = [];
        for (const driver of allocatedDrivers) {
          if (this.checkPhoneFormat(driver.mobilePhone)) {
            const notification = {
              to: UserUtils.phoneToNumberFormat(driver.mobilePhone),
              body: cancelledSms
            };
            cancelledDriversSms.push(TwilioService.createSms(notification));
          }
        }
        await Promise.all(cancelledDriversSms);
      }

      // sending an email to CSR
      const cancelJobEmail = {
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
      await EmailService.sendEmail(cancelJobEmail);

      this.updateJobView(newJob); */
      this.setState({btnSubmitting: false});
      this.closeNow();
    }
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
      jobEndDate,
      loaded,
      reqHandlerRate,
      reqHandlerEndDate
    } = this.state;
    console.log(jobEndDate);
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
                              <Button
                                color="primary"
                                className="next"
                                onClick={() => this.handleResumeJob()}
                              >
                                Resume Job
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
  jobId: PropTypes.number,
  profile: PropTypes.object,
  toggle: PropTypes.func.isRequired
};

JobResumePopup.defaultProps = {
  jobId: null,
  profile: null
};


export default JobResumePopup;
