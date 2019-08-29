import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Row,
  Col,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Container,
  Card
} from 'reactstrap';
import ProfileService from '../../api/ProfileService';
import JobService from '../../api/JobService';
import BookingService from '../../api/BookingService';
import BookingEquipmentService from '../../api/BookingEquipmentService';
import LoadService from '../../api/LoadService';
import UserService from '../../api/UserService';
import TwilioService from '../../api/TwilioService';
import UserUtils from '../../api/UtilsService';

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

    // get loads
    const bookings = await BookingService.getBookingsByJobId(jobId);
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

    // get drivers
    const profile = await ProfileService.getProfile();
    const drivers = await UserService.getDriversWithUserInfoByCompanyId(profile.companyId);

    this.setState({
      loads,
      drivers,
      loaded: true
    });
  }

  closeNow() {
    const { toggle } = this.props;
    toggle();
  }

  async closeJob() {
    const { jobId, jobName, closeJobModalPopup } = this.props;
    const { loads } = this.state;

    // Specs at SG-811
    // 1) All existing loads get to finish
    const loadsToFinish = [];
    const allLoads = [];
    for (const load of loads) {
      loadsToFinish.push(load.id);
      allLoads.push(String(load.id));
    }

    // 2) No new loads can be started?

    // 3) All drivers need text notification
    const gpsTrackings = await LoadService.getLatestGPSForLoads(allLoads);
    const allSms = [];
    if (Object.entries(gpsTrackings).length > 0) {
      // console.log('>>>GOT LOADS: ', gpsTrackings, typeof gpsTrackings);
      for (const tracking of gpsTrackings) {
        if (tracking.status !== 'Ended') {
          // a) If they are in progress on load driver gets a text: “ Job <job name> is ending.
        // Finish your load, and then you are done with the job.”
          const notificationInProgress = {
            to: UserUtils.phoneToNumberFormat(tracking.telephone),
            body: `Job ${jobName} is ending. Finish your load, and then you are done with the job.`
          };
          allSms.push(TwilioService.createSms(notificationInProgress));
        } else {
          // b) If the driver does not have a load in progress they get text:
          // “<job name> has ended. Do not pickup any more material.”
          const notificationNotInProgress = {
            to: UserUtils.phoneToNumberFormat(tracking.telephone),
            body: `Job ${jobName} is ending. Finish your load, and then you are done with the job.`
          };
          allSms.push(TwilioService.createSms(notificationNotInProgress));
        }
        // Next step is performed by the parent:
        // Carrier admin:  “<job name> has ended. Do not pickup any more material.”
      }
      // send out all SMS
      // await Promise.all(allSms); TEST DISABLED!!! (reenable pending)
    }

    // This is the first step, but we need to close the load
    // at the end
    const loadsFinish = {
      id: 0,
      ids: loadsToFinish,
      status: 'Ended'
    };
    // LoadService.closeLoads(loadsFinish); TEST DISABLED!!! (reenable pending)

    // TODO -> Missing steps:
    /*
    If backend job status = 'job ended', what does each persona see for job status?
    What does producer see?
    ‘Job Finishing’
    What does a driver still on a load see?
    ‘Final Load’
    What does a driver not on a load see?
    ‘Job Completed’
    What does carrier admin see?
    ‘Job Finishing’

    Once all loads are complete, and job status is job ended, job status changes to job complete
    Then everyone sees ‘Job Completed’
    */

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
          <ModalBody className="text-left">
            <p style={{ fontSize: 14 }}>
              Please confirm that you want to close this job
            </p>
          </ModalBody>
          <ModalFooter>
            <Row>
              <Col md={6} className="text-left">
                &nbsp;
              </Col>
              <Col md={6}>
                <Button color="secondary" onClick={this.closeNow}>
                  Cancel
                </Button>
                &nbsp;
                <Button
                  color="primary"
                  onClick={(e) => {
                    this.closeJob();
                  }
                }
                >
                  Close
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
