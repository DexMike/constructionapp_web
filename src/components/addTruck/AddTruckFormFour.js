import React, { PureComponent } from 'react';
import {
  Card,
  CardBody,
  Col,
  Button
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
    // e.preventDefault();
    // e.persist();
    // // console.log(e);
    // // console.log(this.props);
    const {
      truckFullInfo,
      userFullInfo,
      availabilityFullInfo,
      onClose
    } = this.props;

    // console.log(truckFullInfo);
    const newUser = await UserService.createUser(userFullInfo.info);

    const driver = {
      usersId: newUser.id,
      driverLicenseId: 1 // THIS IS A FK
    };
    const newDriver = await DriverService.createDriver(driver);

    // assing missing info
    // this closes the cylce of having the truck info cached
    truckFullInfo.info.driversId = newDriver.id;
    truckFullInfo.info.defaultDriverId = newUser.id; // careful here, don't know if it's default
    // truckFullInfo.info.startAvailability = availabilityFullInfo.info.startDate.toISOString()
    // .slice(0, 19).replace('T', ' ');
    truckFullInfo.info.startAvailability = availabilityFullInfo.info.startDate;
    // truckFullInfo.info.endAvailability = availabilityFullInfo.info.endDate.toISOString()
    // .slice(0, 19).replace('T', ' ');
    truckFullInfo.info.endAvailability = availabilityFullInfo.info.endDate;
    // console.log('>>SAVING... ');
    // console.log(truckFullInfo.info);
    await EquipmentService.createEquipment(truckFullInfo.info);
    onClose();
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
      userFullInfo,
      previousPage
    } = this.props;
    // const { showPassword } = this.state;
    // console.log(truckFullInfo);
    // console.log(availabilityFullInfo);
    // console.log(userFullInfo);
    const availableText = availabilityFullInfo.info.isAvailable ? 'Unavailable' : 'Available';
    // // console.log(availabilityFullInfo.info.startDate.toString());
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
              <h5>Does this information look good?</h5>
              <br />
              <Button color="primary" type="button" className="previous" onClick={previousPage} >No, go back</Button>
              <Button color="danger" onClick={this.saveInfo} type="submit" className="next">
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
  onClose: PropTypes.func.isRequired
};

AddTruckFormFour.defaultProps = {
  truckFullInfo: null,
  availabilityFullInfo: null,
  userFullInfo: null
};

export default AddTruckFormFour;
