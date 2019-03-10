import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

/* class TField extends PureComponent {
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
} */

const renderTField = function renderTField({ input, placeholder, type, meta: { touched, error } }) {
  return (
    <div className="form__form-group-input-wrap form__form-group-input-wrap--error-above">
      <input
        {...input}
        placeholder={placeholder}
        type={type}
      />
      {touched && error && <span className="form__form-group-error">{error}</span>}
    </div>
  );
};

/* TField.propTypes = {
  input: PropTypes.shape({
    onChange: PropTypes.func,
    name: PropTypes.string
  }).isRequired,
  placeholder: PropTypes.string,
  type: PropTypes.string,
  meta: PropTypes.shape({
    touched: PropTypes.bool,
    error: PropTypes.string
  })
}; */

renderTField.propTypes = {
  input: PropTypes.shape({
    onChange: PropTypes.func,
    name: PropTypes.string
  }).isRequired,
  meta: PropTypes.shape({
    touched: PropTypes.bool,
    error: PropTypes.string
  }),
  placeholder: PropTypes.string,
  type: PropTypes.string
};

renderTField.defaultProps = {
  placeholder: '',
  meta: null,
  type: 'text'
};

export default renderTField;
