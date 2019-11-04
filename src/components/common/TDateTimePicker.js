import React, { PureComponent } from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import Flatpickr from 'react-flatpickr';
import './overrides.scss';

class TDateTimePickerField extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      startDate: 0
    };
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    let { defaultDate, profileTimeZone } = this.props;

    const timeZonedStartDate = new Date(moment(defaultDate).tz(
      profileTimeZone || Intl.DateTimeFormat().resolvedOptions().timeZone
    ).format('YYYY-MM-DD HH:mm:ss'));
    this.setState({ startDate: timeZonedStartDate });
  }

  componentDidUpdate(prevProps, prevState) {
    let { defaultDate, profileTimeZone } = this.props;
    if ((prevProps.defaultDate !== defaultDate)) {
      const timeZonedStartDate = new Date(moment(defaultDate).tz(
        profileTimeZone || Intl.DateTimeFormat().resolvedOptions().timeZone
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
    const { startDate } = this.state;
    const {
      dateFormat,
      meta: { touched, error },
      showTime,
      // timeFormat,
      disabled,
      id,
      placeholder,
      defaultDate
    } = this.props;

    const date = 1573588800000;
    return (
      <div className="date-picker">
        <div className="form__form-group-input-wrap form__form-group-input-wrap--error-above">
          <Flatpickr
            disabled={disabled}
            className="c-date-picker"
            value={startDate}
            id={id}
            placeholder={placeholder}
            options={{
              enableTime: showTime,
              defaultDate,
              dateFormat,
              // enableTime: true,
              allowInput: true,
              altFormat: 'm\\/d\\/Y h\\:i K',
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
  placeholder: PropTypes.string,
  dateFormat: PropTypes.string,
  meta: PropTypes.shape({
    touched: PropTypes.bool,
    error: PropTypes.string
  }),
  showTime: PropTypes.bool,
  defaultDate: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.number
  ]),
  id: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
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
  defaultDate: null,
  id: null,
  placeholder: null,
  disabled: false,
  profileTimeZone: null
};

export default TDateTimePickerField;
