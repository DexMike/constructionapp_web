import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Container } from 'reactstrap';
import moment from 'moment';
import CloneDeep from 'lodash.clonedeep';
import NumberFormat from 'react-number-format';
import JobService from '../../api/JobService';
import truckImage from '../../img/default_truck.png';
import TButtonToggle from '../common/TButtonToggle';
import AddressService from '../../api/AddressService';
import LookupsService from '../../api/LookupsService';
import BidService from '../../api/BidService';
import BookingService from '../../api/BookingService';
import BookingEquipmentService from '../../api/BookingEquipmentService';
import ProfileService from '../../api/ProfileService';
import TDateTimePicker from '../common/TDateTimePicker';
import TField from '../common/TField';
import TwilioService from '../../api/TwilioService';
import MultiSelect from '../common/TMultiSelect';
import SelectField from '../common/TSelect';

class JobViewForm extends Component {
  constructor(props) {
    super(props);
    const job = JobService.getDefaultJob();

    this.state = {
      loaded: false,
      job,
      states: []
    };
  }

  async componentDidMount() {
    const profile = await ProfileService.getProfile();
    const { job } = this.state;

    const { selectedJob, selectedMaterials } = this.props;

    // await this.fetchForeignValues();
    this.setState({
      job
    });
    this.setState({ loaded: true });
  }

  async viewJob(e) {
    console.log('We are in ViewJob!');
    // e.preventDefault();
    const { closeModal, selectedEquipment } = this.props;
    const { startAddress, job, endAddress, bid, booking, bookingEquipment } = this.state;
    // const newJob = CloneDeep(job);
    // startAddress.name = `Job: ${newJob.name}`;
    // endAddress.name = `Job: ${newJob.name}`;
    if (!this.isFormValid()) {
      // TODO display error message
      // console.error('didnt put all the required fields.');
      return;
    }
    closeModal();
  }

  isFormValid() {
    const job = this.state;
    const {} = this.state;
    let isValid = true;

    return isValid;
  }


  renderSelectedJob() {
    const { jobId } = this.props;
    console.log(jobId);
    return (
      <div className="col-sm-8">
        <h3>Job number is {jobId} </h3>
      </div>
    );
  }

  renderJobFormButtons() {
    const { closeModal } = this.props;

    return (
      <div className="row">
        <div className="col-sm-5"/>
        <div className="col-sm-7">
          <div className="row">
            <div className="col-sm-4">
              <button type="button" className="btn btn-secondary" onClick={() => closeModal()}>
                Cancel
              </button>
            </div>
            <div className="col-sm-8">
              <button type="submit" className="btn btn-primary">
                Send Request
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  render() {
    const { jobId, loaded } = this.state;
    if (loaded) {
      return (
        <form id="job-request" onSubmit={e => this.viewJob(e)}>
          {/*{this.renderJobMaterials()}*/}
          {/*{this.renderJobTop()}*/}
          {/*{this.renderJobStartLocation()}*/}
          {/*{this.isRateTypeTon(job.rateType) && this.renderJobEndLocation()}*/}
          {this.renderSelectedJob()}
          {this.renderJobFormButtons()}
        </form>
      );
    }
    return (
      <Container className="dashboard">
        Loading...
      </Container>
    );
  }
}

JobViewForm.propTypes = {
  jobId: PropTypes.number
};

JobViewForm.defaultProps = {
  jobId: null
};

export default JobViewForm;
