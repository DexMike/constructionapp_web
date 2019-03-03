import React, { PureComponent } from 'react';
import {
  Card,
  CardBody,
  Col,
  Button
} from 'reactstrap';
import PropTypes from 'prop-types';
import DriverService from '../../api/DriverService';
import UserService from '../../api/UserService';
import EquipmentService from '../../api/EquipmentService';

class AddTruckFormFour extends PureComponent {
  constructor(props) {
    super(props);
    console.log('>>LAST STEP GOT PROPS');
    console.log(props);
    this.state = {
      // showPassword: false
    };
    this.handleInputChange = this.handleInputChange.bind(this);
    // this.handleSubmit = this.handleSubmit.bind(this);
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
  async saveInfo(e) {
    // e.preventDefault();
    // e.persist();
    console.log(e);

    const { truckFullInfo, userFullInfo } = this.props;
    const newUser = await UserService.createUser(userFullInfo[0]);

    const driver = {
      usersId: newUser.id,
      driverLicenseId: 1 // THIS IS A FK
    };
    const newDriver = await DriverService.createDriver(driver);

    // assing missing info
    // this closes the cylce of having the truck info cached
    truckFullInfo[0].driversId = newDriver.id;
    truckFullInfo[0].defaultDriverId = newUser.id; // careful here, don't know if it's default
    console.log('>>SAVING...');
    await EquipmentService.createEquipment(truckFullInfo[0]);

    console.log('>>DONE SAVING');
    /**/
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
      userFullInfo
    } = this.props;
    // const { showPassword } = this.state;
    const availableText = availabilityFullInfo[0].isAvailable ? 'Unavailable' : 'Available';
    console.log(availabilityFullInfo[0].startDate.toString());
    const printedStartDate = availabilityFullInfo[0].startDate.toISOString().slice(0, 10).replace(/-/g, '-');
    const printedEndDate = availabilityFullInfo[0].endDate.toISOString().slice(0, 10).replace(/-/g, '-');
    return (
      <Col md={12} lg={12}>
        <Card>
          <CardBody className="profile__card">
            <div className="profile__information">
              <div className="profile__avatar">
                <img src="img/12.png" alt="avatar" />
              </div>
              <div className="profile__data">
                <p className="profile__name">Summary of Truck and Driver Information</p>
                <h4>Information about your Truck:</h4>
                <br />
                <p className="profile__contact">
                  <strong>Description: </strong><br />{truckFullInfo[0].description}
                  <br /><br />
                  <strong>Type: </strong><br />{truckFullInfo[0].type}
                  <br /><br />
                  <strong>Materials hauled: </strong><br /> {/* MATES */}
                  <br /><br />
                  <strong>Maximum capacity: </strong><br />{truckFullInfo[0].maxCapacity} Tons
                  <br /><br />
                  <strong>VIN: </strong><br />{truckFullInfo[0].vin}
                  <br /><br />
                  <strong>License plate: </strong><br />{truckFullInfo[0].licensePlate}
                  <br /><br />
                  <strong>Rate per hour: </strong><br />{truckFullInfo[0].hourRate}
                  <br /><br />
                  <strong>Rate per ton: </strong><br />{truckFullInfo[0].tonRate}
                  <br /><br />
                  <strong>Maximum distance to pickup: </strong>
                  <br />{truckFullInfo[0].maxDistance} Miles
                  <br /><br />
                  <strong>Maximum distance to pickup: </strong>
                  <br />{truckFullInfo[0].maxDistance} Miles
                </p>
                <hr />
                <h4>Information about the Driver:</h4>
                <br />
                <p className="profile__contact">
                  <strong>Name: </strong>
                  <br />{userFullInfo[0].firstName} {userFullInfo[0].lastName}
                  <br /><br />
                  <strong>Email: </strong>
                  <br />{userFullInfo[0].email}
                  <br /><br />
                  <strong>Mobile phone: </strong>
                  {userFullInfo[0].mobilePhone}
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
              <h5>Does this information look good?</h5>
              <br />
              <Button color="primary" onClick={e => this.saveInfo(e)} type="submit" className="next">
                Yes, save now
              </Button>
            </div>
          </CardBody>
        </Card>
      </Col>
    );
  }
}

AddTruckFormFour.propTypes = {
  truckFullInfo: PropTypes.array.isRequired,
  availabilityFullInfo: PropTypes.array.isRequired,
  userFullInfo: PropTypes.array.isRequired
};

AddTruckFormFour.defaultProps = {
  // truckFullInfo: null,
  // availabilityFullInfo: null,
  // userFullInfo: null
};

export default AddTruckFormFour;
