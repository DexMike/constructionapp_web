import React, { PureComponent } from 'react';
import moment from 'moment';
import {
  Card,
  CardBody,
  Col,
  Button,
  ButtonToolbar,
  Row,
  Container
} from 'reactstrap';
import PropTypes from 'prop-types';
import ProfileService from '../../api/ProfileService';
import AddressService from '../../api/AddressService';
import JobService from '../../api/JobService';
import BidService from '../../api/BidService';
import GroupService from '../../api/GroupService';
import TCheckBox from '../common/TCheckBox';
import TwilioService from '../../api/TwilioService';
import './jobs.css';
import GroupListService from '../../api/GroupListService';
import JobMaterialsService from '../../api/JobMaterialsService';


class JobCreateFormTwo extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      sendToMkt: true,
      sendToFavorites: true,
      showSendtoFavorites: false,
      favoriteCompanies: [],
      favoriteAdminTels: [],
      nonFavoriteAdminTels: [],
      loaded: false,
      loading: true
    };
    this.handleInputChange = this.handleInputChange.bind(this);
    this.saveJobMaterials = this.saveJobMaterials.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  async componentDidMount() {
    const { firstTabData } = this.props;
    const d = firstTabData();
    let favoriteAdminTels = [];
    let favoriteCompanies = [];
    let allBidders = [];
    let nonFavoriteAdminTels = [];
    // does this customer has favorites?
    const profile = await ProfileService.getProfile();
    // get only those that match criteria
    const filters = {
      tonnage: Number(d.tonnage),
      rateTab: d.rateTab,
      hourEstimatedHours: d.hourEstimatedHours,
      hourTrucksNumber: d.hourTrucksNumber
    };
    favoriteCompanies = await GroupListService.getGroupListByUserNameFiltered(
      profile.userId,
      filters
    );

    // now let's get the bidders that match criteria
    allBidders = await GroupListService.getBiddersFiltered(
      filters
    );

    const biddersIdsNotFavorites = allBidders.filter(x => !favoriteCompanies.includes(x));

    // are there any favorite companies?
    if (favoriteCompanies.length > 0) {
      // get the phone numbers from the admins
      favoriteAdminTels = await GroupService.getGroupAdminsTels(favoriteCompanies);

      if (biddersIdsNotFavorites.length > 0) {
        nonFavoriteAdminTels = await GroupService.getGroupAdminsTels(biddersIdsNotFavorites);
      }

      this.setState({
        showSendtoFavorites: true,
        favoriteCompanies,
        favoriteAdminTels,
        nonFavoriteAdminTels
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

  async saveJobMaterials(jobId, material) {
    const profile = await ProfileService.getProfile();
    if (profile && material) {
      const newMaterial = {
        jobsId: jobId,
        value: material,
        createdBy: profile.userId,
        createdOn: moment()
          .unix() * 1000,
        modifiedBy: profile.userId,
        modifiedOn: moment()
          .unix() * 1000
      };
      /* eslint-disable no-await-in-loop */
      await JobMaterialsService.createJobMaterials(newMaterial);
    }
  }

  async saveJob(e) {
    e.preventDefault();
    e.persist();
    const { firstTabData } = this.props;
    const {
      favoriteCompanies,
      showSendtoFavorites,
      sendToFavorites,
      sendToMkt,
      favoriteAdminTels,
      nonFavoriteAdminTels
    } = this.state;
    const d = firstTabData();
    const profile = await ProfileService.getProfile();

    // start location
    let startAddress = {
      id: null
    };
    if (d.selectedStartAddressId === 0) {
      const address1 = {
        type: 'Delivery',
        name: 'Delivery Start Location',
        companyId: 19, // 'this should change',
        address1: d.startLocationAddress1,
        address2: d.startLocationAddress2,
        city: d.startLocationCity,
        state: d.startLocationState,
        zipCode: d.startLocationZip,
        createdBy: profile.userId,
        createdOn: moment()
          .unix() * 1000,
        modifiedBy: profile.userId,
        modifiedOn: moment()
          .unix() * 1000
      };
      startAddress = await AddressService.createAddress(address1);
    } else {
      startAddress.id = d.selectedStartAddressId;
    }

    // end location
    let endAddress = {
      id: null
    };
    if (d.selectedEndAddressId === 0) {
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
    } else {
      endAddress.id = d.selectedEndAddressId;
    }

    // job p
    let isFavorited = 0;
    if (showSendtoFavorites) {
      isFavorited = 1;
    }

    let rateType = 'Hour';
    if (d.rateByTon) {
      rateType = 'Ton';
    }

    const job = {
      companiesId: profile.companyId,
      name: d.name,
      status: 'Published',
      isFavorited,
      startAddress: startAddress.id,
      endAddress: endAddress.id,
      startTime: new Date(d.jobDate),
      equipmentType: d.truckType.value,
      numEquipments: d.hourTrucksNumber,
      rateType,
      rate: d.rate,
      rateEstimate: d.hourEstimatedHours,
      rateTotal: 0,
      notes: d.instructions,
      createdBy: profile.userId,
      createdOn: moment()
        .unix() * 1000,
      modifiedBy: profile.userId,
      modifiedOn: moment()
        .unix() * 1000
    };
    const newJob = await JobService.createJob(job);
    // return false;

    // add materials
    if (newJob) {
      if (d.selectedMaterials) { // check if there's materials to add
        this.saveJobMaterials(newJob.id, d.selectedMaterials.value);
      }
    }

    // create bids if this user has favorites:
    if (showSendtoFavorites && sendToFavorites && newJob) {
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
          rateType,
          rate: 0,
          rateEstimate: d.hourEstimatedHours,
          notes: d.instructions,
          createdBy: profile.userId,
          createdOn: moment()
            .unix() * 1000,
          modifiedBy: profile.userId,
          modifiedOn: moment()
            .unix() * 1000
        };
        results.push(BidService.createBid(bid));
      }
      await Promise.all(results);

      // now let's send them an SMS to all favorites
      const allSms = [];
      for (const adminIdTel of favoriteAdminTels) {
        if (this.checkPhoneFormat(adminIdTel)) {
          // console.log('>>Sending SMS to Jake...');
          const notification = {
            to: this.phoneToNumberFormat(adminIdTel),
            body: '🚚 You have a new Trelar Job Offer available. Log into your Trelar account to review and accept. www.trelar.net'
          };
          allSms.push(TwilioService.createSms(notification));
        }
      }
      await Promise.all(allSms);
    }

    // if sending to mktplace, let's send SMS to everybody
    if (sendToMkt) {
      const allBiddersSms = [];
      for (const bidderTel of nonFavoriteAdminTels) {
        if (this.checkPhoneFormat(bidderTel)) {
          const notification = {
            to: this.phoneToNumberFormat(bidderTel),
            body: '👷 You have a new Trelar Job Offer available. Log into your Trelar account to review and apply. www.trelar.net'
          };
          allBiddersSms.push(TwilioService.createSms(notification));
        }
      }
    }

    const { onClose } = this.props;
    onClose();
  }

  // remove non numeric
  phoneToNumberFormat(phone) {
    const num = Number(phone.replace(/\D/g, ''));
    return num;
  }

  // check format ok
  checkPhoneFormat(phone) {
    const phoneNotParents = String(this.phoneToNumberFormat(phone));
    const areaCode3 = phoneNotParents.substring(0, 3);
    const areaCode4 = phoneNotParents.substring(0, 4);
    if (areaCode3.includes('555') || areaCode4.includes('1555')) {
      return false;
    }
    return true;
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
                  <div className={showSendtoFavorites ? 'col-md-11 form__form-group' : 'hidden'}>
                    <h5>
                      Send to Favorites<br />
                    </h5>
                  </div>
                  <div className={showSendtoFavorites ? 'hidden' : 'col-md-12 form__form-group'}>
                    <p>You have not set any favorite carriers to work with.</p><br /><br />
                  </div>
                  <br/>
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
                    <h5>
                      Yes! Send to Trelar Marketplace<br /><br />
                    </h5>
                    <small>* Note - This job will be sent to all Trelar Partners for review</small>
                  </div>
                  <div className="col-md-3 form__form-group">
                    Send Job in<br />
                  </div>
                  <div className="col-md-3 form__form-group">
                    <input
                      name="delay"
                      type="number"
                      placeholder="0"
                    />
                  </div>
                  <div className="col-md-6 form__form-group">
                    Hours
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
