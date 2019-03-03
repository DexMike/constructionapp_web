import React, { PureComponent } from 'react';
import Select from 'react-select';
import PropTypes from 'prop-types';

class SelectField extends PureComponent {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(selectedOption) {
    console.log(12);
    console.log(selectedOption);
    const { onChange } = this.props;
    onChange(selectedOption);
  }

  render() {
    const {
      value, name, placeholder, options
    } = this.props;

    return (
      <Select
        name={name}
        value={value}
        onChange={this.handleChange}
        options={options}
        clearable={false}
        className="form__form-group-select"
        placeholder={placeholder}
      />
    );
  }
}

const renderSelectField = function renderSelectField({ input, options, placeholder, meta }) {
  return (
    <div className="form__form-group-input-wrap">
      <SelectField
        {...input}
        options={options}
        placeholder={placeholder}
      />
      {meta.touched && meta.error && <span className="form__form-group-error">{meta.error}</span>}
    </div>
  );
};

renderSelectField.propTypes = {
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

SelectField.propTypes = {
  onChange: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  options: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.string,
    label: PropTypes.string
  })),
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({
      value: PropTypes.string,
      label: PropTypes.string
    })
  ]).isRequired
};

SelectField.defaultProps = {
  placeholder: '',
  options: []
};

renderSelectField.defaultProps = {
  meta: null,
  options: [],
  placeholder: ''
};

export default renderSelectField;
