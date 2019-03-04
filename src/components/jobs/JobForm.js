import React, { Component } from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';
import { Card, CardBody, Col, Row, Button, Container } from 'reactstrap';
import TCheckBox from '../common/TCheckBox';
import JobService from '../../api/JobService';
import CompanyService from '../../api/CompanyService';
import JobMaterialsService from '../../api/JobMaterialsService';
import AddressService from '../../api/AddressService';

class JobForm extends Component {
  constructor(props) {
    super(props);

    const job = {
      companiesId: 0,
      status: 'New',
      startAddress: 0,
      endAddress: 0,
      rateType: 'All',
      rate: 0,
      notes: '',
      createdBy: 0,
      createdOn: moment().unix() * 1000,
      modifiedBy: 0,
      modifiedOn: moment().unix() * 1000,
      isArchived: 0
    };

    this.state = {
      ...job
    };

    this.handleInputChange = this.handleInputChange.bind(this);
  }

  async componentDidMount() {
    const jobs = await this.fetchJobs();

    Promise.all(
      jobs.map(async (job) => {
        const newJob = job;
        const company = await CompanyService.getCompanyById(newJob.companiesId);
        newJob.companyName = company.legalName;

        const materialsList = await JobMaterialsService.getJobMaterialsByJobId(job.id);
        const materials = materialsList.map(materialItem => materialItem.value);
        newJob.material = this.equipmentMaterialsAsString(materials);

        const address = await AddressService.getAddressById(newJob.startAddress);
        newJob.zip = address.zipCode;

        return newJob;
      })
    );
    this.setState({ jobs });
    // console.log(jobs);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.job) {
      const { job } = nextProps;
      Object.keys(job)
        .map((key) => {
          if (job[key] === null) {
            job[key] = '';
          }
          return true;
        });
      this.setState({ ...job });
    }
  }

  toggle(tab) {
    const { activeTab } = this.state;
    if (activeTab !== tab) {
      this.setState({
        activeTab: tab
      });
    }
  }

  handlePageClick(menuItem) {
    if (menuItem) {
      this.setState({ [`goTo${menuItem}`]: true });
    }
  }

  async saveJob(e) {
    e.preventDefault();
    const { job, handlePageClick } = this.props;
    if (!this.isFormValid()) {
      // TODO display error message
      // console.error('didnt put all the required fields.');
      return;
    }
    const jobForm = this.state;
    if (job && job.id) {
      // then we are updating the record
      jobForm.isArchived = jobForm.isArchived === 'on' ? 1 : 0;
      jobForm.modifiedOn = moment().unix() * 1000;
      await JobService.updateJob(jobForm);
      handlePageClick('Job');
    } else {
      // create
      await JobService.createJob(jobForm);
      handlePageClick('Job');
    }
  }

  isFormValid() {
    const job = this.state;
    return !!(
      job.companiesId
      && job.status
      && job.startAddress
      && job.endAddress
      && job.rateType
    );
  }

  async handleDelete() {
    const job = this.state;
    await JobForm.deleteJobById(job.id);
    this.handlePageClick('Job');
  }

  handleInputChange(e) {
    this.setState({ [e.target.name]: e.target.value });
  }

  renderGoTo() {
    const { goToDashboard, goToJob } = this.state;
    if (goToDashboard) {
      return <Redirect push to="/" />;
    }
    if (goToJob) {
      return <Redirect push to="/jobs" />;
    }
    return true;
  }

  render() {
    const {
      companiesId,
      status,
      startAddress,
      endAddress,
      rateType,
      rate,
      notes,
      createdBy,
      createdOn,
      modifiedBy,
      modifiedOn,
      isArchived
    } = this.state;
    return (
      <React.Fragment>
        <Col md={12} lg={12}>
          <Card>
            <CardBody>
              <form className="form" onSubmit={e => this.saveJob(e)}>
                <div className="form__half">
                  <div className="form__form-group">
                    <span className="form__form-group-label">Company Name</span>
                    <div className="form__form-group-field">
                      <input name="companiesId" type="number" value={companiesId}
                             onChange={this.handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="form__form-group">
                    <span className="form__form-group-label">Status</span>
                    <div className="form__form-group-field">
                      <input name="status" type="text" value={status}
                             onChange={this.handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="form__form-group">
                    <span className="form__form-group-label">Start Address</span>
                    <div className="form__form-group-field">
                      <input name="startAddress" type="number" value={startAddress}
                             onChange={this.handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="form__form-group">
                    <span className="form__form-group-label">End Address</span>
                    <div className="form__form-group-field">
                      <input name="endAddress" type="number" value={endAddress}
                             onChange={this.handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="form__form-group">
                    <span className="form__form-group-label">Model Type</span>
                    <div className="form__form-group-field">
                      <input name="rateType" type="text" value={rateType}
                             onChange={this.handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="form__form-group">
                    <span className="form__form-group-label">Rate</span>
                    <div className="form__form-group-field">
                      <input name="rate" type="number" value={rate}
                             onChange={this.handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="form__form-group">
                    <span className="form__form-group-label">Notes</span>
                    <div className="form__form-group-field">
                      <input name="notes" type="text" value={notes}
                             onChange={this.handleInputChange}
                      />

                    </div>
                  </div>

                  <div className="form__form-group">
                    <span className="form__form-group-label">Created By</span>
                    <div className="form__form-group-field">
                      <input name="createdBy" type="number" value={createdBy}
                             onChange={this.handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="form__form-group">
                    <span className="form__form-group-label">Created On</span>
                    <div className="form__form-group-field">
                      <input name="createdOn" type="text" value={moment(createdOn)
                        .format()} onChange={this.handleInputChange} disabled
                      />
                    </div>
                  </div>

                  <div className="form__form-group">
                    <span className="form__form-group-label">Modified By</span>
                    <div className="form__form-group-field">
                      <input name="modifiedBy" type="number" value={modifiedBy}
                             onChange={this.handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="form__form-group">
                    <span className="form__form-group-label">Modified On</span>
                    <div className="form__form-group-field">
                      <input name="modifiedOn" type="text" value={moment(modifiedOn)
                        .format()} onChange={this.handleInputChange} disabled
                      />
                    </div>
                  </div>

                  <div className="form__form-group">
                    <TCheckBox onChange={this.handleInputChange} name="isArchived"
                               value={!!isArchived} label="Is Archived"
                    />
                  </div>
                </div>
                <Container>
                  <Row>
                    <Col md="4">
                      <Button
                        className="account__btn btn-delete"
                        onClick={() => this.handleDelete()}
                      >
                        Delete Job
                      </Button>
                    </Col>
                    <Col md="4">
                      {this.renderGoTo()}
                      <Button
                        className="app-link account__btn btn-back"
                        onClick={() => this.handlePageClick('Job')}
                      >
                        Cancel
                      </Button>
                    </Col>
                    <Col md="4">
                      <Button
                        type="submit"
                        className="account__btn btn-save"
                      >
                        Submit
                      </Button>
                    </Col>
                  </Row>
                </Container>
              </form>
            </CardBody>
          </Card>
        </Col>
      </React.Fragment>
    );
  }
}

JobForm.propTypes = {
  job: PropTypes.shape({
    id: PropTypes.number
  }),
  handlePageClick: PropTypes.func.isRequired
};

JobForm.defaultProps = {
  job: null
};

export default JobForm;
