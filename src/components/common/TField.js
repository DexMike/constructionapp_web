import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

class TField extends PureComponent {
  render() {
    const {
      input, placeholder, offClick, type, meta: { touched, error }, id, disabled, secondaryDisabled
    } = this.props;

    let backgroundColorDisabled = null;
    if (secondaryDisabled) {
      backgroundColorDisabled = '#FFFFFF';
    } else if (disabled && !secondaryDisabled) {
      backgroundColorDisabled = '#EBEBEB';
    }

    return (
      <div className="form__form-group-input-wrap form__form-group-input-wrap--error-above">
        <input
          style={{
            borderRadius: 0,
            backgroundColor: backgroundColorDisabled,
            borderColor: (disabled || secondaryDisabled) ? '#C8C8C8' : null,
            color: (disabled || secondaryDisabled) ? '#C8C8C8' : null,
          }}
          {...input}
          placeholder={placeholder}
          type={type}
          id={id}
          disabled={disabled}
          onBlur={() => offClick(input.name)}
        />
        {touched && error && <span className="form__form-group-error" style={{color: secondaryDisabled ? '#C8C8C8' : null}}>{error}</span>}
      </div>
    );
  }
}

TField.propTypes = {
  input: PropTypes.shape({
    onChange: PropTypes.func,
    name: PropTypes.string
  }).isRequired,
  disabled: PropTypes.bool,
  secondaryDisabled: PropTypes.bool,
  meta: PropTypes.shape({
    touched: PropTypes.bool,
    error: PropTypes.string
  }),
  placeholder: PropTypes.string,
  type: PropTypes.string,
  offClick: PropTypes.func
};

TField.defaultProps = {
  offClick: () => {},
  disabled: false,
  secondaryDisabled: false,
  placeholder: '',
  meta: {
    value: null,
    label: null
  },
  type: 'text'
};

export default TField;
