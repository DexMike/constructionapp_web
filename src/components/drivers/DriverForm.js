import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';
import {
  Card,
  CardBody,
  Col,
  Button
} from 'reactstrap';
import moment from 'moment';
import NumberFormat from 'react-number-format';
import TField from '../common/TField';
import UserService from '../../api/UserService';
import DriverService from '../../api/DriverService';
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
      selectedUser: [],
      btnSubmitting: false,
      reqHandlerFName: { touched: false, error: '' },
      reqHandlerLName: { touched: false, error: '' },
      reqHandlerEmail: { touched: false, error: '' },
      reqHandlerPhone: { touched: false, error: '' }
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.goToDriversList = this.goToDriversList.bind(this);
    this.saveUser = this.saveUser.bind(this);
  }

  async componentDidMount() {
    const { match } = this.props;
    let { id, firstName, lastName, email, mobilePhone, selectedUser } = this.state;

    if (match.params.id) {
      const driver = await DriverService.getDriverById(match.params.id);
      selectedUser = await UserService.getUserById(driver.usersId);
      id = driver.usersId;
      ({ firstName } = selectedUser);
      ({ lastName } = selectedUser);
      ({ email } = selectedUser);
      ({ mobilePhone } = selectedUser);

      this.setState({ selectedUser, id, firstName, lastName, email, mobilePhone });
    }
  }

  handlePageClick(menuItem) {
    if (menuItem) {
      this.setState({ [`goTo${menuItem}`]: true });
    }
  }

  async saveUser() {
    this.setState({ btnSubmitting: true });

    if (!this.isFormValid()) {
      this.setState({ btnSubmitting: false });
      return;
    }

    const { firstName, lastName, email, mobilePhone, selectedUser } = this.state;
    const user = selectedUser;
    user.mobilePhone = mobilePhone;
    user.lastName = lastName;
    user.email = email;
    user.firstName = firstName;

    if (user && user.id) {
      user.modifiedOn = moment()
        .unix() * 1000;
      await UserService.updateUser(user);
      this.handleSubmit('Drivers');
    }
  }

  isFormValid() {
    const { firstName, lastName, email, mobilePhone } = this.state;
    let isValid = true;

    if (firstName === null || firstName.length === 0) {
      this.setState({
        reqHandlerFName: {
          touched: true,
          error: 'Please enter a first name for the driver'
        }
      });
      isValid = false;
    }

    if (lastName === null || lastName.length === 0) {
      this.setState({
        reqHandlerLName: {
          touched: true,
          error: 'Please enter a last name for the driver'
        }
      });
      isValid = false;
    }

    if (email === null || email.length === 0) {
      this.setState({
        reqHandlerEmail: {
          touched: true,
          error: 'Please enter a email for the driver'
        }
      });
      isValid = false;
    }

    if (mobilePhone === null || mobilePhone.length === 0) {
      this.setState({
        reqHandlerPhone: {
          touched: true,
          error: 'Please enter an mobile phone for the driver'
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

  render() {
    const {
      firstName,
      lastName,
      email,
      mobilePhone,
      btnSubmitting,
      reqHandlerFName,
      reqHandlerLName,
      reqHandlerEmail,
      reqHandlerPhone } = this.state;
    return (
      <React.Fragment>
        {this.renderGoTo()}
        <Col md={12} lg={12}>
          <h3 className="page-title">Edit Driver</h3>
          <br />
          <Card>
            <CardBody>
              <form className="form">
                <div className="form__half">
                  <div className="form__form-group">
                    <span className="form__form-group-label">
                          First Name
                    </span>
                    <TField
                      input={{
                        onChange: this.handleInputChange,
                        name: 'firstName',
                        value: firstName
                      }}
                      placeholder=""
                      type="text"
                      meta={reqHandlerFName}
                    />
                  </div>

                  <div className="form__form-group">
                    <span className="form__form-group-label">Email</span>
                    <TField
                        input={{
                          onChange: this.handleInputChange,
                          name: 'email',
                          value: email
                        }}
                        placeholder=""
                        type="text"
                        meta={reqHandlerEmail}
                    />
                  </div>
                </div>
                <div className="form__half">
                  <div className="form__form-group">
                    <span className="form__form-group-label">
                          Last Name
                    </span>
                    <TField
                        input={{
                          onChange: this.handleInputChange,
                          name: 'lastName',
                          value: lastName
                        }}
                        placeholder=""
                        type="text"
                        meta={reqHandlerLName}
                    />
                  </div>
                  <div className="form__form-group">
                    <span className="form__form-group-label">
                          Mobile Phone
                    </span>
                    <NumberFormat
                        name="mobilePhone"
                        type="text"
                        format="(###) ###-####"
                        mask="_"
                        value={mobilePhone}
                        onChange={this.handleInputChange}
                        meta={reqHandlerPhone}
                    />
                  </div>
                  <br />
                  <div className="float-right">
                    <Button key="2" onClick={this.goToDriversList} className="secondaryButton">Cancel</Button>
                    <TSubmitButton
                      onClick={this.saveUser}
                      className="primaryButton"
                      loading={btnSubmitting}
                      loaderSize={10}
                      bntText="Update Driver"
                    />
                  </div>
                </div>
              </form>
            </CardBody>
          </Card>
        </Col>
      </React.Fragment>
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
  })
};

DriverForm.defaultProps = {
  user: {},
  match: {
    params: {}
  }
};

export default DriverForm;
