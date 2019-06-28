import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import {
  Card,
  CardBody,
  Col,
  Container,
  Modal,
  Row
} from 'reactstrap';
import TTable from '../common/TTable';
import TFormat from '../common/TFormat';
import JobViewForm from './JobViewForm';
import JobFilter from '../filters/JobFilter';
import JobService from '../../api/JobService';

class MarketplaceCarrierPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loaded: false,
      jobs: [],
      jobId: 0,
      modal: false,
      goToDashboard: false,
      page: 0,
      rows: 10,
      totalJobs: 0
    };

    this.renderGoTo = this.renderGoTo.bind(this);
    this.toggleAddJobModal = this.toggleAddJobModal.bind(this);
    this.toggleViewJobModal = this.toggleViewJobModal.bind(this);
    this.toggleViewJobModalClear = this.toggleViewJobModalClear.bind(this);
    this.handlePageChange = this.handlePageChange.bind(this);
    this.handleRowsPerPage = this.handleRowsPerPage.bind(this);
    this.returnJobs = this.returnJobs.bind(this);
  }

  async componentDidMount() {
    await this.fetchJobsInfo();
    this.setState({ loaded: true });
  }

  async fetchJobsInfo() {
    const response = await JobService.getMarketplaceJobsInfo();
    const { totalJobs } = response;
    this.setState({ totalJobs });
  }


  returnJobs(jobs, filters, metadata) {
    const { totalCount } = metadata;
    this.setState({
      totalCount,
      jobs
    });
  }

  handlePageClick(menuItem) {
    if (menuItem) {
      this.setState({ [`goTo${menuItem}`]: true });
    }
  }

  handlePageChange(page) {
    this.setState({ page });
  }

  handleRowsPerPage(rows) {
    this.setState({ rows });
  }

  /* handleJobEdit(id) {
    const { jobs } = this.state;
    const [selectedJob] = jobs.filter((job) => {
      if (id === job.id) {
        return job;
      }
      return false;
    }, id);
    // selectedJob.materials = ['Any'];
    this.setState({
      // selectedJob,
      modal: true
    });
  } */

  toggleAddJobModal() {
    const { modal } = this.state;
    this.setState({
      modal: !modal
    });
  }

  async toggleViewJobModal() {
    const { modal } = this.state;
    this.setState({ modal: !modal });
  }

  async toggleViewJobModalClear(id) {
    const { modal } = this.state;
    this.setState({
      // equipmentId: 0, // reset equipmentID, not companyID
      // selectedItemData: {},
      modal: !modal,
      jobId: id
    });
  }

  renderGoTo() {
    const status = this.state;
    if (status.goToDashboard) {
      return <Redirect push to="/"/>;
    }
    return false;
  }

  renderModal() {
    const {
      modal,
      jobId
    } = this.state;
    return (
      <Modal
        isOpen={modal}
        toggle={this.toggleViewJobModal}
        className="modal-dialog--primary modal-dialog--header"
      >
        <div className="modal__header">
          <button type="button" className="lnr lnr-cross modal__close-btn"
                  onClick={this.toggleViewJobModal}
          />
          <div className="bold-text modal__title">Marketplace Detail</div>
        </div>
        <div className="modal__body" style={{ padding: '25px 25px 20px 25px' }}>
          <JobViewForm
            jobId={jobId}
            closeModal={this.toggleViewJobModal}
            toggle={this.toggleViewJobModal}
          />
        </div>
      </Modal>
    );
  }

  renderTitle() {
    return (
      <Row>
        <Col md={12}>
          <h3 className="page-title">Find a Job</h3>
        </Col>
      </Row>
    );
  }

  renderJobList() {
    let { jobs } = this.state;
    if (jobs) {
      jobs = jobs.map((job) => {
        const newJob = job;

        // const company = await CompanyService.getCompanyById(newJob.companiesId);
        // newJob.companyName = company.legalName;
        //
        // // console.log(companyName);
        // // console.log(job.companyName);
        //
        // const materialsList = await JobMaterialsService.getJobMaterialsByJobId(job.id);
        // const materials = materialsList.map(materialItem => materialItem.value);
        // newJob.material = this.equipmentMaterialsAsString(materials);
        // console.log(companyName);
        // console.log(job.material);
        //
        // const address = await AddressService.getAddressById(newJob.startAddress);
        // newJob.zip = address.zipCode;

        const tempRate = newJob.rate;
        if (newJob.rateType === 'Hour') {
          newJob.newSize = newJob.rateEstimate;
          newJob.newSizeF = TFormat.getValue(
            TFormat.asHours(newJob.rateEstimate)
          );

          newJob.newRate = newJob.rate;
          newJob.newRateF = TFormat.getValue(
            TFormat.asMoneyByHour(newJob.rate)
          );
          // Job's Potential Earnings
          // SG-570: Potential Earnings as displayed to Carrier do not show the Trelar costs
          newJob.potentialIncome = Math.round(tempRate * newJob.rateEstimate);
          newJob.potentialIncomeF = TFormat.getValue(
            TFormat.asMoney(
              (tempRate * newJob.rateEstimate)
            )
          );
        }
        if (newJob.rateType === 'Ton') {
          newJob.newSize = newJob.rateEstimate;
          newJob.newSizeF = TFormat.getValue(
            TFormat.asTons(newJob.rateEstimate)
          );

          newJob.newRate = newJob.rate;
          newJob.newRateF = TFormat.getValue(
            TFormat.asMoneyByTons(newJob.rate)
          );
          // Job's Potential Earnings
          // SG-570: Potential Earnings as displayed to Carrier do not show the Trelar costs
          newJob.potentialIncome = Math.round(tempRate * newJob.rateEstimate);
          newJob.potentialIncomeF = TFormat.getValue(
            TFormat.asMoney(
              (tempRate * newJob.rateEstimate)
            )
          );
        }

        newJob.newStartDate = job.startTime;
        newJob.newStartDateF = TFormat.getValue(
          TFormat.asDate(job.startTime)
        );

        if (typeof job.distance === 'number') {
          newJob.distance = newJob.distance.toFixed(2);
        }

        return newJob;
      });
    } else {
      // console.log("MarketPlaceCarrierPage: no Jobs");
      jobs = [];
    }
    const { totalCount, totalJobs } = this.state;
    return (
      <Container className="dashboard">
        <Row>
          <Col md={12}>
            <Card>
              <CardBody>
                <div className="ml-4 mt-4">
                  Carrier Market Place<br />
                  Displaying {jobs.length} out of {totalCount}&nbsp;
                  filtered jobs ({totalJobs} total jobs)
                </div>
                <TTable
                  columns={
                    [
                      {
                        name: 'name',
                        displayName: 'Job Name'
                      },
                      {
                        name: 'newStartDate',
                        displayName: 'Start Date'
                      },
                      {
                        name: 'potentialIncome',
                        displayName: 'Potential Earnings',
                        label: 'potentialIncomeF'
                      },
                      {
                        name: 'newRate',
                        displayName: 'Hourly Rate',
                        label: 'newRateF'
                      },
                      {
                        name: 'newSize',
                        displayName: 'Min Hours',
                        label: 'newSizeF'
                      },
                      {
                        name: 'distance',
                        displayName: 'Distance (mi)'
                      },
                      {
                        // the materials needs to come from the the JobMaterials Table
                        name: 'materials',
                        displayName: 'Materials'
                      },
                      {
                        name: 'equipmentType',
                        displayName: 'Truck Type'
                      },
                      {
                        name: 'numEquipments',
                        displayName: 'Number of Trucks'
                      }
                    ]
                  }
                  data={jobs}
                  handleIdClick={this.toggleViewJobModalClear}
                  handleRowsChange={this.handleRowsPerPage}
                  handlePageChange={this.handlePageChange}
                  totalCount={totalCount}
                />

              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  renderLoader() {
    return (
      <div className="load loaded inside-page">
        <div className="load__icon-wrap">
          <svg className="load__icon">
            <path fill="rgb(0, 111, 83)" d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z"/>
          </svg>
        </div>
      </div>
    );
  }

  render() {
    const { loaded, page, rows } = this.state;
    if (loaded) {
      return (
        <Container className="dashboard">
          {this.renderModal()}
          {this.renderGoTo()}
          {this.renderTitle()}
          <JobFilter
            returnJobs={this.returnJobs}
            page={page}
            rows={rows}
          />
          {this.renderJobList()}
        </Container>
      );
    }
    return (
      <Container className="dashboard">
        <Row>
          <Col md={12}>
            <h3 className="page-title">Find A Job</h3>
          </Col>
        </Row>
        {this.renderLoader()}
      </Container>
    );
  }
}

export default MarketplaceCarrierPage;
