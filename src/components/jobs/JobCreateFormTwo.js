import React, { PureComponent } from 'react';
import {
  Card,
  CardBody,
  Col,
  Button,
  ButtonToolbar,
  Row
} from 'reactstrap';
import moment from 'moment';
import PropTypes from 'prop-types';
// import validate from '../common/validate ';

class JobCreateFormTwo extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      // ...equipment,
      id: 0, // for use if we are editing
      driversId: 0, // for use if we are editing
      defaultDriverId: 0 // for use if we are editing      
    };
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleMultiChange = this.handleMultiChange.bind(this);
    this.selectChange = this.selectChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  async componentDidMount() {
    await this.fetchMaterials();
  }

  handleMultiChange(data) {
    const { reqHandlerMaterials } = this.state;
    this.setState({
      reqHandlerMaterials: Object.assign({}, reqHandlerMaterials, {
        touched: false
      })
    });
    this.setState({ selectedMaterials: data });
  }

  selectChange(data) {
    const { reqHandlerTruckType } = this.state;
    this.setState({
      reqHandlerTruckType: Object.assign({}, reqHandlerTruckType, {
        touched: false
      })
    });
    this.setState({ truckType: data.value });
  }

  isFormValid() {
    const truck = this.state;
    const {
      /*
      ratesByBoth,
      ratesByTon,
      ratesByHour
      */
    } = this.state;
    let isValid = true;

    this.setState({
      /*
      reqHandlerTruckType: { touched: false },
      reqHandlerMaterials: { touched: false },
      */
    });

    /*
    if (truck.truckType.length === 0) {
      this.setState({
        reqHandlerTruckType: {
          touched: true,
          error: 'Please select the type of truck you are adding'
        }
      });
      isValid = false;
    }
    */

    if (isValid) {
      return true;
    }

    return false;
  }

  async handleSubmit(menuItem) {
    if (menuItem) {
      this.setState({ [`goTo${menuItem}`]: true });
    }
  }

  saveTruckInfo(redir) {
    console.log('se');
  }

  async saveTruck(e) {
    e.preventDefault();
    e.persist();

    if (!this.isFormValid()) {
      // this.setState({ maxCapacityTouched: true });
      return;
    }

    this.saveTruckInfo(true);
  }

  handleInputChange(e) {
    let { value } = e.target;
    let reqHandler = '';
    if (e.target.name === 'ratesByBoth') {
      value = e.target.checked ? Number(1) : Number(0);
      if (e.target.checked) {
        this.setState({
          ratesByHour: 1,
          ratesByTon: 1
        });
      } else {
        this.setState({
          ratesByHour: 0,
          ratesByTon: 0
        });
      }
    }
    if (e.target.name === 'ratesByHour' && e.target.checked) {
      this.setState({ ratesByTon: 0 });
    }
    if (e.target.name === 'ratesByTon' && e.target.checked) {
      this.setState({ ratesByHour: 0 });
    }
    if (e.target.name === 'maxCapacity') {
      // this.RenderField('renderField', 'coman', 'number', 'Throw error');
    }

    // We take the input name prop to set the respective requiredHandler
    if (e.target.name === 'ratesCostPerHour') {
      reqHandler = 'reqHandlerMinRate';
    } else if (e.target.name === 'minOperatingTime') {
      reqHandler = 'reqHandlerMinTime';
    } else if (e.target.name === 'ratesCostPerTon') {
      reqHandler = 'reqHandlerCostTon';
    } else if (e.target.name === 'maxCapacity') {
      reqHandler = 'reqHandlerMaxCapacity';
    } else if (
      e.target.name === 'ratesByTon'
      || e.target.name === 'ratesByHour'
      || e.target.name === 'ratesByBoth'
    ) {
      reqHandler = 'reqHandlerChecks';
    }
    // Then we set the touched prop to false, hiding the error label
    this.setState({
      [reqHandler]: Object.assign({}, reqHandler, {
        touched: false
      })
    });

    this.setState({ [e.target.name]: value });
  }

  // Pull materials
  async fetchMaterials() {
    this.saveTruckInfo(false);
    // let's cache this info, in case we want to go back
  }

  handleImg(e) {
    return e;
  }

  render() {
    const {
      // multiInput,
      // multiMeta,
    } = this.state;
    const { onClose } = this.props;
    return (
      <Col md={12} lg={12}>
        <Card>
          <CardBody>
            <div className="card__title">
              <h5 className="bold-text">
                Welcome to Trelar, Lets add a truck so customers can find you
              </h5>
            </div>

            {/* this.handleSubmit  */}
            <form
              className="form form--horizontal addtruck__form"
              onSubmit={e => this.saveTruck(e)}
            >
              Second tab
              <Row className="col-md-12">
                <hr className="bighr"/>
              </Row>

              <Row className="col-md-12">
                <hr />
              </Row>

              <Row className="col-md-12">
                <ButtonToolbar className="col-md-6 wizard__toolbar">
                  <Button color="minimal" className="btn btn-outline-secondary" type="button" onClick={onClose}>
                    Cancel
                  </Button>
                </ButtonToolbar>
                <ButtonToolbar className="col-md-6 wizard__toolbar right-buttons">
                  <Button color="primary" type="button" disabled
                          className="previous"
                  >
                    Back
                  </Button>
                  <Button color="primary" type="submit" className="next">Next</Button>
                </ButtonToolbar>
              </Row>

            </form>
          </CardBody>
        </Card>
      </Col>
    );
  }
}

JobCreateFormTwo.propTypes = {
  // getJobFullInfo: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
};

JobCreateFormTwo.defaultProps = {
  //
};

export default JobCreateFormTwo;
