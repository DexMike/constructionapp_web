import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { Card, CardBody, Col, Container, Row } from 'reactstrap';
import moment from 'moment';

import TTable from '../common/TTable';
import TFormat from '../common/TFormat';

import JobService from '../../api/JobService';
import CompanyService from '../../api/CompanyService';
import JobMaterialsService from '../../api/JobMaterialsService';
import AddressService from '../../api/AddressService';
import DashboardTitle, {DashboardObject} from './DashboardObject';

class DashboardCarrierPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loaded: false,
      jobs: [],
      goToDashboard: false,
      goToAddJob: false,
      goToUpdateJob: false,
      jobId: 0
      // profile: null
    };

    this.renderGoTo = this.renderGoTo.bind(this);
    this.handleJobEdit = this.handleJobEdit.bind(this);
  }

  async componentDidMount() {
    const jobs = await this.fetchJobs();

    // Promise.all(
    jobs.map(async (job) => {
      const newJob = job;

      const company = await CompanyService.getCompanyById(newJob.companiesId);
      newJob.companyName = company.legalName;

      // console.log(companyName);
      // console.log(job.companyName);

      const materialsList = await JobMaterialsService.getJobMaterialsByJobId(job.id);
      const materials = materialsList.map(materialItem => materialItem.value);
      newJob.material = this.equipmentMaterialsAsString(materials);
      // console.log(companyName);
      // console.log(job.material);

      const address = await AddressService.getAddressById(newJob.startAddress);
      newJob.zip = address.zipCode;

      this.setState({ loaded: true });

      return newJob;
    });
    // );
    this.setState({ jobs });
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

  handleJobEdit(id) {
    this.setState({
      goToUpdateJob: true,
      jobId: id
    });
  }

  handlePageClick(menuItem) {
    if (menuItem) {
      this.setState({ [`goTo${menuItem}`]: true });
    }
  }

  async fetchJobs() {
    let jobs = await JobService.getJobs();
    jobs = jobs.map((job) => {
      const newJob = job;
      newJob.modifiedOn = moment(job.modifiedOn)
        .format();
      newJob.createdOn = moment(job.createdOn)
        .format();
      return newJob;
    });
    return jobs;
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
    if (status.goToAddJob) {
      return <Redirect push to="/jobs/save"/>;
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
    const { loaded } = this.state;
    let { jobs } = this.state;
    let newJobCount = 0;
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
      if (newJob.status === 'New') {
        newJobCount += 1;
      }
      if (newJob.status === 'Accepted') {
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
        newJob.estimatedIncome = TFormat.asMoney(tempRate * newJob.rateEstimate);
      }
      if (newJob.rateType === 'Ton') {
        newJob.newSize = TFormat.asTons(newJob.rateEstimate);
        newJob.newRate = TFormat.asMoneyByTons(newJob.rate);
        newJob.estimatedIncome = TFormat.asMoney(tempRate * newJob.rateEstimate);
      }

      newJob.newStartDate = TFormat.asDate(job.startTime);

      potentialIncome += tempRate * newJob.rateEstimate;

      return newJob;
    });

    jobsCompleted = newJobCount * 20;
    // totalEarnings = TFormat.asMoney(potentialIncome * 3.14159);
    // earningsPerJob = TFormat.asMoney((potentialIncome * 3.14159) / (jobsCompleted));
    // cancelledJobs = 1;
    // jobsPerTruck = TFormat.asNumber(newJobCount / 0.7);
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
            <DashboardObject title="Jobs in Progress" val = {inProgressJobCount}/>
            <DashboardObject title="New Offers" val = {newJobCount}/>
            <DashboardObject title="Booked Jobs" val = {acceptedJobCount}/>
            <DashboardObject title="Completed Jobs" val={completedJobCount}/>
            <DashboardObject title="Potential Earnings" val={potentialIncome}/>
            <DashboardObject title="% Completed" val = {completedOffersPercent}/>
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

  renderFilter() {
    // const {
    //   // Lists
    //   equipmentTypeList,
    //   materialTypeList,
    //   rateTypeList,
    //   startDate,
    //   endDate,
    //
    //   // filters
    //   filters
    //
    // } = this.state;
    //
    // return (
    //   <Row>
    //     <Col md={12}>
    //       <Card>
    //         <CardBody>
    //           <form id="filter-form" className="form" onSubmit={e => this.saveCompany(e)}>
    //             <Col lg={12}>
    //
    //               {/*<Col>*/}
    //               {/*Select by:*/}
    //               {/*<TSelect*/}
    //               {/*input={*/}
    //               {/*{*/}
    //               {/*onChange: this.handleSelectFilterChange,*/}
    //               {/*name: 'rateType',*/}
    //               {/*value: filters.rateType*/}
    //               {/*}*/}
    //               {/*}*/}
    //               {/*meta={*/}
    //               {/*{*/}
    //               {/*touched: false,*/}
    //               {/*error: 'Unable to select'*/}
    //               {/*}*/}
    //               {/*}*/}
    //               {/*value={filters.rateType}*/}
    //               {/*options={*/}
    //               {/*rateTypeList.map(rateType => ({*/}
    //               {/*name: 'rateType',*/}
    //               {/*value: rateType,*/}
    //               {/*label: rateType*/}
    //               {/*}))*/}
    //               {/*}*/}
    //               {/*placeholder={rateTypeList[0]}*/}
    //               {/*/>*/}
    //               {/*</Col>*/}
    //
    //             </Col>
    //
    //             <Col lg={12}>
    //               <Row lg={12} style={{ background: '#eef4f8' }}>
    //                 <Col className="filter-item-title">
    //                   Date Range
    //                 </Col>
    //                 <Col className="filter-item-title">
    //                   Rate Type
    //                 </Col>
    //                 <Col className="filter-item-title">
    //                   Min Rate
    //                 </Col>
    //                 <Col className="filter-item-title">
    //                   Minimum
    //                 </Col>
    //                 <Col className="filter-item-title">
    //                   Truck Type
    //                 </Col>
    //                 <Col className="filter-item-title">
    //                   # of Trucks
    //                 </Col>
    //                 <Col className="filter-item-title">
    //                   Zip Code
    //                 </Col>
    //                 <Col className="filter-item-title">
    //                   Materials
    //                 </Col>
    //               </Row>
    //               <Row lg={12} id="filter-input-row">
    //                 {/*
    //                 <Col>
    //                   <TDateTimePicker
    //                       input={
    //                         {
    //                           onChange: this.handleStartDateChange,
    //                           name: 'startAvailability',
    //                           value: { startDate },
    //                           givenDate: new Date(startDate).getTime()
    //                         }
    //                       }
    //                       onChange={this.handleStartDateChange}
    //                       dateFormat="MM-dd-yy"
    //                   />
    //                 </Col>
    //                   <TDateTimePicker
    //                       input={
    //                         {
    //                           className: 'filter-text',
    //                           onChange: this.handleEndDateChange,
    //                           name: 'endAvailability',
    //                           value: { endDate },
    //                           givenDate: new Date(endDate).getTime()
    //                         }
    //                       }
    //                       onChange={this.handleEndDateChange}
    //                       dateFormat="MM-dd-yy"
    //                   />
    //                 */}
    //                 <Col>
    //                   <TIntervalDatePicker
    //                     startDate={filters.startAvailability}
    //                     endDate={filters.endAvailability}
    //                     name="dateInterval"
    //                     onChange={this.handleIntervalInputChange}
    //                     dateFormat="MM/dd/yy"
    //                   />
    //
    //                 </Col>
    //                 <Col>
    //                   <TSelect
    //                     input={
    //                       {
    //                         onChange: this.handleSelectFilterChange,
    //                         name: 'rateType',
    //                         value: filters.rateType
    //                       }
    //                     }
    //                     meta={
    //                       {
    //                         touched: false,
    //                         error: 'Unable to select'
    //                       }
    //                     }
    //                     value={filters.rateType}
    //                     options={
    //                       rateTypeList.map(rateType => ({
    //                         name: 'rateType',
    //                         value: rateType,
    //                         label: rateType
    //                       }))
    //                     }
    //                     placeholder={rateTypeList[0]}
    //                   />
    //                 </Col>
    //                 <Col>
    //                   <input name="rate"
    //                          className="filter-text"
    //                          type="text"
    //                          placeholder="Any"
    //                          value={filters.rate}
    //                          onChange={this.handleFilterChange}
    //                   />
    //                 </Col>
    //                 <Col>
    //                   <input name="minTons"
    //                          className="filter-text"
    //                          type="text"
    //                          placeholder="Any"
    //                          value={filters.minTons}
    //                          onChange={this.handleFilterChange}
    //                   />
    //                 </Col>
    //                 <Col>
    //                   <TSelect
    //                     input={
    //                       {
    //                         onChange: this.handleSelectFilterChange,
    //                         name: 'equipmentType',
    //                         value: filters.equipmentType
    //                       }
    //                     }
    //                     meta={
    //                       {
    //                         touched: false,
    //                         error: 'Unable to select'
    //                       }
    //                     }
    //                     value={filters.equipmentType}
    //                     options={
    //                       equipmentTypeList.map(equipmentType => ({
    //                         name: 'equipmentType',
    //                         value: equipmentType,
    //                         label: equipmentType
    //                       }))
    //                     }
    //                     placeholder={equipmentTypeList[0]}
    //                   />
    //                 </Col>
    //                 <Col>
    //                   <input name="numEquipments"
    //                          className="filter-text"
    //                          type="text"
    //                          placeholder="1"
    //                          value={filters.numEquipments}
    //                          onChange={this.handleFilterChange}
    //                   />
    //                 </Col>
    //                 <Col>
    //                   <input name="zipCode"
    //                          className="filter-text"
    //                          type="text"
    //                          placeholder="Zip Code"
    //                          value={filters.zipCode}
    //                          onChange={this.handleFilterChange}
    //                   />
    //                 </Col>
    //                 <Col>
    //                   <MultiSelect
    //                     input={
    //                       {
    //                         onChange: this.handleMultiChange,
    //                         // onChange: this.handleSelectFilterChange,
    //                         name: 'materialType',
    //                         value: filters.materialType
    //                       }
    //                     }
    //                     meta={
    //                       {
    //                         touched: false,
    //                         error: 'Unable to select'
    //                       }
    //                     }
    //                     options={
    //                       materialTypeList.map(materialType => ({
    //                         name: 'materialType',
    //                         value: materialType.trim(),
    //                         label: materialType.trim()
    //                       }))
    //                     }
    //                     // placeholder="Materials"
    //                     placeholder={materialTypeList[0]}
    //                   />
    //                 </Col>
    //
    //               </Row>
    //             </Col>
    //
    //             <br/>
    //
    //           </form>
    //
    //         </CardBody>
    //       </Card>
    //     </Col>
    //
    //   </Row>
    // );
  }

  renderJobList() {
    const { loaded } = this.state;
    let { jobs } = this.state;
    let newJobCount = 0;
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
      if (newJob.status === 'New') {
        newJobCount += 1;
      }
      if (newJob.status === 'Accepted') {
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
        newJob.estimatedIncome = TFormat.asMoney(tempRate * newJob.rateEstimate);
      }
      if (newJob.rateType === 'Ton') {
        newJob.newSize = TFormat.asTons(newJob.rateEstimate);
        newJob.newRate = TFormat.asMoneyByTons(newJob.rate);
        newJob.estimatedIncome = TFormat.asMoney(tempRate * newJob.rateEstimate);
      }

      newJob.newStartDate = TFormat.asDate(job.startTime);

      potentialIncome += tempRate * newJob.rateEstimate;

      return newJob;
    });

    // jobsCompleted = newJobCount * 20;
    potentialIncome = TFormat.asMoney(potentialIncome);

    // console.log(jobs);

    if (loaded) {
      return (
        <Container className="dashboard">
          <Row>
            <Col md={12}>
              <Card>
                <CardBody>
                  Displaying 80 of {newJobCount}
                  <TTable
                    columns={
                      [
                        // {
                        //   name: 'id',
                        //   displayName: 'Job Id'
                        // },
                        {
                          name: 'newStartDate',
                          displayName: 'Start Date'
                        },
                        {
                          name: 'companyName',
                          displayName: 'Customer'
                        },
                        {
                          name: 'zip',
                          displayName: 'Start Zip'
                        },
                        {
                          name: 'estimatedIncome',
                          displayName: 'Est. Income'
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
                          name: 'material',
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
          {this.renderFilter()}
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
