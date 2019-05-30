import React, { Component } from 'react';
import {
  Button
} from 'reactstrap';
import * as PropTypes from 'prop-types';
import TSpinner from './TSpinner';

class TSubmitButton extends Component {
  render() {
    const { bntText, className, onClick, loaderSize, loading } = this.props;
    let { disabled, customCss } = this.props;
    if (loading === true) {
      disabled = true;
      customCss = {display: 'inline-block', paddingLeft: '5px'};
    }
    return (
      <Button
        className={className}
        onClick={onClick}
        disabled={disabled}
      >
        <div style={{display: 'inline-block'}}>{bntText}</div>
        <TSpinner
          color="#CCC"
          customCss={customCss}
          loaderSize={loaderSize}
          loading={loading}
        />
      </Button>
    );
  }
}

TSubmitButton.propTypes = {
  bntText: PropTypes.string.isRequired,
  className: PropTypes.string,
  customCss: PropTypes.shape(),
  onClick: PropTypes.func,
  loaderSize: PropTypes.number,
  disabled: PropTypes.bool,
  loading: PropTypes.bool
};

TSubmitButton.defaultProps = {
  className: 'primaryButton',
  customCss: null,
  onClick: null,
  loaderSize: 20,
  disabled: false,
  loading: false
};

export default TSubmitButton;
