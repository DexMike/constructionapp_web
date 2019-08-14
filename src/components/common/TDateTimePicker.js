import React, { PureComponent } from 'react';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import PropTypes from 'prop-types';
import ProfileService from '../../api/ProfileService';
import Flatpickr from "react-flatpickr";

class TDateTimePickerField extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      startDate: null
    };
    this.handleChange = this.handleChange.bind(this);
  }

  // componentDidMount was added in order to prepopulate
  // datePicker date from a fixed date passed from other component.
  async componentDidMount() {
    const { input, profileTimeZone } = this.props;
    let { startDate } = this.state;
    let dueDate = 0;
    // const profile = await ProfileService.getProfile();

    if (input.value) {
      let parsedDate = new Date(input.value);
      startDate = parsedDate;
      if (Object.prototype.toString.call(input.value) !== '[object Date]') {
        // startDate and EndDate were added for common datepicker values
        if (input.value.jobDate) {
          // dueDate = input.value.jobDate.getTime();
          parsedDate = new Date(input.value.jobDate);
          startDate = parsedDate;
        }
        if (input.value.endDate) {
          dueDate = input.value.endDate.getTime();
          parsedDate = new Date(dueDate);
          startDate = parsedDate;
        }
        // startDateComp and endDateComp were added for Reporting Carrier/Customer comparison
        if (input.value.startDateComp) {
          dueDate = input.value.startDateComp.getTime();
          parsedDate = new Date(dueDate);
          startDate = parsedDate;
        }
        if (input.value.endDateComp) {
          dueDate = input.value.endDateComp.getTime();
          parsedDate = new Date(dueDate);
          startDate = parsedDate;
        }
      } else {
        startDate = input.value;
      }

      const timeZonedStartDate = new Date(moment(startDate).tz(
        profileTimeZone || Intl.DateTimeFormat().resolvedOptions().timeZone
      ).format('YYYY-MM-DD HH:mm:ss'));
      this.setState({ startDate: timeZonedStartDate });
    }
  }

  // ComponentWillReceiveProps was added in order to change the
  // datePicker date from a given props value.
  async componentWillReceiveProps(props) {
    let { startDate } = this.state;
    // const profile = await ProfileService.getProfile();
    let dueDate = 0;

    if (props.input.value) {
      let parsedDate = new Date(props.input.value);
      startDate = parsedDate;
      if (props.input.value.givenDate) {
        // dueDate = props.input.value.startDate.getTime();
        parsedDate = new Date(props.input.value.givenDate);
        // this.setState({ startDate: parsedDate });
      }
      if (props.input.value.endDate) {
        dueDate = props.input.value.endDate.getTime();
        parsedDate = new Date(dueDate);
        // this.setState({ startDate: parsedDate });
      }
      if (props.input.value.startDateComp) {
        dueDate = props.input.value.startDateComp.getTime();
        parsedDate = new Date(dueDate);
        // this.setState({ startDate: parsedDate });
      }
      if (props.input.value.endDateComp) {
        dueDate = props.input.value.endDateComp.getTime();
        parsedDate = new Date(dueDate);
        // this.setState({ startDate: parsedDate });
      }

      const timeZonedStartDate = new Date(moment(startDate).tz(
        props.profileTimeZone || Intl.DateTimeFormat().resolvedOptions().timeZone
      ).format('YYYY-MM-DD HH:mm:ss'));
      this.setState({ startDate: timeZonedStartDate });
    }
  }

  handleChange(date) {
    this.setState({
      startDate: date[0]
    });
    const { onChange } = this.props;
    onChange(date[0]);
  }

  render() {
    // const { startDate } = this.state;
    const {
      dateFormat,
      meta: { touched, error },
      showTime,
      // timeFormat,
      disabled,
      id,
      placeholderDate
    } = this.props;
    return (
      <div className="date-picker">
        <div className="form__form-group-input-wrap form__form-group-input-wrap--error-above">
          <Flatpickr
            disabled={disabled}
            className="c-date-picker"
            id={id}
            options={{
              enableTime: showTime,
              defaultDate: placeholderDate,
              dateFormat,
              // enableTime: true,
              onChange: this.handleChange
            }}
          />
          {/*<DatePicker*/}
          {/*  timeFormat={timeFormat}*/}
          {/*  className="form__form-group-datepicker"*/}
          {/*  selected={startDate}*/}
          {/*  showTimeSelect={showTime}*/}
          {/*  onChange={this.handleChange}*/}
          {/*  dateFormat={dateFormat}*/}
          {/*  disabled={disabled}*/}
          {/*  id={id}*/}
          {/*  placeholderText={placeholder}*/}
          {/*/>*/}
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
    name: PropTypes.string,
    value: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.number
    ])
  }).isRequired,
  dateFormat: PropTypes.string,
  meta: PropTypes.shape({
    touched: PropTypes.bool,
    error: PropTypes.string
  }),
  showTime: PropTypes.bool,
  placeholderDate: PropTypes.object,
  disabled: PropTypes.bool,
  profileTimeZone: PropTypes.string
};

TDateTimePickerField.defaultProps = {
  dateFormat: 'm/d/Y',
  meta: {
    touched: null,
    error: null
  },
  showTime: false,
  placeholderDate: new Date(),
  disabled: false,
  profileTimeZone: null
};

export default TDateTimePickerField;
