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
import TwilioService from '../../api/TwilioService';
import './jobs.css';

class JobCreateFormTwo extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      sendToMkt: true,
      sendToFavorites: true,
      showSendtoFavorites: false,
      favoriteCompanies: [],
      favoriteAdminTels: [],
      loaded: false
    };
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  async componentDidMount() {
    // does this customer has favorites?
    const profile = await ProfileService.getProfile();
    const favorites = await GroupService.getGroupListByUserName(profile.userId);

    // now that we have the companies, let's figure out the admins
    const favoriteAdminTels = await GroupService.getGroupAdminsTels(favorites);
    // console.log(favoriteAdminTels);

    // are there any favorite companies?
    if (favorites.length > 0) {
      this.setState({
        showSendtoFavorites: true,
        favoriteCompanies: favorites,
        favoriteAdminTels
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
    const {
      favoriteCompanies,
      favoriteAdminTels,
      showSendtoFavorites,
      sendToFavorites
    } = this.state;
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
    const startAddress = await AddressService.createAddress(address1);

    // end location
    let endAddress = null;
    if (d.rateTab === 2) {
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
      endAddress = await AddressService.createAddress(address2);
    }

    // job p
    const profile = await ProfileService.getProfile();
    const job = {
      companiesId: profile.companyId,
      name: d.name,
      status: 'New', // check if this one is alright
      isFavorited: showSendtoFavorites,
      startAddress: startAddress.id,
      endAddress: endAddress.id,
      equipmentType: d.truckType.value,
      rateType: 'Ton',
      rate: d.tonnage,
      notes: d.instructions,
      rateEstimate: 0,
      rateTotal: 0,
      numberOfTrucks: d.capacity // check if this one is alright
    };
    const newJob = await JobService.createJob(job);
    // return false;

    // create bids if this user has favorites:
    if (showSendtoFavorites && sendToFavorites) {
      const results = [];
      for (const companyId of favoriteCompanies) {
        // bid
        const bid = {
          jobId: newJob.id,
          userId: profile.userId,
          companyCarrierId: companyId,
          hasCustomerAccepted: 1,
          hasSchedulerAccepted: 0,
          status: 'New',
          rateType: 'Ton',
          rate: 0,
          rateEstimate: 0,
          notes: d.instructions
        };
        results.push(BidService.createBid(bid));
      }
      await Promise.all(results);

      // now let's send them an SMS
      const allSms = [];
      for (const adminIdTel of favoriteAdminTels) {
        // send only to Jake
        if (adminIdTel === '6129990787') {
          console.log('>>Sending SMS to jakje...');
          const notification = {
            to: adminIdTel,
            body: '🚚 You have a new job offer!, please log in to https://www.mytrelar.com'
          };
          allSms.push(TwilioService.createSms(notification));
        }
      }
      await Promise.all(allSms);
    }

    // return false;
    const { onClose } = this.props;
    onClose();
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
                  <div className="col-md-3 form__form-group">
                    Send Job in
                  </div>
                  <div className="col-md-3 form__form-group">
                    <input
                      name="delay"
                      type="number"
                      placeholder="0"
                    />
                  </div>
                  <div className="col-md-6 form__form-group">
                    <Button color="minimal" className="btn btn-outline-secondary" type="button">
                      Hours
                    </Button>
                    <Button color="secondary" className="btn btn-outline-secondary" type="button">
                      Days
                    </Button>
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
  onClose: PropTypes.func.isRequired,
  firstTabData: PropTypes.func.isRequired
};

JobCreateFormTwo.defaultProps = {
  //
};

export default JobCreateFormTwo;
