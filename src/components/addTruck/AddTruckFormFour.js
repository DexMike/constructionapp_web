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
import EquipmentService from '../../api/EquipmentService';
import EquipmentMaterialsService from '../../api/EquipmentMaterialsService';
// import truckImage from '../../img/12.png';

class AddTruckFormFour extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      // showPassword: false
      userInfo: {}
    };
    this.handleInputChange = this.handleInputChange.bind(this);
    this.saveInfo = this.saveInfo.bind(this);
  }

  async componentDidMount() {
    const {
      userFullInfo
    } = this.props;
    const userInfoLoaded = await UserService.getUserById(userFullInfo.info.id);
    this.setState({
      userInfo: userInfoLoaded
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
<<<<<<< HEAD
      truckFullInfo.info.modifiedBy = profile.userId;
=======
>>>>>>> dev
      await EquipmentService.updateEquipment(truckFullInfo.info);
      // return;

      // now let's save the user ..
      /*
      if (userFullInfo.info.id === 0) {

        // ID SHOULD NOT BE 0, SINCE THERE'S ALWAYS
        // SOMEONE ALREADY SELECTED

        // let's not save a new driver for now
        /*
        // setup info for user
        delete userFullInfo.info.redir;
        delete userFullInfo.info.id;
        userFullInfo.info.companyId = companyId;
        // userFullInfo.info.equipmentId = 1; // setting as 1 since I don't have the ID yet
        userFullInfo.info.preferredLanguage = 'English';
        userFullInfo.info.isBanned = 0;
        userFullInfo.info.userStatus = 'New';
        const newUser = await UserService.createUser(userFullInfo.info);
        userFullInfo.info.id = newUser.id;

        const driver = {
          id: truckFullInfo.info.driversId,
          usersId: newUser.id,
          driverLicenseId: 1 // THIS IS A FK
        };
        await DriverService.updateDriver(driver);
        // return false;
      } else {
        userFullInfo.info.companyId = companyId;
        userFullInfo.info.isBanned = 0; // TODO read from current profile
        userFullInfo.info.preferredLanguage = 'English'; // TODO read from current profile
        userFullInfo.info.userStatus = 'Active'; // TODO read from current - profile
        await UserService.updateUser(userFullInfo.info);
      }
      */

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
      // do not create a new user for now
      // const newUser = await UserService.createUser(userFullInfo.info);
      // return false;

      // const driver = {
      //   // usersId: newUser.id,
      //   usersId: userFullInfo.info.id,
      //   driverLicenseId: 1 // THIS IS A FK
      // };
      // const newDriver = await DriverService.createDriver(driver);

      truckFullInfo.info.driversId = userFullInfo.info.id;
      truckFullInfo.info.companyId = companyId;
      truckFullInfo.info.defaultDriverId = userFullInfo.info.id;
      truckFullInfo.info.createdBy = profile.userId;
      const selectedTruckMaterials = truckFullInfo.info.selectedMaterials;

      // convert false to 0
      const available = availabilityFullInfo.info.isAvailable;
      truckFullInfo.info.currentAvailability = (available === true) ? 1 : 0;

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

  render() {
    const {
      availabilityFullInfo,
      truckFullInfo,
      userFullInfo,
      previousPage,
      getTruckFullInfo,
      getAvailiabilityFullInfo,
      getUserFullInfo,
      onClose
    } = this.props;
    const { userInfo } = this.state;
    // show selected materials
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
                      <img src={truckFullInfo.info.image} alt="avatar"/>
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
                  <div className="row">
                    <div className="col-md-4">
                      <strong>Rate per hour: </strong>
                    </div>
                    <div className="col-md-8">
                      {TFormat.asMoneyByHour(truckFullInfo.info.hourRate)}
                    </div>
                  </div>
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
                  <Button onClick={this.saveInfo} type="submit" className="primaryButton">Save now</Button>
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
