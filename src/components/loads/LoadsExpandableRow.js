import React, {Component} from 'react';
import PropTypes from 'prop-types';
import TableCell from '@material-ui/core/TableCell/index';
import TableRow from '@material-ui/core/TableRow/index';
import IconButton from '@material-ui/core/IconButton';
import moment from 'moment';
import {Container, Row, Col, Button} from 'reactstrap';
import UserService from '../../api/UserService';

class LoadsExpandableRow extends Component {
  constructor(props) {
    super(props);
    this.state = {
      load: props.load,
      loaded: false, // if page is loading
      index: props.index,
      expanded: false,
      driver: null
    };
    this.toggle = this.toggle.bind(this);
  }

  async componentDidMount() {
    const {props} = this;
    const driver = await UserService.getDriverByBookingId(props.load.bookingId);
    this.setState({driver, loaded: true});
  }

  toggle() {
    const {expanded} = {...this.state};
    this.setState({
      expanded: !expanded
    });
  }

  render() {
    const {loaded} = {...this.state};
    if (loaded) {
      const {load, index, expanded, driver} = {...this.state};
      const startTime = (!load.startTime ? null : moment(new Date(load.startTime)).format('lll'));
      const endTime = (!load.endTime ? null : moment(new Date(load.endTime)).format('lll'));
      let statusColor = '';
      switch (load.loadStatus) {
        case 'Approved':
          statusColor = '#006F53';
          break;
        case 'Disputed':
          statusColor = 'red';
          break;
        case 'Submitted':
          statusColor = 'orange';
          break;
        case 'Ended':
          statusColor = 'blue';
          break;
        default:
          statusColor = 'black';
      }
      return (
        <React.Fragment>
          <TableRow key={load.id}>
            <TableCell component="th" scope="row" align="left">
              <IconButton onClick={this.toggle}
                          style={{color: (!expanded ? '#006F53' : 'red')}}
              >{!expanded ? '+' : '-'}
              </IconButton>
            </TableCell>
            <TableCell align="left">{index + 1}</TableCell>
            <TableCell align="left">{!driver.id ? 'Not Available' : `${driver.firstName} ${driver.lastName}`}</TableCell>
            <TableCell align="left">{(!startTime ? 'Error creating load' : startTime)}</TableCell>
            <TableCell align="left"
                       style={{fontStyle: !endTime ? 'italic' : 'normal'}}>{(!endTime ? 'In Progress' : endTime)}
            </TableCell>
            <TableCell align="left" style={{color: statusColor}}>{load.loadStatus}</TableCell>
          </TableRow>
          {expanded && (
            <TableRow>
              <TableCell colspan="6" style={{'text-align': 'center', padding: 20}}>
                <Container style={{backgroundColor: 'rgb(219, 219, 219)', borderRadius: 3}}>
                  <Row style={{paddingTop: 20}}>
                    <Col md={2}>
                      <p style={{color: '#006F53', fontSize: 20}}>
                        Load {index + 1}
                      </p>
                    </Col>
                    <Col md={7}/>
                    <Col md={3}>
                      <p style={{color: statusColor, fontSize: 20}}>
                        {load.loadStatus}
                      </p>
                    </Col>
                  </Row>
                  <hr/>
                  {load.loadStatus === 'Submitted' && (
                  <Row justify="between">
                    <Col md={3}>
                      {/*<p style={{fontSize: 15, color: 'black', paddingLeft: 10}}>*/}
                      {/*  Driver Name: {`${driver.firstName} ${driver.lastName}`}*/}
                      {/*</p>*/}
                    </Col>
                    <Col md={5}/>
                      <Col md={4}>
                        <Button
                          // onClick={this.toggleNewJobModal}
                          type="button"
                          className="primaryButton"
                        >
                          DISPUTE
                        </Button>
                        <Button
                          // onClick={this.toggleNewJobModal}
                          type="button"
                          className="secondaryButton"
                        >
                          APPROVE
                        </Button>
                      </Col>
                  </Row>
                  )
                  }
                  {/*<Row justify="between" style={{paddingTop: 20}}>*/}
                  {/*  <Col md={4}>*/}
                  {/*    <h4 style={{fontSize: 15, color: '#006F53', paddingLeft: 10}}>*/}
                  {/*      Route taken*/}
                  {/*    </h4>*/}
                  {/*  </Col>*/}
                  {/*  <Col md={4}>*/}
                  {/*    <h4 style={{fontSize: 15, color: '#006F53', paddingLeft: 10}}>*/}
                  {/*      Ticket*/}
                  {/*    </h4>*/}
                  {/*  </Col>*/}
                  {/*  <Col md={4}>*/}
                  {/*    <h4 style={{fontSize: 15, color: '#006F53', paddingLeft: 10}}>*/}
                  {/*      Signature*/}
                  {/*    </h4>*/}
                  {/*  </Col>*/}
                  {/*</Row>*/}
                </Container>
              </TableCell>
            </TableRow>
          )
          }
        </React.Fragment>
      );
    }
    return (
      <Container>
        Loading...
      </Container>
    );
  }
}

LoadsExpandableRow.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  load: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired
};

LoadsExpandableRow.defaultProps = {};

export default LoadsExpandableRow;
