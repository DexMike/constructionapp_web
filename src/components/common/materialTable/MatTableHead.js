import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import TableHead from '@material-ui/core/TableHead';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Checkbox from '@material-ui/core/Checkbox';
import TableSortLabel from '@material-ui/core/TableSortLabel';

// import SidebarLink from "../../layout/sidebar/SidebarLink";

class MatTableHead extends Component {
  constructor(props) {
    super(props);

    // TODO might try to do this but would need to migrate to babel 7
    // ref: https://babeljs.io/docs/en/babel-plugin-proposal-class-properties
    // https://medium.freecodecamp.org/the-best-way-to-bind-event-handlers-in-react-282db2cf1530
    this.createSortHandler = this.createSortHandler.bind(this);
  }

  createSortHandler(e) {
    const { onRequestSort } = this.props;
    if (e === null) {
      return;
    }
    let name = null;
    // They could click span -> svg -> path nodes, so handle all of them
    name = e.target.getAttribute('name') ? e.target.getAttribute('name') : name;
    name = e.target.parentElement.getAttribute('name')
      ? e.target.parentElement.getAttribute('name') : name;
    name = e.target.parentElement.parentElement.getAttribute('name')
      ? e.target.parentElement.parentElement.getAttribute('name') : name;
    if (name === null) {
      return;
    }
    onRequestSort(e, name);
  }

  // handleChange = name => event => {
  //   this.setState({ [name]: event.target.value });
  // }

  render() {
    const {
      order,
      orderBy,
      columns,
      isSelectable,
      numSelected,
      rowCount,
      onSelectAllClick
    } = this.props;

    return (
      <TableHead>
        <TableRow>
          {isSelectable && (
            <TableCell padding="checkbox" style={{ width: '10px' }}>
              <Checkbox
                className={`material-table__checkbox ${numSelected === rowCount && 'material-table__checkbox--checked'}`}
                indeterminate={numSelected > 0 && numSelected < rowCount}
                checked={numSelected === rowCount}
                onChange={onSelectAllClick}
              />
            </TableCell>
          )}
          {columns.map(column => (
            <TableCell
              className="material-table__cell material-table__cell--sort"
              key={column.name}
              // align={row.numeric ? 'right' : 'left'}
              // padding={row.disablePadding ? 'none' : 'default'}
              sortDirection={orderBy === column.name ? order : false}
            >
              <TableSortLabel
                active={orderBy === column.name}
                name={column.name}
                direction={order}
                onClick={this.createSortHandler}
                className="material-table__sort-label"
              >
                {column.displayName}
              </TableSortLabel>
            </TableCell>
          ), this)}
        </TableRow>
      </TableHead>
    );
  }
}

// this is part of TableSortLabel and it cause the browser
// TODO look into getting this to work eventually
// {/*onClick={this.createSortHandler(row.id)}*/}

MatTableHead.propTypes = {
  numSelected: PropTypes.number,
  onRequestSort: PropTypes.func.isRequired,
  onSelectAllClick: PropTypes.func.isRequired,
  isSelectable: PropTypes.bool.isRequired,
  order: PropTypes.string.isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number,
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      displayName: PropTypes.string
    })
  ).isRequired
};

MatTableHead.defaultProps = {
  rowCount: 0,
  numSelected: 0
};

export default MatTableHead;
