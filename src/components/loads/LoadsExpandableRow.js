import React, {Component} from 'react';
import PropTypes from 'prop-types';
import TableCell from '@material-ui/core/TableCell/index';
import TableRow from '@material-ui/core/TableRow/index';
import IconButton from '@material-ui/core/IconButton';
import moment from 'moment';
import {Container, Row, Col, Button, Modal, ButtonToolbar} from 'reactstrap';
import ImageZoom from 'react-medium-image-zoom';
import LoadService from '../../api/LoadService';
import LoadInvoiceService from '../../api/LoadInvoiceService';
import GPSTrackingService from '../../api/GPSTrackingService';
import ProfileService from '../../api/ProfileService';
import CompanyService from '../../api/CompanyService';
import UserService from '../../api/UserService';
import TFormat from '../common/TFormat';
import TMapGPS from '../common/TMapGPS';
import '../common/ImageZoom.scss';
import './Load.css';

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
      profile: null,
      company: null,
      toggledId: 0
    };
    this.toggleDisputeModal = this.toggleDisputeModal.bind(this);
    this.toggle = this.toggle.bind(this);
    this.programmedRefresh = this.programmedRefresh.bind(this);
    this.getTrackings = this.getTrackings.bind(this);
    this.handleApproveLoad = this.handleApproveLoad.bind(this);
    this.confirmDisputeLoad = this.confirmDisputeLoad.bind(this);
  }

  async componentDidMount() {
    const {props} = this;
    const {load} = this.state;
    let { driver, company, profile, loadInvoices } = {...this.state};

    this.getTrackings(load.id);

    try {
      loadInvoices = await LoadInvoiceService.getLoadInvoicesByLoad(props.load.id);
      driver = await UserService.getDriverByBookingEquipmentId(props.load.bookingEquipmentId);
      this.setState({driver, loaded: true});
    } catch (err) {
      console.log(err);
    }

    this.setState({
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
    const {load} = {...this.state};
    try {
      const response = await LoadService.disputeLoad(load.id);
      if (response) {
        this.setState({load: response});
        this.toggleDisputeModal();
      }
    } catch (e) {
      console.error('Unable to dispute load...');
    }
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
        backdrop="static"
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
    const { profile } = {...this.props};
    if (loaded) {
      const {
        load,
        loadStatus,
        index,
        driver,
        gpsTrackings,
        loadInvoices,
        job
      } = {...this.state};
      const startCoords = job.startAddress;
      const endCoords = job.endAddress;

      /*
      // According to https://trelar.atlassian.net/browse/SG-930
      // if there are tracking points use those instead of job address.
      if (gpsTrackings && gpsTrackings.length && gpsTrackings.length > 0) {
        startCoords = {
          latitude: gpsTrackings[0][0],
          longitude: gpsTrackings[0][1]
        };
        endCoords = {
          latitude: gpsTrackings[gpsTrackings.length - 1][0],
          longitude: gpsTrackings[gpsTrackings.length - 1][1]
        };
      }
      */
      // per https://trelar.atlassian.net/browse/SG-1391
      // the start and end addresses shoul be the ones from the job

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
            <TableCell align="left">{load.externalEquipmentNumber}</TableCell>
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
                    <Col md={6} className="headroute">
                      <h3 className="subhead" style={{
                        paddingTop: 30,
                        color: '#006F53',
                        fontSize: 22
                      }}
                      >
                        Route
                      </h3>
                      <ul className="indicators">
                        <li>
                          <svg width="14" height="14">
                            <rect width="14" height="14" fill="rgb(0, 201, 151)"/>
                          </svg>
                          <span>Recommended</span>
                        </li>
                        <li>
                          <svg width="14" height="14">
                            <rect width="14" height="14" fill="rgb(0, 111, 83)"/>
                          </svg>
                          <span>Depart</span>
                        </li>
                        <li>
                          <svg width="14" height="14">
                            <rect width="14" height="14" fill="rgb(45, 140, 200)"/>
                          </svg>
                          <span>Return</span>
                        </li>
                      </ul>
                    </Col>
                    <Col md={6}>
                      <h3 className="subhead" style={{
                        paddingTop: 30,
                        color: '#006F53',
                        fontSize: 22
                      }}
                      >
                        Driver: {!driver.id ? 'No driver assigned' : `${driver.firstName} ${driver.lastName}`}
                      </h3>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6}>
                      <TMapGPS
                        id={`load${load.id}`}
                        width="100%"
                        height={400}
                        startAddress={startCoords}
                        endAddress={endCoords}
                        loadId={load.id}
                        loadStatus={loadStatus}
                      />
                    </Col>
                    <Col md={6}>
                      <Row>
                        {loadInvoices.map(item => (
                          <Col key={item.id} sm className="loadTicketCol">
                            <ImageZoom
                              image={{
                                src: `${item.image}`
                              }}
                            />
                          </Col>
                        ))
                        }
                      </Row>
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
  isExpanded: PropTypes.bool,
  // eslint-disable-next-line react/forbid-prop-types,react/no-unused-prop-types
  profile: PropTypes.object.isRequired
};

LoadsExpandableRow.defaultProps = {
  onRowExpanded: null,
  isExpanded: false
};

export default LoadsExpandableRow;
