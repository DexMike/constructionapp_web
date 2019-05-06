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

class MarketplaceCarrierPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loaded: false,
      jobs: [],
      jobId: 0,
      modal: false,
      goToDashboard: false,
    };

    this.renderGoTo = this.renderGoTo.bind(this);
    this.toggleAddJobModal = this.toggleAddJobModal.bind(this);
    this.toggleViewJobModal = this.toggleViewJobModal.bind(this);
    this.toggleViewJobModalClear = this.toggleViewJobModalClear.bind(this);
    this.returnJobs = this.returnJobs.bind(this);
  }

  async componentDidMount() {
    this.setState(
      {
        loaded: true,
      }
    );
  }

  returnJobs(jobs) {
    this.setState({ jobs });
  }

  handlePageClick(menuItem) {
    if (menuItem) {
      this.setState({ [`goTo${menuItem}`]: true });
    }
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
    let {
      jobs
    } = this.state;
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

        return newJob;
      });
    } else {
      // console.log("MarketPlaceCarrierPage: no Jobs");
      jobs = [];
    }

    return (
      <Container className="dashboard">
        <Row>
          <Col md={12}>
            <Card>
              <CardBody>
                Carrier Market Place
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
                        name: 'estimatedIncome',
                        displayName: 'Potential Earnings'
                      },
                      {
                        name: 'newRate',
                        displayName: 'Hourly Rate'
                      },
                      {
                        name: 'newSize',
                        displayName: 'Min Hours'
                      },
                      {
                        name: 'zipCode',
                        displayName: 'Zip Code'
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
                />

              </CardBody>
            </Card>
          </Col>
        </Row>
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
          <JobFilter
            returnJobs={this.returnJobs}
          />
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

export default MarketplaceCarrierPage;
