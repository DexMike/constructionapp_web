import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {Button} from "reactstrap";

const Hello = <button type="reset">Hello</button>


class ToggleButton extends PureComponent {

  // static propTypes = {
  //   onChange: PropTypes.func.isRequired,
  //   name: PropTypes.string.isRequired,
  //   defaultChecked: PropTypes.bool,
  //   disabled: PropTypes.bool,
  //   value: PropTypes.oneOfType([
  //     PropTypes.string,
  //     PropTypes.bool
  //   ]).isRequired
  // };
  //
  // static defaultProps = {
  //   defaultChecked: false,
  //   disabled: false
  // };

  // constructor(props) {
  //   super(props);
  // }

  // componentDidMount() {
  //   const {
  //     input,
  //     defaultChecked
  //   } = this.props;
  //   input.onChange(defaultChecked);
  // }


  render() {
    const {
      disabled, input
    } = this.props;

    return (
      <div className="toggle-btn">
        <input
          className="toggle-btn__input"
          type="checkbox"
          name={input.name}
          checked={input.value}
          disabled={disabled}

        />
        <button
          className="toggle-btn__input-label"
          onClick={input.onChange}
          type="button"
          style={{backgroundColor: input.value ? null : 'rgba(0, 111, 83, 0.54)'}}

        >Toggle
        </button>
      </div>
    );
  }
}

ToggleButton.propTypes = {
  input: PropTypes.shape({
    onChange: PropTypes.func,
    name: PropTypes.string,
    value: PropTypes.bool
  }).isRequired,
  disabled: PropTypes.bool
};

ToggleButton.defaultProps = {
  disabled: false
};

// const renderToggleButtonField = props => (
//   <ToggleButtonField
//     {...props.input}
//     defaultChecked={props.defaultChecked}
//     disabled={props.disabled}
//   />
// );

// renderToggleButtonField.propTypes = {
//   input: PropTypes.shape({
//     onChange: PropTypes.func,
//     name: PropTypes.string
//   }).isRequired,
//   defaultChecked: PropTypes.bool,
//   disabled: PropTypes.bool
// };
//
// renderToggleButtonField.defaultProps = {
//   defaultChecked: false,
//   disabled: false
// };

export default ToggleButton;
