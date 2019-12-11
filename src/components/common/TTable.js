import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Card, CardBody, Col } from 'reactstrap';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
// import Checkbox from '@material-ui/core/Checkbox';
import Checkbox from '@material-ui/core/Checkbox';
import MatTableHead from './materialTable/MatTableHead';
// import MatTableToolbar from './materialTable/MatTableToolbar';
// import TableHead from '@material-ui/core/TableHead';
import truckImage from '../../img/default_truck.png';
import TSpinner from './TSpinner';

class TTable extends Component {
  constructor(props) {
    super(props);
    const { order, orderBy, selected, defaultRows } = this.props;
    this.state = {
      order,
      orderBy,
      selected,
      page: 0,
      rowsPerPage: defaultRows
    };
    this.handleRequestSort = this.handleRequestSort.bind(this);
    this.handleSelectAllClick = this.handleSelectAllClick.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleChangePage = this.handleChangePage.bind(this);
    this.handleChangeRowsPerPage = this.handleChangeRowsPerPage.bind(this);
    this.isSelected = this.isSelected.bind(this);
  }

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

  handleClick(event, id) {
    const { onSelect, handleIdClick, isSelectable, omitFromSelect } = this.props;
    if (omitFromSelect.length > 0) {
      if (omitFromSelect.includes(id)) {
        return;
      }
    }
    const { selected } = this.state;
    if (isSelectable) {
      const selectedIndex = selected.indexOf(id);
      let newSelected = [];

      if (selectedIndex === -1) {
        newSelected = newSelected.concat(selected, id);
      } else if (selectedIndex === 0) {
        newSelected = newSelected.concat(selected.slice(1));
      } else if (selectedIndex === selected.length - 1) {
        newSelected = newSelected.concat(selected.slice(0, -1));
      } else if (selectedIndex > 0) {
        newSelected = newSelected.concat(
          selected.slice(0, selectedIndex),
          selected.slice(selectedIndex + 1)
        );
      }

      this.setState({ selected: newSelected });
      onSelect(newSelected);
    }
    handleIdClick(id);
  }

  handleSelectAllClick(event, checked) {
    const { onSelect } = this.props;
    if (checked) {
      const { data } = { ...this.props };
      const selected = data.map(item => item.id);
      this.setState({ selected });
      onSelect(selected);
      return;
    }
    this.setState({ selected: [] });
    onSelect([]);
  }

  handleChangeRowsPerPage(event) {
    const { handleRowsChange } = this.props;
    const rowsPerPage = event.target.value;
    this.setState({ rowsPerPage });
    handleRowsChange(rowsPerPage);
  }

  handleChangePage(event, page) {
    const { handlePageChange } = this.props;
    this.setState({ page });
    handlePageChange(page);
  }

  handleRequestSort(event, property) {
    const { handleSortChange, data } = this.props;
    let { order } = this.state;
    const { orderBy } = this.state;
    if (orderBy === property) {
      order = order === 'desc' ? 'asc' : 'desc';
    } else {
      order = 'asc';
    }
    if (handleSortChange) {
      handleSortChange(property, order);
    } else {
      data.sort(this.getSorting(order, orderBy));
    }
    this.setState({
      order,
      orderBy: property
    });
  }

  isSelected(id) {
    const { selected } = this.state;
    return selected.indexOf(id) !== -1;
  }

  renderItem(item, isSelectable, isSelected) {
    const shallowItem = {};
    const { columns, handleIdClick, handleItemPreview } = this.props;
    columns.forEach((column) => {
      if (typeof column.label !== 'undefined') {
        shallowItem[column.name] = `${item[column.label]}`;
      } else {
        shallowItem[column.name] = item[column.name];
      }
    });

    // {/*<CheckBoxIcon checked={isSelected && item.checkboxDisabled} disabled onChange={null} className="mate
    return (
      <React.Fragment>
        {(isSelectable && !item.checkboxDisabled) && (
          <TableCell className="material-table__cell" padding="checkbox">
            <Checkbox checked={isSelected && !item.checkboxDisabled} className="material-table__checkbox"/>
          </TableCell>
        )}
        {(isSelectable && item.checkboxDisabled) && (
          <TableCell className="material-table__cell" style={{ textAlign: 'center' }}>
            <i className="material-icons" style={{ color: 'grey' }}>
              check_box
            </i>
          </TableCell>
        )}
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
            if (key === 'image') {
              return (
                <TableCell key="image">
                  {/* Setting the image to default truck image for now */}
                  {/* Eventually need to pull real image of truck */}
                  {shallowItem[key] && shallowItem[key].trim().length <= 0 && <img src={`${window.location.origin}/${truckImage}`} alt="" style={{ width: '160px', height: 'auto' }}/>}
                  {shallowItem[key] && shallowItem[key].trim().length > 0 && <img src={shallowItem[key]} alt="" style={{ width: '160px', height: 'auto' }}/>}
                  {!shallowItem[key] && <img src={`${window.location.origin}/${truckImage}`} alt="" style={{ width: '160px', height: 'auto' }}/>}
                </TableCell>
              );
            }
            if (key === 'imgPreview') {
              return (
                <TableCell
                  style={{width: 30, borderBottom: 0}}
                  key="preview"
                  onClick={() => {
                    handleItemPreview(shallowItem[key]);
                  }}
                >
                  <span style={{fontSize: 26, zIndex: 5 }} className="lnr lnr-picture"/>
                </TableCell>
              );
            }
            return (
              <TableCell
                style={{ maxWidth: 300 }}
                key={key}
                className="material-table__cell"
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
    const {
      data,
      columns,
      // handleIdClick,
      totalCount,
      // handleSelectAllClick,
      isSelectable,
      hidePagination,
      isLoading
    } = this.props;
    const emptyRows = 0;
    // const emptyRows = rowsPerPage - Math.min(rowsPerPage, data.length - (page * rowsPerPage));
    return (
      <Col md={12} lg={12}>
        <Card>
          <CardBody>
            <div className="material-table__wrap">
              <Table className="material-table">
                {
                  isLoading && (
                    <div className="ttable-spinner">
                      <div
                        style={{
                          position: 'relative',
                          top: '50%',
                          transform: 'translateY(-50%)'
                        }}
                      >
                        <TSpinner
                          loading
                        />
                      </div>
                    </div>
                  )
                }
                <MatTableHead
                  columns={columns}
                  numSelected={selected.length}
                  order={order}
                  orderBy={orderBy}
                  isSelectable={isSelectable}
                  onSelectAllClick={this.handleSelectAllClick}
                  onRequestSort={this.handleRequestSort}
                  rowCount={data.length}
                />
                <TableBody>
                  {data
                    // .sort(this.getSorting(order, orderBy))
                    // .slice(page * rowsPerPage, (page * rowsPerPage) + rowsPerPage)
                    .map((dataItem) => {
                      const isSelected = this.isSelected(dataItem.id);
                      //  {/* TODO you still need to call handleIdClick */}
                      return (
                        <TableRow
                          className="material-table__row"
                          role="checkbox"
                          onClick={event => this.handleClick(event, dataItem.id)}
                          // onClick={event => this.handleClick(event, d.id)}
                          aria-checked={isSelected}
                          tabIndex={-1}
                          key={`${dataItem.id}`}
                          selected={isSelected}
                        >
                          {this.renderItem(dataItem, isSelectable, isSelected)}
                        </TableRow>
                      );
                    })}
                  {emptyRows > 0 && (
                    <TableRow style={{ height: 49 * emptyRows }}>
                      <TableCell colSpan={6}/>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <TablePagination
              style={{display: hidePagination ? 'none' : 'block' }}
              component="div"
              className="material-table__pagination"
              count={totalCount}
              rowsPerPage={rowsPerPage}
              page={page}
              backIconButtonProps={{ 'aria-label': 'Previous Page' }}
              nextIconButtonProps={{ 'aria-label': 'Next Page' }}
              onChangePage={this.handleChangePage}
              onChangeRowsPerPage={this.handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 15, 50]}
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
  defaultRows: PropTypes.number,
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      displayName: PropTypes.string,
      label: PropTypes.string
    })
  ).isRequired,
  totalCount: PropTypes.number,
  handleIdClick: PropTypes.func.isRequired,
  handlePageChange: PropTypes.func,
  handleRowsChange: PropTypes.func,
  data: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number
      ])
    })
  ).isRequired,
  onSelect: PropTypes.func,
  selected: PropTypes.arrayOf(PropTypes.number),
  isSelectable: PropTypes.bool,
  omitFromSelect: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number
      ])
    })
  ),
  hidePagination: PropTypes.bool,
  isLoading: PropTypes.bool
};

TTable.defaultProps = {
  defaultRows: 10,
  totalCount: 5,
  order: 'asc',
  orderBy: 'id',
  selected: [],
  onSelect: () => {},
  isSelectable: false,
  omitFromSelect: [],
  handlePageChange: null,
  handleRowsChange: null,
  hidePagination: false,
  isLoading: false
};

export default TTable;
