import React, {Component} from 'react';
import * as PropTypes from 'prop-types';
import { Card, CardBody, Row, Container, Col, Modal, ButtonToolbar, Button } from 'reactstrap';
import './jobs.css';
import CloneDeep from 'lodash.clonedeep';
import moment from 'moment';
import TFormat from '../common/TFormat';
import CompanyService from '../../api/CompanyService';
import BidService from '../../api/BidService';
import TTable from '../common/TTable';
import TSubmitButton from '../common/TSubmitButton';
import JobService from '../../api/JobService';
import UserService from '../../api/UserService';
import TwilioService from '../../api/TwilioService';

class BidsTable extends Component {
  constructor(props) {
    super(props);

    this.state = {
      bids: [],
      selectedBid: [],
      selectedBidCompany: [],
      totalBids: 0,
      page: 0,
      rows: 10,
      modalAcceptBid: false,
      loaded: false,
      btnSubmitting: false
    };

    // this.handleJobEdit = this.handleJobEdit.bind(this);
    this.handlePageChange = this.handlePageChange.bind(this);
    this.handleRowsPerPage = this.handleRowsPerPage.bind(this);
    this.toggleBidModal = this.toggleBidModal.bind(this);
    // this.closeNow = this.closeNow.bind(this);
  }

  async componentDidMount() {
    const { job } = this.props;
    let { totalBids } = this.state;
    let bids = await BidService.getBidsInfoByJobId(job.id);

    bids = bids.map((bid) => {
      const newBid = bid;

      newBid.date = TFormat.asDate(bid.createdOn);

      if (newBid.status === 'New') {
        if (newBid.isFavorite === 'Favorite') {
          newBid.status = 'Requested and Offered';
        } else {
          newBid.status = 'Requested';
        }
      }

      /* newBid.actions = ({'
        <TSubmitButton
          onClick={() => this.saveBid('decline')}
          className="secondaryButton float-right"
          loading={btnSubmitting}
          loaderSize={10}
          bntText="Decline Job"
        />
        <TSubmitButton
          onClick={() => this.saveBid('accept')}
          className="primaryButton float-right"
          loading={btnSubmitting}
          loaderSize={10}
          bntText="Accept Job"
        />
      '}); */

      return newBid;
    });

    totalBids = bids.length;

    this.setState({ bids, totalBids, loaded: true });
  }

  async toggleBidModal(bidId) {
    const {modalAcceptBid} = this.state;
    let { selectedBid, selectedBidCompany } = this.state;

    if (typeof bidId === 'number') {
      selectedBid = await BidService.getBidById(bidId);
      selectedBidCompany = await CompanyService.getCompanyById(selectedBid.companyCarrierId);
    }
    this.setState({
      selectedBid,
      selectedBidCompany,
      modalAcceptBid: !modalAcceptBid
    });
  }

  handlePageChange(page) {
    this.setState({ page });
  }

  handleRowsPerPage(rows) {
    this.setState({ rows });
  }

  async saveBid(action) {
    const { selectedBid, profile } = this.state;
    this.setState({ btnSubmitting: true });

    console.log(selectedBid);

    const job = await JobService.getJobById(selectedBid.jobId);

    if (action === 'accept') {
      // TODO assign job to carrier
      // TODO decline all other Bids - status: Ignored

      const bids = await BidService.getBidsByJobId(selectedBid.jobId);
    } else {
      // TODO decline Bid - status: Declined

      /* const newBid = CloneDeep(selectedBid);
      newBid.status = 'Declined';
      newBid.hasCustomerAccepted = 1;
      newBid.modifiedBy = profile.userId;
      newBid.modifiedOn = moment()
        .unix() * 1000;

      // Notify Carrier company's admin that the job request was declined
      const carrierAdmin = await UserService.getAdminByCompanyId(selectedBid.companyCarrierId);
      if (carrierAdmin.length > 0) { // check if we get a result
        if (carrierAdmin[0].mobilePhone && this.checkPhoneFormat(carrierAdmin[0].mobilePhone)) {
          const notification = {
            to: this.phoneToNumberFormat(carrierAdmin[0].mobilePhone),
            body: `We're sorry, your request for the Job [${job.name}] was not accepted.
              Please log in to Trelar to look for more jobs.`
          };
          await TwilioService.createSms(notification);
        }
      } */
    }

    this.setState({ btnSubmitting: false });
  }

  renderTitle() {
    return (
      <Row>
        <Col md={12}>
          <h3 className="page-title">Open Requests</h3>
        </Col>
      </Row>
    );
  }

  renderTableLegend() {
    const { totalBids } = this.state;
    return (
      <div className="ml-4 mt-4">
        Total number of offers: {totalBids}
      </div>
    );
  }

  renderBidsTable() {
    const { bids } = this.state;
    return (
      <Container>
        <Card>
          <CardBody>
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
                  /* { // TODO v2
                    name: 'acceptanceRate',
                    displayName: 'Acceptance Rate'
                  }, */
                  {
                    name: 'actions',
                    displayName: 'Actions'
                  },
                  {
                    name: 'loadsNumber',
                    displayName: 'Loads Completed'
                  },
                  {
                    name: 'date',
                    displayName: 'Date'
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
      selectedBidCompany
    } = this.state;

    if (modalAcceptBid) {
      return (
        <Modal
          isOpen={modalAcceptBid}
          toggle={this.toggleBidModal}
          className="modal-dialog--primary modal-dialog--header"
        >
          <div className="modal__header">
            <button type="button" className="lnr lnr-cross modal__close-btn"
                    onClick={this.toggleViewJobModal}
            />
            <div className="bold-text modal__title">Assign a Job</div>
          </div>
          <div className="modal__body" style={{ padding: '10px 25px 0px 25px' }}>
            <Container className="dashboard">
              <Row>
                <Col md={12} lg={12}>
                  <Card style={{paddingBottom: 0}}>
                    <CardBody
                      className="form form--horizontal addtruck__form"
                    >
                      <Row className="col-md-12">
                        Do you want to assign this job to {selectedBidCompany.legalName}
                      </Row>
                      <hr/>
                      <Row className="col-md-12">
                        <ButtonToolbar className="col-md-6 wizard__toolbar">
                          <Button color="minimal" className="btn btn-outline-secondary"
                                  type="button"
                                  onClick={this.toggleBidModal}
                          >
                            Cancel
                          </Button>
                        </ButtonToolbar>
                        <ButtonToolbar className="col-md-6 wizard__toolbar right-buttons">
                          <TSubmitButton
                            onClick={() => this.saveBid('decline')}
                            className="secondaryButton float-right"
                            loading={btnSubmitting}
                            loaderSize={10}
                            bntText="Decline Job"
                          />
                          <TSubmitButton
                            onClick={() => this.saveBid('accept')}
                            className="primaryButton float-right"
                            loading={btnSubmitting}
                            loaderSize={10}
                            bntText="Accept Job"
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
    const { loaded } = this.state;
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
  })
};

BidsTable.defaultProps = {
  job: null
};

export default BidsTable;
