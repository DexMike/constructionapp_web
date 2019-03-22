import React, { Component } from 'react';
import CheckIcon from 'mdi-react/CheckIcon';
import CloseIcon from 'mdi-react/CloseIcon';
import PropTypes from 'prop-types';
import classNames from 'classnames';

class TCheckBox extends Component {
  // componentDidMount() {
  //   const { onChange, defaultChecked } = this.props;
  //   onChange(defaultChecked);
  // }

  render() {
    const {
      disabled, className, name, value, onChange, label, color, meta: { touched, error }
    } = this.props;
    const CheckboxClass = classNames({
      'checkbox-btn': true,
      disabled
    });
    return (
      <div className="form__form-group-input-wrap form__form-group-input-wrap--error-above">
        <label htmlFor={name}
          className={`${CheckboxClass} ${className ? ` checkbox-btn--${className}` : ''}`}
        >
          <input
            className="checkbox-btn__checkbox"
            type="checkbox"
            id={name}
            name={name}
            onChange={onChange}
            checked={value}
            disabled={disabled}
          />
          <span
            className="checkbox-btn__checkbox-custom"
            style={color ? {
              background: color,
              borderColor: color
            } : {}}
          >
            <CheckIcon/>
          </span>
          {className === 'button'
            ? (
              <span className="checkbox-btn__label-svg">
                <CheckIcon className="checkbox-btn__label-check"/>
                <CloseIcon className="checkbox-btn__label-uncheck"/>
              </span>
            ) : ''}
          <span className="checkbox-btn__label">
            {label}
          </span>
        </label>
        {touched && error && <span className="form__form-group-error">{error}</span>}
      </div>
    );
  }
}

TCheckBox.propTypes = {
  onChange: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.bool
  ]).isRequired,
  label: PropTypes.string,
  // defaultChecked: PropTypes.bool,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  color: PropTypes.string,
  meta: PropTypes.shape({
    touched: PropTypes.bool,
    error: PropTypes.string
  })
};

TCheckBox.defaultProps = {
  label: '',
  // defaultChecked: false,
  disabled: false,
  className: '',
  color: '',
  meta: {
    value: null,
    label: null
  }
};

export default TCheckBox;
