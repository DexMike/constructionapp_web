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
import GeoUtils from '../../utils/GeoUtils';
import AddressService from '../../api/AddressService';

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
      const usersWithLoad = [];
      const usersWithoutLoad = [];

      if (Object.keys(gpsTrackings).length > 0) { // there's loads in progress, notify drivers
        // console.log('>>>GOT LOADS: ', gpsTrackings, typeof gpsTrackings);
        for (const tracking of gpsTrackings) {
          if (tracking.status !== 'Ended' && tracking.status !== 'Returning') {
            // a) If they are in progress on load driver gets a text: “ Job <job name> is ending.
            // Finish your load, and then you are done with the job.”
            usersWithLoad.push(tracking.userId);
          } else {
            // b) If the driver does not have a load in progress they get text:
            // “<job name> has ended. Do not pickup any more material.”
            usersWithoutLoad.push(tracking.userId);
          }
        }

        if (usersWithLoad.length > 0) {
          const notification = {
            usersIds: usersWithLoad,
            body: `${envString}Job ${jobName} is ending. Finish your load, and then you are done with the job.`
          };
          await TwilioService.smsBatchSending(notification);
        }

        if (usersWithoutLoad.length > 0) {
          const notification = {
            usersIds: usersWithoutLoad,
            body: `${envString}${jobName} has ended. Do not pickup any more material.`
          };
          await TwilioService.smsBatchSending(notification);
        }

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

    // get distance
    const startAddress = await AddressService.getAddressById(newJob.startAddress);
    const endAddress = await AddressService.getAddressById(newJob.endAddress);
    const startingPoint = `${startAddress.latitude},${startAddress.longitude}`;
    const endingPoint = `${endAddress.latitude},${endAddress.longitude}`;
    const geo = await GeoUtils.getDistance(startingPoint, endingPoint);
    newJob.avgDistance = ((geo.distance / 1.609) / 1000);

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
