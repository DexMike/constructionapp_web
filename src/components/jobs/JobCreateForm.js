import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import moment from 'moment';
import CloneDeep from 'lodash.clonedeep';
import JobService from '../../api/JobService';
import truckImage from '../../img/default_truck.png';
import NumberFormat from 'react-number-format';
import TButtonToggle from '../common/TButtonToggle';
import AddressService from '../../api/AddressService';
import BidService from '../../api/BidService';
import ProfileService from '../../api/ProfileService';

class JobCreateForm extends Component {
  constructor(props) {
    super(props);
    const job = JobService.getDefaultJob();
    // Note: not needed for creating a job
    delete job.endTime;
    // job.
    this.state = {
      job,
      startAddress: AddressService.getDefaultAddress(),
      endAddress: AddressService.getDefaultAddress(),
      bid: BidService.getDefaultBid()
    };
    this.handleJobInputChange = this.handleJobInputChange.bind(this);
    this.handleStartAddressInputChange = this.handleStartAddressInputChange.bind(this);
    this.handleEndAddressInputChange = this.handleEndAddressInputChange.bind(this);
    this.toggleJobRateType = this.toggleJobRateType.bind(this);
    this.createJob = this.createJob.bind(this);
    this.isFormValid = this.isFormValid.bind(this);
  }

  async componentDidMount() {
    const profile = await ProfileService.getProfile();
    const { job, startAddress, endAddress, bid } = this.state;
    const { selectedEquipment } = this.props;
    job.companiesId = profile.companyId;
    job.numberOfTrucks = 1;
    job.modifiedBy = profile.userId;
    job.createdBy = profile.userId;
    if (selectedEquipment.rateType !== 'All') {
      job.rateType = selectedEquipment.rateType;
    }
    startAddress.companyId = profile.companyId;
    startAddress.modifiedBy = profile.userId;
    startAddress.createdBy = profile.userId;
    endAddress.companyId = profile.companyId;
    endAddress.modifiedBy = profile.userId;
    endAddress.createdBy = profile.userId;
    bid.hasCustomerAccepted = 1;
    bid.userId = profile.userId;
    bid.createdBy = profile.userId;
    bid.modifiedBy = profile.userId;
    this.setState({
      job,
      startAddress,
      endAddress,
      bid
    });
  }

  handleJobInputChange(e) {
    const { job } = this.state;
    job[e.target.name] = e.target.value;
    this.setState({ job });
  }

  handleStartAddressInputChange(e) {
    const { startAddress } = this.state;
    startAddress[e.target.name] = e.target.value;
    this.setState({ startAddress });
  }

  handleEndAddressInputChange(e) {
    const { endAddress } = this.state;
    endAddress[e.target.name] = e.target.value;
    this.setState({ endAddress });
  }

  toggleJobRateType() {
    const { job } = this.state;
    if (job.rateType === 'Hour') {
      job.rateType = 'Ton';
    } else {
      job.rateType = 'Hour';
    }
    this.setState({ job });
  }

  isRateTypeTon(rateType) {
    return rateType !== 'Hour';
  }

  async createJob(e) {
    e.preventDefault();
    const { closeModal, selectedEquipment } = this.props;
    const { startAddress, job, endAddress, bid } = this.state;
    const newJob = CloneDeep(job);
    startAddress.name = `Job: ${newJob.name}`;
    endAddress.name = `Job: ${newJob.name}`;
    if (!this.isFormValid()) {
      // TODO display error message
      // console.error('didnt put all the required fields.');
      return;
    }
    startAddress.modifiedOn = moment()
      .unix() * 1000;
    startAddress.createdOn = moment()
      .unix() * 1000;
    const newStartAddress = await AddressService.createAddress(startAddress);
    newJob.startAddress = newStartAddress.id;
    if (newJob.rateType === 'Ton') {
      endAddress.modifiedOn = moment()
        .unix() * 1000;
      endAddress.createdOn = moment()
        .unix() * 1000;
      const newEndAddress = await AddressService.createAddress(endAddress);
      newJob.endAddress = newEndAddress.id;
      newJob.rate = selectedEquipment.tonRate;
    } else {
      delete newJob.endAddress;
      newJob.rate = selectedEquipment.hourRate;
    }
    newJob.modifiedOn = moment()
      .unix() * 1000;
    newJob.createdOn = moment()
      .unix() * 1000;
    const createdJob = await JobService.createJob(newJob);
    bid.jobId = createdJob.id;
    bid.rate = createdJob.rate;
    bid.rateEstimate = createdJob.rateEstimate;
    bid.modifiedOn = moment()
      .unix() * 1000;
    bid.createdOn = moment()
      .unix() * 1000;
    await BidService.createBid(bid);
    closeModal();
  }

  isFormValid() {
    const { startAddress, job, endAddress } = this.state;
    // start address
    if (!startAddress.name || !startAddress.companyId) {
      return false;
    }
    // job
    if (!job.companiesId || !job.name || !job.status || !job.rateType) {
      return false;
    }
    // end address
    if (job.rateType === 'Ton' && (!endAddress.name || !endAddress.companyId)) {
      return false;
    }
    return true;
  }

  renderSelectedEquipment() {
    const { job } = this.state;
    const { selectedEquipment } = this.props;
    return (
      <React.Fragment>
        <h4>{selectedEquipment.name}</h4>
        <div style={{ paddingTop: '10px' }} className="row">
          <div className="col-sm-3">
            <img width="100" height="85" src={`${window.location.origin}/${truckImage}`} alt=""
                 style={{ width: '100px' }}
            />
          </div>
          <div className="col-sm-3">
            <div className="form__form-group">
              <span className="form__form-group-label">Truck Type</span>
              <div className="form__form-group-field">
                <span>{selectedEquipment.type}</span>
              </div>
            </div>
          </div>
          <div className="col-sm-3">
            <div className="form__form-group">
              <span className="form__form-group-label">Capacity</span>
              <div className="form__form-group-field">
                <span>
                  <NumberFormat
                    value={selectedEquipment.maxCapacity}
                    displayType="text"
                    decimalSeparator="."
                    decimalScale={0}
                    fixedDecimalScale
                    thousandSeparator
                    prefix=" "
                    suffix=" Tons"
                  />
                </span>
              </div>
            </div>
          </div>
          <div className="col-sm-3">
            <div className="form__form-group">
              <span className="form__form-group-label">Materials</span>
              <div className="form__form-group-field">
                {this.renderEquipmentMaterials()}
              </div>
            </div>
          </div>
        </div>
        {!this.isRateTypeTon(job.rateType) && (
          <div style={{ marginTop: '5px' }}>
            <NumberFormat
              value={selectedEquipment.hourRate}
              displayType="text"
              decimalSeparator="."
              decimalScale={2}
              fixedDecimalScale
              thousandSeparator
              prefix="$ "
              suffix=" per Hour"
            />
          </div>
        )}
        {this.isRateTypeTon(job.rateType) && (
          <div style={{ marginTop: '5px' }}>
            <NumberFormat
              value={selectedEquipment.tonRate}
              displayType="text"
              decimalSeparator="."
              decimalScale={2}
              fixedDecimalScale
              thousandSeparator
              prefix="$ "
              suffix=" per Ton"
            />
          </div>
        )}
      </React.Fragment>
    );
  }

  renderEquipmentMaterials() {
    const { selectedEquipment } = this.props;
    return selectedEquipment.materials.map((material, index, materials) => {
      if (index !== materials.length - 1) {
        return (
          <span key={material}>
            {material}
            ,&nbsp;
          </span>
        );
      }
      return <span key={material}>{material}</span>;
    });
  }

  renderJobTop() {
    const { job } = this.state;
    const { selectedEquipment } = this.props;
    return (
      <React.Fragment>
        <div style={{
          borderBottom: '2px solid #ccc',
          marginTop: '10px'
        }}
        />
        <div style={{ paddingTop: '10px' }} className="row">
          <div className="col-sm-12 form">
            <div className="form__form-group">
              <h4 className="form__form-group-label">Job Name</h4>
              <div className="form__form-group-field">
                <input name="name"
                       style={{ width: '100%' }}
                       type="text"
                       placeholder="Job # 242423"
                       onChange={this.handleJobInputChange}
                />
              </div>
            </div>
          </div>
        </div>
        {selectedEquipment.rateType === 'Both' && (
          <div className="row">
            <div className="col-sm-4">
              <TButtonToggle isOtherToggled={this.isRateTypeTon(job.rateType)} buttonOne="Hour"
                             buttonTwo="Ton" onChange={this.toggleJobRateType}
              />
            </div>
          </div>
        )}
        <div className="row">
          <div className="col-sm-7 form form--horizontal">
            <div className="form__form-group">
              <span className="form__form-group-label">Start Date</span>
              <div className="form__form-group-field">
                <input name="startTime"
                       type="text"
                       placeholder="00/00/0000"
                       value={job.startTime}
                       onChange={this.handleJobInputChange}
                />
              </div>
            </div>
          </div>
          <div className="col-sm-5 form form--horizontal">
            <div className="form__form-group">
              <span className="form__form-group-label">Estimated {job.rateType}s</span>
              <div className="form__form-group-field">
                <input name="rateEstimate"
                       type="text"
                       value={job.rateEstimate}
                       onChange={this.handleJobInputChange}
                />
              </div>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }

  renderJobStartLocation() {
    const { startAddress } = this.state;
    return (
      <React.Fragment>
        <div className="row">
          <div className="col-sm-12">
            <h4>Start Location</h4>
          </div>
        </div>
        <div style={{
          borderBottom: '3px solid #ccc',
          marginBottom: '15px'
        }}
        />
        <div className="row form">
          <div className="col-sm-12">
            <div className="form__form-group">
              <input name="address1"
                     type="text"
                     placeholder="Address #1"
                     value={startAddress.address1}
                     onChange={this.handleStartAddressInputChange}
              />
            </div>
          </div>
        </div>
        <div className="row form">
          <div className="col-sm-12">
            <div className="form__form-group">
              <input name="address2"
                     type="text"
                     placeholder="Address #2"
                     value={startAddress.address2}
                     onChange={this.handleStartAddressInputChange}
              />
            </div>
          </div>
        </div>
        <div className="row form">
          <div className="col-sm-7">
            <div className="form__form-group">
              <input name="city"
                     type="text"
                     placeholder="City"
                     value={startAddress.city}
                     onChange={this.handleStartAddressInputChange}
              />
            </div>
          </div>
          <div className="col-sm-2">
            <div className="form__form-group">
              <input name="state"
                     type="text"
                     placeholder="State"
                     value={startAddress.state}
                     onChange={this.handleStartAddressInputChange}
              />
            </div>
          </div>
          <div className="col-sm-3">
            <div className="form__form-group">
              <input name="zipCode"
                     type="text"
                     placeholder="Zip Code"
                     value={startAddress.zipCode}
                     onChange={this.handleStartAddressInputChange}
              />
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }

  renderJobEndLocation() {
    const { endAddress } = this.state;
    return (
      <React.Fragment>
        <div className="row">
          <div className="col-sm-12">
            <h4>End Location</h4>
          </div>
        </div>
        <div style={{
          borderBottom: '3px solid #ccc',
          marginBottom: '15px'
        }}
        />
        <div className="row form">
          <div className="col-sm-12">
            <div className="form__form-group">
              <input name="address1"
                     type="text"
                     placeholder="Address #1"
                     value={endAddress.address1}
                     onChange={this.handleEndAddressInputChange}
              />
            </div>
          </div>
        </div>
        <div className="row form">
          <div className="col-sm-12">
            <div className="form__form-group">
              <input name="address2"
                     type="text"
                     placeholder="Address #2"
                     value={endAddress.address2}
                     onChange={this.handleEndAddressInputChange}
              />
            </div>
          </div>
        </div>
        <div className="row form">
          <div className="col-sm-7">
            <div className="form__form-group">
              <input name="city"
                     type="text"
                     placeholder="City"
                     value={endAddress.city}
                     onChange={this.handleEndAddressInputChange}
              />
            </div>
          </div>
          <div className="col-sm-2">
            <div className="form__form-group">
              <input name="state"
                     type="text"
                     placeholder="State"
                     value={endAddress.state}
                     onChange={this.handleEndAddressInputChange}
              />
            </div>
          </div>
          <div className="col-sm-3">
            <div className="form__form-group">
              <input name="zipCode"
                     type="text"
                     placeholder="Zip Code"
                     value={endAddress.zipCode}
                     onChange={this.handleEndAddressInputChange}
              />
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }

  renderJobBottom() {
    const { job } = this.state;
    return (
      <div className="form">
        <div className="form__form-group">
          <h4 className="form__form-group-label">Comments</h4>
          <div className="form__form-group-field">
            <textarea name="notes" value={job.notes} onChange={this.handleJobInputChange}/>
          </div>
        </div>
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
    const { job } = this.state;
    return (
      <form id="job-request" onSubmit={e => this.createJob(e)}>
        {this.renderSelectedEquipment()}
        {this.renderJobTop()}
        {this.renderJobStartLocation()}
        {this.isRateTypeTon(job.rateType) && this.renderJobEndLocation()}
        {this.renderJobBottom()}
        {this.renderJobFormButtons()}
      </form>
    );
  }
}

JobCreateForm.propTypes = {
  selectedEquipment: PropTypes.shape({
    id: PropTypes.number
  }).isRequired,
  closeModal: PropTypes.func.isRequired
};

export default JobCreateForm;
