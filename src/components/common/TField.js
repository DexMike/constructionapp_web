import React from 'react';
import PropTypes from 'prop-types';

const renderField = function renderField({ input, placeholder, type, meta: { touched, error } }) {
  return (
    <div className="form__form-group-input-wrap form__form-group-input-wrap--error-above">
      <input {...input} placeholder={placeholder} type={type} />
      {touched && error && <span className="form__form-group-error">{error}</span>}
    </div>
  );
};

renderField.propTypes = {
  input: PropTypes.shape().isRequired,
  placeholder: PropTypes.string,
  type: PropTypes.string,
  meta: PropTypes.shape({
    touched: PropTypes.bool,
    error: PropTypes.string
  })
};

renderField.defaultProps = {
  placeholder: '',
  meta: null,
  type: 'text'
};

export default renderField;
