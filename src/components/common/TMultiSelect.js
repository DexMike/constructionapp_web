import React, { PureComponent } from 'react';
import Select from 'react-select';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';

class MultiSelectField extends PureComponent {
  constructor(props) {
    super(props);
    // console.log('>>>PROPOS:', props)
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(value) {
    const { onChange, name } = this.props;
    // console.log("TCL: MultiSelectField -> handleChange -> ONCHANGE", value, name)
    onChange(value, name);
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
        classNamePrefix="react-select"
        optionClassName="react-select-options"
        style={{borderRadius: 0, minHeight:'32px'}}
      />
    );
  }
}

const renderMultiSelectField = function renderMultiSelectField(
  { input, options, placeholder, id, horizontalScroll, selectedItems,
    meta: { touched, error }
  }
) {

  let selected = 0;
  if (selectedItems !== undefined) {
    selected = selectedItems.length;
  }

  function slideTo(direction) {
    const selector = document.getElementById(id).getElementsByClassName('Select-control')[0];
    if (direction) {
      const maxDistance = 40 * selected * 1.5;
      if (selector.scrollLeft < maxDistance) {
        selector.scrollLeft += 20;
      }
    } else {
      selector.scrollLeft -= 20;
    }
    const container = document.getElementById(id).getElementsByClassName('Select-multi-value-wrapper')[0];
    container.scrollTop = 0;
  }

  function appendArrows() {
    const arrows = document.getElementById(`${id}Scroll`);
    let selector = document.getElementById(id).getElementsByClassName('form__form-group-select')[0].contains(arrows);
    if (selector) return;
    selector = document.getElementById(id).getElementsByClassName('form__form-group-select')[0].appendChild(document.createElement('section'));
    selector.setAttribute('id', `${id}Scroll`);
    const element = (
      <React.Fragment>
        <i
          className="material-icons select-navigator"
          style={{color: '#666666', fontSize: 18, position: 'absolute', right: 16, top: -20, zIndex: 50 }}
          onClick={() => slideTo(false)}
        >
          navigate_before
        </i>
        <i
          className="material-icons select-navigator"
          style={{color: '#666666', fontSize: 18, position: 'absolute', right: 0, top: -20, zIndex: 50}}
          onClick={() => slideTo(true)}
        >
          navigate_next
        </i>
      </React.Fragment>
    );
    ReactDOM.render(element, document.querySelector(`#${id}Scroll`));
  }

  if (horizontalScroll === 'true' && selected >= 3) {
    appendArrows();
  }

  return (
    <div className="form__form-group-input-wrap form__form-group-input-wrap--error-above">
      <MultiSelectField
      style
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
    id: PropTypes.number,
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
    id: PropTypes.number,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    label: PropTypes.string
  })),
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.arrayOf(PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      label: PropTypes.string
    }))
  ]).isRequired
};

MultiSelectField.defaultProps = {
  placeholder: '',
  options: []
};

export default renderMultiSelectField;
