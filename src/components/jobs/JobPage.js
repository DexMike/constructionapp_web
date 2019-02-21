import React, { Component } from 'react';
import moment from 'moment';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';
import { Card, CardBody, Col, Row, Button, Container,
  Nav, NavItem, NavLink, TabContent, TabPane
} from 'reactstrap';
import JobsService from '../../api/JobsService';
import TCheckBox from '../common/TCheckBox';

// import JobListPage from './JobListPage';
// import JobCarrierListPage from './JobCarrierListPage';
// import JobCustomerListPage from './JobCustomerListPage';

class JobPage extends Component {
  constructor(props) {
    super(props);

    const job = {
      companiesId: 0,
      status: 'New',
      startAddress: 0,
      endAddress: 0,
      modelType: 'All',
      rate: 0,
      notes: '',
      createdBy: 0,
      createdOn: moment().unix() * 1000,
      modifiedBy: 0,
      modifiedOn: moment().unix() * 1000,
      isArchived: 0
    };

    this.state = {
      activeTab: '1',
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
    const jobPage = this.state;
    if (job && job.id) {
      // then we are updating the record
      jobPage.isArchived = jobPage.isArchived === 'on' ? 1 : 0;
      jobPage.modifiedOn = moment().unix() * 1000;
      await JobsService.updateJob(jobPage);
      handlePageClick('Job');
    } else {
      // create
      await JobsService.createJob(jobPage);
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
      && job.modelType
    );
  }

  async handleDelete() {
    const job = this.state;
    await JobPage.deleteJobById(job.id);
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
      return <Redirect push to="/tables/jobs" />;
    }
    return true;
  }

  render() {
    const {
      companiesId,
      status,
      startAddress,
      endAddress,
      modelType,
      rate,
      notes,
      createdBy,
      createdOn,
      modifiedBy,
      modifiedOn,
      isArchived,
      activeTab
    } = this.state;
    return (
      <React.Fragment>
        <Col md={12} lg={12}>
          <Card>
            <CardBody>
              <div className="tabs tabs--justify tabs--bordered-top">
                <div className="tabs__wrap">
                  <Nav tabs>
                    <NavItem>
                      <NavLink
                        className={classnames({
                          active: activeTab === '1'
                        })}
                        onClick={() => {
                          this.toggle('1');
                        }}
                      >
                        Job
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        className={classnames({
                          active: activeTab === '2'
                        })}
                        onClick={() => {
                          this.toggle('2');
                        }}
                      >
                        Bookings
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        className={classnames({
                          active: activeTab === '3'
                        })}
                        onClick={() => {
                          this.toggle('3');
                        }}
                      >
                        Bids
                      </NavLink>
                    </NavItem>
                  </Nav>
                </div>
              </div>
              <TabContent activeTab={activeTab}>
                <TabPane tabId="1">
                  <br/>
                  <form className="form" onSubmit={e => this.saveJob(e)}>
                    <div className="form__half">

                      <div className="form__form-group">
                        <span className="form__form-group-label">Companies Id</span>
                        <div className="form__form-group-field">
                          <input name="companiesId" type="number" value={companiesId} onChange={this.handleInputChange} />
                        </div>
                      </div>

                      <div className="form__form-group">
                        <span className="form__form-group-label">Status</span>
                        <div className="form__form-group-field">
                          <input name="status" type="number" value={status} onChange={this.handleInputChange} />
                        </div>
                      </div>

                      <div className="form__form-group">
                        <span className="form__form-group-label">Start Address</span>
                        <div className="form__form-group-field">
                          <input name="startAddress" type="number" value={startAddress} onChange={this.handleInputChange} />
                        </div>
                      </div>

                      <div className="form__form-group">
                        <span className="form__form-group-label">End Address</span>
                        <div className="form__form-group-field">
                          <input name="endAddress" type="number" value={endAddress} onChange={this.handleInputChange} />
                        </div>
                      </div>

                      <div className="form__form-group">
                        <span className="form__form-group-label">Model Type</span>
                        <div className="form__form-group-field">
                          <input name="modelType" type="number" value={modelType} onChange={this.handleInputChange} />
                        </div>
                      </div>

                      <div className="form__form-group">
                        <span className="form__form-group-label">Rate</span>
                        <div className="form__form-group-field">
                          <input name="rate" type="number" value={rate} onChange={this.handleInputChange} />
                        </div>
                      </div>

                      <div className="form__form-group">
                        <span className="form__form-group-label">Notes</span>
                        <div className="form__form-group-field">
                          <input name="notes" type="text" value={notes} onChange={this.handleInputChange} />

                        </div>
                      </div>

                      <div className="form__form-group">
                        <span className="form__form-group-label">Created By</span>
                        <div className="form__form-group-field">
                          <input name="createdBy" type="number" value={createdBy} onChange={this.handleInputChange} />
                        </div>
                      </div>

                      <div className="form__form-group">
                        <span className="form__form-group-label">Created On</span>
                        <div className="form__form-group-field">
                          <input name="createdOn" type="text" value={moment(createdOn).format()} onChange={this.handleInputChange} disabled />
                        </div>
                      </div>

                      <div className="form__form-group">
                        <span className="form__form-group-label">Modified By</span>
                        <div className="form__form-group-field">
                          <input name="modifiedBy" type="number" value={modifiedBy} onChange={this.handleInputChange} />
                        </div>
                      </div>

                      <div className="form__form-group">
                        <span className="form__form-group-label">Modified On</span>
                        <div className="form__form-group-field">
                          <input name="modifiedOn" type="text" value={moment(modifiedOn).format()} onChange={this.handleInputChange} disabled />
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
                </TabPane>
                <TabPane tabId="2">
                  <p>In development</p>
                </TabPane>
                <TabPane tabId="3">
                  <p>In development</p>
                </TabPane>
              </TabContent>
            </CardBody>
          </Card>
        </Col>
      </React.Fragment>
    );
  }
}

JobPage.propTypes = {
  job: PropTypes.shape({
    id: PropTypes.number
  }),
  handlePageClick: PropTypes.func.isRequired
};

JobPage.defaultProps = {
  job: null
};

export default JobPage;
