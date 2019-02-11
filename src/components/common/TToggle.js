import React, { Component } from 'react';
import * as PropTypes from 'prop-types';

class TToggle extends Component {
  componentDidMount() {
    const { onChange, defaultChecked } = this.props;
    onChange(defaultChecked);
  }

  render() {
    const {
      name, disabled, value, onChange
    } = this.props;

    return (
      <div className="toggle-btn">
        <input
          className="toggle-btn__input"
          type="checkbox"
          name={name}
          onChange={onChange}
          checked={value}
          disabled={disabled}
        />
        <button type="button"
                className="toggle-btn__input-label"
                onClick={() => onChange(!value)}
        >
          Toggle
        </button>
      </div>
    );
  }
}

TToggle.propTypes = {
  onChange: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  defaultChecked: PropTypes.bool,
  disabled: PropTypes.bool,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.bool
  ]).isRequired
};

TToggle.defaultProps = {
  defaultChecked: false,
  disabled: false
};

const renderToggleButtonField = (props) => {
  const { input, defaultChecked, disabled } = props;
  return (
    <TToggle
      {...input}
      defaultChecked={defaultChecked}
      disabled={disabled}
    />
  );
};

renderToggleButtonField.propTypes = {
  input: PropTypes.shape({
    onChange: PropTypes.func,
    name: PropTypes.string
  }).isRequired,
  defaultChecked: PropTypes.bool,
  disabled: PropTypes.bool
};

renderToggleButtonField.defaultProps = {
  defaultChecked: false,
  disabled: false
};

export default renderToggleButtonField;
