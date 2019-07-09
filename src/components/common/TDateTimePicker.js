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

  // componentDidMount was added in order to prepopulate
  // datePicker date from a fixed date passed from other component.
  componentDidMount() {
    const { input } = this.props;
    let dueDate = 0;
    // startDate and EndDate were added for common datepicker values
    if (input.value.startDate) {
      dueDate = input.value.startDate.getTime();
      const parsedDate = new Date(dueDate);
      this.setState({ startDate: parsedDate });
    }
    if (input.value.endDate) {
      dueDate = input.value.endDate.getTime();
      const parsedDate = new Date(dueDate);
      this.setState({ startDate: parsedDate });
    }
    // startDateComp and endDateComp were added for Reporting Carrier/Customer comparison
    if (input.value.startDateComp) {
      dueDate = input.value.startDateComp.getTime();
      const parsedDate = new Date(dueDate);
      this.setState({ startDate: parsedDate });
    }
    if (input.value.endDateComp) {
      dueDate = input.value.endDateComp.getTime();
      const parsedDate = new Date(dueDate);
      this.setState({ startDate: parsedDate });
    }
  }

  // ComponentWillReceiveProps was added in order to change the
  // datePicker date from a given props value.
  componentWillReceiveProps(props) {
    let dueDate = 0;
    if (props.input.value.startDate) {
      dueDate = props.input.value.startDate.getTime();
      const parsedDate = new Date(dueDate);
      this.setState({ startDate: parsedDate });
    }
    if (props.input.value.endDate) {
      dueDate = props.input.value.endDate.getTime();
      const parsedDate = new Date(dueDate);
      this.setState({ startDate: parsedDate });
    }
    if (props.input.value.startDateComp) {
      dueDate = props.input.value.startDateComp.getTime();
      const parsedDate = new Date(dueDate);
      this.setState({ startDate: parsedDate });
    }
    if (props.input.value.endDateComp) {
      dueDate = props.input.value.endDateComp.getTime();
      const parsedDate = new Date(dueDate);
      this.setState({ startDate: parsedDate });
    }
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
    const {
      dateFormat,
      meta: { touched, error },
      showTime,
      timeFormat,
      disabled,
      id
    } = this.props;
    return (
      <div className="date-picker">
        <div className="form__form-group-input-wrap form__form-group-input-wrap--error-above">
          <DatePicker
            timeFormat={timeFormat}
            className="form__form-group-datepicker"
            selected={startDate}
            showTimeSelect={showTime}
            onChange={this.handleChange}
            dateFormat={dateFormat}
            disabled={disabled}
            id={id}
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
    name: PropTypes.string,
    value: PropTypes.object
  }).isRequired,
  dateFormat: PropTypes.string,
  timeFormat: PropTypes.string,
  meta: PropTypes.shape({
    touched: PropTypes.bool,
    error: PropTypes.string
  }),
  showTime: PropTypes.bool,
  disabled: PropTypes.bool
};

TDateTimePickerField.defaultProps = {
  dateFormat: 'MMMM dd, yyyy hh:mm aaa',
  timeFormat: 'h:mm aa',
  meta: {
    touched: null,
    error: null
  },
  showTime: false,
  disabled: false
};

export default TDateTimePickerField;
