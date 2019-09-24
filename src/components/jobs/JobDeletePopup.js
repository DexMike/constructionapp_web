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

class JobDeletePopup extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loaded: false,
      profile: null
    };

    this.closeNow = this.closeNow.bind(this);
    this.deleteJob = this.deleteJob.bind(this);
  }

  async componentDidMount() {
    let profile = [];
    try {
      profile = await ProfileService.getProfile();
    } catch (error) {
      console.error('Unable to obtain profile');
    }

    this.setState({
      profile,
      loaded: true
    });
  }

  closeNow() {
    const { toggle } = this.props;
    toggle();
  }

  async deleteJob() {
    const { jobId, jobName, deleteJobModalPopup } = this.props;
    const { profile } = this.state;
    const envString = (process.env.APP_ENV === 'Prod') ? '' : `[Env] ${process.env.APP_ENV} - `;

    const job = await JobService.getJobById(jobId);
    let newJob = [];
    const requesterCarriersIds = [];

    const requesterCarriers = await JobService.getRequestersByCancelledJobId(jobId);
    if (requesterCarriers.length > 0) {
      for (const requesterCarrier of requesterCarriers) {
        requesterCarriersIds.push(requesterCarrier.id);
      }
      const notification = {
        usersIds: requesterCarriersIds,
        body: `${envString}The job ${jobName} you requested has been deleted.`
      };
      await TwilioService.smsBatchSending(notification);
    }

    newJob = CloneDeep(job);
    newJob.status = 'Job Deleted';
    newJob.actualEndTime = moment.utc().format();
    newJob.modifiedOn = moment.utc().format();
    newJob.modifiedBy = profile.userId;

    try {
      newJob = await JobService.updateJob(newJob);
    } catch (e) {
      console.error('>> NOT SAVED: JobDeletePopup -> deleteJob -> e', e)  ;
    }

    // bubble to parent
    deleteJobModalPopup();
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
              Are you sure you want to delete this job?
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
                    this.deleteJob();
                  }
                }
                >
                  Delete
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

JobDeletePopup.propTypes = {
  toggle: PropTypes.func,
  deleteJobModalPopup: PropTypes.func,
  jobName: PropTypes.string,
  jobId: PropTypes.number
};

JobDeletePopup.defaultProps = {
  toggle: null,
  deleteJobModalPopup: null,
  jobName: null,
  jobId: null
};


export default JobDeletePopup;
