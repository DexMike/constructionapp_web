import React, {Component} from 'react';
import PropTypes from 'prop-types';
import TableCell from '@material-ui/core/TableCell/index';
import TableRow from '@material-ui/core/TableRow/index';
import IconButton from '@material-ui/core/IconButton';
import moment from 'moment';
import {Container, Row, Col, Button, Modal, ButtonToolbar} from 'reactstrap';
import LoadService from '../../api/LoadService';
import EmailService from '../../api/EmailService';
import LoadInvoiceService from '../../api/LoadInvoiceService';
import GPSTrackingService from '../../api/GPSTrackingService';
import ProfileService from '../../api/ProfileService';
import CompanyService from '../../api/CompanyService';
import UserService from '../../api/UserService';
import TFormat from '../common/TFormat';
import TMap from '../common/TMap';

const refreshInterval = 15; // refresh every 15 seconds
let timerVar;

class LoadsExpandableRow extends Component {
  constructor(props) {
    super(props);
    this.state = {
      load: props.load,
      loadStatus: props.load.loadStatus,
      job: props.job,
      loaded: false, // if page is loading
      index: props.index,
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
    this.programmedRefresh = this.programmedRefresh.bind(this);
    this.getTrackings = this.getTrackings.bind(this);
  }

  async componentDidMount() {
    const {props} = this;
    const {load} = this.state;
    let { loadInvoices, disputeEmail } = {...this.state};

    this.getTrackings(load.id);
    loadInvoices = await LoadInvoiceService.getLoadInvoicesByLoad(props.load.id);

    // This throws an error
    const driver = await UserService.getDriverByBookingEquipmentId(props.load.bookingEquipmentId);

    const profile = await ProfileService.getProfile();
    const company = await CompanyService.getCompanyById(profile.companyId);
    const date = new Date();
    const envString = (process.env.APP_ENV === 'Prod') ? '' : `[Env] ${process.env.APP_ENV} `;
    disputeEmail = {
      toEmail: 'csr@trelar.com',
      toName: 'Trelar CSR',
      subject: `${envString}[Dispute] ${company.legalName}, Job: '${props.job.name}' - Load Ticket Number ${load.ticketNumber}`,
      isHTML: true,
      body: 'Support,<br><br>The following customer has disputed a load.<br><br>'
        + `Time of dispute: ${moment(new Date(date)).format('lll')}<br>`
        + `Company: ${company.legalName}<br>`
        + `Job: ${props.job.name}<br>`
        + `Load Ticket Number: ${load.ticketNumber}`,
      recipients: [
        {name: 'CSR', email: 'csr@trelar.com'}
      ],
      attachments: []
    };
    this.setState({driver, loaded: true});
    this.handleApproveLoad = this.handleApproveLoad.bind(this);
    this.confirmDisputeLoad = this.confirmDisputeLoad.bind(this);
    this.setState({
      disputeEmail,
      profile,
      loadInvoices
    });
  }

  componentWillUnmount() {
    this.programmedRefresh(true);
  }

  async getTrackings(loadId) {
    const gpsTrackings = await GPSTrackingService.getGPSTrackingByLoadId(loadId);
    this.setState({ gpsTrackings });
  }

  toggle() {
    let { isExpanded } = this.props;
    const { load } = {...this.state};
    const { onRowExpanded } = this.props;
    isExpanded = !isExpanded;
    if (isExpanded) {
      this.programmedRefresh(false);
      onRowExpanded(load.id, isExpanded);
    } else {
      this.programmedRefresh(true);
      onRowExpanded(0, isExpanded);
    }
  }

  async handleApproveLoad() {
    const {load} = {...this.state};
    load.loadStatus = 'Approved';
    await LoadService.updateLoad(load);
    this.setState({loadStatus: 'Approved'});
  }

  async confirmDisputeLoad() {
    const {load, disputeEmail} = {...this.state};
    load.loadStatus = 'Disputed';
    await LoadService.updateLoad(load);
    await EmailService.sendEmail(disputeEmail);
    this.setState({load, loadStatus: 'Disputed'});
    this.toggleDisputeModal();
  }

  toggleDisputeModal() {
    const {modal} = this.state;
    this.setState({modal: !modal});
  }

  programmedRefresh(remove) {
    const { load } = this.state;
    if (!remove) {
      const that = this;
      const timerTimer = function timerTimer() {
        const { isExpanded } = that.props;
        if (!isExpanded) {
          clearInterval(timerVar);
        }
        that.getTrackings(load.id);
      };
      timerVar = setInterval(timerTimer, (refreshInterval * 1000));
    } else {
      clearInterval(timerVar);
    }
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
            <h5 style={{paddingBottom: '25px'}}>If you dispute it, a Trelar representative will be
              in contact with you soon to help solve the issue.
            </h5>
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
      let startCoords = job.startAddress;
      let endCoords = job.endAddress;

      // According to https://trelar.atlassian.net/browse/SG-930
      // if there are tracking points use those instead of job address.
      if (gpsTrackings && gpsTrackings.length && gpsTrackings.length > 0) {
        startCoords = {
          latitude: gpsTrackings[0][1],
          longitude: gpsTrackings[0][0]
        };
        endCoords = {
          latitude: gpsTrackings[gpsTrackings.length - 1][1],
          longitude: gpsTrackings[gpsTrackings.length - 1][0]
        };
      }

      // please do not delete code commented
      /* startCoords = {
        latitude: job.startAddress.latitude,
        longitude: job.startAddress.longitude
      };

      endCoords = {
        latitude: job.endAddress.latitude,
        longitude: job.endAddress.longitude
      }; */

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
          statusColor = 'gray';
          break;
        default:
          statusColor = 'black';
      }
      // const driverName = `Driver Name: ${driver.firstName} ${driver.lastName}`;
      return (
        <React.Fragment>
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
            <TableCell align="left">{`${load.tonsEntered ? (load.tonsEntered).toFixed(2) : '0.00'} tons`}</TableCell>
            {job.rateType === 'Hour' && <TableCell align="left">{`${load.hoursEntered} hours`}</TableCell>}
            <TableCell align="left">{job.rateType === 'Hour' ? TFormat.asMoneyByHour(job.rate) : TFormat.asMoneyByTons(job.rate)}</TableCell>
            <TableCell align="left">{job.rateType === 'Hour' ? TFormat.asMoney(job.rate * load.hoursEntered) : TFormat.asMoney(job.rate * load.tonsEntered)}</TableCell>
            <TableCell align="left" style={{color: statusColor}}>{loadStatus}</TableCell>
            <TableCell align="left" style={{color: statusColor}}>{load.ticketNumber || 'N/A'}</TableCell>
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
                      <Col md={4}/>
                      <Col md={4}>
                        <Button
                          onClick={this.toggleDisputeModal}
                          // name="DISPUTE"
                          type="button"
                          className="btn btn-secondary"
                        >
                          DISPUTE
                        </Button>
                        <Button
                          onClick={this.handleApproveLoad}
                          type="button"
                          color="primary"
                        >
                          APPROVE
                        </Button>
                      </Col>
                    </Row>
                  )
                  }
                  <Row style={{paddingTop: 0}}>
                    <Col md={4}>
                      <h3 className="subhead" style={{
                        paddingTop: 30,
                        color: '#006F53',
                        fontSize: 22
                      }}
                      >
                        Route
                      </h3>
                    </Col>
                    <Col md={4}>
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
                    <Col md={4}>
                      <TMap
                        id={`load${load.id}`}
                        width="100%"
                        height={400}
                        startAddress={startCoords}
                        endAddress={endCoords}
                        trackings={gpsTrackings}
                      />
                    </Col>
                    <Col md={4}>
                      {loadInvoices.map(item => (
                        <img
                          key={item}
                          src={`${item.image}`}
                          alt={`${item.image}`}
                          style={{
                            width: '100%'
                          }}
                        />
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
    return false;
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
