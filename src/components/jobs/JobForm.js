import React, { Component } from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';
import { Card, CardBody, Col, Row } from 'reactstrap';
// import TCheckBox from '../common/TCheckBox';
import JobService from '../../api/JobService';
// import CompanyService from '../../api/CompanyService';
// import JobMaterialsService from '../../api/JobMaterialsService';
// import AddressService from '../../api/AddressService';

class JobForm extends Component {
  // constructor(props) {
  //   super(props);
  //
  //   const job = {
  //     companiesId: 0,
  //     status: 'New',
  //     startAddress: 0,
  //     endAddress: 0,
  //     rateType: 'All',
  //     rate: 0,
  //     notes: '',
  //     createdBy: 0,
  //     createdOn: moment()
  //       .unix() * 1000,
  //     modifiedBy: 0,
  //     modifiedOn: moment()
  //       .unix() * 1000,
  //     isArchived: 0
  //   };
  //
  //   this.state = {
  //     ...job
  //   };
  //
  //   this.handleInputChange = this.handleInputChange.bind(this);
  // }
  //
  // // async componentDidMount() {
  // //   const jobs = await this.fetchJobs();
  // //
  // //   Promise.all(
  // //     jobs.map(async (job) => {
  // //       const newJob = job;
  // //       const company = await CompanyService.getCompanyById(newJob.companiesId);
  // //       newJob.companyName = company.legalName;
  // //
  // //       const materialsList = await JobMaterialsService.getJobMaterialsByJobId(job.id);
  // //       const materials = materialsList.map(materialItem => materialItem.value);
  // //       newJob.material = this.equipmentMaterialsAsString(materials);
  // //
  // //       const address = await AddressService.getAddressById(newJob.startAddress);
  // //       newJob.zip = address.zipCode;
  // //
  // //       return newJob;
  // //     })
  // //   );
  // //   this.setState({ jobs });
  // //   // console.log(jobs);
  // // }
  //
  // componentWillReceiveProps(nextProps) {
  //   if (nextProps.job) {
  //     const { job } = nextProps;
  //     Object.keys(job)
  //       .map((key) => {
  //         if (job[key] === null) {
  //           job[key] = '';
  //         }
  //         return true;
  //       });
  //     this.setState({ ...job });
  //   }
  // }
  //
  // toggle(tab) {
  //   const { activeTab } = this.state;
  //   if (activeTab !== tab) {
  //     this.setState({
  //       activeTab: tab
  //     });
  //   }
  // }
  //
  // handlePageClick(menuItem) {
  //   if (menuItem) {
  //     this.setState({ [`goTo${menuItem}`]: true });
  //   }
  // }
  //
  // async saveJob(e) {
  //   e.preventDefault();
  //   const { job, handlePageClick } = this.props;
  //   if (!this.isFormValid()) {
  //     // TODO display error message
  //     // console.error('didnt put all the required fields.');
  //     return;
  //   }
  //   const jobForm = this.state;
  //   if (job && job.id) {
  //     // then we are updating the record
  //     jobForm.isArchived = jobForm.isArchived === 'on' ? 1 : 0;
  //     jobForm.modifiedOn = moment()
  //       .unix() * 1000;
  //     await JobService.updateJob(jobForm);
  //     handlePageClick('Job');
  //   } else {
  //     // create
  //     await JobService.createJob(jobForm);
  //     handlePageClick('Job');
  //   }
  // }
  //
  // isFormValid() {
  //   const job = this.state;
  //   return !!(
  //     job.companiesId
  //     && job.status
  //     && job.startAddress
  //     && job.endAddress
  //     && job.rateType
  //   );
  // }
  //
  // async handleDelete() {
  //   const job = this.state;
  //   await JobForm.deleteJobById(job.id);
  //   this.handlePageClick('Job');
  // }
  //
  // handleInputChange(e) {
  //   this.setState({ [e.target.name]: e.target.value });
  // }
  //
  // materialsAsString(materials) {
  //   let materialsString = '';
  //   if (materials) {
  //     let index = 0;
  //     for (const material of materials) {
  //       if (index !== materials.length - 1) {
  //         materialsString += `${material}, `;
  //       } else {
  //         materialsString += material;
  //       }
  //       index += 1;
  //     }
  //   }
  //   return materialsString;
  // }
  //
  // renderGoTo() {
  //   const { goToDashboard, goToJob } = this.state;
  //   if (goToDashboard) {
  //     return <Redirect push to="/"/>;
  //   }
  //   if (goToJob) {
  //     return <Redirect push to="/jobs"/>;
  //   }
  //   return true;
  // }
  //
  // renderJobTop(job) {
  //   return (
  //     <React.Fragment>
  //       <h4 style={{
  //         borderBottom: '3px solid #ccc',
  //         marginBottom: '20px'
  //       }}
  //       >
  //         {job.name}
  //       </h4>
  //       <Row>
  //         <Col xl={3} lg={4} md={6} sm={12}>
  //           <div className="form__form-group">
  //             <span className="form__form-group-label">Start Date</span>
  //             <div className="form__form-group-field">
  //               <span>
  //                 {moment(job.startTime)
  //                   .format('MM/DD/YY')}
  //               </span>
  //             </div>
  //           </div>
  //         </Col>
  //         <Col xl={3} lg={4} md={6} sm={12}>
  //           <div className="form__form-group">
  //             <span className="form__form-group-label">Estimated Amount</span>
  //             <div className="form__form-group-field">
  //               <span>{job.rateEstimate} {job.rateType}(s)</span>
  //             </div>
  //           </div>
  //         </Col>
  //         <Col xl={3} lg={4} md={6} sm={12}>
  //           <div className="form__form-group">
  //             <span className="form__form-group-label">Company Name</span>
  //             <div className="form__form-group-field">
  //               <span>{job.company.legalName}</span>
  //             </div>
  //           </div>
  //         </Col>
  //         <Col xl={3} lg={4} md={6} sm={12}>
  //           <div className="form__form-group">
  //             <span className="form__form-group-label">Status</span>
  //             <div className="form__form-group-field">
  //               <span>{job.status}</span>
  //             </div>
  //           </div>
  //         </Col>
  //         <Col xl={3} lg={4} md={6} sm={12}>
  //           <div className="form__form-group">
  //             <span className="form__form-group-label">Materials</span>
  //             <div className="form__form-group-field">
  //               <span>{this.materialsAsString(job.materials)}</span>
  //             </div>
  //           </div>
  //         </Col>
  //         <Col xl={3} lg={4} md={6} sm={12}>
  //           <div className="form__form-group">
  //             <span className="form__form-group-label">Rate</span>
  //             <div className="form__form-group-field">
  //               ${job.rate} / {job.rateType}
  //             </div>
  //           </div>
  //         </Col>
  //         <Col xl={3} lg={4} md={6} sm={12}>
  //           <div className="form__form-group">
  //             <span className="form__form-group-label">Created On</span>
  //             <div className="form__form-group-field">
  //               <span>
  //                 {moment(job.createdOn)
  //                   .format('MM/DD/YY')}
  //               </span>
  //             </div>
  //           </div>
  //         </Col>
  //       </Row>
  //     </React.Fragment>
  //   );
  // }
  //
  // renderAddress(address) {
  //   return (
  //     <Row style={{ marginTop: '20px' }}>
  //       <Col sm={12}>
  //         <div className="form__form-group">
  //           <span className="form__form-group-label">Address</span>
  //           <div className="form__form-group-field">
  //             <span>{address.address1}</span>
  //           </div>
  //         </div>
  //       </Col>
  //       {address.address2 && (
  //         <Col sm={12}>
  //           <div className="form__form-group">
  //             <div className="form__form-group-field">
  //               <span>{address.address2}</span>
  //             </div>
  //           </div>
  //         </Col>
  //       )}
  //       {address.address3 && (
  //         <Col sm={12}>
  //           <div className="form__form-group">
  //             <div className="form__form-group-field">
  //               <span>{address.address3}</span>
  //             </div>
  //           </div>
  //         </Col>
  //       )}
  //       {address.address4 && (
  //         <Col sm={12}>
  //           <div className="form__form-group">
  //             <div className="form__form-group-field">
  //               <span>{address.address4}</span>
  //             </div>
  //           </div>
  //         </Col>
  //       )}
  //       <Col xl={3} lg={4} md={6} sm={12}>
  //         <div className="form__form-group">
  //           <span className="form__form-group-label">City</span>
  //           <div className="form__form-group-field">
  //             <span>{address.city}</span>
  //           </div>
  //         </div>
  //       </Col>
  //       <Col xl={3} lg={4} md={6} sm={12}>
  //         <div className="form__form-group">
  //           <span className="form__form-group-label">State</span>
  //           <div className="form__form-group-field">
  //             <span>{address.state}</span>
  //           </div>
  //         </div>
  //       </Col>
  //       <Col xl={3} lg={4} md={6} sm={12}>
  //         <div className="form__form-group">
  //           <span className="form__form-group-label">Zip Code</span>
  //           <div className="form__form-group-field">
  //             <span>{address.zipCode}</span>
  //           </div>
  //         </div>
  //       </Col>
  //     </Row>
  //   );
  // }
  //
  // renderJobBottom(job) {
  //   return (
  //     <React.Fragment>
  //       <h4 style={{
  //         borderBottom: '3px solid #ccc',
  //         marginBottom: '20px'
  //       }}
  //       >
  //         Comments 315
  //       </h4>
  //       <Row>
  //         <Col xl={3} lg={4} md={6} sm={12}>
  //           <div className="form__form-group">
  //             <div className="form__form-group-field">
  //               {job.notes}
  //             </div>
  //           </div>
  //         </Col>
  //       </Row>
  //     </React.Fragment>
  //   );
  // }
  //
  // render() {
  //   const { job } = this.props;
  //   return (
  //     <React.Fragment>
  //       <Col md={12} lg={12}>
  //         <Card>
  //           <CardBody>
  //             {this.renderJobTop(job)}
  //             <h4 style={{ borderBottom: '3px solid #ccc' }}>Start Location</h4>
  //             {this.renderAddress(job.startAddress)}
  //             {job.endAddress && (
  //               <React.Fragment>
  //                 <h4 style={{ borderBottom: '3px solid #ccc' }}>End Location</h4>
  //                 {this.renderAddress(job.endAddress)}
  //               </React.Fragment>
  //             )}
  //             {this.renderJobBottom(job)}
  //           </CardBody>
  //         </Card>
  //       </Col>
  //     </React.Fragment>
  //   );
  // }
}
//
// JobForm.propTypes = {
//   job: PropTypes.shape({
//     id: PropTypes.number
//   }),
//   handlePageClick: PropTypes.func.isRequired
// };
//
// JobForm.defaultProps = {
//   job: null
// };

export default JobForm;
