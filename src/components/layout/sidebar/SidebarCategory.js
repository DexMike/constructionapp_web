import React, { Component } from 'react';
import { Collapse } from 'reactstrap';
import PropTypes from 'prop-types';
import classNames from 'classnames';

class SidebarCategory extends Component {
  constructor(props) {
    super(props);
    this.state = {
      collapse: false
    };

    this.toggle = this.toggle.bind(this);
  }

  toggle() {
    const { collapse } = this.state;
    this.setState({ collapse: !collapse });
  }

  render() {
    const { title, icon, isNew, children } = this.props;
    const { collapse } = this.state;
    const categoryClass = classNames({
      'sidebar__category-wrap': true,
      'sidebar__category-wrap--open': collapse
    });

    return (
      <div className={categoryClass}>
        <button type="button" className="sidebar__link sidebar__category" onClick={this.toggle}>
          {icon ? <span className={`sidebar__link-icon lnr lnr-${icon}`}/> : ''}
          <p className="sidebar__link-title">
            {title}
            {isNew && <span className="sidebar__category-new"/>}
          </p>
          <span className="sidebar__category-icon lnr lnr-chevron-right"/>
        </button>
        <Collapse isOpen={collapse} className="sidebar__submenu-wrap">
          <ul className="sidebar__submenu">
            <div>
              {children}
            </div>
          </ul>
        </Collapse>
      </div>
    );
  }
}

SidebarCategory.propTypes = {
  title: PropTypes.string.isRequired,
  icon: PropTypes.string,
  isNew: PropTypes.bool,
  children: PropTypes.arrayOf(PropTypes.element).isRequired
};

SidebarCategory.defaultProps = {
  icon: '',
  isNew: false
};

export default SidebarCategory;
