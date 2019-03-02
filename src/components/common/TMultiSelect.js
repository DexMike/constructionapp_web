import React, { PureComponent } from 'react';
import Select from 'react-select';
import PropTypes from 'prop-types';

class MultiSelectField extends PureComponent {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(value) {
    const { onChange } = this.props;
    onChange(value);
  }

  render() {
    const {
      value, name, placeholder, options
    } = this.props;

    return (
      <Select
        multi
        name={name}
        value={value}
        onChange={this.handleChange}
        options={options}
        clearable={false}
        className="form__form-group-select"
        closeOnSelect={false}
        removeSelected={false}
        placeholder={placeholder}
      />
    );
  }
}

const renderMultiSelectField = function renderMultiSelectField(
  { input, options, placeholder, meta }
) {
  return (
    <div className="form__form-group-input-wrap">
      <MultiSelectField
        {...input}
        options={options}
        placeholder={placeholder}
      />
      {meta.touched && meta.error && <span className="form__form-group-error">{meta.error}</span>}
    </div>
  );
};

renderMultiSelectField.propTypes = {
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

renderMultiSelectField.defaultProps = {
  meta: null,
  options: [],
  placeholder: ''
};

MultiSelectField.propTypes = {
  onChange: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  options: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.string,
    label: PropTypes.string
  })),
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.shape({
      value: PropTypes.string,
      label: PropTypes.string
    }))
  ]).isRequired
};

MultiSelectField.defaultProps = {
  placeholder: '',
  options: []
};

export default renderMultiSelectField;