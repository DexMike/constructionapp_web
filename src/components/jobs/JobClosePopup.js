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
import CloneDeep from 'lodash.clonedeep';
import moment from 'moment';
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
      profile: null,
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

    // get drivers
    let profile = [];
    let drivers = [];
    try {
      profile = await ProfileService.getProfile();
    } catch (error) {
      // console.log('Unable to obtain profile');
    }

    try {
      drivers = await UserService.getDriversWithUserInfoByCompanyId(profile.companyId);
    } catch (error) {
      // console.log('Unable to obtain drivers');
    }

    this.setState({
      loads,
      drivers,
      profile,
      loaded: true
    });
  }

  closeNow() {
    const { toggle } = this.props;
    toggle();
  }

  async closeJob() {
    const { jobId, jobName, closeJobModalPopup } = this.props;
    const { loads, profile } = this.state;
    const envString = (process.env.APP_ENV === 'Prod') ? '' : `[Env] ${process.env.APP_ENV} - `;

    const job = await JobService.getJobById(jobId);
    let newJob = [];

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
    let gpsTrackings = [];

    if (allLoads.length > 0) { // there's loads
      try {
        gpsTrackings = await LoadService.getLatestGPSForLoads(allLoads);
      } catch (error) {
        console.error('Unable to retrieve GPS for loads:', error);
      }
      const allSms = [];
      if (Object.keys(gpsTrackings).length > 0) { // there's loads in progress, notify drivers
        // console.log('>>>GOT LOADS: ', gpsTrackings, typeof gpsTrackings);
        for (const tracking of gpsTrackings) {
          if (tracking.status !== 'Ended' && tracking.status !== 'Returning') {
            // a) If they are in progress on load driver gets a text: “ Job <job name> is ending.
            // Finish your load, and then you are done with the job.”
            const notificationInProgress = {
              to: UserUtils.phoneToNumberFormat(tracking.telephone),
              body: `${envString}Job ${jobName} is ending. Finish your load, and then you are done with the job.`
            };
            allSms.push(TwilioService.createSms(notificationInProgress));
          } else {
            // b) If the driver does not have a load in progress they get text:
            // “<job name> has ended. Do not pickup any more material.”
            const notificationNotInProgress = {
              to: UserUtils.phoneToNumberFormat(tracking.telephone),
              body: `${envString}${jobName} has ended. Do not pickup any more material.`
            };
            allSms.push(TwilioService.createSms(notificationNotInProgress));
          }
          // Next step is performed by the parent:
          // Carrier admin:  “<job name> has ended. Do not pickup any more material.”
        }
        // send out all SMS
        await Promise.all(allSms);

        // changing job status to 'Job Ended'
        newJob = CloneDeep(job);
        newJob.status = 'Job Ended';
        newJob.modifiedOn = moment.utc().format();
        newJob.modifiedBy = profile.userId;
      } else { // no loads in progress, set job status to 'Job Completed'
        newJob = CloneDeep(job);
        newJob.status = 'Job Completed';
        newJob.actualEndTime = moment.utc().format();
        newJob.modifiedOn = moment.utc().format();
        newJob.modifiedBy = profile.userId;
      }
    } else { // there's no loads, just complete the job
      newJob = CloneDeep(job);
      newJob.status = 'Job Completed';
      newJob.actualEndTime = moment.utc().format();
      newJob.modifiedOn = moment.utc().format();
      newJob.modifiedBy = profile.userId;
    }

    // Set load's status as Job Ended
    /* const loadsFinish = {
      id: 0,
      ids: loadsToFinish,
      status: 'Job Ended'
    };
    LoadService.closeLoads(loadsFinish); */

    try {
      newJob = await JobService.updateJob(newJob);
    } catch (e) {
      console.error('>> NOT SAVED: JobClosePopup -> closeJob -> e', e)  ;
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
