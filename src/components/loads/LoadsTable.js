import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Table from '@material-ui/core/Table/index';
import TableBody from '@material-ui/core/TableBody/index';
import TableCell from '@material-ui/core/TableCell/index';
import TableHead from '@material-ui/core/TableHead/index';
import TableRow from '@material-ui/core/TableRow/index';
import Paper from '@material-ui/core/Paper/index';
import LoadsExpandableRow from './LoadsExpandableRow';


class LoadsTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loads: props.loads
    };
    this.toggle = this.toggle.bind(this);
  }

  toggle() {
    const {expanded} = {...this.state};
    this.setState({
      expanded: !expanded
    });
  }

  render() {
    const {loads} = {...this.state};
    return (
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="left" style={{color: '#006F53', fontSize: 16}}>View Details</TableCell>
              <TableCell align="left" style={{color: '#006F53', fontSize: 16}}>Load</TableCell>
              <TableCell align="left" style={{color: '#006F53', fontSize: 16}}>Driver Name</TableCell>
              <TableCell align="left" style={{color: '#006F53', fontSize: 16}}>Start Time</TableCell>
              <TableCell align="left" style={{color: '#006F53', fontSize: 16}}>End Time</TableCell>
              <TableCell align="left" style={{color: '#006F53', fontSize: 16}}>Status</TableCell>
            </TableRow>
          </TableHead>
          {loads && (
            <TableBody>
              {loads.map((load, index) => (
                <LoadsExpandableRow key={load.id} load={load} index={index}/>
              ))}
            </TableBody>
          )
          }
        </Table>
      </Paper>
    );
  }
}

LoadsTable.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  loads: PropTypes.array.isRequired
};

LoadsTable.defaultProps = {};

export default LoadsTable;
