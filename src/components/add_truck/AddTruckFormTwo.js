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

class AddTruckFormTwo extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      startDate: new Date(1550016000000),
      endDate: '',
      isAvailable: false
    };
    this.handleInputChange = this.handleInputChange.bind(this);
    this.startDateChange = this.startDateChange.bind(this);
    this.endDateChange = this.endDateChange.bind(this);
    this.makeAvailable = this.makeAvailable.bind(this);
    this.availableButtonColor = this.availableButtonColor.bind(this);
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
    this.setState({ startDate: data.value });
  }

  endDateChange(data) {
    this.setState({ startDate: data.value });
  }

  async saveAddress() {
    /*
    // use like FORM pages in others
    */
  }

  handleSubmit(menuItem) {
    if (menuItem) {
      this.setState({ [`goTo${menuItem}`]: true });
    }
  }

  render() {
    const { handleSubmit, p } = this.props;
    const { startDate, endDate, isAvailable } = this.state;
    // let fakeDate = new Date();
    const fakeDate = 1550016000000;
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
              onSubmit={handleSubmit}
            >

              <Row>
                <div className="col-md-12 form__form-group">
                  <h4 className="subhead">
                    Truck Availability IS:
                    {isAvailable}
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
                        givenDate: fakeDate
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
                        onChange: this.startDateChange,
                        name: 'endDate',
                        value: { endDate },
                        givenDate: fakeDate
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
                <div className="col-md-4 form__form-group">
                  {/* color={availableButtonColor(true)} */}
                  <Button color={this.availableButtonColor(isAvailable)} type="button" onClick={this.makeAvailable} className="previous">
                    Available
                  </Button>
                </div>
                <div className="col-md-5 form__form-group">
                  {/* color={availableButtonColor(false)} */}
                  <Button color={this.availableButtonColor(!isAvailable)} type="button" onClick={this.makeAvailable} className="previous">
                    Un-available
                  </Button>
                </div>
              </Row>

              <Row>
                <div className="col-md-12 form__form-group">
                  <ButtonToolbar className="form__button-toolbar wizard__toolbar">
                    <Button color="primary" type="button" className="previous">Back</Button>
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
  /*
  equipment: PropTypes.shape({
    id: PropTypes.number
  }),
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string
    })
  }),
  */
  p: PropTypes.number,
  // form: 'horizontal_form_validation_two', // a unique identifier for this form
  // validate,
  handleSubmit: PropTypes.func.isRequired
};

AddTruckFormTwo.defaultProps = {
  p: PropTypes.number
};

export default AddTruckFormTwo;
