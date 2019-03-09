import React from 'react';
import PropTypes from 'prop-types';

const handleInputChange = function handleInputChange() {
  // const { onChange } = this.props;
  // onChange(e);
  // console.log(e);
};

const renderField = ({
  input, placeholder, type, meta: { touched, error }
}) => (
  <div className="form__form-group-input-wrap form__form-group-input-wrap--error-above">
    <input
      {...input}
      placeholder={placeholder}
      type={type}
      onChange={handleInputChange}
    />
    {touched && error && <span className="form__form-group-error">{error}</span>}
  </div>
);

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
