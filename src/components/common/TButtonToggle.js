import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import classnames from 'classnames';

class TButtonToggle extends Component {
  render() {
    const { buttonOne, buttonTwo, isOtherToggled, onChange } = this.props;
    return (
      <div className="row">
        <div className="col-sm-6">
          <button type="button"
                  className={classnames('btn', { 'btn-primary': !isOtherToggled }, { 'btn-secondary': isOtherToggled }, 'btn-sm')}
                  onClick={onChange}
          >
            {buttonOne}
          </button>
        </div>
        <div className="col-sm-6">
          <button type="button"
                  className={classnames('btn', { 'btn-primary': isOtherToggled }, { 'btn-secondary': !isOtherToggled }, 'btn-sm')}
                  onClick={onChange}
          >
            {buttonTwo}
          </button>
        </div>
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
