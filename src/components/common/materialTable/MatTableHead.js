import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import TableHead from '@material-ui/core/TableHead';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
// import Checkbox from '@material-ui/core/Checkbox';
import TableSortLabel from '@material-ui/core/TableSortLabel';
// import SidebarLink from "../../layout/sidebar/SidebarLink";

// const rows = [
//   {
//     id: 'name', numeric: false, disablePadding: true, label: 'Dessert (100g serving)',
//   },
//   {
//     id: 'calories', numeric: true, disablePadding: false, label: 'Calories',
//   },
//   {
//     id: 'fat', numeric: true, disablePadding: false, label: 'Fat (g)',
//   },
//   {
//     id: 'carbs', numeric: true, disablePadding: false, label: 'Carbs (g)',
//   },
//   {
//     id: 'protein', numeric: true, disablePadding: false, label: 'Protein (g)',
//   },
// ];

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
    const { order, orderBy, columns } = this.props;

    return (
      <TableHead>
        <TableRow>
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
  // numSelected: PropTypes.number.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  // onSelectAllClick: PropTypes.func.isRequired,
  order: PropTypes.string.isRequired,
  orderBy: PropTypes.string.isRequired,
  // rowCount: PropTypes.number.isRequired
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      displayName: PropTypes.string
    })
  ).isRequired
};

export default MatTableHead;
