import React, { PureComponent } from 'react';
import {
  Card,
  CardBody,
  Col,
  Button,
  ButtonToolbar,
  Row,
  Container
} from 'reactstrap';
// import moment from 'moment';
import PropTypes from 'prop-types';
import ProfileService from '../../api/ProfileService';
import AddressService from '../../api/AddressService';
import JobService from '../../api/JobService';
import BidService from '../../api/BidService';
import GroupService from '../../api/GroupService';
import TCheckBox from '../common/TCheckBox';
import './jobs.css';

class JobCreateFormTwo extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      sendToMkt: true,
      sendToFavorites: true,
      showSendtoFavorites: false,
      loaded: false
    };
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  async componentDidMount() {
    // does this customer has favorites?
    const profile = await ProfileService.getProfile();
    const favorites = await GroupService.getGroupByFavoriteAndCompanyId(profile.companyId);
    if (Number(favorites[0]) > 0) {
      this.setState({
        showSendtoFavorites: true
      });
    }
    this.setState({ loaded: true });
  }

  isFormValid() {
    const isValid = true;

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

  async saveJob(e) {
    e.preventDefault();
    e.persist();
    const { firstTabData } = this.props;
    const d = firstTabData();

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
    const { value } = e.target;
    this.setState({ [e.target.name]: value });
  }

  render() {
    const {
      sendToMkt,
      sendToFavorites,
      showSendtoFavorites,
      loaded
    } = this.state;
    const { onClose } = this.props;
    if (loaded) {
      return (
        <Col md={12} lg={12}>
          <Card>
            <CardBody>

              {/* this.handleSubmit  */}
              <form
                className="form form--horizontal addtruck__form"
                onSubmit={e => this.saveJob(e)}
              >
                <Row className="col-md-12">

                  <div className={showSendtoFavorites ? 'col-md-1 form__form-group' : 'hidden'}>
                    <TCheckBox
                      onChange={this.handleInputChange}
                      name="sendToMkt"
                      value={!!sendToFavorites}
                    />
                  </div>
                  <div className="col-md-11 form__form-group">
                    <h4 className="talign">
                      Send to Favorites
                    </h4>
                  </div>
                </Row>

                <Row className="col-md-12">
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
    return (
      <Container>
        Loading...
      </Container>
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
