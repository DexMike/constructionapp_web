import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Row,
  Col,
  Button,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Container,
  Card
} from 'reactstrap';
import JobService from '../../api/JobService';
import BookingService from '../../api/BookingService';
import BookingEquipmentService from '../../api/BookingEquipmentService';
import LoadService from '../../api/LoadService';

class JobClosePopup extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loaded: false,
      loads: []
    };

    this.closeNow = this.closeNow.bind(this);
    this.closeJob = this.closeJob.bind(this);
  }

  async componentDidMount() {
    const { jobId } = this.props;
    let { loads } = this.state;

    let bookings = [];
    // get loads
    try {
      bookings = await BookingService.getBookingsByJobId(jobId);
    } catch (error) {
      // console.log('Unable to obtain bookings');
    }
    if (bookings.length > 0) {
      const bookingEquipments = await BookingEquipmentService
        .getBookingEquipmentsByBookingId(bookings[0].id);
      if (bookingEquipments.length > 0) {
        loads = await LoadService.getLoadsByBookingId(
          bookings[0].id // booking.id 6
        );
        loads = loads.reverse();
      }
    }
    this.setState({
      loads,
      loaded: true
    });
  }

  closeNow() {
    const { toggle } = this.props;
    toggle();
  }

  async closeJob() {
    const { jobId, closeJobModalPopup } = this.props;
    try {
      await JobService.closeJob(jobId);
    } catch (e) {
      console.error('>> NOT SAVED: JobClosePopup -> closeJob -> e', e);
    }

    // bubble to parent
    closeJobModalPopup();
    this.closeNow();
    return false;
  }

  render() {
    const { loaded } = this.state;
    const { jobName } = this.props;
    if (loaded) {
      return (
        <React.Fragment>
          <ModalHeader>
            <div style={{ fontSize: 22, fontWeight: 'bold' }}>
              <span className="lnr lnr-warning"/>
              &nbsp;
              {jobName}
            </div>
          </ModalHeader>
          <ModalBody className="text-left" backdrop="static">
            <p style={{ fontSize: 14 }}>
              Are you sure you want to end this job?
            </p>
          </ModalBody>
          <ModalFooter style={{marginRight: 30}}>
            <Row>
              <Col md={6} className="text-left">
                &nbsp;
              </Col>
              <Col md={6}>
                <Button color="secondary" onClick={this.closeNow}>
                  No
                </Button>
                &nbsp;
                <Button
                  color="primary"
                  onClick={(e) => {
                    this.closeJob();
                  }
                }
                >
                  Yes, end this job
                </Button>
              </Col>
            </Row>
          </ModalFooter>
        </React.Fragment>
      );
    }
    return (
      <Container className="dashboard">
        <Row>
          <Col md={12}>
            <Card>Loading...</Card>
          </Col>
        </Row>
      </Container>
    );
  }
}

JobClosePopup.propTypes = {
  toggle: PropTypes.func,
  closeJobModalPopup: PropTypes.func,
  jobName: PropTypes.string,
  jobId: PropTypes.number
};

JobClosePopup.defaultProps = {
  toggle: null,
  closeJobModalPopup: null,
  jobName: null,
  jobId: null
};


export default JobClosePopup;
