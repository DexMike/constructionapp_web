import React, { PureComponent } from 'react';
import * as PropTypes from 'prop-types';
import ThemeContext from './ThemeContext';

class MainWrapper extends PureComponent {
  render() {
    const { children } = this.props;
    return (
      <ThemeContext.Consumer>
        {({ theme }) => (
          <div className={`theme-${theme}`}>
            <div className="wrapper">
              {children}
            </div>
          </div>
        )}
      </ThemeContext.Consumer>
    );
  }
}

MainWrapper.propTypes = {
  children: PropTypes.element.isRequired
};

export default MainWrapper;
