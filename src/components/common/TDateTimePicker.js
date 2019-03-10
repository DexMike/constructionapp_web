import React, { PureComponent } from 'react';
import DatePicker from 'react-datepicker';
import PropTypes from 'prop-types';

class TDateTimePickerField extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      startDate: new Date(props.givenDate)
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
    const { dateFormat } = this.props;
    // console.log(input.dateFormat);
    return (
      <div className="date-picker">
        <DatePicker
          timeFormat="HH:mm"
          className="form__form-group-datepicker"
          selected={startDate}
          // showTimeSelect //shows Time picker as well
          onChange={this.handleChange}
          dateFormat={dateFormat}
        />
      </div>
    );
  }
}

const renderTDateTimePickerField = function renderTDateTimePickerField(
  { input, options, meta: { touched, error } }
) {
  return (
    <div className="form__form-group-input-wrap form__form-group-input-wrap--error-above">
      <TDateTimePickerField
        {...input}
        options={options}
      />
      {touched && error && <span className="form__form-group-error">{error}</span>}
    </div>
  );
};

renderTDateTimePickerField.propTypes = {
  onChange: PropTypes.func.isRequired,
  input: PropTypes.shape({
    onChange: PropTypes.func,
    name: PropTypes.string
  }).isRequired,
  meta: PropTypes.shape({
    touched: PropTypes.bool,
    error: PropTypes.string
  }),
  options: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.string,
    label: PropTypes.string
  })),
  placeholder: PropTypes.string
};

renderTDateTimePickerField.defaultProps = {
  meta: { touched: false, error: '' },
  options: [],
  placeholder: ''
};

TDateTimePickerField.propTypes = {
  onChange: PropTypes.func.isRequired,
  givenDate: PropTypes.number,
  dateFormat: PropTypes.string,
  meta: PropTypes.shape({
    touched: PropTypes.bool,
    error: PropTypes.string
  })
};

TDateTimePickerField.defaultProps = {
  givenDate: PropTypes.number,
  dateFormat: 'MMMM dd, yyyy hh:mm aaa',
  meta: { touched: false, error: '' }
};

export default renderTDateTimePickerField;
