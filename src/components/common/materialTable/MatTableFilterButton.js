import React, { Component } from 'react';
import PropTypes from 'prop-types';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import FilterListIcon from 'mdi-react/FilterListIcon';

// import Topbar from "../../layout/topbar/Topbar";

class MatTableFilterButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      anchorEl: null
    };
    this.handleClick = this.handleClick.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }

  handleClick(event) {
    this.setState({ anchorEl: event.currentTarget });
  }

  handleClose() {
    this.setState({ anchorEl: null });
  }

  // handleSort = property => (event) => {
  //   this.props.onRequestSort(event, property);
  //   this.handleClose();
  // };

  render() {
    const { anchorEl } = this.state;
    const { onRequestSort } = this.props;

    return (
      <div>
        <IconButton
          className="material-table__toolbar-button"
          aria-owns={anchorEl ? 'simple-menu' : null}
          aria-haspopup="true"
          onClick={this.handleClick}
        >
          <FilterListIcon/>
        </IconButton>
        <Menu
          id="simple-menu"
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={this.handleClose}
          className="material-table__filter-menu"
        >
          <MenuItem onClick={(event) => {
            onRequestSort(event, 'name');
            this.handleClose();
          }} className="material-table__filter-menu-item"
          >
            Name
          </MenuItem>
          <MenuItem onClick={(event) => {
            onRequestSort(event, 'calories');
            this.handleClose();
          }} className="material-table__filter-menu-item"
          >
            Calories
          </MenuItem>
          <MenuItem onClick={(event) => {
            onRequestSort(event, 'fat');
            this.handleClose();
          }} className="material-table__filter-menu-item"
          >
            Fat
          </MenuItem>
          <MenuItem onClick={(event) => {
            onRequestSort(event, 'carbs');
            this.handleClose();
          }} className="material-table__filter-menu-item"
          >
            Carbs
          </MenuItem>
          <MenuItem onClick={(event) => {
            onRequestSort(event, 'protein');
            this.handleClose();
          }} className="material-table__filter-menu-item"
          >
            Protein
          </MenuItem>
        </Menu>
      </div>
    );
  }
}

MatTableFilterButton.propTypes = {
  onRequestSort: PropTypes.func.isRequired
};

export default MatTableFilterButton;
