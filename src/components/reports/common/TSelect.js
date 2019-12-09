import React, { PureComponent } from 'react';
import Select from 'react-select';
import PropTypes from 'prop-types';

class TSelectField extends PureComponent {
  render() {
    const {
      input, placeholder, options, meta: { touched, error }
    } = this.props;

    return (
      <div className="form__form-group-input-wrap form__form-group-input-wrap--error-above">
        <Select
          {...input}
          placeholder={placeholder}
          options={options}
          clearable={false}
          className="form__form-group-select"
          classNamePrefix="react-select"
          optionClassName="react-select-options"
          style={{borderRadius: 0, minHeight:'32px'}}
        />
        {touched && error && <span className="form__form-group-error">{error}</span>}
      </div>
    );
  }
}

TSelectField.propTypes = {
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

TSelectField.defaultProps = {
  meta: {
    value: null,
    label: null
  },
  placeholder: '',
  options: []
};

export default TSelectField;

// import React, { PureComponent } from 'react';
// import Select from 'react-select';
// import PropTypes from 'prop-types';
//
// class TSelectField extends PureComponent {
//   constructor(props) {
//     super(props);
//     this.handleChange = this.handleChange.bind(this);
//   }
//
//   handleChange(selectedOption) {
//     const { onChange } = this.props;
//     onChange(selectedOption);
//   }
//
//   render() {
//     const {
//       value, name, placeholder, options
//     } = this.props;
//
//     return (
//       <Select
//         name={name}
//         value={value}
//         onChange={this.handleChange}
//         options={options}
//         clearable={false}
//         className="form__form-group-select"
//         placeholder={placeholder}
//       />
//     );
//   }
// }
//
// const renderSelectField = function renderSelectField({ input, options, placeholder, meta }) {
//   return (
//     <div className="form__form-group-input-wrap">
//       <TSelectField
//         {...input}
//         options={options}
//         placeholder={placeholder}
//       />
//       {meta.touched && meta.error && <span className="form__form-group-error">{meta.error}</span>}
//     </div>
//   );
// };
//
// renderSelectField.propTypes = {
//   input: PropTypes.shape({
//     onChange: PropTypes.func,
//     name: PropTypes.string
//   }).isRequired,
//   meta: PropTypes.shape({
//     touched: PropTypes.bool,
//     error: PropTypes.string
//   }),
//   options: PropTypes.arrayOf(PropTypes.shape({
//     value: PropTypes.string,
//     label: PropTypes.string
//   })),
//   placeholder: PropTypes.string
// };
//
// TSelectField.propTypes = {
//   onChange: PropTypes.func.isRequired,
//   name: PropTypes.string.isRequired,
//   placeholder: PropTypes.string,
//   options: PropTypes.arrayOf(PropTypes.shape({
//     value: PropTypes.string,
//     label: PropTypes.string
//   })),
//   value: PropTypes.oneOfType([
//     PropTypes.string,
//     PropTypes.number,
//     PropTypes.shape({
//       value: PropTypes.string,
//       label: PropTypes.string
//     })
//   ]).isRequired
// };
//
// TSelectField.defaultProps = {
//   placeholder: '',
//   options: []
// };
//
// renderSelectField.defaultProps = {
//   meta: null,
//   options: [],
//   placeholder: ''
// };
//
// export default renderSelectField;
