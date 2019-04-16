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
import * as PropTypes from 'prop-types';
import TDateTimePicker from '../common/TDateTimePicker';
// import { start } from 'repl';

class AddTruckFormTwo extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      startDate: new Date(),
      endDate: new Date(),
      reqHandlerStartDate: {
        touched: false,
        error: 'Please select a start date for when your truck is available'
      },
      reqHandlerEndDate: {
        touched: false,
        error: 'Please select an end date for when your truck is available'
      },
      isAvailable: true,
      redir: false
    };
    this.handleInputChange = this.handleInputChange.bind(this);
    this.startDateChange = this.startDateChange.bind(this);
    this.endDateChange = this.endDateChange.bind(this);
    this.makeAvailable = this.makeAvailable.bind(this);
    this.availableButtonColor = this.availableButtonColor.bind(this);
    this.saveAndGoBack = this.saveAndGoBack.bind(this);
  }

  componentDidMount() {
    // check fo cached info
    const { getAvailiabilityFullInfo } = this.props;
    const preloaded = getAvailiabilityFullInfo();
    if (Object.keys(preloaded).length > 0) {
      this.setState({
        isAvailable: preloaded.info.isAvailable,
        startDate: preloaded.info.startDate,
        endDate: preloaded.info.endDate
      },
      function wait() { // wait until it loads
        this.saveAvailabilityInfo(false);
      });
    } else {
      // console.log(47);
    }
  }

  componentWillReceiveProps(nextProps) {
    const {validateResTwo} = this.props;
    if (nextProps.validateOnTabTwoClick) {
      if (this.isFormValid()) {
        validateResTwo(true);
        this.saveAvailabilityInfo(true);
      } else {
        validateResTwo(false);
      }
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

  unavailableButtonColor(isAvailable) {
    return isAvailable ? 'minimal' : 'warning';
  }

  makeAvailable() {
    let { isAvailable } = this.state;

    if (isAvailable === 1 || isAvailable === true) {
      isAvailable = false;
    } else if (isAvailable === 0 || isAvailable === false) {
      isAvailable = true;
    }

    this.setState({ isAvailable },
      function wait() {
        this.saveAvailabilityInfo(false);
      });
  }

  startDateChange(data) {
    const { reqHandlerStartDate } = this.state;

    this.setState({ startDate: data },
      function wait() {
        this.saveAvailabilityInfo(false);
      });

    this.setState({
      reqHandlerStartDate: Object.assign({}, reqHandlerStartDate, {
        touched: false
      })
    });
  }

  endDateChange(data) {
    const { reqHandlerEndDate } = this.state;
    this.setState({ endDate: data },

      function wait() {
        this.saveAvailabilityInfo(false);
      });

    this.setState({
      reqHandlerEndDate: Object.assign({}, reqHandlerEndDate, {
        touched: false
      })
    });
  }

  isFormValid() {
    const truck = this.state;
    const {
      reqHandlerStartDate,
      reqHandlerEndDate
    } = this.state;
    let isValid = true;
    if (truck.startDate === null || truck.startDate.length === 0) {
      this.setState({
        reqHandlerStartDate: Object.assign({}, reqHandlerStartDate, {
          touched: true
        })
      });
      isValid = false;
    }

    if (truck.endDate === null || truck.endDate.length === 0) {
      this.setState({
        reqHandlerEndDate: Object.assign({}, reqHandlerEndDate, {
          touched: true
        })
      });
      isValid = false;
    }

    if (isValid) {
      return true;
    }
    return false;
  }

  saveAvailabilityInfo(redir) {
    const { onAvailabilityFullInfo } = this.props;

    if (!this.isFormValid()) {
      return;
    }

    this.setState({ redir },
      function wait() {
        onAvailabilityFullInfo(this.state);
        this.handleSubmit('Availability');
      });
  }

  async saveAvailability(e) {
    e.preventDefault();
    e.persist();
    this.saveAvailabilityInfo(true);
  }

  saveAndGoBack() {
    const { previousPage } = this.props;
    this.saveAvailabilityInfo(false);
    previousPage();
  }

  handleSubmit(menuItem) {
    // // console.log(menuItem);
    if (menuItem) {
      this.setState({ [`goTo${menuItem}`]: true });
    }
  }

  render() {
    const { p, onClose } = this.props;
    const {
      startDate,
      endDate,
      isAvailable,
      reqHandlerStartDate,
      reqHandlerEndDate
    } = this.state;

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
            {/*  onSubmit={handleSubmit} */}
            <form
              className="form form--horizontal addtruck__form"
              onSubmit={e => this.saveAvailability(e)}
            >

              <Row className="col-md-12">
                <div className="col-md-12 form__form-group">
                  <h3 className="subhead">
                    Set availability by date range
                  </h3>
                  <br/>
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
                    onChange={this.startDateChange}
                    meta={reqHandlerStartDate}
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
                    onChange={this.endDateChange}
                    meta={reqHandlerEndDate}
                  />
                </div>
              </Row>

              <Row className="col-md-12">
                <h3 className="subhead">Availability</h3>
                <br/>
                <div className="">
                  {/* color={availableButtonColor(true)} */}
                  <Button color={this.availableButtonColor(!isAvailable)} type="button" onClick={this.makeAvailable} className="previous">
                    Available
                  </Button>
                  <Button color={this.unavailableButtonColor(isAvailable)} type="button" onClick={this.makeAvailable} className="previous">
                    Un-available
                  </Button>
                </div>
              </Row>

              <Row className="col-md-12">
                <hr className="bighr" />
              </Row>

              <Row className="col-md-12">
                <ButtonToolbar className="col-md-6 wizard__toolbar">
                  <Button type="button" className="tertiaryButton" onClick={onClose}>
                    Cancel
                  </Button>
                </ButtonToolbar>
                <ButtonToolbar className="col-md-6 wizard__toolbar right-buttons">
                  <Button type="button" className="secondaryButton" onClick={this.saveAndGoBack} >Back</Button>
                  <Button type="submit" className="primaryButton">Next</Button>
                </ButtonToolbar>
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
  onAvailabilityFullInfo: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  validateResTwo: PropTypes.any, // eslint-disable-line react/forbid-prop-types
  validateOnTabTwoClick: PropTypes.any // eslint-disable-line react/forbid-prop-types
};

AddTruckFormTwo.defaultProps = {
  p: PropTypes.number,
  // previousPage: PropTypes.func.isAvailable,
  validateResTwo: null,
  validateOnTabTwoClick: null
};

export default AddTruckFormTwo;
