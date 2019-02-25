import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
// import moment from 'moment';
import truckImage from '../../img/default_truck.png';
import TButtonToggle from '../common/TButtonToggle';

class JobCreateForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      // companiesId: 19,
      // name: '',
      // status: 'New',
      // startAddress: 0,
      // endAddress: 0,
      // rateType: 'Hour',
      // rateEstimate: 0,
      // rateTotal: 0,
      // startGeoFence: '',
      // endGeoFence: '',
      // numberOfTrucks: 0,
      // startTime: '',
      // endTime: '',
      // rate: 0,
      // materialType: 'All',
      // notes: '',
      // createdBy: 0,
      // createdOn: moment().unix() * 1000,
      // modifiedBy: 0,
      // modifiedOn: moment().unix() * 1000,
      // isArchived: 0
    };
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
            <TButtonToggle/>
          </div>
        </div>
        <div className="row">
          <div className="col-sm-7 form form--horizontal">
            <div className="form__form-group">
              <span className="form__form-group-label">Start Date</span>
              <div className="form__form-group-field">
                <input name="startDate" type="text" placeholder="00/00/0000"/>
              </div>
            </div>
          </div>
          <div className="col-sm-5 form form--horizontal">
            <div className="form__form-group">
              <span className="form__form-group-label">Estimated Tons</span>
              <div className="form__form-group-field">
                <input name="estimatedTons" type="text"/>
              </div>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }

  renderJobStartLocation() {
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
              <input name="addressLine1" type="text" placeholder="Address #1"/>
            </div>
          </div>
        </div>
        <div className="row form">
          <div className="col-sm-12">
            <div className="form__form-group">
              <input name="addressLine2" type="text" placeholder="Address #2"/>
            </div>
          </div>
        </div>
        <div className="row form">
          <div className="col-sm-7">
            <div className="form__form-group">
              <input name="addressLine2" type="text" placeholder="City"/>
            </div>
          </div>
          <div className="col-sm-2">
            <div className="form__form-group">
              <input name="addressLine2" type="text" placeholder="State"/>
            </div>
          </div>
          <div className="col-sm-3">
            <div className="form__form-group">
              <input name="addressLine2" type="text" placeholder="Zip Code"/>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }

  renderJobEndLocation() {
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
              <input name="addressLine1" type="text" placeholder="Address #1"/>
            </div>
          </div>
        </div>
        <div className="row form">
          <div className="col-sm-12">
            <div className="form__form-group">
              <input name="addressLine2" type="text" placeholder="Address #2"/>
            </div>
          </div>
        </div>
        <div className="row form">
          <div className="col-sm-7">
            <div className="form__form-group">
              <input name="addressLine2" type="text" placeholder="City"/>
            </div>
          </div>
          <div className="col-sm-2">
            <div className="form__form-group">
              <input name="addressLine2" type="text" placeholder="State"/>
            </div>
          </div>
          <div className="col-sm-3">
            <div className="form__form-group">
              <input name="addressLine2" type="text" placeholder="Zip Code"/>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }

  renderJobBottom() {
    return (
      <div className="form">
        <div className="form__form-group">
          <h4 className="form__form-group-label">Comments</h4>
          <div className="form__form-group-field">
            <textarea name="textarea" type="text"/>
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
    return (
      <div>
        {this.renderSelectedEquipment()}
        {this.renderJobTop()}
        {this.renderJobStartLocation()}
        {this.renderJobEndLocation()}
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