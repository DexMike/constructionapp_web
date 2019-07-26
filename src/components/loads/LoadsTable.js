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
      job: props.job,
      expandedLoad: 0 // saving just to relay to grandparent
    };
    this.toggle = this.toggle.bind(this);
    this.onRowExpanded = this.onRowExpanded.bind(this);
    // this.onRowContracted = this.onRowContracted.bind(this);
  }

  onRowExpanded(rowId, isExpanded) {
    const { expandedRow } = this.props;
    if (!isExpanded) {
      this.setState({
        expandedLoad: 0
      }, function loaded() {
        expandedRow(0);
      });
    } else {
      this.setState({
        expandedLoad: rowId
      }, function loaded() {
        expandedRow(rowId);
      });
    }
    this.contractAll(rowId);
  }

  toggle() {
    const {expanded} = {...this.state};
    this.setState({
      expanded: !expanded
    });
  }
  /**/

  contractAll(butId) {
    const { loads } = this.state;
    for (const load of loads) {
      if (load) {
        if (load.id !== butId) {
          load.isExpanded = false;
        } else {
          load.isExpanded = true;
        }
      }
    }
    this.setState({
      loads
    });
  }

  render() {
    const {loads, job, expandedLoad} = {...this.state};
    // debugger;
    return (
      <Paper style={{overflowX: 'auto'}}>
        {/* EXPANDED: {expandedLoad} */}
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
                <LoadsExpandableRow
                  key={load.id}
                  load={load}
                  index={index}
                  job={job}
                  onRowExpanded={this.onRowExpanded}
                  isExpanded={load.isExpanded}
                />
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
  job: PropTypes.object.isRequired,
  expandedRow: PropTypes.func
};

LoadsTable.defaultProps = {
  expandedRow: null
};

export default LoadsTable;
