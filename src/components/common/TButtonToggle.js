import React, { Component } from 'react';

class TButtonToggle extends Component {
  render() {
    return (
      <div className="row">
        <div className="col-sm-6">
          <button className="btn btn-secondary btn-sm">
            Hour
          </button>
        </div>
        <div className="col-sm-6">
          <button className="btn btn-primary btn-sm">
            Ton
          </button>
        </div>
      </div>
    );
  }
}

export default TButtonToggle;
