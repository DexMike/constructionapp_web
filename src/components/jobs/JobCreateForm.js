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
import ProfileService from '../../api/ProfileService';
import TDateTimePicker from '../common/TDateTimePicker';
import TField from '../common/TField';
import TwilioService from '../../api/TwilioService';
import MultiSelect from '../common/TMultiSelect';
import SelectField from '../common/TSelect';


class JobCreateForm extends Component {
  constructor(props) {
    super(props);
    const job = JobService.getDefaultJob();
    // Note: not needed for creating a job
    delete job.endTime;
    // job.
    this.state = {
      loaded: false,
      job,
      states: [],
      startAddress: AddressService.getDefaultAddress(),
      endAddress: AddressService.getDefaultAddress(),
      bid: BidService.getDefaultBid(),
      materials: [],
      availableMaterials: [],
      reqHandlerName: { touched: false, error: '' },
      reqHandlerDate: { touched: false, error: '' },
      reqHandlerEstHours: { touched: false, error: '' },
      reqHandlerEstTons: { touched: false, error: '' },
      reqHandlerSAddress: { touched: false, error: '' },
      reqHandlerSCity: { touched: false, error: '' },
      reqHandlerSState: { touched: false, error: '' },
      reqHandlerSZip: { touched: false, error: '' },
      reqHandlerEAddress: { touched: false, error: '' },
      reqHandlerECity: { touched: false, error: '' },
      reqHandlerEState: { touched: false, error: '' },
      reqHandlerEZip: { touched: false, error: '' }
    };
    this.handleJobInputChange = this.handleJobInputChange.bind(this);
    this.handleStartAddressInputChange = this.handleStartAddressInputChange.bind(this);
    this.handleStartStateChange = this.handleStartStateChange.bind(this);
    this.handleEndAddressInputChange = this.handleEndAddressInputChange.bind(this);
    this.handleEndStateChange = this.handleEndStateChange.bind(this);
    this.toggleJobRateType = this.toggleJobRateType.bind(this);
    this.handleStartTimeChange = this.handleStartTimeChange.bind(this);
    this.createJob = this.createJob.bind(this);
    this.isFormValid = this.isFormValid.bind(this);
    this.handleMultiChange = this.handleMultiChange.bind(this);
  }

  async componentDidMount() {
    // debugger;
    const profile = await ProfileService.getProfile();
    const { job, startAddress, endAddress, bid } = this.state;
    const { selectedEquipment, selectedMaterials } = this.props;
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

    // bid.userId should be the userid of the driver likned to that equipment
    if (!selectedEquipment.defaultDriverId) {
      bid.userId = profile.selectedEquipment.defaultDriverId;
    } else {
      bid.userId = profile.userId;
    }

    bid.createdBy = profile.userId;
    bid.modifiedBy = profile.userId;
    await this.fetchForeignValues();
    this.setState({
      job,
      startAddress,
      endAddress,
      bid,
      availableMaterials: selectedMaterials()
    });
    this.setState({ loaded: true });
  }

  async fetchForeignValues() {
    const lookups = await LookupsService.getLookups();
    let states = [];
    Object.values(lookups).forEach((itm) => {
      if (itm.key === 'States') states.push(itm);
    });
    states = states.map(state => ({
      value: String(state.val1),
      label: state.val1
    }));
    this.setState({ states });
  }

  handleJobInputChange(e) {
    const { job } = this.state;
    let reqHandler = '';
    job[e.target.name] = e.target.value;

    if (e.target.name === 'name') {
      reqHandler = 'reqHandlerName';
    } else if (e.target.name === 'startTime') {
      reqHandler = 'reqHandlerDate';
    } else if (e.target.name === 'rateEstimate') {
      reqHandler = 'reqHandlerEstHours';
    }
    this.setState({
      [reqHandler]: Object.assign({}, reqHandler, {
        touched: false
      })
    });

    this.setState({ job });
  }

  handleStartAddressInputChange(e) {
    const { startAddress } = this.state;
    let reqHandler = '';
    startAddress[e.target.name] = e.target.value;

    if (e.target.name === 'address1') {
      reqHandler = 'reqHandlerSAddress';
    } else if (e.target.name === 'city') {
      reqHandler = 'reqHandlerSCity';
    } else if (e.target.name === 'state') {
      reqHandler = 'reqHandlerSState';
    } else if (e.target.name === 'zipCode') {
      reqHandler = 'reqHandlerSZip';
    }
    this.setState({
      [reqHandler]: Object.assign({}, reqHandler, {
        touched: false
      })
    });

    this.setState({ startAddress });
  }

  handleStartStateChange(e) {
    const { startAddress } = this.state;
    const reqHandler = '';
    startAddress.state = e.value;

    this.setState({
      reqHandlerSState: Object.assign({}, reqHandler, {
        touched: false
      })
    });

    this.setState({ startAddress });
  }

  handleEndAddressInputChange(e) {
    const { endAddress } = this.state;
    let reqHandler = '';
    endAddress[e.target.name] = e.target.value;

    if (e.target.name === 'address1') {
      reqHandler = 'reqHandlerEAddress';
    } else if (e.target.name === 'city') {
      reqHandler = 'reqHandlerECity';
    } else if (e.target.name === 'state') {
      reqHandler = 'reqHandlerEState';
    } else if (e.target.name === 'zipCode') {
      reqHandler = 'reqHandlerEZip';
    }
    this.setState({
      [reqHandler]: Object.assign({}, reqHandler, {
        touched: false
      })
    });

    this.setState({ endAddress });
  }

  handleEndStateChange(e) {
    const { endAddress } = this.state;
    const reqHandler = '';
    endAddress.state = e.value;

    this.setState({
      reqHandlerEState: Object.assign({}, reqHandler, {
        touched: false
      })
    });

    this.setState({ endAddress });
  }

  handleStartTimeChange(e) {
    const { job } = this.state;
    job.startTime = e;
    this.setState({ job });
  }

  handleMultiChange(data) {
    this.setState({
      materials: data
    });
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
    // Now we need to create a Booking

    // Let's make a call to Twilio to send an SMS
    // We need to change later get the body from the lookups table
    // We need to get the phone number from the carrier co
    const notification = {
      to: '16129990787',
      body: 'You have a new job offer, please log in to https://www.mytrelar.com'
    };
    await TwilioService.createSms(notification);
    closeModal();
  }

  isFormValid() {
    const job = this.state;
    const {
      reqHandlerName,
      reqHandlerDate,
      reqHandlerEstHours,
      reqHandlerEstTons,
      reqHandlerSAddress,
      reqHandlerSCity,
      reqHandlerSState,
      reqHandlerSZip,
      reqHandlerEAddress,
      reqHandlerECity,
      reqHandlerEState,
      reqHandlerEZip
    } = this.state;
    let isValid = true;

    if (job.job.name.length === 0) {
      this.setState({
        reqHandlerName: Object.assign({}, reqHandlerName, {
          touched: true,
          error: 'Please Enter a Name for this job'
        })
      });
      isValid = false;
    }

    if (job.job.startTime.length === 0) {
      this.setState({
        reqHandlerDate: Object.assign({}, reqHandlerDate, {
          touched: true,
          error: 'Please select a start date for this job'
        })
      });
      isValid = false;
    }

    if (job.job.rateEstimate.length === 0 || job.job.rateEstimate <= 0) {
      this.setState({
        reqHandlerEstHours: Object.assign({}, reqHandlerEstHours, {
          touched: true,
          error: 'Please enter an estimated number for this job'
        })
      });
      isValid = false;
    }

    if (job.job.rateEstimate.length === 0 || job.job.rateEstimate <= 0) {
      this.setState({
        reqHandlerEstTons: Object.assign({}, reqHandlerEstTons, {
          touched: true,
          error: 'Please enter an estimated number for this job'
        })
      });
      isValid = false;
    }

    if (job.startAddress.address1.length === 0) {
      this.setState({
        reqHandlerSAddress: Object.assign({}, reqHandlerSAddress, {
          touched: true,
          error: 'Please enter a starting address for this job'
        })
      });
      isValid = false;
    }

    if (job.startAddress.city.length === 0) {
      this.setState({
        reqHandlerSCity: Object.assign({}, reqHandlerSCity, {
          touched: true,
          error: 'This field is required'
        })
      });
      isValid = false;
    }

    if (job.startAddress.state.length === 0) {
      this.setState({
        reqHandlerSState: Object.assign({}, reqHandlerSState, {
          touched: true,
          error: 'This field is required'
        })
      });
      isValid = false;
    }

    if (job.startAddress.zipCode.length === 0) {
      this.setState({
        reqHandlerSZip: Object.assign({}, reqHandlerSZip, {
          touched: true,
          error: 'This field is required'
        })
      });
      isValid = false;
    }

    // if it's job per hour, do not validate endAddress
    if (job.job.rateType !== 'Hour') {
      if (job.endAddress.address1.length === 0) {
        this.setState({
          reqHandlerEAddress: Object.assign({}, reqHandlerEAddress, {
            touched: true,
            error: 'Please enter a destination or end address for this job'
          })
        });
        isValid = false;
      }

      if (job.endAddress.city.length === 0) {
        this.setState({
          reqHandlerECity: Object.assign({}, reqHandlerECity, {
            touched: true,
            error: 'This field is required'
          })
        });
        isValid = false;
      }

      if (job.endAddress.state.length === 0) {
        this.setState({
          reqHandlerEState: Object.assign({}, reqHandlerEState, {
            touched: true,
            error: 'This field is required'
          })
        });
        isValid = false;
      }

      if (job.endAddress.zipCode.length === 0) {
        this.setState({
          reqHandlerEZip: Object.assign({}, reqHandlerEZip, {
            touched: true,
            error: 'This field is required'
          })
        });
        isValid = false;
      }
    }

    if (isValid) {
      return true;
    }

    return false;
  }

  renderSelectedEquipment() {
    const { job, materials } = this.state;
    let { availableMaterials } = this.state;
    const { selectedEquipment, getAllMaterials } = this.props;

    // if ANY is selected, let's show all materials
    if (availableMaterials.length > 0) {
      for (const mat in availableMaterials) {
        if (availableMaterials[mat].value === 'Any') {
          availableMaterials = getAllMaterials().map(rateType => ({
            name: 'rateType',
            value: rateType,
            label: rateType
          }));
        }
      }
    }

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
                {/* this.renderEquipmentMaterials() */}
                <MultiSelect
                  input={
                    {
                      onChange: this.handleMultiChange,
                      // onChange: this.handleSelectFilterChange,
                      name: 'materialType',
                      value: materials
                    }
                  }
                  meta={
                    {
                      touched: false,
                      error: 'Unable to select'
                    }
                  }
                  options={availableMaterials}
                  // placeholder="Materials"
                  placeholder="Select materials"
                />
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
    const {
      job,
      reqHandlerName,
      reqHandlerDate,
      reqHandlerEstHours/* ,
      reqHandlerEstTons */
    } = this.state;
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
                { /* <input name="name"
                      style={{ width: '100%' }}
                      type="text"
                      placeholder="Job # 242423"
                      onChange={this.handleJobInputChange}
                /> */ }
                <TField
                  input={
                    {
                      onChange: this.handleJobInputChange,
                      name: 'name',
                      value: job.name
                    }
                  }
                  placeholder="Job # 242423"
                  type="text"
                  meta={reqHandlerName}
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
                <TDateTimePicker
                  input={
                    {
                      onChange: this.handleStartTimeChange,
                      name: 'startTime',
                      value: job.startTime,
                      givenDate: new Date(job.startTime).getTime(),
                      dateFormat: 'MM-dd-yy'
                    }
                  }
                  onChange={this.handleStartTimeChange}
                  meta={reqHandlerDate}
                />
              </div>
            </div>
          </div>
          <div className="col-sm-5 form form--horizontal">
            <div className="form__form-group">
              <span className="form__form-group-label">Estimated {job.rateType}s</span>
              <div className="form__form-group-field">
                { /* <input name="rateEstimate"
                      type="text"
                      value={job.rateEstimate}
                      onChange={this.handleJobInputChange}
                /> */ }
                <TField
                  input={
                    {
                      onChange: this.handleJobInputChange,
                      name: 'rateEstimate',
                      value: job.rateEstimate
                    }
                  }
                  placeholder="0"
                  type="number"
                  meta={reqHandlerEstHours}
                />
              </div>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }

  renderJobStartLocation() {
    const {
      states,
      startAddress,
      reqHandlerSAddress,
      reqHandlerSCity,
      reqHandlerSState,
      reqHandlerSZip
    } = this.state;
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
              <TField
                input={
                  {
                    onChange: this.handleStartAddressInputChange,
                    name: 'address1',
                    value: startAddress.address1
                  }
                }
                placeholder="Address #1"
                type="text"
                meta={reqHandlerSAddress}
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
              <TField
                input={
                  {
                    onChange: this.handleStartAddressInputChange,
                    name: 'city',
                    value: startAddress.city
                  }
                }
                placeholder="City"
                type="text"
                meta={reqHandlerSCity}
              />
            </div>
          </div>
          <div className="col-sm-2">
            <div className="form__form-group">
              <SelectField
                input={
                  {
                    onChange: this.handleStartStateChange,
                    name: 'state',
                    value: startAddress.state
                  }
                }
                meta={reqHandlerSState}
                value={startAddress.state}
                options={states}
                placeholder="State"
              />
            </div>
          </div>
          <div className="col-sm-3">
            <div className="form__form-group">
              <TField
                input={
                  {
                    onChange: this.handleStartAddressInputChange,
                    name: 'zipCode',
                    value: startAddress.zipCode
                  }
                }
                placeholder="Zip Code"
                type="number"
                meta={reqHandlerSZip}
              />
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }

  renderJobEndLocation() {
    const {
      states,
      endAddress,
      reqHandlerEAddress,
      reqHandlerECity,
      reqHandlerEState,
      reqHandlerEZip
    } = this.state;
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
              <TField
                input={
                  {
                    onChange: this.handleEndAddressInputChange,
                    name: 'address1',
                    value: endAddress.address1
                  }
                }
                placeholder="Address #1"
                type="text"
                meta={reqHandlerEAddress}
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
              <TField
                input={
                  {
                    onChange: this.handleEndAddressInputChange,
                    name: 'city',
                    value: endAddress.city
                  }
                }
                placeholder="City"
                type="text"
                meta={reqHandlerECity}
              />
            </div>
          </div>
          <div className="col-sm-2">
            <div className="form__form-group">
              <SelectField
                input={
                  {
                    onChange: this.handleEndStateChange,
                    name: 'state',
                    value: endAddress.state
                  }
                }
                meta={reqHandlerEState}
                value={endAddress.state}
                options={states}
                placeholder="State"
              />
            </div>
          </div>
          <div className="col-sm-3">
            <div className="form__form-group">
              <TField
                input={
                  {
                    onChange: this.handleEndAddressInputChange,
                    name: 'zipCode',
                    value: endAddress.zipCode
                  }
                }
                placeholder="Zip Code"
                type="number"
                meta={reqHandlerEZip}
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
    const { job, loaded } = this.state;
    if (loaded) {
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
    return (
      <Container className="dashboard">
        Loading...
      </Container>
    );
  }
}

JobCreateForm.propTypes = {
  selectedEquipment: PropTypes.shape({
    id: PropTypes.number
  }).isRequired,
  getAllMaterials: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  selectedMaterials: PropTypes.func.isRequired
};

export default JobCreateForm;
