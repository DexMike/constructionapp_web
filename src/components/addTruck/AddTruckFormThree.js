import React, { PureComponent } from 'react';
import {
  Card,
  CardBody,
  Col,
  Row,
  Button,
  ButtonToolbar
} from 'reactstrap';
import PropTypes from 'prop-types';
import NumberFormat from 'react-number-format';
import UserService from '../../api/UserService';
import DriverService from '../../api/DriverService';

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
      parentId: 4, // THIS IS A FK
      isBanned: 0,
      preferredLanguage: 'eng',
      userStatus: 'New'
    };
    this.handleInputChange = this.handleInputChange.bind(this);
    this.getAndSetExistingUser = this.getAndSetExistingUser.bind(this);
  }

  componentDidMount() {
    // check fo cached info
    const { getUserFullInfo, passedTruckFullInfoId } = this.props;
    const preloaded = getUserFullInfo();
    if (Object.keys(preloaded).length > 0) {
      this.setState({
        firstName: preloaded.info.firstName,
        lastName: preloaded.info.lastName,
        mobilePhone: preloaded.info.mobilePhone,
        email: preloaded.info.email
      });
    }

    // check for existing user (if this is loaded data)
    // TODO -> use only a bool to check for this (only pass the id)
    // console.log(passedTruckFullInfoId);
    if (passedTruckFullInfoId !== null && passedTruckFullInfoId !== 0) {
      this.getAndSetExistingUser(passedTruckFullInfoId);
    }
  }

  async getAndSetExistingUser(id) {
    // I only have the driverId, so I have to work from there
    const driver = await DriverService.getDriverById(id);
    const user = await UserService.getUserById(driver.usersId);
    this.setState({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      mobilePhone: user.mobilePhone,
      email: user.email
    },
    function chido() { // wait until it loads
      this.saveUserInfo(false);
    });
    // , this.saveUserInfo(false));
  }

  handleInputChange(e) {
    let { value } = e.target;
    if (e.target.name === 'isArchived') {
      value = e.target.checked ? Number(1) : Number(0);
    }
    this.setState({ [e.target.name]: value });
  }

  saveUserInfo(redir) {
    const { onUserFullInfo } = this.props;
    const {
      id, // only to track if this is an edit
      firstName,
      lastName,
      mobilePhone,
      email
    } = this.state;
    const userInfo = {
      id, // only to track if this is an edit
      firstName,
      lastName,
      mobilePhone,
      email
    };
    userInfo.redir = redir;
    onUserFullInfo(userInfo);
    this.handleSubmit('User');
  }

  async saveUser(e) {
    e.preventDefault();
    e.persist();
    this.saveUserInfo(true);
  }

  handleSubmit(menuItem) {
    if (menuItem) {
      this.setState({ [`goTo${menuItem}`]: true });
    }
  }

  render() {
    const { previousPage, onClose } = this.props;
    const {
      id,
      firstName,
      lastName,
      mobilePhone,
      email,
      equipmentId,
      parentId,
      isBanned,
      preferredLanguage,
      userStatus
    } = this.state;
    return (
      <Col md={12} lg={12}>
        <Card>
          <CardBody>
            <div className="card__title">
              <h5 className="bold-text">
                Add a Driver
              </h5>
            </div>

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
                <hr className="bighr" />
              </Row>

              <Row className="col-md-12">

                <div className="col-md-6 form__form-group">
                  <span className="form__form-group-label">First Name</span>
                  <input
                    name="firstName"
                    type="text"
                    value={firstName}
                    onChange={this.handleInputChange}
                  />
                  <input type="hidden" value={equipmentId} />
                </div>
                <div className="col-md-6 form__form-group">
                  <span className="form__form-group-label">Last Name</span>
                  <input
                    name="lastName"
                    type="text"
                    value={lastName}
                    onChange={this.handleInputChange}
                  />
                </div>
              </Row>

              <Row className="col-md-12">

                <div className="col-md-6 form__form-group">
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
                  <input
                    name="email"
                    type="text"
                    value={email}
                    onChange={this.handleInputChange}
                  />
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
                  <Button color="secondary" type="button" onClick={previousPage} className="previous">Back</Button>
                  <Button color="primary" type="submit" className="next">Next</Button>
                </ButtonToolbar>
              </Row>

            </form>
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
  onClose: PropTypes.func.isRequired
};

AddTruckFormThree.defaultProps = {
  equipmentId: null,
  passedTruckFullInfoId: null
};

export default AddTruckFormThree;
