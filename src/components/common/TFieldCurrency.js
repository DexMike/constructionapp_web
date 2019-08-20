import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

class TFieldCurrency extends PureComponent {
  constructor(props) {
    super(props);
    this.handleKeypress = this.handleKeypress.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
  }

  handleKeypress(e) {
    const { decimal, negative } = this.props;
    const { key } = e;

    if (key === 'Backspace') {
      return;
    }

    const decimalString = e.currentTarget.value.includes('.');
    const negativeString = e.currentTarget.value.includes('-');
    if (key === '.' || key === '-') {
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
    const { allowUndefined, decimal, input } = this.props;
    const { value } = e.currentTarget;
    if (decimal) {
      e.currentTarget.value = parseFloat(value).toFixed(2);
      input.onChange(e);
    } else {
      e.currentTarget.value = parseInt(value, 10);
      input.onChange(e);
    }
    if (allowUndefined && Number(value) === 0) {
      e.currentTarget.value = '';
    }
  }

  render() {
    const {
      input,
      placeholder,
      meta: { touched, error },
      negative,
      decimal,
      currency,
      allowUndefined
    } = this.props;
    let step = 1;
    const min = !negative ? 0 : null;
    step = decimal ? 0.01 : null;
    return (
      <div className="form__form-group-input-wrap form__form-group-input-wrap--error-above input-number">
        {
          currency ? (
            <span style={{position: 'absolute', paddingLeft: 16, paddingTop: 8}}>$</span>
          ) : null
        }
        <input
          style={{textAlign: 'right', height: '32px', maxHeight: '32px'}}
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

export default TFieldCurrency;
