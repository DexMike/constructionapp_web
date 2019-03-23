import React, { PureComponent } from 'react';
import Select from 'react-select';
import PropTypes from 'prop-types';

class TSelectField extends PureComponent {
  render() {
    const {
      input, placeholder, options, meta: { touched, error }
    } = this.props;

    return (
      <div className="form__form-group-input-wrap form__form-group-input-wrap--error-above">
        <Select
          {...input}
          placeholder={placeholder}
          options={options}
          clearable={false}
          className="form__form-group-select"
        />
        {touched && error && <span className="form__form-group-error">{error}</span>}
      </div>
    );
  }
}

TSelectField.propTypes = {
  input: PropTypes.shape({
    onChange: PropTypes.func,
    name: PropTypes.string
  }).isRequired,
  meta: PropTypes.shape({
    touched: PropTypes.bool,
    error: PropTypes.string
  }),
  options: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.string,
    label: PropTypes.string
  })),
  placeholder: PropTypes.string
};

TSelectField.defaultProps = {
  meta: {
    value: null,
    label: null
  },
  placeholder: '',
  options: []
};

export default TSelectField;
