import React, { PureComponent } from 'react';
import * as PropTypes from 'prop-types';

class MainWrapper extends PureComponent {
  render() {
    const { children } = this.props;
    return (
      <div className="theme-light">
        <div className="wrapper">
          {children}
        </div>
      </div>
    );
  }
}

MainWrapper.propTypes = {
  children: PropTypes.element.isRequired
};

export default MainWrapper;
