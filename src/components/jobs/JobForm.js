import React, { Component } from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';
import { Card, CardBody, Col, Row, Button, Container
} from 'reactstrap';
import JobsService from '../../api/JobsService';

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
      await JobsService.updateJob(jobForm);
      handlePageClick('Job');
    } else {
      // create
      await JobsService.createJob(jobForm);
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
      startTime,
      rateType,
      rate,
    } = this.state;
    return (
      <React.Fragment>
        <Col md={12} lg={12}>
          <Card>
            <CardBody>
              <form className="form" onSubmit={e => this.saveJob(e)}>
                <div className="form__half">
                  <div className="form__form-group">
                    <span className="form__form-group-label">Companies Id</span>
                    <div className="form__form-group-field">
                      <input name="companiesId" type="number" value={companiesId}
                             onChange={this.handleInputChange} disabled
                      />
                    </div>
                  </div>

                  <div className="form__form-group">
                    <span className="form__form-group-label">Status</span>
                    <div className="form__form-group-field">
                      <input name="status" type="text" value={status}
                             onChange={this.handleInputChange} disabled
                      />
                    </div>
                  </div>

                  <div className="form__form-group">
                    <span className="form__form-group-label">Start Time</span>
                    <div className="form__form-group-field">
                      <input name="startTime" type="number" value={startTime}
                             onChange={this.handleInputChange} disabled
                      />
                    </div>
                  </div>

                  <div className="form__form-group">
                    <span className="form__form-group-label">Start Address</span>
                    <div className="form__form-group-field">
                      <input name="startAddress" type="number" value={startAddress}
                             onChange={this.handleInputChange} disabled
                      />
                    </div>
                  </div>

                  <div className="form__form-group">
                    <span className="form__form-group-label">Rate Type</span>
                    <div className="form__form-group-field">
                      <input name="rateType" type="text" value={rateType}
                             onChange={this.handleInputChange} disabled
                      />
                    </div>
                  </div>

                  <div className="form__form-group">
                    <span className="form__form-group-label">Rate</span>
                    <div className="form__form-group-field">
                      <input name="rate" type="number" value={rate}
                             onChange={this.handleInputChange} disabled
                      />
                    </div>
                  </div>

                  <div className="form__form-group">
                    <span className="form__form-group-label">Estimated Income</span>
                    <div className="form__form-group-field">
                      <input name="estimatedIncome" type="number" value={rate} disabled/>
                    </div>
                  </div>

                </div>
                <Container>
                  <Row>
                    <Col md="4">
                      {this.renderGoTo()}
                      <Button
                        className="app-link account__btn btn-back"
                        onClick={() => this.handlePageClick('Job')}
                      >
                        Go Back
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
