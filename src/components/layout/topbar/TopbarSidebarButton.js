import React, { Component } from 'react';
import PropTypes from 'prop-types';
import icon from '../../../img/burger.svg';

// const icon = `${process.env.PUBLIC_URL}/img/burger.svg`;

class TopbarSidebarButton extends Component {
  render() {
    const { changeMobileSidebarVisibility, changeSidebarVisibility } = this.props;

    return (
      <div>
        <button type="button" className="topbar__button topbar__button--desktop" onClick={changeSidebarVisibility}>
          <img src={`${window.location.origin}/${icon}`} alt="" className="topbar__button-icon" />
        </button>
        <button type="button" className="topbar__button topbar__button--mobile" onClick={changeMobileSidebarVisibility}>
          <img src={`${window.location.origin}/${icon}`} alt="" className="topbar__button-icon" />
        </button>
      </div>
    );
  }
}

TopbarSidebarButton.propTypes = {
  changeMobileSidebarVisibility: PropTypes.func.isRequired,
  changeSidebarVisibility: PropTypes.func.isRequired
};

export default TopbarSidebarButton;
