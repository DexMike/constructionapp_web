import React, { PureComponent } from 'react';
import { Alert } from 'reactstrap';
import * as PropTypes from 'prop-types';
import InformationOutlineIcon from 'mdi-react/InformationOutlineIcon';
import ThumbUpOutlineIcon from 'mdi-react/ThumbUpOutlineIcon';
import CommentAlertOutlineIcon from 'mdi-react/CommentAlertOutlineIcon';
import CloseCircleOutlineIcon from 'mdi-react/CloseCircleOutlineIcon';

class TAlert extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      visible: props.visible
    };

    this.onDismiss = this.onDismiss.bind(this);
  }

  static getDerivedStateFromProps(props, currentState) {
    if (currentState.visible !== props.visible) {
      return {
        visible: props.visible
      };
    }
    return null;
  }

  onDismiss() {
    const { onDismiss } = this.props;
    onDismiss();
  }

  render() {
    const {
      color, className, icon, children
    } = this.props;
    const {
      visible
    } = this.state;
    let Icon;

    switch (color) {
      case 'info':
        Icon = <InformationOutlineIcon />;
        break;
      case 'success':
        Icon = <ThumbUpOutlineIcon />;
        break;
      case 'warning':
        Icon = <CommentAlertOutlineIcon />;
        break;
      case 'danger':
        Icon = <CloseCircleOutlineIcon />;
        break;
      default:
        break;
    }

    if (visible) {
      return (
        <Alert color={color} className={className} isOpen={visible}>
          {icon && <div className="alert__icon">{Icon}</div>}
          <button type="button" className="close" onClick={this.onDismiss}><span className="lnr lnr-cross" /></button>
          <div className="alert__content">
            {children}
          </div>
        </Alert>
      );
    }

    return <React.Fragment />;
  }
}

TAlert.propTypes = {
  color: PropTypes.string,
  icon: PropTypes.bool,
  className: PropTypes.string,
  children: PropTypes.element.isRequired,
  visible: PropTypes.bool,
  onDismiss: PropTypes.func.isRequired
};

TAlert.defaultProps = {
  color: '',
  icon: false,
  className: '',
  visible: true
};

export default TAlert;
