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
      loads: props.loads,
      job: props.job
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
    const {loads, job} = {...this.state};
    // debugger;
    return (
      <Paper style={{overflowX: 'auto'}}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="left" style={{color: '#006F53', fontSize: 13}}>Details</TableCell>
              <TableCell align="left" style={{color: '#006F53', fontSize: 13}}>Load</TableCell>
              <TableCell align="left" style={{color: '#006F53', fontSize: 13}}>Driver Name</TableCell>
              <TableCell align="left" style={{color: '#006F53', fontSize: 13}}>Start Time</TableCell>
              <TableCell align="left" style={{color: '#006F53', fontSize: 13}}>End Time</TableCell>
              <TableCell align="left" style={{color: '#006F53', fontSize: 13}}>Tons Moved</TableCell>
              {job.rateType === 'Hour' && <TableCell align="left" style={{color: '#006F53', fontSize: 13}}>Hours Worked</TableCell>}
              <TableCell align="left" style={{color: '#006F53', fontSize: 13}}>Rate</TableCell>
              <TableCell align="left" style={{color: '#006F53', fontSize: 13}}>Total Cost</TableCell>
              <TableCell align="left" style={{color: '#006F53', fontSize: 13}}>Status</TableCell>
            </TableRow>
          </TableHead>
          {loads && (
            <TableBody>
              {loads.map((load, index) => (
                <LoadsExpandableRow key={load.id} load={load} index={index} job={job}/>
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
  loads: PropTypes.array.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  job: PropTypes.object.isRequired
};

LoadsTable.defaultProps = {};

export default LoadsTable;
