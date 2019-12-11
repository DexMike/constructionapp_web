import React, {Component} from 'react';
import * as PropTypes from 'prop-types';
import {Card, CardBody, Row, Container, Col, Modal, ButtonToolbar, Button} from 'reactstrap';
import './jobs.css';
import TFormat from '../common/TFormat';
import CompanyService from '../../api/CompanyService';
import BidService from '../../api/BidService';
import TTable from '../common/TTable';
import TSubmitButton from '../common/TSubmitButton';
import JobService from '../../api/JobService';
import ProfileService from '../../api/ProfileService';
import NumberFormatting from '../../utils/NumberFormatting';


class BidsTable extends Component {
  constructor(props) {
    super(props);

    this.state = {
      newJob: [],
      profile: [],
      bids: [],
      booking: null,
      bookingEquipment: null,
      selectedBid: [],
      selectedBidCompany: [],
      totalBids: 0,
      // page: 0,
      // rows: 10,
      modalAcceptBid: false,
      loaded: false,
      btnSubmitting: false,
      producerCompany: null,
      insuranceWarning: false,
      approveInsurance: ''
    };

    // this.handleJobEdit = this.handleJobEdit.bind(this);
    this.handlePageChange = this.handlePageChange.bind(this);
    this.handleRowsPerPage = this.handleRowsPerPage.bind(this);
    this.toggleBidModal = this.toggleBidModal.bind(this);
    this.handleApproveInputChange = this.handleApproveInputChange.bind(this);
    this.loadBidsTable = this.loadBidsTable.bind(this);
    // this.closeNow = this.closeNow.bind(this);
  }

  componentDidMount() {
    this.loadBidsTable();
  }

  componentWillReceiveProps(props) {
    const { newJob } = this.state;
    if ((newJob) && (parseInt(props.job.id, 10) !== parseInt(newJob.id, 10))) {
      this.loadBidsTable(props.job.id); // load a new job bids table
    }
  }

  async loadBidsTable(jobId) {
    const {job} = this.props;
    let {totalBids, profile} = this.state;
    profile = await ProfileService.getProfile();
    let bids = [];

    if (jobId) { // we are updating the view
      bids = await BidService.getBidsInfoByJobId(jobId);
    } else { // we are loading the view
      bids = await BidService.getBidsInfoByJobId(job.id);
    }

    const producerCompany = await CompanyService.getCompanyById(profile.companyId);

    bids = await Promise.all(bids.map(async (bid) => {
      const newBid = bid;
      const bidCompany = await CompanyService.getCompanyById(bid.companyCarrierId);
      if (bidCompany.liabilityGeneral < producerCompany.liabilityGeneral
        || bidCompany.liabilityAuto < producerCompany.liabilityAuto
        || bidCompany.liabilityOther < producerCompany.liabilityOther) {
        newBid.insCoverage = 'No';
      } else {
        newBid.insCoverage = 'Yes';
      }

      newBid.insuranceInfo = `General: ${NumberFormatting.asMoney(bidCompany.liabilityGeneral, '.', 2)}\n`
      + `Auto: ${NumberFormatting.asMoney(bidCompany.liabilityAuto, '.', 2)}\n`
      + `Other: ${NumberFormatting.asMoney(bidCompany.liabilityOther, '.', 2)}\n`;

      newBid.date = bid.createdOn;
      newBid.dateF = TFormat.asDate(bid.createdOn);

      if (newBid.status === 'Pending') {
        newBid.status = 'Requested';
      }

      return newBid;
    }));
    totalBids = bids.length;

    this.setState({newJob: job, bids, totalBids, profile, loaded: true, producerCompany});
  }

  async toggleBidModal(bidId) {
    let {modalAcceptBid, selectedBid, selectedBidCompany} = this.state;

    if (typeof bidId === 'number') {
      selectedBid = await BidService.getBidById(bidId);
      selectedBidCompany = await CompanyService.getCompanyById(selectedBid.companyCarrierId);
      if (selectedBid.status === 'Declined'
        || selectedBid.status === 'Ignored'
        || selectedBid.status === 'Accepted'
        || selectedBid.status === 'New') {
        modalAcceptBid = true; // this prevents the modal from opening
      }
    }
    this.setState({
      selectedBid,
      selectedBidCompany,
      modalAcceptBid: !modalAcceptBid
    });
  }

  handlePageChange(page) {
    this.setState({page});
  }

  handleRowsPerPage(rows) {
    this.setState({rows});
  }

  async saveBid(action) {
    const {updateJobView} = this.props;
    const {
      selectedBid
    } = this.state;
    let {newJob} = this.state;
    let newBid = [];
    let allBids = [];
    this.setState({btnSubmitting: true});


    if (action === 'accept') {
      try {
        await BidService.acceptBid(selectedBid.jobId, selectedBid.id);
        newJob = await JobService.getJobById(selectedBid.jobId);
      } catch (e) {
        // console.log(e);
      }
      updateJobView(newJob, selectedBid.companyCarrierId);
    } else {
      try {
        await BidService.declineBid(selectedBid.jobId, selectedBid.id);
        newJob = await JobService.getJobById(selectedBid.jobId);
      } catch (e) {
        // console.log(e);
      }
      updateJobView(newJob);
    }

    try {
      allBids = await BidService.getBidsInfoByJobId(selectedBid.jobId);
      allBids.map((bid) => {
        newBid = bid;
        newBid.date = bid.createdOn;
        newBid.dateF = TFormat.asDate(bid.createdOn);
        return newBid;
      });
    } catch (error) {
      // console.log(error);
    }

    this.setState({
      newJob,
      bids: allBids,
      btnSubmitting: false
    });
    this.toggleBidModal();
  }

  handleApproveInputChange(e) {
    this.setState({approveInsurance: e.target.value.toUpperCase()});
  }

  renderTitle() {
    const {newJob} = this.state;
    return (
      <Row>
        <Col md={12}>
          <h3 className="page-title">
            {newJob.status === 'Published' || newJob.status === 'Published And Offered' ? 'Open Requests' : 'Requests History'}
          </h3>
        </Col>
      </Row>
    );
  }

  renderTableLegend() {
    const {totalBids} = this.state;
    return (
      <div className="ml-4 mt-4">
        Total number of requests: {totalBids}
      </div>
    );
  }

  renderBidsTable() {
    const {bids} = this.state;
    return (
      <Container>
        <Card>
          <CardBody className="bids-table">
            {this.renderTableLegend()}
            <TTable
              columns={
                [
                  {
                    name: 'carrierName',
                    displayName: 'Carrier Name'
                  },
                  {
                    name: 'contactName',
                    displayName: 'Contact'
                  },
                  {
                    name: 'status',
                    displayName: 'Status'
                  },
                  {
                    name: 'insuranceInfo',
                    displayName: 'Ins Coverage'
                  },
                  /* { // TODO v2
                    name: 'acceptanceRate',
                    displayName: 'Acceptance Rate'
                  }, */
                  {
                    name: 'loadsNumber',
                    displayName: 'Total Hauls Delivered on Trelar'
                  },
                  {
                    name: 'dateF',
                    displayName: 'Date Requested'
                    // label: 'dateF'
                  }
                ]
              }
              data={bids}
              handleIdClick={this.toggleBidModal}
              handleRowsChange={this.handleRowsPerPage}
              handlePageChange={this.handlePageChange}
              // totalCount={totalCount}
            />
          </CardBody>
        </Card>
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

  renderBidModal() {
    const {
      modalAcceptBid,
      btnSubmitting,
      selectedBidCompany,
      insuranceWarning,
      producerCompany,
      approveInsurance
    } = this.state;

    if (modalAcceptBid) {
      return (
        <Modal
          isOpen={modalAcceptBid}
          toggle={this.toggleBidModal}
          className="modal-dialog--primary modal-dialog--header"
          backdrop="static"
        >
          <div className="modal__header">
            <button type="button" className="lnr lnr-cross modal__close-btn"
                    onClick={this.toggleBidModal}
            />
            <div className="bold-text modal__title">Carrier Request</div>
          </div>
          <div className="modal__body" style={{padding: '10px 25px 0px 25px'}}>
            <Container className="dashboard">
              <Row>
                <Col md={12} lg={12}>
                  <Card style={{paddingBottom: 0}}>
                    <CardBody
                      className="form form--horizontal addtruck__form"
                    >
                      <Row className="col-md-12">
                        Do you want to book {selectedBidCompany.legalName} for this job now?
                      </Row>
                      <hr/>
                      {insuranceWarning && (
                        <Row className="col-md-12" style={{paddingBottom: 50}}>
                          <Row className="col-md-12">
                            <span style={{fontWeight: 'bold'}}> Minimum Insurance Level Warning</span>
                          </Row>
                          <Row className="col-md-12">
                            {selectedBidCompany.liabilityGeneral < producerCompany.liabilityGeneral && (
                              <Row className="col-md-12">
                                <i className="material-icons iconSet" style={{color: 'red'}}>ic_report_problem</i>
                                General: {selectedBidCompany.legalName} has {selectedBidCompany.liabilityGeneral},
                                but requires {producerCompany.liabilityGeneral}
                              </Row>
                            )}
                            {selectedBidCompany.liabilityAuto < producerCompany.liabilityAuto && (
                              <Row className="col-md-12">
                                <i className="material-icons iconSet" style={{color: 'red'}}>ic_report_problem</i>
                                Auto: {selectedBidCompany.legalName} has {selectedBidCompany.liabilityAuto},
                                but requires {producerCompany.liabilityAuto}
                              </Row>
                            )}
                            {selectedBidCompany.liabilityOther < producerCompany.liabilityOther && (
                              <Row className="col-md-12">
                                <i className="material-icons iconSet" style={{color: 'red'}}>ic_report_problem</i>
                                Other: {selectedBidCompany.legalName} has {selectedBidCompany.liabilityOther},
                                but requires {producerCompany.liabilityOther}
                              </Row>
                            )}
                            <Row className="col-md-12">
                              To use this carrier, and override your insurance requirements,
                              you must type APPROVE in this box:
                              <Row className="col-md-12" style={{paddingTop: 15}}>
                                <div className="form__form-group-field">
                                  <input
                                    name="approveInsurance"
                                    type="text"
                                    value={approveInsurance}
                                    onChange={this.handleApproveInputChange}
                                  />
                                </div>
                              </Row>
                            </Row>
                          </Row>
                        </Row>
                      )}
                      <Row className="col-md-12">
                        <ButtonToolbar className="col-md-4 wizard__toolbar">
                          <Button color="minimal" className="btn btn-outline-secondary"
                                  type="button"
                                  onClick={this.toggleBidModal}
                          >
                            Cancel
                          </Button>
                        </ButtonToolbar>
                        <ButtonToolbar className="col-md-8 wizard__toolbar right-buttons">
                          <TSubmitButton
                            onClick={() => this.saveBid('decline')}
                            className="secondaryButton float-right"
                            loading={btnSubmitting}
                            loaderSize={10}
                            bntText="No, decline this Request"
                          />
                          <TSubmitButton
                            onClick={() => this.saveBid('accept')}
                            className="primaryButton float-right"
                            loading={btnSubmitting}
                            loaderSize={10}
                            bntText="Yes, book this Request"
                          />
                        </ButtonToolbar>
                      </Row>
                    </CardBody>
                  </Card>
                </Col>
              </Row>
            </Container>
          </div>
        </Modal>
      );
    }
    return null;
  }

  render() {
    const {loaded} = this.state;
    if (loaded) {
      return (
        <Container className="dashboard">
          {this.renderBidModal()}
          {this.renderTitle()}
          {this.renderBidsTable()}
        </Container>
      );
    }
    return (
      <Container className="dashboard">
        {this.renderLoader()}
      </Container>
    );
  }
}

BidsTable.propTypes = {
  job: PropTypes.shape({
    id: PropTypes.number
  }),
  updateJobView: PropTypes.func.isRequired
};

BidsTable.defaultProps = {
  job: null
};

export default BidsTable;
