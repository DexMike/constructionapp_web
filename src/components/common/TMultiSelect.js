import React, { PureComponent } from 'react';
import Select from 'react-select';
import PropTypes from 'prop-types';

class MultiSelectField extends PureComponent {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(value) {
    // console.log(value);
    const { onChange } = this.props;
    onChange(value);
  }

  render() {
    const {
      value, name, placeholder, options
    } = this.props;

    return (
      <Select
        multi
        name={name}
        value={value}
        onChange={this.handleChange}
        options={options}
        // clearable={false}
        className="form__form-group-select"
        closeOnSelect={false}
        // removeSelected={false}
        placeholder={placeholder}
        slideTo={this.sideScroll}
      />
    );
  }
}

const renderMultiSelectField = function renderMultiSelectField(
  { input, options, placeholder, id, horizontalScroll, selectedItems, 
    meta: { touched, error }
  }
) {
  return (
    <div className="form__form-group-input-wrap form__form-group-input-wrap--error-above">
      {
        horizontalScroll === 'true' && selectedItems >= 2 ? (
          <React.Fragment>
            <i
            className="material-icons select-navigator"
            style={{color: '#666666', fontSize: 18, position: 'absolute', left: 0, top: 32}}
            onClick={() => {
              var selector = document.getElementById(id).getElementsByClassName('Select-control')[0];
              selector.scrollLeft -= 20;
              var container = document.getElementById(id).getElementsByClassName('Select-multi-value-wrapper')[0];
              container.scrollTop = 0;
              
            }}
            >
              navigate_before
            </i>
            <i
              className="material-icons select-navigator"
              style={{color: '#666666', fontSize: 18, position: 'absolute', right: 0, top: 32}}
              onClick={() => {
                var selector = document.getElementById(id).getElementsByClassName('Select-control')[0];
                selector.scrollLeft += 20;
                var container = document.getElementById(id).getElementsByClassName('Select-multi-value-wrapper')[0];
                container.scrollTop = 0;               
              }}
            >
              navigate_next
            </i>
          </React.Fragment>
        )
      : null
      }
      <MultiSelectField
        {...input}
        options={options}
        placeholder={placeholder}
      />
      {touched && error && <span className="form__form-group-error">{error}</span>}
    </div>
  );
};

renderMultiSelectField.propTypes = {
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

renderMultiSelectField.defaultProps = {
  meta: {
    value: null,
    label: null
  },
  options: [],
  placeholder: ''
};

MultiSelectField.propTypes = {
  onChange: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  options: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.string,
    label: PropTypes.string
  })),
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.shape({
      value: PropTypes.string,
      label: PropTypes.string
    }))
  ]).isRequired
};

MultiSelectField.defaultProps = {
  placeholder: '',
  options: []
};

export default renderMultiSelectField;
