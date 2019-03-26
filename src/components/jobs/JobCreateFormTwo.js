import React, { PureComponent } from 'react';
import {
  Card,
  CardBody,
  Col,
  Button,
  ButtonToolbar,
  Row
} from 'reactstrap';
// import moment from 'moment';
import PropTypes from 'prop-types';
import ProfileService from '../../api/ProfileService';
import AddressService from '../../api/AddressService';
import JobService from '../../api/JobService';
import BidService from '../../api/BidService';
import TCheckBox from '../common/TCheckBox';
import './jobs.css';

class JobCreateFormTwo extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      sendToMkt: true
    };
    this.handleInputChange = this.handleInputChange.bind(this);
    // this.jobChangeDate = this.jobChangeDate.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  async componentDidMount() {
    // await this.fetchMaterials();
  }

  isFormValid() {
    /*
    const truck = this.state;
    const {
      ratesByBoth,
      ratesByTon,
      ratesByHour
    } = this.state;
    */
    let isValid = true;

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

  async saveTruck(e) {
    e.preventDefault();
    e.persist();
    const { firstTabData } = this.props;
    const d = firstTabData();
    console.log(d);

    // start location
    const address1 = {
      type: 'Delivery',
      name: 'Delivery Start Location',
      companyId: 19, // 'this should change',
      address1: d.startLocationAddress1,
      address2: d.startLocationAddress2,
      city: d.startLocationCity,
      state: d.startLocationState,
      zipCode: d.startLocationZip
    };

    // end location
    const address2 = {
      type: 'Delivery',
      name: 'Delivery End Location',
      companyId: 19, // 'this should change',
      address1: d.endLocationAddress1,
      address2: d.endLocationAddress2,
      city: d.endLocationCity,
      state: d.endLocationState,
      zipCode: d.endLocationZip
    };

    // save two addresses
    const startAddress = await AddressService.createAddress(address1);
    const endAddress = await AddressService.createAddress(address2);

    // job
    const profile = await ProfileService.getProfile();
    const job = {
      companiesId: profile.companyId,
      name: d.name,
      status: 'New', // check if this one is alright
      startAddress: startAddress.id,
      endAddress: endAddress.id,
      rateType: 'Ton',
      rate: d.tonnage,
      notes: d.instructions,
      rateEstimate: 0,
      rateTotal: 0,
      numberOfTrucks: d.capacity // check if this one is alright
    };

    const newJob = await JobService.createJob(job);

    // bid
    const bid = {
      jobId: newJob.id,
      hasCustomerAccepted: 1,
      hasSchedulerAccepted: 1,
      status: 'New',
      userId: profile.userId,
      rateType: 'Ton',
      rate: 0,
      rateEstimate: 0,
      notes: d.instructions
    };

    await BidService.createBid(bid);

    // return false;
    const { onClose } = this.props;
    onClose();
    /*
    if (!this.isFormValid()) {
      // this.setState({ maxCapacityTouched: true });
      return;
    }
    */
  }

  handleInputChange(e) {
    console.log(e);
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

  render() {
    const {
      sendToMkt
    } = this.state;
    const { onClose } = this.props;
    return (
      <Col md={12} lg={12}>
        <Card>
          <CardBody>

            {/* this.handleSubmit  */}
            <form
              className="form form--horizontal addtruck__form"
              onSubmit={e => this.saveTruck(e)}
            >
              <Row className="col-md-12">
                {/* FOURTH ROW */}
                <div className="col-md-1 form__form-group">
                  <TCheckBox
                    onChange={this.handleInputChange}
                    name="sendToMkt"
                    value={!!sendToMkt}
                  />
                </div>
                <div className="col-md-11 form__form-group">
                  <h4 className="talign">
                    Yes! Send to Trelar Marketplace
                  </h4>
                  * Note - This job will be sent to all Trelar Partners for review
                </div>
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
                  {/*
                  <Button color="primary" type="button" disabled
                          className="previous"
                  >
                    Back
                  </Button>
                  */}
                  <Button
                    color="primary"
                    type="submit"
                    className="next"
                  >
                    Send Job
                  </Button>
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
  onClose: PropTypes.func.isRequired,
  firstTabData: PropTypes.func.isRequired
};

JobCreateFormTwo.defaultProps = {
  //
};

export default JobCreateFormTwo;
