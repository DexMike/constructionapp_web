import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';
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
import TwilioService from '../../api/TwilioService';
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
      selectedUser: {},
      btnSubmitting: false,
      reqHandlerFName: { touched: false, error: '' },
      reqHandlerLName: { touched: false, error: '' },
      reqHandlerEmail: { touched: false, error: '' },
      reqHandlerPhone: { touched: false, error: '' },
      loaded: false,
      step: 1,
      updateNewDriver: false,
      inviteStatus: false,
      inviteMessage: ''
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.goToDriversList = this.goToDriversList.bind(this);
    this.saveUser = this.saveUser.bind(this);
  }

  async componentDidMount() {
    const { driverId } = this.props;
    let { id, firstName, lastName, email, mobilePhone, userStatus, selectedUser } = this.state;

    if (driverId) {
      const driver = await DriverService.getDriverById(driverId);
      selectedUser = await UserService.getUserById(driver.usersId);
      id = driver.usersId;
      ({ firstName } = selectedUser);
      ({ lastName } = selectedUser);
      ({ email } = selectedUser);
      ({ mobilePhone } = selectedUser);
      ({ userStatus } = selectedUser);
      this.setState({
        selectedUser,
        id,
        firstName,
        lastName,
        email,
        mobilePhone,
        userStatus,
        loaded: true
      });
    }

    this.setState({ loaded: true });
  }

  handlePageClick(menuItem) {
    if (menuItem) {
      this.setState({ [`goTo${menuItem}`]: true });
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

  async sendDriverInvite(user) {
    let { inviteStatus, inviteMessage } = this.state;
    const { currentUser } = this.props;
    try {
      // Sending SMS to Truck's company
      const chars = {'(': '', ')': '', '-': '', ' ': ''};
      const mobilePhone = user.mobilePhone.replace(/[abc]/g, m => chars[m]);
      if (this.checkPhoneFormat(mobilePhone)) {
        const notification = {
          to: this.phoneToNumberFormat(mobilePhone),
          body: `Hello. You’ve been invited by your friend ${currentUser.firstName} ${currentUser.lastName} to drive with Trelar. 
            Please click www.trelar.net/driver to join Trelar.net</a>.`
        };
        await TwilioService.createSms(notification);

        inviteStatus = true;
        inviteMessage = `Invite Sent!.
        Your invite to ${user.firstName} ${user.lastName} at phone number ${user.mobilePhone} was sent.`;
      } else {
        inviteStatus = false;
        inviteMessage = `Mobile phone format ${user.mobilePhone} is invalid. Try editing it ...`;
      }
    } catch (err) {
      inviteStatus = false;
      inviteMessage = `Error. Your invite to ${user.firstName} ${user.lastName}
        at phone number ${user.mobilePhone} had a problem. Please try again by clicking the button below.`;
    }
    this.setState({
      inviteStatus,
      inviteMessage
    });
  }

  async saveUser() {
    const { toggle, currentUser } = this.props;
    this.setState({ btnSubmitting: true });
    if (!this.isFormValid()) {
      this.setState({ btnSubmitting: false });
      return;
    }
    const { 
      firstName,
      lastName, email, mobilePhone, userStatus, selectedUser, updateNewDriver } = this.state;
    const user = selectedUser;
    user.mobilePhone = mobilePhone;
    user.lastName = lastName;
    user.email = email;
    user.firstName = firstName;

    if (user && user.id) {
      user.modifiedBy = currentUser.userId;
      user.modifiedOn = moment().unix() * 1000;
      await UserService.updateUser(user);
      if (updateNewDriver || userStatus === 'Driver Invited') {
        this.sendDriverInvite(user);
        this.setState({step: 2});
      } else {
        toggle();
      }
    } else {
      user.companyId = currentUser.companyId;
      user.isBanned = 0;
      user.preferredLanguage = 'English';
      user.userStatus = 'Driver Invited';
      user.isEmailVerified = 0;
      user.isPhoneVerified = 0;
      user.createdBy = currentUser.id;
      user.createdOn = moment().unix() * 1000;
      user.modifiedBy = currentUser.id;
      user.modifiedOn = moment().unix() * 1000;
      const newUser = await UserService.createUser(user);
      user.id = newUser.id;

      const driver = {};
      driver.driverLicenseId = 1;
      driver.usersId = newUser.id;
      driver.createdBy = currentUser.id;
      driver.createdOn = moment().unix() * 1000;

      await DriverService.createDriver(driver);
      this.sendDriverInvite(user);
      this.setState({ step: 2, selectedUser: user });
    }
  }

  isFormValid() {
    const { firstName, lastName, email, mobilePhone } = this.state;
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

    if (email === null || email.length === 0) {
      this.setState({
        reqHandlerEmail: {
          touched: true,
          error: 'Please enter drivers email'
        }
      });
      isValid = false;
    }

    if (mobilePhone === null || mobilePhone.length === 0) {
      this.setState({
        reqHandlerPhone: {
          touched: true,
          error: 'Please enter a mobile phone for the driver'
        }
      });
      isValid = false;
    }

    if (isValid) {
      return true;
    }

    return false;
  }

  handleInputChange(e) {
    const { value } = e.target;
    let reqHandler = '';

    if (e.target.name === 'firstName') {
      reqHandler = 'reqHandlerFName';
    } else if (e.target.name === 'lastName') {
      reqHandler = 'reqHandlerLName';
    } else if (e.target.name === 'email') {
      reqHandler = 'reqHandlerEmail';
    } else if (e.target.name === 'mobilePhone') {
      reqHandler = 'reqHandlerPhone';
    }
    this.setState({
      [reqHandler]: Object.assign({}, reqHandler, {
        touched: false
      })
    });
    this.setState({ [e.target.name]: value });
  }

  handleSubmit(menuItem) {
    if (menuItem) {
      this.setState({ [`goTo${menuItem}`]: true });
    }
  }

  goToDriversList() {
    this.handleSubmit('Drivers');
  }

  renderGoTo() {
    const { goToDashboard, goToDrivers } = this.state;
    if (goToDashboard) {
      return <Redirect push to="/"/>;
    }
    if (goToDrivers) {
      return <Redirect push to="/drivers"/>;
    }
    return true;
  }

  renderDriverInvite() {
    const { inviteStatus, inviteMessage, selectedUser } = this.state;
    const { toggle } = this.props;
    return (
      <Row>
        <Col md={12}>
          <span>Invite a Driver</span>
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
                  this.setState({updateNewDriver: false});
                  toggle();
                }
                }
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
                onClick={() => this.setState({ step: 1, updateNewDriver: true })}
                className="secondaryButton"
              >
                Edit
              </Button>
              <Button
                onClick={() => this.sendDriverInvite(selectedUser)}
                className="primaryButton"
              >
                Resend Invite
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
      email,
      mobilePhone,
      // btnSubmitting,
      reqHandlerFName,
      reqHandlerLName,
      reqHandlerEmail,
      reqHandlerPhone,
      userStatus
    } = this.state;
    const { driverId, toggle } = this.props;
    return (
      <Row className="form">
        {this.renderGoTo()}
        <Col md={12}>
          <h3 className="page-title">
            { driverId ? 'Edit Driver' : 'Add Driver'}
          </h3>
        </Col>
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
            Email
          </span>
          <TField
            input={{
              onChange: this.handleInputChange,
              name: 'email',
              value: email
            }}
            placeholder="Email"
            type="text"
            meta={reqHandlerEmail}
          />
        </Col>
        <Col md={6} className="pt-2">
          <span>
            Mobile Phone
          </span>
          {
            /*
            <TField
              input={{
                onChange: this.handleInputChange,
                name: 'mobilePhone',
                value: mobilePhone
              }}
              placeholder="Mobile Phone"
              type="text"
              meta={reqHandlerPhone}
            />
            */
          }
          <NumberFormat
            name="mobilePhone"
            placeholder="Mobile Phone"
            type="text"
            format="(###) ###-####"
            mask="_"
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
            // loading={btnSubmitting}
            // loaderSize={10}
            bntText={driverId && userStatus !== 'Driver Invited' ? 'Update' : 'Send Invite'}
          />
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
          {step === 1 ? this.renderForm() : null }
          {step === 2 ? this.renderDriverInvite() : null }
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
