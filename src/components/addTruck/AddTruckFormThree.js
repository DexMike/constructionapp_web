import React, { PureComponent } from 'react';
import {
  Card,
  CardBody,
  Col,
  Row,
  Button,
  ButtonToolbar,
  Container
} from 'reactstrap';
import PropTypes from 'prop-types';
import moment from 'moment';
import CloneDeep from 'lodash.clonedeep';
// import NumberFormat from 'react-number-format';
// import TField from '../common/TField';
import UserService from '../../api/UserService';
import DriverService from '../../api/DriverService';
import ProfileService from '../../api/ProfileService';
import SelectField from '../common/TSelect';
import TSpinner from '../common/TSpinner';

class AddTruckFormThree extends PureComponent {
  constructor(props) {
    super(props);
    const { equipmentId } = this.props;
    this.state = {
      // showPassword: false
      id: 0, // only to track if this is an edit
      firstName: '',
      lastName: '',
      mobilePhone: '',
      email: '',
      equipmentId,
      companyId: 0,
      parentId: 4, // THIS IS A FK
      isBanned: 0,
      preferredLanguage: 'English',
      userStatus: 'New',
      reqHandlerDriver: { touched: false, error: '' },
      reqHandlerFName: { touched: false, error: '' },
      reqHandlerLName: { touched: false, error: '' },
      reqHandlerEmail: { touched: false, error: '' },
      reqHandlerPhone: { touched: false, error: '' },
      allDrivers: [],
      selectedDriverId: 0,
      loaded: false
    };
    this.handleInputChange = this.handleInputChange.bind(this);
    this.onSubmitDriver = this.onSubmitDriver.bind(this);
    this.getAndSetExistingUser = this.getAndSetExistingUser.bind(this);
    this.selectChange = this.selectChange.bind(this);
  }

  async componentDidMount() {
    // check fo cached info
    const { getUserFullInfo, passedTruckFullInfoId, editDriverId } = this.props;
    const preloaded = getUserFullInfo();
    const profile = await ProfileService.getProfile();

    let allDrivers = await DriverService.getDriverByCompanyId(profile.companyId);
    allDrivers = allDrivers.map(driver => ({
      value: String(driver.driverId),
      label: `${driver.firstName} ${driver.lastName} - ${driver.mobilePhone} - ${driver.email}`
    }));

    // console.log(preloaded);
    if (Object.keys(preloaded).length > 0) {
      this.setState({
        firstName: preloaded.info.firstName,
        lastName: preloaded.info.lastName,
        mobilePhone: preloaded.info.mobilePhone,
        email: preloaded.info.email,
        allDrivers,
        loaded: true
      });
    } else {
      this.setState({
        allDrivers
      });
    }

    // check for existing user (if this is loaded data)
    // TODO -> use only a bool to check for this (only pass the id)
    if (passedTruckFullInfoId !== null && passedTruckFullInfoId !== 0) {
      this.getAndSetExistingUser(passedTruckFullInfoId);
    }
    // check for existing driver (we're coming from Driver's List)
    if (editDriverId) {
      this.getAndSetExistingUser(editDriverId);
    }

    this.setState({loaded: true});
  }

  componentWillReceiveProps(nextProps) {
    const {validateResThree} = this.props;
    if (nextProps.validateOnTabThreeClick) {
      if (this.isFormValid()) {
        validateResThree(true);
        this.saveUserInfo(true);
      } else {
        validateResThree(false);
      }
    }
  }

  async onSubmitDriver() {
    // const user = this.state;
    const { onClose } = this.props;
    const user = CloneDeep(this.state);
    delete user.equipmentId;
    delete user.parentId;
    delete user.reqHandlerEmail;
    delete user.reqHandlerFName;
    delete user.reqHandlerLName;
    delete user.reqHandlerPhone;
    user.modifiedOn = moment()
      .unix() * 1000;
    await UserService.updateUser(user);
    onClose();
  }

  async getAndSetExistingUser(id) {
    // I only have the driverId, so I have to work from there
    const driver = await DriverService.getDriverById(id);
    let user;
    try {
      user = await UserService.getUserById(driver.usersId);
    } catch (e) {
      /* console.log(e); */
    }
    if (user) {
      this.setState({
        id: driver.id,
        firstName: user.firstName,
        lastName: user.lastName,
        mobilePhone: user.mobilePhone,
        email: user.email,
        companyId: user.companyId,
        isBanned: user.isBanned,
        preferredLanguage: user.preferredLanguage,
        userStatus: user.userStatus,
        selectedDriverId: driver.id
      },
      function setUserInfo() { // wait until it loads
        this.saveUserInfo(false);
      });
    } else {
      this.setState({
        id: 0
      });
    }
    // , this.saveUserInfo(false));
  }

  handleInputChange(e) {
    let { value } = e.target;
    let reqHandler = '';
    if (e.target.name === 'isArchived') {
      value = e.target.checked ? Number(1) : Number(0);
    }

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
    this.setState({ [e.target.name]: value },
      function wait() {
        this.saveUserInfo(false);
      });
  }

  isFormValid() {
    // const truck = this.state;
    const { selectedDriverId } = this.state;
    let isValid = true;

    if (selectedDriverId === null || selectedDriverId === 0 || selectedDriverId.length === 0) {
      this.setState({
        reqHandlerDriver: {
          touched: true,
          error: 'Please select a driver'
        }
      });
      isValid = false;
    }
    /*
    if (truck.firstName === null || truck.firstName.length === 0) {
      this.setState({
        reqHandlerFName: {
          touched: true,
          error: 'Please enter a first name for the driver'
        }
      });
      isValid = false;
    }

    if (truck.lastName === null || truck.lastName.length === 0) {
      this.setState({
        reqHandlerLName: {
          touched: true,
          error: 'Please enter a last name for the driver'
        }
      });
      isValid = false;
    }

    if (truck.email === null || truck.email.length === 0) {
      this.setState({
        reqHandlerEmail: {
          touched: true,
          error: 'Please enter a email for the driver'
        }
      });
      isValid = false;
    }

    if (truck.mobilePhone === null || truck.mobilePhone.length === 0) {
      this.setState({
        reqHandlerPhone: {
          touched: true,
          error: 'Please enter an mobile phone for the driver'
        }
      });
      isValid = false;
    }
    */
    if (isValid) {
      return true;
    }

    return false;
  }

  saveUserInfo(redir) {
    const { onUserFullInfo } = this.props;
    const {
      firstName,
      lastName,
      mobilePhone,
      email,
      selectedDriverId
    } = this.state;

    const userInfo = {
      id: selectedDriverId, // only to track if this is an edit
      firstName,
      lastName,
      mobilePhone,
      email
    };

    userInfo.redir = redir;
    onUserFullInfo(userInfo);
    this.handleSubmit('User');
    // this.saveUserInfo(true);
  }

  async selectChange(data) {
    const reqHandler = 'reqHandlerDriver';

    this.setState({
      [reqHandler]: Object.assign({},
        reqHandler,
        {
          touched: false
        }),
      selectedDriverId: data.value
    }, function wait() {
      this.saveUserInfo(false);
    });
  }

  async saveUser(e) {
    e.preventDefault();
    e.persist();

    if (!this.isFormValid()) {
      return;
    }

    this.saveUserInfo(true);
  }

  handleSubmit(menuItem) {
    if (menuItem) {
      this.setState({ [`goTo${menuItem}`]: true });
    }
  }

  render() {
    const { previousPage, onClose, editDriverId } = this.props;
    const {
      id,
      // firstName,
      // lastName,
      // mobilePhone,
      // email,
      // equipmentId,
      parentId,
      isBanned,
      preferredLanguage,
      userStatus,
      reqHandlerDriver,
      // reqHandlerFName,
      // reqHandlerLName,
      // reqHandlerEmail,
      allDrivers,
      selectedDriverId,
      loaded
    } = this.state;
    const buttons = [];

    if (editDriverId) { // We are in Drivers List
      buttons.push(<Button key="1" onClick={this.onSubmitDriver} className="primaryButton">Update Driver</Button>);
    } else {
      buttons.push(<Button key="1" type="button" className="secondaryButton" onClick={previousPage}>Back</Button>);
      buttons.push(<Button key="2" type="submit" className="primaryButton">Next</Button>);
    }

    if (loaded) {
      return (
        <Col md={12} lg={12}>
          <Card>
            <CardBody>

              <h3 className="subhead">
                Search for a Driver
              </h3>

              <form
                className="form form--horizontal addtruck__form"
                onSubmit={e => this.saveUser(e)}
              >
                <input type="hidden" value={id} />
                <input type="hidden" value={parentId} />
                <input type="hidden" value={isBanned} />
                <input type="hidden" value={preferredLanguage} />
                <input type="hidden" value={userStatus} />

                <Row className="col-md-12">

                  {/*
                  <div className="col-md-6 form__form-group">
                    <span className="form__form-group-label">First Name</span>
                    <TField
                      input={
                        {
                          onChange: this.handleInputChange,
                          name: 'firstName',
                          value: firstName
                        }
                      }
                      placeholder=""
                      type="text"
                      meta={reqHandlerFName}
                    />
                    <input type="hidden" value={equipmentId} />
                  </div>
                  <div className="col-md-6 form__form-group">
                    <span className="form__form-group-label">Last Name</span>
                    <TField
                      input={
                        {
                          onChange: this.handleInputChange,
                          name: 'lastName',
                          value: lastName
                        }
                      }
                      placeholder=""
                      type="text"
                      meta={reqHandlerLName}
                    />
                  </div>
                  */}

                  <SelectField
                    input={
                      {
                        onChange: this.selectChange,
                        name: 'All Drivers',
                        value: selectedDriverId
                      }
                    }
                    meta={reqHandlerDriver}
                    value={selectedDriverId}
                    options={allDrivers}
                    placeholder="All Drivers"
                  />

                </Row>

                <Row className="col-md-12">

                  {/*
                  <div className="col-md-6">
                    <span className="form__form-group-label">Mobile Phone</span>
                    <NumberFormat
                      name="mobilePhone"
                      type="text"
                      format="(###) ###-####"
                      mask="_"
                      value={mobilePhone}
                      onChange={this.handleInputChange}
                    />
                  </div>
                  <div className="col-md-6 form__form-group">
                    <span className="form__form-group-label">Email</span>
                    <TField
                      input={
                        {
                          onChange: this.handleInputChange,
                          name: 'email',
                          value: email
                        }
                      }
                      placeholder=""
                      type="text"
                      meta={reqHandlerEmail}
                    />
                  </div>
                  */}
                </Row>

                <Row className="col-md-12">
                  <hr />
                </Row>

                <Row className="col-md-12">
                  <ButtonToolbar className="col-md-6 wizard__toolbar">
                    <Button type="button" className="tertiaryButton" onClick={onClose}>
                      Cancel
                    </Button>
                  </ButtonToolbar>
                  <ButtonToolbar className="col-md-6 wizard__toolbar right-buttons">
                    {buttons}
                  </ButtonToolbar>
                </Row>

              </form>
            </CardBody>
          </Card>
        </Col>
      );
    }
    return (
      <Col md={12}>
        <Card style={{paddingBottom: 0}}>
          <CardBody>
            <Row className="col-md-12"><TSpinner loading/></Row>
          </CardBody>
        </Card>
      </Col>
    );
  }
}

AddTruckFormThree.propTypes = {
  equipmentId: PropTypes.number,
  getUserFullInfo: PropTypes.func.isRequired,
  onUserFullInfo: PropTypes.func.isRequired,
  previousPage: PropTypes.func.isRequired,
  passedTruckFullInfoId: PropTypes.number,
  editDriverId: PropTypes.number,
  onClose: PropTypes.func.isRequired,
  validateResThree: PropTypes.any, // eslint-disable-line react/forbid-prop-types
  validateOnTabThreeClick: PropTypes.any // eslint-disable-line react/forbid-prop-types
};

AddTruckFormThree.defaultProps = {
  equipmentId: null,
  passedTruckFullInfoId: null,
  editDriverId: 0,
  validateResThree: null,
  validateOnTabThreeClick: null
};

export default AddTruckFormThree;
