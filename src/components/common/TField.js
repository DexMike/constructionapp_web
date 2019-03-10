import React from 'react';
import PropTypes from 'prop-types';

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
