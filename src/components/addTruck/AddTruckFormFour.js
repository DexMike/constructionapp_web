import React, { PureComponent } from 'react';
import {
  Card,
  CardBody,
  Col,
  Button,
  Container,
  ButtonToolbar
} from 'reactstrap';
import PropTypes, { object } from 'prop-types';
import TFormat from '../common/TFormat';
// import DriverService from '../../api/DriverService';
import ProfileService from '../../api/ProfileService';
import UserService from '../../api/UserService';
import DriverService from '../../api/DriverService';
import EquipmentService from '../../api/EquipmentService';
import EquipmentMaterialsService from '../../api/EquipmentMaterialsService';
import defaultTruckImage from '../../img/default_truck.png';
import TSubmitButton from '../common/TSubmitButton';

class AddTruckFormFour extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      // showPassword: false
      userInfo: {},
      btnSubmitting: false
    };
    this.handleInputChange = this.handleInputChange.bind(this);
    this.saveInfo = this.saveInfo.bind(this);
  }

  async componentDidMount() {
    const {
      userFullInfo
    } = this.props;
    // const userInfoLoaded = await UserService.getUserById(userFullInfo.info.id);
    const driver = await DriverService.getDriverById(userFullInfo.info.id);
    const user = await UserService.getUserById(driver.usersId);
    this.setState({
      userInfo: user
    });
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

  // save after the user has checked the info
  async saveInfo() {
    this.setState({ btnSubmitting: true });
    // save new or update?
    const {
      truckFullInfo, // saved info
      userFullInfo,
      availabilityFullInfo,
      onClose,
      equipmentId,
      companyId
    } = this.props;
    const profile = await ProfileService.getProfile();
    // not saving, updating instead
    if (truckFullInfo.info.id !== 0) {
      // assign all the info from availiabilty into the equipment
      const available = availabilityFullInfo.info.isAvailable;
      const start = new Date(availabilityFullInfo.info.startDate);
      const end = new Date(availabilityFullInfo.info.endDate);
      truckFullInfo.info.id = equipmentId;
      truckFullInfo.info.companyId = companyId;
      truckFullInfo.info.currentAvailability = (available === true) ? 1 : 0;
      truckFullInfo.info.startAvailability = start.getTime(); // date as miliseconds
      truckFullInfo.info.endAvailability = end.getTime(); // date as miliseconds
      truckFullInfo.info.driversId = userFullInfo.info.id;
      truckFullInfo.info.modifiedBy = profile.userId;
      await EquipmentService.updateEquipment(truckFullInfo.info);

      // save materials
      await EquipmentMaterialsService.createAllEquipmentMaterials(
        truckFullInfo.info.selectedMaterials,
        equipmentId
      );

      onClose();
    } else {
      // setup info for user
      delete userFullInfo.info.redir;
      // delete userFullInfo.info.id;
      userFullInfo.info.companyId = companyId;
      // userFullInfo.info.equipmentId = 1; // setting as 1 since I don't have the ID yet
      userFullInfo.info.preferredLanguage = 'English';
      userFullInfo.info.isBanned = 0;
      userFullInfo.info.userStatus = 'New';

      truckFullInfo.info.driversId = userFullInfo.info.id;
      truckFullInfo.info.companyId = companyId;
      truckFullInfo.info.defaultDriverId = userFullInfo.info.id;
      truckFullInfo.info.createdBy = profile.userId;
      const selectedTruckMaterials = truckFullInfo.info.selectedMaterials;

      // convert false to 0
      const available = availabilityFullInfo.info.isAvailable;
      truckFullInfo.info.currentAvailability = (available === true) ? 1 : 0;
      truckFullInfo.info.startAvailability = availabilityFullInfo.info.startDate;
      truckFullInfo.info.endAvailability = availabilityFullInfo.info.endDate;
      truckFullInfo.info.rateType = truckFullInfo.info.isRatedHour ? 'Hour' : 'Ton';
      // remove unnecesary info
      delete truckFullInfo.info.id;
      delete truckFullInfo.info.redir;
      delete truckFullInfo.info.ratesByBoth;
      delete truckFullInfo.info.ratesByHour;
      delete truckFullInfo.info.ratesByTon;

      const createdEquipment = await EquipmentService.createEquipment(truckFullInfo.info);
      const jsonMaterials = JSON.stringify(selectedTruckMaterials);

      // save materials
      await EquipmentMaterialsService.createAllEquipmentMaterials(
        jsonMaterials,
        createdEquipment.id
      );

      onClose();
    }
  }

  async saveAddress() {
    /*
    // use like FORM pages in others
    */
  }

  availableButtonColor(isAvailable) {
    return isAvailable ? 'secondary' : 'minimal';
  }

  renderHourOrTon(hourTon, info) {
    if (hourTon) {
      return (
        <React.Fragment>
          <div className="row">
            <div className="col-md-4">
              <strong>Rate per hour: </strong>
            </div>
            <div className="col-md-8">
              {TFormat.asMoneyByHour(info.hourRate)}
            </div>
          </div>
        </React.Fragment>
      );
    }
    return (
      <React.Fragment>
        <div className="row">
          <div className="col-md-4">
            <strong>Rate per ton: </strong>
          </div>
          <div className="col-md-8">
            {TFormat.asMoneyByTons(info.tonRate)}
          </div>
        </div>
      </React.Fragment>
    );
  }

  render() {
    const {
      availabilityFullInfo,
      truckFullInfo,
      // userFullInfo,
      previousPage,
      getTruckFullInfo,
      getAvailiabilityFullInfo,
      getUserFullInfo,
      onClose
    } = this.props;
    const { userInfo, btnSubmitting } = this.state;
    let allMaterials = '';
    for (const material of getTruckFullInfo().info.selectedMaterials) {
      allMaterials += `${material.label}, `;
    }
    allMaterials = allMaterials.substring(0, allMaterials.length - 2);
    // do we  have info? otherwise don't let the user continue
    if (Object.keys(getAvailiabilityFullInfo().info).length > 0
      && Object.keys(getTruckFullInfo().info).length > 0
      && Object.keys(getUserFullInfo().info).length > 0) {
      const available = availabilityFullInfo.info.isAvailable;
      const availableText = (available === true) ? 'Available' : 'Unavailable';
      const printedStartDate = availabilityFullInfo.info.startDate.toISOString().slice(0, 10).replace(/-/g, '-');
      const printedEndDate = availabilityFullInfo.info.endDate.toISOString().slice(0, 10).replace(/-/g, '-');
      return (
        <Col md={12} lg={12}>
          <Card>
            <CardBody className="profile__card">
              <div className="">
                <div className="">
                  <div className="row">
                    <div className="col-md-4 truck-profile">
                      { truckFullInfo.info.image
                        ? <img src={truckFullInfo.info.image} alt="avatar"/>
                        : <img src={defaultTruckImage} alt="avatar"/>
                      }
                    </div>
                    <div className="col-md-8">
                      <div className="row">
                        <div className="col-md-6">
                          <strong>Truck Name: </strong>
                        </div>
                        <div className="col-md-6">
                          {truckFullInfo.info.description}
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-md-6">
                          <strong>Type: </strong>
                        </div>
                        <div className="col-md-6">
                          {truckFullInfo.info.type}
                        </div>
                      </div>
                      <br />
                      <div className="row">
                        <div className="col-md-6">
                          <strong>Name: </strong>
                        </div>
                        <div className="col-md-6">
                          {userInfo.firstName} {userInfo.lastName}
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-md-6">
                          <strong>Email: </strong>
                        </div>
                        <div className="col-md-6">
                          <a href="mailto: {userInfo.email}"> {userInfo.email}</a>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-md-6">
                          <strong>Mobile phone: </strong>
                        </div>
                        <div className="col-md-6">
                          <a href="tel: {userInfo.mobilePhone}"> {userInfo.mobilePhone}</a>
                        </div>
                      </div>
                      <br />
                      <div className="row">
                        <div className="col-md-6">
                          <strong>Available from:</strong>
                        </div>
                        <div className="col-md-6">
                          {printedStartDate}
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-md-6">
                          <strong>Available until:</strong>
                        </div>
                        <div className="col-md-6">
                          {printedEndDate}
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-md-6">
                          <strong>Availability:</strong>
                        </div>
                        <div className="col-md-6">
                          {availableText}
                        </div>
                      </div>
                    </div>
                  </div>
                  <hr/>
                  <div className="row">
                    <div className="col-md-4">
                      <strong>Materials hauled: </strong>
                    </div>
                    <div className="col-md-8">
                      {allMaterials}
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-4">
                      <strong>Maximum capacity: </strong>
                    </div>
                    <div className="col-md-8">
                      {truckFullInfo.info.maxCapacity} Tons
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-4">
                      <strong>VIN: </strong>
                    </div>
                    <div className="col-md-8">
                      {truckFullInfo.info.vin}
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-4">
                      <strong>License plate: </strong>
                    </div>
                    <div className="col-md-8">
                      {truckFullInfo.info.licensePlate}
                    </div>
                  </div>
                  {this.renderHourOrTon(truckFullInfo.info.isRatedHour, truckFullInfo.info)}
                  <div className="row">
                    <div className="col-md-4">
                      <strong>Maximum distance pickup: </strong>
                    </div>
                    <div className="col-md-8">
                      {truckFullInfo.info.maxDistance} Miles
                    </div>
                  </div>
                </div>
              </div>
              <hr />
              <div className="profile__stats">
                <ButtonToolbar className="col-md-6 wizard__toolbar">
                  <Button type="button" className="tertiaryButton" onClick={onClose}>
                    Cancel
                  </Button>
                </ButtonToolbar>
                <ButtonToolbar className="col-md-6 wizard__toolbar right-buttons">
                  <Button type="button" className="secondaryButton" onClick={previousPage}>Go back</Button>
                  <TSubmitButton
                    onClick={this.saveInfo}
                    className="primaryButton"
                    loading={btnSubmitting}
                    loaderSize={10}
                    bntText="Save now"
                  />
                </ButtonToolbar>
              </div>
            </CardBody>
          </Card>
        </Col>
      );
    }
    return (
      <Container className="dashboard">
        It seems that you haven&#39;t entered any info, please go back and add some.
      </Container>
    );
  }
}

AddTruckFormFour.propTypes = {
  truckFullInfo: PropTypes.shape({
    info: object
  }),
  availabilityFullInfo: PropTypes.shape({
    info: object
  }),
  userFullInfo: PropTypes.shape({
    info: object
  }),
  equipmentId: PropTypes.number,
  companyId: PropTypes.number,
  previousPage: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  // fields for loaded info
  getTruckFullInfo: PropTypes.func.isRequired,
  getAvailiabilityFullInfo: PropTypes.func.isRequired,
  getUserFullInfo: PropTypes.func.isRequired
};

AddTruckFormFour.defaultProps = {
  truckFullInfo: null,
  equipmentId: null,
  companyId: null,
  availabilityFullInfo: null,
  userFullInfo: null
};

export default AddTruckFormFour;
