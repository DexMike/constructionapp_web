import React, { PureComponent } from 'react';
import DatePicker from 'react-datepicker';
import PropTypes from 'prop-types';

class TDateTimePicker extends PureComponent {
  render() {
    const { input, dateFormat, meta: { touched, error } } = this.props;
    return (
      <div className="form__form-group-input-wrap form__form-group-input-wrap--error-above">
        <div className="date-picker">
          <DatePicker
            {...input}
            timeFormat="HH:mm"
            className="form__form-group-datepicker"
            // selected={startDate}
            // showTimeSelect //shows Time picker as well
            // onChange={this.handleChange}
            dateFormat={dateFormat}
          />
        </div>
        {touched && error && <span className="form__form-group-error">{error}</span>}
      </div>
    );
  }
}

TDateTimePicker.propTypes = {
  input: PropTypes.shape({
    onChange: PropTypes.func,
    name: PropTypes.string,
    value: PropTypes.string
  }).isRequired,
  meta: PropTypes.shape({
    touched: PropTypes.bool,
    error: PropTypes.string
  }),
  dateFormat: PropTypes.string
};

TDateTimePicker.defaultProps = {
  dateFormat: 'MMMM dd, yyyy hh:mm aaa',
  meta: { touched: false, error: '' }
};

export default TDateTimePicker;
