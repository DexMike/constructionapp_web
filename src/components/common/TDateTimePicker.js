import React, { PureComponent } from 'react';
import DatePicker from 'react-datepicker';
import PropTypes from 'prop-types';

class TDateTimePickerField extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      startDate: null
    };
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
    // showTimeSelect
    return (
      <div className="date-picker">
        <DatePicker
          timeFormat="HH:mm"
          className="form__form-group-datepicker"
          selected={startDate}
          onChange={this.handleChange}
          dateFormat="LLL, dd" // http://userguide.icu-project.org/formatparse/datetime
        />
      </div>
    );
  }
}

const renderTDateTimePickerField = function renderTDateTimePickerField(props) {
  const { input } = props;
  return (
    <TDateTimePickerField
      {...input}
    />
  );
};

renderTDateTimePickerField.propTypes = {
  onChange: PropTypes.func.isRequired,
  input: PropTypes.shape({
    onChange: PropTypes.func,
    name: PropTypes.string
  }).isRequired
};

TDateTimePickerField.propTypes = {
  onChange: PropTypes.func.isRequired
};

TDateTimePickerField.defaultProps = {
  // onChange: PropTypes.func.isRequired
};

export default renderTDateTimePickerField;
