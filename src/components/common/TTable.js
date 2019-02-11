import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Card, CardBody, Col } from 'reactstrap';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
// import Checkbox from '@material-ui/core/Checkbox';
import MatTableHead from './materialTable/MatTableHead';
// import MatTableToolbar from './materialTable/MatTableToolbar';
// import TableHead from '@material-ui/core/TableHead';

class TTable extends Component {
  constructor(props) {
    super(props);
    const { order, orderBy } = this.props;
    this.state = {
      order,
      orderBy,
      selected: [],
      page: 0,
      rowsPerPage: 500
    };
    this.handleRequestSort = this.handleRequestSort.bind(this);
    // this.handleSelectAllClick = this.handleSelectAllClick.bind(this);
    // this.handleClick = this.handleClick.bind(this);
    // this.handleChangePage = this.handleChangePage.bind(this);
    // this.handleChangeRowsPerPage = this.handleChangeRowsPerPage.bind(this);
    // this.handleDeleteSelected = this.handleDeleteSelected.bind(this);
    // this.isSelected = this.isSelected.bind(this);
  }

  // handleSelectAllClick(event, checked) {
  //   if (checked) {
  //     this.setState(state => ({selected: state.data.map(n => n.id)}));
  //     return;
  //   }
  //   this.setState({selected: []});
  // };

  // handleClick(event, id) {
  //   const {selected} = this.state;
  //   const selectedIndex = selected.indexOf(id);
  //   let newSelected = [];
  //
  //   if (selectedIndex === -1) {
  //     newSelected = newSelected.concat(selected, id);
  //   } else if (selectedIndex === 0) {
  //     newSelected = newSelected.concat(selected.slice(1));
  //   } else if (selectedIndex === selected.length - 1) {
  //     newSelected = newSelected.concat(selected.slice(0, -1));
  //   } else if (selectedIndex > 0) {
  //     newSelected = newSelected.concat(
  //       selected.slice(0, selectedIndex),
  //       selected.slice(selectedIndex + 1),
  //     );
  //   }
  //
  //   this.setState({selected: newSelected});
  // };

  // handleChangePage(event, page) {
  //   this.setState({page});
  // };

  // handleChangeRowsPerPage(event) {
  //   this.setState({rowsPerPage: event.target.value});
  // };

  // handleDeleteSelected() {
  //   let copyData = [...this.state.data];
  //   const {selected} = this.state;
  //
  //   for (let i = 0; i < selected.length; i += 1) {
  //     copyData = copyData.filter(obj => obj.id !== selected[i]);
  //     /* Jake, where is this obj coming from?*/
  //   }
  //
  //   this.setState({data: copyData, selected: []});
  // };

  // isSelected(id) {
  //   this.state.selected.indexOf(id) !== -1;
  // }

  getSorting() {
    const { order, orderBy } = this.state;
    return (a, b) => {
      if (a[orderBy] === b[orderBy]) {
        return 0;
      }
      if (order === 'desc') {
        if (b[orderBy] < a[orderBy]) {
          return -1;
        }
        return 1;
      }
      if (a[orderBy] < b[orderBy]) {
        return -1;
      }
      return 1;
    };
  }

  handleRequestSort(event, property) {
    let { order } = this.state;
    const { orderBy } = this.state;
    if (orderBy === property) {
      order = order === 'desc' ? 'asc' : 'desc';
    } else {
      order = 'asc';
    }
    this.setState({
      order,
      orderBy: property
    });
  }

  renderItem(item) {
    const shallowItem = {};
    const { columns, handleIdClick } = this.props;
    columns.forEach((column) => {
      shallowItem[column.name] = item[column.name];
    });
    return (
      <React.Fragment>
        {Object.keys(shallowItem)
          .map((key) => {
            if (key === 'id') {
              return (
                <TableCell key="id" className="material-table__cell app-link"
                           align="left"
                           onClick={() => {
                             handleIdClick(shallowItem[key]);
                           }}
                >
                  {shallowItem[key]}
                </TableCell>
              );
            }
            return (
              <TableCell key={key} className="material-table__cell"
                         align="left"
              >
                {shallowItem[key]}
              </TableCell>
            );
          })}
      </React.Fragment>
    );
  }

  render() {
    const { order, orderBy, selected, rowsPerPage, page } = this.state;
    const { data, columns } = this.props;
    const emptyRows = 0;
    // const emptyRows = rowsPerPage - Math.min(rowsPerPage, data.length - (page * rowsPerPage));
    return (
      <Col md={12} lg={12}>
        <Card>
          <CardBody>
            <div className="material-table__wrap">
              <Table className="material-table">
                <MatTableHead
                  columns={columns}
                  numSelected={selected.length}
                  order={order}
                  orderBy={orderBy}
                  onSelectAllClick={() => {
                  }}
                  // onSelectAllClick={this.handleSelectAllClick}
                  onRequestSort={this.handleRequestSort}
                  rowCount={data.length}
                />
                <TableBody>
                  {data
                    .sort(this.getSorting(order, orderBy))
                    // .slice(page * rowsPerPage, (page * rowsPerPage) + rowsPerPage)
                    .map(dataItem => (
                      <TableRow
                        className="material-table__row"
                        role="checkbox"
                        onClick={() => {
                        }}
                        // onClick={event => this.handleClick(event, d.id)}
                        aria-checked={false}
                        tabIndex={-1}
                        key={dataItem.id}
                        selected={false}
                      >
                        {this.renderItem(dataItem)}
                      </TableRow>
                    ))}
                  {emptyRows > 0 && (
                    <TableRow style={{ height: 49 * emptyRows }}>
                      <TableCell colSpan={6}/>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <TablePagination
              component="div"
              className="material-table__pagination"
              count={data.length}
              rowsPerPage={rowsPerPage}
              page={page}
              backIconButtonProps={{ 'aria-label': 'Previous Page' }}
              nextIconButtonProps={{ 'aria-label': 'Next Page' }}
              onChangePage={() => {
              }}
              // onChangePage={this.handleChangePage}
              onChangeRowsPerPage={() => {
              }}
              // onChangeRowsPerPage={this.handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 15]}
            />
          </CardBody>
        </Card>
      </Col>
    );
  }
}

TTable.propTypes = {
  order: PropTypes.string, // could be 'asc' or 'desc'
  orderBy: PropTypes.string,
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      displayName: PropTypes.string
    })
  ).isRequired,
  handleIdClick: PropTypes.func.isRequired,
  data: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number
    })
  ).isRequired
};

TTable.defaultProps = {
  order: 'asc',
  orderBy: 'id'
};

export default TTable;
