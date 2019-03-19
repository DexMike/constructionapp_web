/* eslint-disable no-param-reassign */
import React, { PureComponent } from 'react';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import MinusIcon from 'mdi-react/MinusIcon';
import PropTypes from 'prop-types';

class IntervalDatePickerField extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      startDate: props.startDate,
      endDate: props.endDate
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleChangeStart = this.handleChangeStart.bind(this);
    this.handleChangeEnd = this.handleChangeEnd.bind(this);
  }

  handleChangeStart(changedStartDate) {
    this.handleChange({ changedStartDate });
  }

  handleChangeEnd(changedEndDate) {
    this.handleChange({ changedEndDate });
  }

  handleChange({ changedStartDate, changedEndDate }) {
    const { onChange } = this.props;

    const { startDate, endDate } = this.state;

    if (changedStartDate === null) { // if input is set to empty
      changedStartDate = null;
    } else {
      changedStartDate = changedStartDate || startDate;
    }

    if (changedEndDate === null) { // if input is set to empty
      changedEndDate = null;
    } else {
      changedEndDate = changedEndDate || endDate;
    }

    if (moment(changedStartDate).isAfter(moment(changedEndDate))) {
      changedEndDate = changedStartDate;
    }

    this.setState({ startDate: changedStartDate, endDate: changedEndDate });
    onChange({ start: changedStartDate, end: changedEndDate });
  }

  render() {
    const { startDate, endDate } = this.state;
    const { name, dateFormat } = this.props;
    return (
      <div className="date-picker date-picker--interval">
        <DatePicker
          name={name}
          selected={startDate}
          selectsStart
          startDate={startDate}
          endDate={endDate}
          onChange={this.handleChangeStart}
          dateFormat={dateFormat}
          placeholderText="From"
        />
        <MinusIcon className="date-picker__svg" />
        <DatePicker
          name={name}
          selected={endDate}
          selectsEnd
          startDate={startDate}
          endDate={endDate}
          onChange={this.handleChangeEnd}
          dateFormat={dateFormat}
          placeholderText="To"
        />
      </div>
    );
  }
}

IntervalDatePickerField.propTypes = {
  onChange: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  // startDate: PropTypes.instanceOf(Date),
  startDate: PropTypes.oneOfType([
    PropTypes.instanceOf(Date),
    PropTypes.oneOf([null]).isRequired
  ]),
  endDate: PropTypes.oneOfType([
    PropTypes.instanceOf(Date),
    PropTypes.oneOf([null]).isRequired
  ]),
  dateFormat: PropTypes.string
};

IntervalDatePickerField.defaultProps = {
  dateFormat: 'MMMM dd, yyyy',
  startDate: null,
  endDate: null
};

export default IntervalDatePickerField;
