import React, {Component} from 'react';
import PropTypes from 'prop-types';
import TableCell from '@material-ui/core/TableCell/index';
import TableRow from '@material-ui/core/TableRow/index';
import IconButton from '@material-ui/core/IconButton';
import moment from 'moment';
import {Container, Row, Col, Button, Modal, ButtonToolbar} from 'reactstrap';
import UserService from '../../api/UserService';
import LoadService from '../../api/LoadService';
import EmailService from '../../api/EmailService';
import LoadInvoiceService from '../../api/LoadInvoiceService';
import GPSTrackingService from '../../api/GPSTrackingService';
import ProfileService from '../../api/ProfileService';
import CompanyService from '../../api/CompanyService';
import TMapBoxPath
  from '../common/TMapBoxPath';

class LoadsExpandableRow extends Component {
  constructor(props) {
    super(props);
    this.state = {
      load: props.load,
      loadStatus: props.load.loadStatus,
      job: props.job,
      loaded: false, // if page is loading
      index: props.index,
      // expanded: false,
      modal: false,
      driver: null,
      gpsTrackings: null,
      loadInvoices: [],
      disputeEmail: null,
      profile: null,
      toggledId: 0
    };
    this.toggleDisputeModal = this.toggleDisputeModal.bind(this);
    this.toggle = this.toggle.bind(this);
  }

  async componentDidMount() {
    const {props} = this;
    const {load} = this.state;
    let {gpsTrackings, loadInvoices, disputeEmail} = {...this.state};
    gpsTrackings = await this.fetchGPSPoints(load.id);
    loadInvoices = await LoadInvoiceService.getLoadInvoicesByLoad(props.load.id);
    const driver = await UserService.getDriverByBookingEquipmentId(props.load.bookingEquipmentId);
    const profile = await ProfileService.getProfile();
    const company = await CompanyService.getCompanyById(profile.companyId);
    const date = new Date();
    disputeEmail = {
      toEmail: 'csr@trelar.net',
      toName: 'Trelar CSR',
      subject: `[Dispute] ${company.legalName}, Load Ticket Number ${load.ticketNumber}`,
      isHTML: true,
      body: 'Support,<br><br>The following customer has disputed a load.<br><br>'
        + `Time of dispute: ${moment(new Date(date)).format('lll')}<br>`
        + `Company: ${company.legalName}<br>`
        + `Load Ticket Number: ${load.ticketNumber}`,
      recipients: [
        {name: 'CSR', email: 'csr@trelar.net'}
      ],
      attachments: []
    }
    this.setState({driver, loaded: true});
    this.handleApproveLoad = this.handleApproveLoad.bind(this);
    this.confirmDisputeLoad = this.confirmDisputeLoad.bind(this);
    this.setState({gpsTrackings, loadInvoices, disputeEmail, profile});
  }

  async fetchGPSPoints(loadId) {
    return GPSTrackingService.getGPSTrackingByLoadId(loadId);
  }

  toggle() {
    let { isExpanded } = this.props;
    const { load } = {...this.state};
    const { onRowExpanded } = this.props;
    isExpanded = !isExpanded;
    if (isExpanded) {
      onRowExpanded(load.id, isExpanded);
    } else {
      onRowExpanded(0, isExpanded);
    }
  }

  async handleApproveLoad() {
    const {load} = {...this.state};
    load.loadStatus = 'Approved';
    await LoadService.updateLoad(load.id, load);
    this.setState({loadStatus: 'Approved'});
  }

  async confirmDisputeLoad() {
    const {load, disputeEmail} = {...this.state};
    load.loadStatus = 'Disputed';
    await LoadService.updateLoad(load.id, load);
    await EmailService.sendEmail(disputeEmail)
    this.setState({load, loadStatus: 'Disputed'});
    this.toggleDisputeModal();
  }

  toggleDisputeModal() {
    const {modal} = this.state;
    this.setState({modal: !modal});
  }

  renderModal() {
    const {modal} = this.state;
    return (
      <Modal
        isOpen={modal}
        toggle={this.toggleDisputeModal}
        className="modal-dialog--primary modal-dialog--header form"
      >
        <div className="modal__header">
          <button type="button" className="lnr lnr-cross modal__close-btn"
                  onClick={this.toggleDisputeModal}
          />
          <div className="bold-text modal__title">Dispute Load</div>
        </div>
        <div className="modal__body" style={{padding: '25px 25px 20px 25px'}}>
          <Row className="col-md-12">
            <h5 style={{paddingBottom: '25px'}}>Are you sure you wish to dispute this load?</h5>
          </Row>
          <Row className="col-md-12">
            <ButtonToolbar className="col-md-6 wizard__toolbar">
              <Button color="minimal" className="btn btn-outline-secondary"
                      type="button"
                      onClick={this.toggleDisputeModal}
              >
                Cancel
              </Button>
            </ButtonToolbar>
            <ButtonToolbar className="col-md-6 wizard__toolbar right-buttons">
              <Button
                color="primary"
                type="submit"
                className="confirm"
                onClick={this.confirmDisputeLoad}
              >
                Dispute
              </Button>
            </ButtonToolbar>
          </Row>
        </div>
      </Modal>
    );
  }


  render() {
    const {loaded} = {...this.state};
    if (loaded) {
      const {
        load,
        loadStatus,
        index,
        driver,
        gpsTrackings,
        loadInvoices,
        profile,
        job
      } = {...this.state};
      const { isExpanded } = this.props;
      const startTime = (!load.startTime ? null : moment(new Date(load.startTime)).format('lll'));
      const endTime = (!load.endTime ? null : moment(new Date(load.endTime)).format('lll'));
      let statusColor = '';
      switch (loadStatus) {
        case 'Approved':
          statusColor = '#006F53';
          break;
        case 'Disputed':
          statusColor = 'red';
          break;
        case 'Submitted':
          statusColor = 'orange';
          break;
        case 'Ended':
          statusColor = 'blue';
          break;
        default:
          statusColor = 'black';
      }
      const driverName = `Driver Name: ${driver.firstName} ${driver.lastName}`;
      return (
        <React.Fragment>
          ES: {isExpanded.toString()}
          {this.renderModal()}
          <TableRow key={load.id}>
            <TableCell component="th" scope="row" align="left">
              <IconButton onClick={this.toggle}
                          style={{color: (!isExpanded ? '#006F53' : 'red')}}
              >{!isExpanded ? '+' : '-'}
              </IconButton>
            </TableCell>
            <TableCell align="left">{index + 1}</TableCell>
            <TableCell align="left">{!driver.id ? 'Not Available' : `${driver.firstName} ${driver.lastName}`}</TableCell>
            <TableCell align="left">{(!startTime ? 'Error creating load' : startTime)}</TableCell>
            <TableCell align="left"
                       style={{fontStyle: !endTime ? 'italic' : 'normal'}}
            >{(!endTime ? 'In Progress' : endTime)}
            </TableCell>
            <TableCell align="left">{`${load.tonsEntered} tons`}</TableCell>
            {job.rateType === 'Hour' && <TableCell align="left">{`${load.hoursEntered} hours`}</TableCell>}
            <TableCell align="left">{job.rateType === 'Hour' ? `$${job.rate} / hour` : `$${job.rate} / ton`}</TableCell>
            <TableCell align="left">${job.rateType === 'Hour' ? job.rate * load.hoursEntered : job.rate * load.tonsEntered}</TableCell>
            <TableCell align="left" style={{color: statusColor}}>{loadStatus}</TableCell>
          </TableRow>
          {isExpanded && (
            <TableRow>
              <TableCell colSpan="9" style={{padding: 20}}>
                <Container style={{backgroundColor: '#ffffff', borderRadius: 3}}>
                  <Row style={{paddingTop: 20}}>
                    <Col md={2}>
                      <p style={{color: '#006F53', fontSize: 20}}>
                        Load {index + 1}
                      </p>
                    </Col>
                    <Col md={7}/>
                    <Col md={3}>
                      <p style={{color: statusColor, fontSize: 20}}>
                        {loadStatus}
                      </p>
                    </Col>
                  </Row>
                  <hr/>
                  {loadStatus === 'Submitted' && profile.companyType === 'Customer' && (
                    <Row justify="between">
                      <Col md={8}/>
                      <Col md={4}>
                        <Button
                          onClick={this.toggleDisputeModal}
                          // name="DISPUTE"
                          type="button"
                          className="primaryButton"
                        >
                          DISPUTE
                        </Button>
                        <Button
                          onClick={this.handleApproveLoad}
                          type="button"
                          className="secondaryButton"
                        >
                          APPROVE
                        </Button>
                      </Col>
                    </Row>
                  )
                  }
                  <Row style={{paddingTop: 0}}>
                    <Col md={6}>
                      <h3 className="subhead" style={{
                        paddingTop: 30,
                        color: '#006F53',
                        fontSize: 22
                      }}
                      >
                        Route
                      </h3>
                    </Col>
                    <Col md={6}>
                      <h3 className="subhead" style={{
                        paddingTop: 30,
                        color: '#006F53',
                        fontSize: 22
                      }}
                      >
                        Ticket Number: {load.ticketNumber}
                      </h3>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6}>
                      <React.Fragment>
                        <TMapBoxPath gpsTrackings={gpsTrackings} loadId={load.id}/>
                        <p style={{fontSize: 15, color: 'black', paddingLeft: 10}}>
                          {profile.companyType === 'Customer' ? '' : `${driverName}`}
                        </p>
                      </React.Fragment>
                    </Col>
                    <Col md={6}>
                      {loadInvoices.map(item => (
                        <Col md={12} key={`img-${item}`}>
                          <img key={item} src={`${item[2]}`} alt={`${item[2]}`}/>
                        </Col>
                        // <Col className="col-md-3 pt-3" key={`img-${item}`}>
                        //   <img key={item} src={`${item[2]}`} alt={`${item}`}/>
                        // </Col>
                      ))
                      }
                    </Col>
                  </Row>
                </Container>
              </TableCell>
            </TableRow>
          )
          }
        </React.Fragment>
      );
    }
    return (
      <Container>
        Loading...
      </Container>
    );
  }
}

LoadsExpandableRow.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  load: PropTypes.object.isRequired,
  // eslint-disable-next-line react/forbid-prop-types,react/no-unused-prop-types
  job: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  onRowExpanded: PropTypes.func,
  isExpanded: PropTypes.bool
};

LoadsExpandableRow.defaultProps = {
  onRowExpanded: null,
  isExpanded: false
};

export default LoadsExpandableRow;
