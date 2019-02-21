import React, { Component } from 'react';
import truckImage from '../../img/default_truck.png';

class JobCreateForm extends Component {
  render() {
    return (
      <div>
        <h4>ABC Trucking</h4>
        <div style={{paddingTop: '10px'}} className="row">
          <div className="sm-col-3" style={{width:'25%'}}>
            <img width="100" height="85" src={`${window.location.origin}/${truckImage}`} alt="" style={{width: '100px'}} />
          </div>
          <div className="sm-col-3" style={{width:'25%'}}>
            <div className="form__form-group">
              <span className="form__form-group-label">Truck Type</span>
              <div className="form__form-group-field">
                <input
                  style={{width: '100px'}}
                  name="truckType"
                  type="text"
                  placeholder="Truck Type"
                />
              </div>
            </div>
          </div>
          <div className="sm-col-3" style={{width:'25%'}}>
            <div className="form__form-group">
              <span className="form__form-group-label">Capacity</span>
              <div className="form__form-group-field">
                <input
                  style={{width: '100px'}}
                  name="capacity"
                  type="text"
                  placeholder="25 Tons"
                />
              </div>
            </div>
          </div>
          <div className="sm-col-3" style={{width:'25%'}}>
            <div className="form__form-group">
              <span className="form__form-group-label">Materials</span>
              <div className="form__form-group-field">
                <input
                  style={{width: '100px'}}
                  name="materials"
                  type="text"
                  placeholder="Select Material"
                />
              </div>
            </div>
          </div>
        </div>
        <div style={{ marginTop: '5px' }}>$100 per hour</div>
        <div style={{ borderBottom: '2px solid #ccc', marginTop: '10px'}}></div>
        <div style={{paddingTop: '10px'}} className="row">
          <div className="sm-col-12" style={{width:'100%'}}>
            <div className="form__form-group">
              <h4 className="form__form-group-label">Job Name</h4>
              <div className="form__form-group-field">
                <input name="materials"
                       style={{width: '100%'}}
                  type="text"
                  placeholder="Select Material"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default JobCreateForm;
