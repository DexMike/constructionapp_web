import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import JobService from '../../api/JobService';
// import moment from 'moment';
import truckImage from '../../img/default_truck.png';
import TButtonToggle from '../common/TButtonToggle';
import AddressService from '../../api/AddressService';
// import BidService from '../../api/BidService';
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
      endAddress: AddressService.getDefaultAddress()
      // ,
      // bid: BidService.getDefaultBid()
    };
    this.handleInputChange = this.handleInputChange.bind(this);
    this.toggleJobRate = this.toggleJobRate.bind(this);
  }

  async componentDidMount() {
    const profile = await ProfileService.getProfile();
    const { job } = this.state;
    job.companyId = profile.companyId;
    this.setState({ job });
  }

  handleInputChange(e) {
    this.setState({ [e.target.name]: e.target.value });
  }

  toggleJobRate() {
    const { job } = this.state;
    if (job.rate === 'Hour') {
      job.rate = 'Ton';
    } else {
      job.rate = 'Hour';
    }
    this.setState({ job });
  }

  isRateTon(rate) {
    return rate !== 'Hour';
  }

  renderSelectedEquipment() {
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
                <span>{selectedEquipment.maxCapacity}</span>
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
        <div style={{ marginTop: '5px' }}>
          $
          {selectedEquipment.hourRate}
          &nbsp;per hour
        </div>
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
                <input name="jobName"
                       style={{ width: '100%' }}
                       type="text"
                       placeholder="Job # 242423"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-sm-4">
            <TButtonToggle isOtherToggled={this.isRateTon(job.rate)} buttonOne="Hour" buttonTwo="Ton" onChange={this.toggleJobRate} />
          </div>
        </div>
        <div className="row">
          <div className="col-sm-7 form form--horizontal">
            <div className="form__form-group">
              <span className="form__form-group-label">Start Date</span>
              <div className="form__form-group-field">
                <input name="job.startTime" type="text" placeholder="00/00/0000" value={job.startTime} onChange={this.handleInputChange} />
              </div>
            </div>
          </div>
          <div className="col-sm-5 form form--horizontal">
            <div className="form__form-group">
              <span className="form__form-group-label">Estimated {job.rate}s</span>
              <div className="form__form-group-field">
                <input name="job.rateEstimate" type="text" value={job.rateEstimate} onChange={this.handleInputChange} />
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
              <input name="addressLine1" type="text" placeholder="Address #1" value={startAddress.address1} onChange={this.handleInputChange} />
            </div>
          </div>
        </div>
        <div className="row form">
          <div className="col-sm-12">
            <div className="form__form-group">
              <input name="addressLine2" type="text" placeholder="Address #2" value={startAddress.address2} onChange={this.handleInputChange} />
            </div>
          </div>
        </div>
        <div className="row form">
          <div className="col-sm-7">
            <div className="form__form-group">
              <input name="addressLine2" type="text" placeholder="City" value={startAddress.city} onChange={this.handleInputChange} />
            </div>
          </div>
          <div className="col-sm-2">
            <div className="form__form-group">
              <input name="addressLine2" type="text" placeholder="State" value={startAddress.state} onChange={this.handleInputChange} />
            </div>
          </div>
          <div className="col-sm-3">
            <div className="form__form-group">
              <input name="addressLine2" type="text" placeholder="Zip Code" value={startAddress.zipCode} onChange={this.handleInputChange} />
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
              <input name="addressLine1" type="text" placeholder="Address #1" value={endAddress.address1} onChange={this.handleInputChange}/>
            </div>
          </div>
        </div>
        <div className="row form">
          <div className="col-sm-12">
            <div className="form__form-group">
              <input name="addressLine2" type="text" placeholder="Address #2" value={endAddress.address2} onChange={this.handleInputChange}/>
            </div>
          </div>
        </div>
        <div className="row form">
          <div className="col-sm-7">
            <div className="form__form-group">
              <input name="addressLine2" type="text" placeholder="City" value={endAddress.city} onChange={this.handleInputChange} />
            </div>
          </div>
          <div className="col-sm-2">
            <div className="form__form-group">
              <input name="addressLine2" type="text" placeholder="State" value={endAddress.state} onChange={this.handleInputChange} />
            </div>
          </div>
          <div className="col-sm-3">
            <div className="form__form-group">
              <input name="addressLine2" type="text" placeholder="Zip Code" value={endAddress.zipCode} onChange={this.handleInputChange} />
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
            <textarea name="textarea" type="text" value={job.note} onChange={this.handleInputChange} />
          </div>
        </div>
      </div>
    );
  }

  renderJobFormButtons() {
    return (
      <div className="row">
        <div className="col-sm-5"/>
        <div className="col-sm-7">
          <div className="row">
            <div className="col-sm-4">
              <button type="button" className="btn btn-secondary">
                Cancel
              </button>
            </div>
            <div className="col-sm-8">
              <button type="button" className="btn btn-primary">
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
      <div>
        {this.renderSelectedEquipment()}
        {this.renderJobTop()}
        {this.renderJobStartLocation()}
        {this.isRateTon(job.rate) && this.renderJobEndLocation()}
        {this.renderJobBottom()}
        {this.renderJobFormButtons()}
      </div>
    );
  }
}

JobCreateForm.propTypes = {
  selectedEquipment: PropTypes.shape({
    id: PropTypes.number
  }).isRequired
};

export default JobCreateForm;
