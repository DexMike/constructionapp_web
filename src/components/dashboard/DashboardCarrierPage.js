import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import {
  Card,
  CardBody,
  Col,
  Container,
  Row
} from 'reactstrap';
import TTable from '../common/TTable';
import TFormat from '../common/TFormat';
import {DashboardObjectStatic} from './DashboardObjectStatic';
import {DashboardObjectClickable} from './DashboardObjectClickable';
import JobFilter from '../filters/JobFilter';

class DashboardCarrierPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loaded: false,
      jobs: [],
      goToDashboard: false,
      goToUpdateJob: false,
      jobId: 0,
      // profile: null
      // Rate Type Button toggle
      filters: {
        status: ''
      },
    };

    this.renderGoTo = this.renderGoTo.bind(this);
    this.handleJobEdit = this.handleJobEdit.bind(this);
    this.returnSelectedMaterials = this.returnSelectedMaterials.bind(this);
    this.handleFilterStatusChange = this.handleFilterStatusChange.bind(this);
    this.returnJobs = this.returnJobs.bind(this);
  }

  async componentDidMount() {
    this.setState(
      {
        loaded: true
      }
    );
  }

  returnJobs(jobs, filters) {
    this.setState({ jobs });
    this.setState({ filters });
  }

  equipmentMaterialsAsString(materials) {
    let materialsString = '';
    if (materials) {
      let index = 0;
      for (const material of materials) {
        if (index !== materials.length - 1) {
          materialsString += `${material}, `;
        } else {
          materialsString += material;
        }
        index += 1;
      }
    }
    return materialsString;
  }


  handlePageClick(menuItem) {
    if (menuItem) {
      this.setState({ [`goTo${menuItem}`]: true });
    }
  }

  async handleFilterStatusChange({value, name}) {
    const { filters } = this.state;
    if (filters[name] === value) {
      filters[name] = '';
    } else {
      filters[name] = value;
    }
    this.refs.filterChild.filterWithStatus(filters);
  }

  handleJobEdit(id) {
    this.setState({
      goToUpdateJob: true,
      jobId: id
    });
  }

  // handleJobEdit(id) {
  //   const { jobs } = this.state;
  //   const [selectedJob] = jobs.filter((job) => {
  //     if (id === job.id) {
  //       return job;
  //     }
  //     return false;
  //   }, id);
  //   selectedJob.materials = ['Any'];
  //   this.setState({
  //     selectedJob,
  //     modal: true
  //   });
  // }

  returnSelectedMaterials() {
    const { filters } = this.state;
    return filters.materialType;
  }

  // renderModal stolen from MarketplaceCarrierPage
  renderModal() {
    // const {
    //   // equipments,
    //   // startAvailability,
    //   // endAvailability,
    //   // equipmentType,
    //   // minCapacity,
    //   // materials,
    //   // zipCode,
    //   // rateType,
    //   modal,
    //   selectedEquipment
    // } = this.state;
    // return (
    //   <Modal
    //     isOpen={modal}
    //     toggle={this.toggleAddJobModal}
    //     className="modal-dialog--primary modal-dialog--header"
    //   >
    //     <div className="modal__header">
    //       <button type="button" className="lnr lnr-cross modal__close-btn"
    //               onClick={this.toggleAddJobModal}
    //       />
    //       <h4 className="bold-text modal__title">Job Request</h4>
    //     </div>
    //     <div className="modal__body" style={{ padding: '25px 25px 20px 25px' }}>
    //       <JobCreateForm
    //         selectedEquipment={selectedEquipment}
    //         closeModal={this.toggleAddJobModal}
    //         selectedMaterials={this.returnSelectedMaterials}
    //         getAllMaterials={this.retrieveAllMaterials}
    //       />
    //     </div>
    //   </Modal>
    // );
  }

  renderGoTo() {
    const status = this.state;
    if (status.goToDashboard) {
      return <Redirect push to="/"/>;
    }
    if (status.goToUpdateJob) {
      return <Redirect push to={`/jobs/save/${status.jobId}`}/>;
    }
    return false;
  }

  renderTitle() {
    return (
      <Row>
        <Col md={12}>
          <h3 className="page-title">Job Dashboard</h3>
        </Col>
      </Row>
    );
  }

  renderCards() {
    const { loaded, filters } = this.state;
    let { jobs } = this.state;

    let onOfferJobCount = 0;
    let publishedJobCount = 0;
    let acceptedJobCount = 0;
    let inProgressJobCount = 0;
    let completedJobCount = 0;
    let potentialIncome = 0;

    let jobsCompleted = 0;
    let totalEarnings = 0;
    let earningsPerJob = 0;
    let cancelledJobs = 0;
    let jobsPerTruck = 0;
    let idleTrucks = 0;
    let completedOffersPercent = 0;

    if (jobs) {
      jobs = jobs.map((job) => {
        const newJob = job;
        const tempRate = newJob.rate;
        if (newJob.status === 'On Offer') {
          onOfferJobCount += 1;
        }
        if (newJob.status === 'Published') {
          publishedJobCount += 1;
        }
        if (newJob.status === 'Booked') {
          acceptedJobCount += 1;
        }
        if (newJob.status === 'In Progress') {
          inProgressJobCount += 1;
        }
        if (newJob.status === 'Job Completed') {
          completedJobCount += 1;
        }
        if (newJob.rateType === 'Hour') {
          newJob.newSize = TFormat.asHours(newJob.rateEstimate);
          newJob.newRate = TFormat.asMoneyByHour(newJob.rate);
          newJob.estimatedIncome = TFormat.asMoney(
            (tempRate * newJob.rateEstimate) * 0.95
          );
        }
        if (newJob.rateType === 'Ton') {
          newJob.newSize = TFormat.asTons(newJob.rateEstimate);
          newJob.newRate = TFormat.asMoneyByTons(newJob.rate);
          newJob.estimatedIncome = TFormat.asMoney(
            (tempRate * newJob.rateEstimate) * 0.95
          );
        }

        newJob.newStartDate = TFormat.asDate(job.startTime);

        potentialIncome += (tempRate * newJob.rateEstimate) * 0.95;

        return newJob;
      });
    }

    jobsCompleted = onOfferJobCount * 20;
    // totalEarnings = TFormat.asMoney(potentialIncome * 3.14159);
    // earningsPerJob = TFormat.asMoney((potentialIncome * 3.14159) / (jobsCompleted));
    // cancelledJobs = 1;
    // jobsPerTruck = TFormat.asNumber(onOfferJobCount / 0.7);
    // idleTrucks = 1;

    // Jobs completed / Job offers responded to
    completedOffersPercent = TFormat.asPercent((completedJobCount / jobs.length) * 100, 2);

    potentialIncome = TFormat.asMoney(potentialIncome);

    // console.log(jobs);

    if (loaded) {
      return (
        <Container className="dashboard">
          {/*{this.renderGoTo()}*/}

          <div className="row">
            <DashboardObjectClickable title="New Offers" displayVal = {onOfferJobCount} value={"On Offer"} handle={this.handleFilterStatusChange} name={"status"} status={filters["status"]}/>
            <DashboardObjectClickable title="Published Jobs" displayVal = {publishedJobCount} value={"Published"} handle={this.handleFilterStatusChange} name={"status"} status={filters["status"]}/>
            <DashboardObjectClickable title="Booked Jobs" displayVal = {acceptedJobCount} value={"Booked"} handle={this.handleFilterStatusChange} name={"status"} status={filters["status"]}/>
            <DashboardObjectClickable title="Jobs in Progress" displayVal = {inProgressJobCount} value={"In Progress"} handle={this.handleFilterStatusChange} name={"status"} status={filters["status"]}/>
            <DashboardObjectClickable title="Completed Jobs" displayVal = {completedJobCount} value={"Job Completed"} handle={this.handleFilterStatusChange} name={"status"} status={filters["status"]}/>
            {/*<DashboardObjectStatic title="% Completed" displayVal = {completedOffersPercent}/>*/}
            <DashboardObjectStatic title={filters["status"] === "Job Completed"  ? "Earnings" : "Potential Earnings"} displayVal={potentialIncome}/>
          </div>
        </Container>
      );
    }
    return (
      <Container>
        Loading...
      </Container>
    );
  }

  renderJobList() {
    const { loaded } = this.state;
    let { jobs } = this.state;
    let onOfferJobCount = 0;
    let publishedJobCount = 0;
    let acceptedJobCount = 0;
    let inProgressJobCount = 0;
    let completedJobCount = 0;
    let potentialIncome = 0;

    let jobsCompleted = 0;
    let totalEarnings = 0;
    let earningsPerJob = 0;
    let cancelledJobs = 0;
    let jobsPerTruck = 0;
    let idleTrucks = 0;
    let completedOffersPercent = 0;

    jobs = jobs.map((job) => {
      const newJob = job;
      const tempRate = newJob.rate;
      if (newJob.status === 'On Offer') {
        onOfferJobCount += 1;
      }
      if (newJob.status === 'Published') {
        publishedJobCount += 1;
      }
      if (newJob.status === 'Booked') {
        acceptedJobCount += 1;
      }
      if (newJob.status === 'In Progress') {
        inProgressJobCount += 1;
      }
      if (newJob.status === 'Job Completed') {
        completedJobCount += 1;
      }
      if (newJob.rateType === 'Hour') {
        newJob.newSize = TFormat.asHours(newJob.rateEstimate);
        newJob.newRate = TFormat.asMoneyByHour(newJob.rate);
        newJob.estimatedIncome = TFormat.asMoney(
          (tempRate * newJob.rateEstimate) * 0.95
        );
      }
      if (newJob.rateType === 'Ton') {
        newJob.newSize = TFormat.asTons(newJob.rateEstimate);
        newJob.newRate = TFormat.asMoneyByTons(newJob.rate);
        // Job's Potencial Earnings
        newJob.estimatedIncome = TFormat.asMoney(
          (tempRate * newJob.rateEstimate) * 0.95
        );
      }

      newJob.newStartDate = TFormat.asDate(job.startTime);

      potentialIncome += (tempRate * newJob.rateEstimate) * 0.95;

      return newJob;
    });

    // jobsCompleted = onOfferJobCount * 20;
    potentialIncome = TFormat.asMoney(potentialIncome);

    if (loaded) {
      const {filters} = this.state;
      return (
        <Container className="dashboard">
          <Row>
            <Col md={12}>
              <Card>
                <CardBody>
                  Displaying {jobs.length} of {jobs.length}
                  <TTable
                    columns={
                      [
                        //{
                        //  name: 'id',
                        //  displayName: 'Job Id'
                        // },
                        {
                          name: 'newStartDate',
                          displayName: 'Start Date'
                        },
                        {
                          name: 'name',
                          displayName: 'Job Name'
                        },
                        {
                          name: 'status',
                          displayName: 'Job Status'
                        },
                        {
                          name: 'legalName',
                          displayName: 'Customer'
                        },
                        {
                          name: 'zipCode',
                          displayName: 'Start Zip'
                        },
                        {
                          name: 'estimatedIncome',
                          displayName: filters.status === "Job Completed" ? "Earnings" : "Potential Earnings"
                        },
                        {
                          name: 'newRate',
                          displayName: 'Rate'
                        },
                        // {
                        //   name: 'name',
                        //   displayName: 'Job Name'
                        // },
                        // {
                        //   name: 'status',
                        //   displayName: 'Job Status'
                        // },


                        {
                          name: 'newSize',
                          displayName: 'Size'
                        },
                        {
                          // the materials needs to come from the the JobMaterials Table
                          name: 'materials',
                          displayName: 'Materials'
                        }
                      ]
                    }
                    data={jobs}
                    handleIdClick={this.handleJobEdit}
                  />
                </CardBody>
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

  render() {
    const { loaded } = this.state;
    if (loaded) {
      return (
        <Container className="dashboard">
          {this.renderModal()}
          {this.renderGoTo()}
          {this.renderTitle()}
          {this.renderCards()}
          <JobFilter
            returnJobs={this.returnJobs} 
            ref="filterChild"
          />
          {/*{this.renderFilter()}*/}
          {this.renderJobList()}
        </Container>
      );
    }
    return (
      <Container className="dashboard">
        Loading...
      </Container>
    );
  }
}

export default DashboardCarrierPage;
