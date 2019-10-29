import React, { PureComponent } from 'react';
import moment from 'moment';
// import DatePicker from 'react-datepicker';
import MinusIcon from 'mdi-react/MinusIcon';
import PropTypes from 'prop-types';
import './overrides.css';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/themes/material_green.css';

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

  handleChangeStart(startDate) {
    const changedStartDate = startDate[0];
    this.handleChange({ changedStartDate });
  }

  handleChangeEnd(endDate) {
    const changedEndDate = endDate[0];
    changedEndDate.setHours(23, 59, 59);
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
    const { startDate, endDate, name, dateFormat, isCustom } = this.props;
    // console.log("TCL: render -> startDate", startDate, endDate, isCustom);

    let startDateM;
    let endDateM;
    if (startDate !== null) {
      startDateM = startDate.getTime();
    } else {
      startDateM = new Date();
    }

    if (endDate !== null) {
      endDateM = endDate.getTime();
    } else {
      endDateM = new Date();
    }

    return (
      <div className="date-picker date-picker--interval" style={{ backgroundColor: 'transparent' }}>
        <Flatpickr
          className={`c-date-picker ${!isCustom ? 'fake-disable' : 'fake-enable'}`}
          name={name}
          options={{
            defaultDate: startDateM,
            // maxDate: endDate,
            dateFormat,
            // enableTime: true,
            onChange: this.handleChangeStart
          }}
          value={startDateM}
          disabled={!isCustom}
        />
        <MinusIcon className="date-picker__svg" />
        <Flatpickr
          className={`c-date-picker ${!isCustom ? 'fake-disable' : 'fake-enable'}`}
          name={name}
          options={{
            defaultDate: endDateM,
            dateFormat,
            onChange: this.handleChangeEnd
          }}
          value={endDateM}
          disabled={!isCustom}
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
  dateFormat: PropTypes.string,
  isCustom: PropTypes.bool
};

IntervalDatePickerField.defaultProps = {
  dateFormat: 'm/d/Y',
  startDate: null,
  endDate: null,
  isCustom: false
};

export default IntervalDatePickerField;
