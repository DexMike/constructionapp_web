import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

class TFieldNumber extends PureComponent {
  constructor(props) {
    super(props);
    this.handleKeypress = this.handleKeypress.bind(this);
  }

  handleKeypress(e) {
    const { decimal, negative } = this.props;
    const { key } = e;

    if (key === 'Backspace') {
      return;
    }

    const decimalString = e.currentTarget.value.includes('.');
    const negativeString = e.currentTarget.value.includes('-');

    if ((key >= 0 && key <= 9) || key === '.' || key === '-') {
      if (decimal) {
        if (decimalString && key === '.') {
          e.preventDefault();
        }
      }
      if (!decimal && key === '.') {
        e.preventDefault();
      }
      if (negative) {
        if (negativeString && key === '-') {
          e.preventDefault();
        }
      }
      if (!negative && key === '-') {
        e.preventDefault();
      }
    }
  }

  handleBlur(e) {
    e.currentTarget.value = Number(e.currentTarget.value);
  }

  render() {
    const {
      input,
      placeholder,
      meta: { touched, error },
      negative,
      decimal,
      currency
    } = this.props;
    let step = 1;
    const min = !negative ? 0 : null;
    step = decimal ? 0.1 : null;
    return (
      <div className="form__form-group-input-wrap form__form-group-input-wrap--error-above">
        {
          currency ? (
            <span style={{position: 'absolute', paddingLeft: 16, paddingTop: 8}}>$</span>
          ) : null
        }
        <input
          style={{textAlign: 'right'}}
          {...input}
          placeholder={placeholder}
          type="number"
          min={min}
          step={step}
          onKeyDown={this.handleKeypress}
          onBlur={this.handleBlur}
        />
        {touched && error && <span className="form__form-group-error">{error}</span>}
      </div>
    );
  }
}

TFieldNumber.propTypes = {
  input: PropTypes.shape({
    onChange: PropTypes.func,
    name: PropTypes.string
  }).isRequired,
  meta: PropTypes.shape({
    touched: PropTypes.bool,
    error: PropTypes.string
  }),
  placeholder: PropTypes.string,
  type: PropTypes.string,
  decimal: PropTypes.bool,
  negative: PropTypes.bool
};

TFieldNumber.defaultProps = {
  placeholder: '',
  meta: {
    value: null,
    label: null
  },
  type: 'number',
  decimal: false,
  negative: false
};

export default TFieldNumber;
