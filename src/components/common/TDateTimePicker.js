import React, { PureComponent } from 'react';
import DatePicker from 'react-datepicker';
import PropTypes from 'prop-types';

class TDateTimePickerField extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      startDate: new Date()
    };
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(date) {
    this.setState({
      startDate: date
    });
    const { onChange } = this.props;
    onChange(date);
  }

  render() {
    const { startDate } = this.state;
    const { dateFormat, meta: { touched, error } } = this.props;
    return (
      <div className="date-picker">
        <div className="form__form-group-input-wrap form__form-group-input-wrap--error-above">
          <DatePicker
            timeFormat="HH:mm"
            className="form__form-group-datepicker"
            selected={startDate}
            // showTimeSelect //shows Time picker as well
            onChange={this.handleChange}
            dateFormat={dateFormat}
          />
          {touched && error && <span className="form__form-group-error">{error}</span>}
        </div>
      </div>
    );
  }
}

TDateTimePickerField.propTypes = {
  onChange: PropTypes.func.isRequired,
  input: PropTypes.shape({
    onChange: PropTypes.func,
    name: PropTypes.string
  }).isRequired,
  // givenDate: PropTypes.number,
  dateFormat: PropTypes.string,
  meta: PropTypes.shape({
    touched: PropTypes.bool,
    error: PropTypes.string
  })
};

TDateTimePickerField.defaultProps = {
  // givenDate: PropTypes.number,
  dateFormat: 'MMMM dd, yyyy hh:mm aaa',
  meta: null
};

export default TDateTimePickerField;
