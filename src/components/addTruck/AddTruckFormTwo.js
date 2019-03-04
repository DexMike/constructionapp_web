import React, { PureComponent } from 'react';
import {
  Card,
  CardBody,
  Col,
  Button,
  ButtonToolbar,
  Row
} from 'reactstrap';
// import EyeIcon from 'mdi-react/EyeIcon';
import PropTypes from 'prop-types';
import TDateTimePicker from '../common/TDateTimePicker';
// import { start } from 'repl';

class AddTruckFormTwo extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      startDate: new Date(),
      endDate: new Date(),
      isAvailable: false
    };
    this.handleInputChange = this.handleInputChange.bind(this);
    this.startDateChange = this.startDateChange.bind(this);
    this.endDateChange = this.endDateChange.bind(this);
    this.makeAvailable = this.makeAvailable.bind(this);
    this.availableButtonColor = this.availableButtonColor.bind(this);
  }

  componentDidMount() {
    // check fo cached info
    const { getAvailiabilityFullInfo } = this.props;
    const preloaded = getAvailiabilityFullInfo();
    if (Object.keys(preloaded).length > 0) {
      this.setState({
        isAvailable: preloaded.info.isAvailable
      });
    }
  }

  // on the login I can find something like this
  showPassword(e) {
    e.preventDefault();
    const { showPassword } = this.state;
    this.setState({
      showPassword
    });
  }

  handleInputChange(e) {
    let { value } = e.target;
    if (e.target.name === 'isArchived') {
      value = e.target.checked ? Number(1) : Number(0);
    }
    this.setState({ [e.target.name]: value });
  }

  availableButtonColor(isAvailable) {
    return isAvailable ? 'minimal' : 'success';
  }

  makeAvailable() {
    const { isAvailable } = this.state;
    const newValue = !isAvailable;
    this.setState({ isAvailable: newValue });
  }

  startDateChange(data) {
    console.log(data);
    this.setState({ startDate: data });
  }

  endDateChange(data) {
    this.setState({ endDate: data });
  }

  async saveAvailability(e) {
    e.preventDefault();
    e.persist();
    const { onAvailabilityFullInfo } = this.props;
    onAvailabilityFullInfo(this.state);
    this.handleSubmit('Truck');
  }

  /*
  async saveUser(e) {
    e.preventDefault();
    e.persist();
    const { onUserFullInfo } = this.props;
    const availability = this.state;
    onUserFullInfo(availability);
    this.handleSubmit('User');
  }
  */

  handleSubmit(menuItem) {
    if (menuItem) {
      this.setState({ [`goTo${menuItem}`]: true });
    }
  }

  render() {
    const { p, previousPage } = this.props;
    const { startDate, endDate, isAvailable } = this.state;

    const today = new Date();
    const date = new Date();
    let tomorrowDate = date.setDate(date.getDate() + 1);
    let currentDate = today.getTime();

    // cached?
    const { getAvailiabilityFullInfo } = this.props;
    const preloaded = getAvailiabilityFullInfo();
    if (Object.keys(preloaded).length > 0) {
      tomorrowDate = preloaded.info.endDate.getTime();
      currentDate = preloaded.info.startDate.getTime();
    } else {
      tomorrowDate = date.setDate(date.getDate() + 1);
      currentDate = today.getTime();
    }

    return (
      <Col md={12} lg={12}>
        <Card>
          <CardBody>
            <div className="card__title">
              <h5 className="bold-text">
                Configure your schedule (p)
              </h5>
            </div>

            {/*  onSubmit={handleSubmit} */}
            <form
              className="form form--horizontal addtruck__form"
              onSubmit={e => this.saveAvailability(e)}
            >

              <Row>
                <div className="col-md-12 form__form-group">
                  <h4 className="subhead">
                    <br />
                    Set availability by date range
                  </h4>
                </div>

                <div className="col-md-6 form__form-group">
                  <span className="form__form-group-label">Start</span>
                  <TDateTimePicker
                    input={
                      {
                        onChange: this.startDateChange,
                        name: 'startDate',
                        value: { startDate },
                        givenDate: currentDate
                      }
                    }
                    onChange={this.handleInputChange}
                  />
                  <input type="hidden" value={p} />
                </div>
                <div className="col-md-6 form__form-group">
                  <span className="form__form-group-label">End</span>
                  <TDateTimePicker
                    input={
                      {
                        onChange: this.endDateChange,
                        name: 'endDate',
                        value: { endDate },
                        givenDate: tomorrowDate
                      }
                    }
                    onChange={this.handleInputChange}
                  />
                </div>

              </Row>

              <Row className="col-md-12">
                <hr className="bighr" />
              </Row>

              <Row className="col-md-12">
                <div className="col-md-3 form__form-group">
                  <span className="form__form-group-label">Toggle Availability</span>
                </div>
                <div className="col-md-9 form__form-group">
                  {/* color={availableButtonColor(true)} */}
                  <Button color={this.availableButtonColor(isAvailable)} type="button" onClick={this.makeAvailable} className="previous">
                    Available
                  </Button>
                  <Button color={this.availableButtonColor(!isAvailable)} type="button" onClick={this.makeAvailable} className="previous">
                    Un-available
                  </Button>
                </div>
              </Row>

              <Row>
                <div className="col-md-12 form__form-group">
                  <ButtonToolbar className="form__button-toolbar wizard__toolbar">
                    <Button color="primary" type="button" className="previous" onClick={previousPage} >Back</Button>
                    <Button color="primary" type="submit" className="next">Next</Button>
                  </ButtonToolbar>
                </div>
              </Row>

            </form>

          </CardBody>
        </Card>
      </Col>
    );
  }
}

AddTruckFormTwo.propTypes = {
  p: PropTypes.number,
  previousPage: PropTypes.func.isRequired,
  getAvailiabilityFullInfo: PropTypes.func.isRequired,
  onAvailabilityFullInfo: PropTypes.func.isRequired
};

AddTruckFormTwo.defaultProps = {
  p: PropTypes.number
  // previousPage: PropTypes.func.isAvailable,
};

export default AddTruckFormTwo;
