import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

class TField extends PureComponent {
  render() {
    const {
      input, placeholder, type, meta: { touched, error }
    } = this.props;

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
  }
}

TField.propTypes = {
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

TField.defaultProps = {
  placeholder: '',
  meta: {
    value: null,
    label: null
  },
  type: 'text'
};

export default TField;
