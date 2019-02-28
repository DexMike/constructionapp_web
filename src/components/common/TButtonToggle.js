import React, { Component } from 'react';
import * as PropTypes from 'prop-types';

class TButtonToggle extends Component {
  render() {
    const { buttonOne, buttonTwo, isOtherToggled, onChange } = this.props;
    // TODO need to use isothertoggled properly...
    return (
      <div className="row">
        {isOtherToggled && (
          <React.Fragment>
            <div className="col-sm-6">
              <button type="button" className="btn btn-secondary btn-sm" onClick={onChange}>
                {buttonOne}
              </button>
            </div>
            <div className="col-sm-6">
              <button type="button" className="btn btn-primary btn-sm" onClick={onChange}>
                {buttonTwo}
              </button>
            </div>
          </React.Fragment>
        )
        }
      </div>
    );
  }
}

TButtonToggle.propTypes = {
  isOtherToggled: PropTypes.bool,
  buttonOne: PropTypes.string.isRequired,
  buttonTwo: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired
};

TButtonToggle.defaultProps = {
  isOtherToggled: false
};

export default TButtonToggle;
