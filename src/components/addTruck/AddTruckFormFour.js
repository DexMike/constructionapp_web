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
import DriverService from '../../api/DriverService';
import UserService from '../../api/UserService';
import EquipmentService from '../../api/EquipmentService';
import truckImage from '../../img/12.png';

class AddTruckFormFour extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      // showPassword: false
    };
    this.handleInputChange = this.handleInputChange.bind(this);
    this.saveInfo = this.saveInfo.bind(this);
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
      getTruckFullInfo, // cached info
      getAvailiabilityFullInfo,
      getUserFullInfo,
      truckFullInfo, // saved info
      userFullInfo,
      availabilityFullInfo,
      onClose
      // availabilityFullInfo
    } = this.props;

    // not saving, updating instead
    if (Object.keys(getTruckFullInfo()).length > 0
      && Object.keys(getAvailiabilityFullInfo()).length > 0
      && Object.keys(getUserFullInfo()).length > 0) {
      // assign all the info from availiabilty into the equipment
      const available = availabilityFullInfo.info.isAvailable;
      const start = new Date(availabilityFullInfo.info.startDate);
      const end = new Date(availabilityFullInfo.info.endDate);
      truckFullInfo.info.currentAvailability = (available === true) ? 1 : 0;
      truckFullInfo.info.startAvailability = start.getTime(); // date as miliseconds
      truckFullInfo.info.endAvailability = end.getTime(); // date as miliseconds
      await EquipmentService.updateEquipment(truckFullInfo.info);

      // now let's save the user
      await UserService.updateUser(userFullInfo.info);

      onClose();
    } else {
      const newUser = await UserService.createUser(userFullInfo.info);

      const driver = {
        usersId: newUser.id,
        driverLicenseId: 1 // THIS IS A FK
      };
      const newDriver = await DriverService.createDriver(driver);

      // assing missing info
      truckFullInfo.info.driversId = newDriver.id;
      truckFullInfo.info.defaultDriverId = newDriver.id; // set as default as well
      truckFullInfo.info.defaultDriverId = newUser.id; // careful here, don't know if it's default
      truckFullInfo.info.startAvailability = availabilityFullInfo.info.startDate;
      truckFullInfo.info.endAvailability = availabilityFullInfo.info.endDate;
      await EquipmentService.createEquipment(truckFullInfo.info);
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

    // do we have good info?
    /*
    console.log(Object.keys(getAvailiabilityFullInfo().info).length);
    console.log(Object.keys(getTruckFullInfo().info).length);
    console.log(Object.keys(getUserFullInfo().info).length);
    */

    // do we  have info? otherwise don't let the user continue
    if (Object.keys(getAvailiabilityFullInfo().info).length > 0
      && Object.keys(getTruckFullInfo().info).length > 0
      && Object.keys(getUserFullInfo().info).length > 0) {
      const availableText = availabilityFullInfo.info.isAvailable ? 'Unavailable' : 'Available';
      const printedStartDate = availabilityFullInfo.info.startDate.toISOString().slice(0, 10).replace(/-/g, '-');
      const printedEndDate = availabilityFullInfo.info.endDate.toISOString().slice(0, 10).replace(/-/g, '-');
      return (
        <Col md={12} lg={12}>
          <Card>
            <CardBody className="profile__card">
              <div className="profile__information">
                <div className="profile__avatar">
                  <img src={`${window.location.origin}/${truckImage}`} alt="avatar"/>
                </div>
                <div className="profile__data">
                  <p className="profile__name">Summary of Truck and Driver Information</p>
                  <h4>Information about your Truck:</h4>
                  <br />
                  <p className="profile__contact">
                    <strong>Description: </strong><br />{truckFullInfo.info.description}
                    <br /><br />
                    <strong>Type: </strong><br />{truckFullInfo.info.type}
                    <br /><br />
                    <strong>Materials hauled: </strong><br /> {/* MATES */}
                    <br /><br />
                    <strong>Maximum capacity: </strong><br />{truckFullInfo.info.maxCapacity} Tons
                    <br /><br />
                    <strong>VIN: </strong><br />{truckFullInfo.info.vin}
                    <br /><br />
                    <strong>License plate: </strong><br />{truckFullInfo.info.licensePlate}
                    <br /><br />
                    <strong>Rate per hour: </strong><br />{truckFullInfo.info.hourRate}
                    <br /><br />
                    <strong>Rate per ton: </strong><br />{truckFullInfo.info.tonRate}
                    <br /><br />
                    <strong>Maximum distance to pickup: </strong>
                    <br />{truckFullInfo.info.maxDistance} Miles
                    <br /><br />
                    <strong>Maximum distance to pickup: </strong>
                    <br />{truckFullInfo.info.maxDistance} Miles
                  </p>
                  <hr />
                  <h4>Information about the Driver:</h4>
                  <br />
                  <p className="profile__contact">
                    <strong>Name: </strong>
                    <br />{userFullInfo.info.firstName} {userFullInfo.info.lastName}
                    <br /><br />
                    <strong>Email: </strong>
                    <br />{userFullInfo.info.email}
                    <br /><br />
                    <strong>Mobile phone: </strong>
                    {userFullInfo.info.mobilePhone}
                  </p>
                </div>
              </div>
              <hr />
              <div className="profile__stats">
                <div className="profile__stat">
                  <p className="profile__stat-number">Avilable from:</p>
                  <h4>{printedStartDate}</h4>
                </div>
                <div className="profile__stat">
                  <p className="profile__stat-number">Available until:</p>
                  <h4>{printedEndDate}</h4>
                </div>
                <div className="profile__stat">
                  <p className="profile__stat-number">Availability:</p>
                  <h4>{availableText}</h4>
                </div>
              </div>
              <hr className="bighr" />
              <div className="profile__stats">
                <ButtonToolbar className="col-md-6 wizard__toolbar">
                  <Button color="minimal" className="btn btn-outline-secondary" type="button" onClick={onClose}>
                    Cancel
                  </Button>
                </ButtonToolbar>
                <ButtonToolbar className="col-md-6 wizard__toolbar right-buttons">
                  <Button color="secondary" type="button" className="previous" onClick={previousPage} >No, go back</Button>
                  <Button color="primary" onClick={this.saveInfo} type="submit" className="next">
                    Yes, save now
                  </Button>
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
  previousPage: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  // fields for loaded info
  getTruckFullInfo: PropTypes.func.isRequired,
  getAvailiabilityFullInfo: PropTypes.func.isRequired,
  getUserFullInfo: PropTypes.func.isRequired
};

AddTruckFormFour.defaultProps = {
  truckFullInfo: null,
  availabilityFullInfo: null,
  userFullInfo: null
};

export default AddTruckFormFour;
