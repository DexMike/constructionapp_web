import React, {Component} from 'react';
import * as PropTypes from 'prop-types';
import {Redirect} from 'react-router-dom';
import {
  Container,
  Col,
  Button,
  Row
} from 'reactstrap';
import moment from 'moment';
import NumberFormat from 'react-number-format';
import TField from '../common/TField';
import UserService from '../../api/UserService';
import DriverService from '../../api/DriverService';
import UserManagementService from '../../api/UserManagementService';
import TSubmitButton from '../common/TSubmitButton';

class DriverForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      id: '',
      firstName: '',
      lastName: '',
      email: '',
      mobilePhone: '',
      userStatus: '',
      driverStatus: '',
      selectedUser: {},
      btnSubmitting: false,
      reqHandlerFName: {touched: false, error: ''},
      reqHandlerLName: {touched: false, error: ''},
      reqHandlerPhone: {touched: false, error: ''},
      loaded: false,
      step: 1,
      inviteStatus: false,
      inviteMessage: '',
      sendingSMS: false
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.goToDriversList = this.goToDriversList.bind(this);
    this.saveUser = this.saveUser.bind(this);
  }

  async componentDidMount() {
    const {driverId} = this.props;
    let {
      id,
      firstName,
      lastName,
      email,
      mobilePhone,
      userStatus,
      driverStatus,
      selectedUser
    } = this.state;

    if (driverId) {
      const driver = await DriverService.getDriverById(driverId);
      selectedUser = await UserService.getUserById(driver.usersId);
      id = driver.usersId;
      ({firstName} = selectedUser);
      ({lastName} = selectedUser);
      ({email} = selectedUser);
      mobilePhone = selectedUser.mobilePhone.replace('+1', '');
      const chars = {'(': '', ')': '', '-': '', ' ': ''};
      mobilePhone = mobilePhone.replace(/[abc]/g, m => chars[m]);
      ({userStatus} = selectedUser);
      ({driverStatus} = driver);
      this.setState({
        selectedUser,
        id,
        firstName,
        lastName,
        email,
        mobilePhone,
        userStatus,
        driverStatus,
        loaded: true
      });
    }

    this.setState({loaded: true});
  }

  handlePageClick(menuItem) {
    if (menuItem) {
      this.setState({[`goTo${menuItem}`]: true});
    }
  }

  phoneToNumberFormat(phone) {
    const num = Number(phone.replace(/\D/g, ''));
    return num;
  }

  checkPhoneFormat(phone) {
    const phoneNotParents = String(this.phoneToNumberFormat(phone));
    const areaCode3 = phoneNotParents.substring(0, 3);
    const areaCode4 = phoneNotParents.substring(0, 4);
    if (areaCode3.includes('555') || areaCode4.includes('1555')) {
      return false;
    }
    return true;
  }

  async saveUser() {
    let {inviteStatus, inviteMessage} = this.state;
    const {toggle, currentUser} = this.props;
    this.setState({btnSubmitting: true});
    const isValid = await this.isFormValid();
    if (!isValid) {
      this.setState({btnSubmitting: false});
      return;
    }
    const {
      firstName,
      lastName, email, mobilePhone, selectedUser
    } = this.state;
    const user = selectedUser;
    user.mobilePhone = `+1${mobilePhone}`;
    user.lastName = lastName;
    user.email = email;
    user.firstName = firstName;

    if (user && user.id) {
      user.modifiedBy = currentUser.userId;
      user.modifiedOn = moment.utc().format();
      try {
        await UserService.updateUser(user);
      } catch (e) {
        // console.log(e);
      }
      toggle();
    } else {
      user.email = `${user.mobilePhone}refBy${currentUser.email}`;
      user.companyId = currentUser.companyId;
      user.isBanned = 0;
      user.preferredLanguage = 'English';
      user.userStatus = 'Driver Invited';
      user.isEmailVerified = 0;
      user.isPhoneVerified = 0;
      user.createdBy = currentUser.id;
      user.createdOn = moment.utc().format();
      user.modifiedBy = currentUser.id;
      user.modifiedOn = moment.utc().format();
      try {
        const response = await UserService.createDriver(user);
        if (response === true) {
          inviteStatus = true;
          inviteMessage = `Your invitation to ${user.firstName} ${user.lastName}, sent to phone number ${user.mobilePhone}, was Successful.`;
        } else {
          inviteStatus = false;
          inviteMessage = `Error. Your invitation to ${user.firstName} ${user.lastName}
            to phone number ${user.mobilePhone} had a problem. Please try again by clicking the button below.`;
        }
      } catch (err) {
        inviteStatus = false;
        inviteMessage = `Error. Your invitation to ${user.firstName} ${user.lastName}
          to phone number ${user.mobilePhone} had a problem. Please try again by clicking the button below.`;
      }
      this.setState({
        sendingSMS: false,
        inviteStatus,
        inviteMessage,
        step: 2,
        selectedUser: user});
    }
  }

  async isFormValid() {
    const {firstName, lastName, mobilePhone} = this.state;
    this.setState({btnSubmitting: true});
    let isValid = true;

    if (firstName === null || firstName.length === 0) {
      this.setState({
        reqHandlerFName: {
          touched: true,
          error: 'Please enter drivers first name'
        }
      });
      isValid = false;
    }

    if (lastName === null || lastName.length === 0) {
      this.setState({
        reqHandlerLName: {
          touched: true,
          error: 'Please enter drivers last name'
        }
      });
      isValid = false;
    }

    if (mobilePhone === null || mobilePhone.replace(/\D/g, '').length === 0 || mobilePhone.replace(/\D/g, '').length < 10) {
      this.setState({
        reqHandlerPhone: {
          touched: true,
          error: 'Please enter a mobile phone for the driver'
        }
      });
      isValid = false;
    }

    const userStatusRequest = {phone: `+1${mobilePhone}`, driverFlow: true};
    let userStatusResponse = false;
    try {
      userStatusResponse = await UserManagementService.findCognito(userStatusRequest);
    } catch (err) {
      console.log(err);
    }
    const user = await UserService.getUserByMobile(`+1${mobilePhone}`);
    if (userStatusResponse || user.id) {
      this.setState({
        reqHandlerPhone: {
          touched: true,
          error: 'Mobile phone is already taken'
        }
      });
      isValid = false;
    }
    this.setState({btnSubmitting: false});
    return isValid;
  }

  handleInputChange(e) {
    let {value} = e.target;
    let reqHandler = '';
    if (e.target.name === 'mobilePhone') {
      reqHandler = 'reqHandlerPhone';
      value = value.replace(/\D/g, '');
      if (value.length > 10) {
        return;
      }
    } else if (e.target.name === 'firstName') {
      reqHandler = 'reqHandlerFName';
    } else if (e.target.name === 'lastName') {
      reqHandler = 'reqHandlerLName';
    }
    this.setState({
      [reqHandler]: Object.assign({}, reqHandler, {
        touched: false
      })
    });
    this.setState({[e.target.name]: value});
  }


  handleSubmit(menuItem) {
    if (menuItem) {
      this.setState({[`goTo${menuItem}`]: true});
    }
  }

  goToDriversList() {
    this.handleSubmit('Drivers');
  }

  renderGoTo() {
    const {goToDashboard, goToDrivers} = this.state;
    if (goToDashboard) {
      return <Redirect push to="/"/>;
    }
    if (goToDrivers) {
      return <Redirect push to="/drivers"/>;
    }
    return true;
  }

  renderDriverInvite() {
    const {inviteStatus, inviteMessage, sendingSMS} = this.state;
    const {toggle} = this.props;
    if (sendingSMS) {
      return (
        <Row>
          <Col md={12} className="text-center">
            <div className="spinner-border text-success" role="status">
              <span className="sr-only">Loading...</span>
            </div>
          </Col>
        </Row>
      );
    }
    return (
      <Row className="p-4">
        <Col md={12}>
          {/* <span>Invite a Driver</span> */}
          <br/>
          <h3>{inviteStatus ? 'Success!' : 'Warning'}</h3>
          <p>
            {inviteMessage}
          </p>
        </Col>
        {
          inviteStatus === true ? (
            <Col md={12} className="text-right pt-4">
              <Button
                onClick={() => {
                  toggle();
                }}
                className="primaryButton"
              >
                Return
              </Button>
            </Col>
          ) : null
        }
        {
          inviteStatus === false ? (
            <Col md={12} className="text-right pt-4">
              <Button
                onClick={() => this.setState({
                  step: 1
                })}
                className="secondaryButton"
              >
                Edit
              </Button>
            </Col>
          ) : null
        }
      </Row>
    );
  }

  renderForm() {
    const {
      firstName,
      lastName,
      mobilePhone,
      reqHandlerFName,
      reqHandlerLName,
      reqHandlerPhone,
      userStatus,
      btnSubmitting
    } = this.state;
    const {driverId, toggle} = this.props;
    return (
      <Row className="form">
        {this.renderGoTo()}
        <Col md={12}>
          <h3
            className="page-title pl-4 pr-4 pt-2 pb-2"
            style={{backgroundColor: '#006F53', color: '#FFF', fontSize: 14}}
          >
            {driverId ? 'Edit Driver' : 'Add Driver'}
          </h3>
        </Col>
        <Col md={12}>
          <Row className="pl-4 pr-4">
            <Col md={6} className="pt-2">
              <span>
                First Name
              </span>
              <TField
                input={{
                  onChange: this.handleInputChange,
                  name: 'firstName',
                  value: firstName
                }}
                placeholder="First Name"
                type="text"
                meta={reqHandlerFName}
              />
            </Col>
            <Col md={6} className="pt-2">
              <span>
                Last Name
              </span>
              <TField
                input={{
                  onChange: this.handleInputChange,
                  name: 'lastName',
                  value: lastName
                }}
                placeholder="Last Name"
                type="text"
                meta={reqHandlerLName}
              />
            </Col>
            <Col md={6} className="pt-2">
              <span>
                Mobile Phone
              </span>
              <NumberFormat
                name="mobilePhone"
                placeholder="Mobile Phone"
                type="text"
                format="##########"
                // mask="_"
                value={mobilePhone}
                onChange={this.handleInputChange}
                meta={reqHandlerPhone}
              />
              {
                reqHandlerPhone.touched
                  ? (
                    <span style={{color: '#D32F2F'}}>
                      {reqHandlerPhone.error}
                    </span>
                  )
                  : null
              }
            </Col>
            <Col md={12} className="text-right pt-4">
              <Button key="2"
                      onClick={toggle}
                      className="secondaryButton"
              >
                Cancel
              </Button>
              <TSubmitButton
                onClick={this.saveUser}
                className="primaryButton"
                loading={btnSubmitting}
                // loaderSize={10}
                bntText={driverId && userStatus !== 'Driver Invited' ? 'Update' : 'Send Invite'}
              />
            </Col>
          </Row>
        </Col>
      </Row>
    );
  }

  renderLoader() {
    return (
      <div className="load loaded inside-page">
        <div className="load__icon-wrap">
          <svg className="load__icon">
            <path fill="rgb(0, 111, 83)" d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z"/>
          </svg>
        </div>
      </div>
    );
  }

  render() {
    const {
      loaded,
      step
    } = this.state;
    if (loaded) {
      return (
        <React.Fragment>
          {this.renderGoTo()}
          {step === 1 ? this.renderForm() : null}
          {step === 2 ? this.renderDriverInvite() : null}
        </React.Fragment>
      );
    }
    return (
      <Container className="dashboard">
        <Row>
          <Col md={12}>
            <h3 className="page-title">Edit Driver</h3>
          </Col>
        </Row>
        {this.renderLoader()}
      </Container>
    );
  }
}

DriverForm.propTypes = {
  toggle: PropTypes.func.isRequired,
  user: PropTypes.shape({
    id: PropTypes.number
  }),
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string
    })
  }),
  driverId: PropTypes.number
};

DriverForm.defaultProps = {
  user: {},
  match: {
    params: {}
  },
  driverId: 0
};

export default DriverForm;
