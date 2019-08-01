import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';
import {
  Card,
  CardBody,
  Col,
  // Nav,
  // NavItem,
  // NavLink,
  // TabContent,
  // TabPane,
  // Row,
  // Button,
  Container
} from 'reactstrap';
// import classnames from 'classnames';
import moment from 'moment';
import CloneDeep from 'lodash.clonedeep';
import UserService from '../../api/UserService';
import CompanyService from '../../api/CompanyService';
import LookupsService from '../../api/LookupsService';
import TCheckBox from '../common/TCheckBox';
import SelectField from '../common/TSelect';

// import { string } from 'prop-types';

class UserForm extends Component {
  constructor(props) {
    super(props);

    const user = {
      companyId: '',
      firstName: '',
      lastName: '',
      email: '',
      mobilePhone: '',
      phone: '',
      managerId: '',
      isBanned: 0,
      rating: '',
      driverId: '',
      preferredLanguage: '',
      userStatus: '',
      parentId: ''
      /*
      createdOn: moment().unix() * 1000,
      modifiedBy: 1,
      modifiedOn: moment().unix() * 1000,
      isArchived: 0
      */
    };

    this.state = {
      companyName: '',
      activeTab: '1',
      languages: [],
      userStatuses: [],
      managers: [],
      ...user
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleManagerIdChange = this.handleManagerIdChange.bind(this);
    this.handlePreferredLangChange = this.handlePreferredLangChange.bind(this);
    this.handleUserStatChange = this.handleUserStatChange.bind(this);
    this.saveUser = this.saveUser.bind(this);
  }

  async componentWillReceiveProps(nextProps) {
    const { user } = this.props;
    if (nextProps.user !== user) {
      const userNext = nextProps.user;
      Object.keys(userNext)
        .map((key) => {
          if (userNext[key] === null) {
            userNext[key] = '';
          }
          return true;
        });
      await this.fetchForeignValues(userNext);
      await this.fetchParentValues(userNext);
      this.setState({ ...userNext });
    }
  }

  async fetchForeignValues(user) {
    if (user.companyId) {
      const company = await CompanyService.getCompanyById(user.companyId);
      this.setState({ companyName: company.legalName });
    }

    const lookups = await LookupsService.getLookups();

    let languages = [];
    Object.values(lookups).forEach((itm) => {
      if (itm.key === 'Language') languages.push(itm);
    });
    languages = languages.map(languagesSelect => ({
      value: String(languagesSelect.val1),
      label: languagesSelect.val1
    }));
    this.setState({ languages });

    let userStatuses = [];
    Object.values(lookups).forEach((itm) => {
      if (itm.key === 'UserStatus') userStatuses.push(itm);
    });
    userStatuses = userStatuses.map(userStatus => ({
      value: String(userStatus.val1),
      label: userStatus.val1
    }));
    this.setState({ userStatuses });
  }

  async fetchParentValues(user) {
    // const companyId = user.companyId;

    const response = await UserService.getUsers();
    let users = response.data;
    const managers = [];
    users = users.map(userMap => ({
      value: String(userMap.id),
      label: `${userMap.firstName} ${userMap.lastName}`,
      companyId: userMap.companyId
    }));
    Object.values(users).forEach((itm) => {
      if (itm.companyId === user.companyId) managers.push(itm);
    });
    this.setState({ managers });
  }

  toggle(tab) {
    const { activeTab } = this.state;
    if (activeTab !== tab) {
      this.setState({
        activeTab: tab
      });
    }
  }

  handlePageClick(menuItem) {
    if (menuItem) {
      this.setState({ [`goTo${menuItem}`]: true });
    }
  }

  async saveUser(e) {
    e.preventDefault();
    if (!this.isFormValid()) {
      // TODO display error message
      // console.error('didnt put all the required fields.');
      return;
    }
    // const { handlePageClick } = this.props;
    // convert strings to int's
    const user = CloneDeep(this.state);
    user.companyId = Number(user.companyId);
    user.userStatus = user.userStatus;
    const { handlePageClick } = this.props;
    delete user.companyName;
    delete user.managers;
    delete user.languages;
    delete user.userStatuses;
    if (user && user.id) {
      // then we are updating the record
      user.modifiedOn = moment.utc().format();
      await UserService.updateUser(user);
      handlePageClick('User');
    } else {
      // create
      await UserService.createUser(this.state);
      handlePageClick('User');
    }
  }

  isFormValid() {
    const user = this.state;
    return !!(
      user.companyId
      && user.preferredLanguage
      && user.mobilePhone
      && user.lastName
      && user.email
      && user.firstName
      && user.userStatus
    );
  }

  async handleDelete() {
    const { user } = this.props;
    await UserService.deleteUserById(user.id);
    this.handlePageClick('User');
  }

  handleManagerIdChange(e) {
    this.setState({ managerId: Number(e.value) });
  }

  handlePreferredLangChange(e) {
    this.setState({ preferredLanguage: e.value });
  }

  handleUserStatChange(e) {
    this.setState({ userStatus: e.value });
  }

  handleInputChange(e) {
    this.setState({ [e.target.name]: e.target.value });
  }

  renderGoTo() {
    const { goToDashboard, goToUser } = this.state;
    if (goToDashboard) {
      return <Redirect push to="/"/>;
    }
    if (goToUser) {
      return <Redirect push to="/users"/>;
    }
    return true;
  }
  //
  // This is being used as the driver detail page. We are not currently showing
  // any users to the customer so there is no customer user detail page
  //

  render() {
    const {
      companyName, firstName, lastName, email, mobilePhone, managerId, managers,
      isBanned, rating, driverId, preferredLanguage, languages, userStatus, userStatuses
      // , parentId, isArchived
    } = this.state;
    return (
      <React.Fragment>
        <Col md={12} lg={12}>
          <Card>
            <CardBody>
              <div className="card__title" />

              <br />
              <form className="form" onSubmit={e => this.saveUser(e)}>
                <div className="form__half">
                  <div className="form__form-group">
                    <span className="form__form-group-label">
                          * Company
                    </span>
                    <div className="form__form-group-field">
                      <input name="companyId" type="text" value={companyName} disabled />
                    </div>
                  </div>

                  <div className="form__form-group">
                    <span className="form__form-group-label">
                          * First Name
                    </span>
                    <div className="form__form-group-field">
                      <input
                            name="firstName"
                            type="text"
                            placeholder="First Name"
                            value={firstName}
                            onChange={this.handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="form__form-group">
                    <span className="form__form-group-label">
                          * Last Name
                    </span>
                    <div className="form__form-group-field">
                      <input
                            name="lastName"
                            type="text"
                            placeholder=" Last Name"
                            value={lastName}
                            onChange={this.handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="form__form-group">
                    <span className="form__form-group-label">* Email</span>
                    <div className="form__form-group-field">
                      <input
                            name="email"
                            type="text"
                            placeholder="Email"
                            value={email}
                            onChange={this.handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="form__form-group">
                    <span className="form__form-group-label">
                          * Mobile Phone
                    </span>
                    <div className="form__form-group-field">
                      <input
                            name="mobilePhone"
                            type="text"
                            placeholder="Mobile Phone"
                            value={mobilePhone}
                            onChange={this.handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="form__form-group">
                    <span className="form__form-group-label">
                          Manager
                    </span>
                    <div className="form__form-group-field">
                      <SelectField
                            input={
                              {
                                onChange: this.handleManagerIdChange,
                                name: 'managerId',
                                value: managerId
                              }
                            }
                            meta={
                              {
                                touched: false,
                                error: 'Unable to select'
                              }
                            }
                            value={managerId}
                            options={managers}
                            placeholder="Select a Manager"
                      />
                    </div>
                  </div>
                </div>
                <div className="form__half">
                  <div className="form__form-group">
                    <div className="form__form-group">
                      <TCheckBox onChange={this.handleInputChange} name="isBanned"
                                     value={!!isBanned} label="Is Banned"
                      />
                    </div>
                  </div>
                  <div className="form__form-group">
                    <span className="form__form-group-label">Rating</span>
                    <div className="form__form-group-field">
                      <input
                            name="rating"
                            type="number"
                            placeholder=""
                            value={rating}
                            onChange={this.handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="form__form-group">
                    <span className="form__form-group-label">
                          Driver Id
                    </span>
                    <div className="form__form-group-field">
                      <input
                            name="driverId"
                            type="number"
                            placeholder=""
                            value={driverId}
                            onChange={this.handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="form__form-group">
                    <span className="form__form-group-label">
                          * Preferred Language Id
                    </span>
                    <div className="form__form-group-field">
                      <SelectField
                            input={
                              {
                                onChange: this.handlePreferredLangChange,
                                name: 'preferredLanguage',
                                value: preferredLanguage
                              }
                            }
                            meta={
                              {
                                touched: false,
                                error: 'Unable to select'
                              }
                            }
                            value={preferredLanguage}
                            options={languages}
                            placeholder="Select a language"
                      />
                    </div>
                  </div>

                  <div className="form__form-group">
                    <span className="form__form-group-label">
                          * User Status
                    </span>
                    <div className="form__form-group-field">
                      <SelectField
                            input={
                              {
                                onChange: this.handleUserStatChange,
                                name: 'userStatus',
                                value: userStatus
                              }
                            }
                            meta={
                              {
                                touched: false,
                                error: 'Unable to select'
                              }
                            }
                            value={userStatus}
                            options={userStatuses}
                            placeholder="Select a status"
                      />
                    </div>
                  </div>

                </div>
                <Container>

                  {/* <Row> */}
                  {/* <Col md="4"> */}
                  {/* <Button */}
                  {/* className="account__btn btn-delete" */}
                  {/* onClick={() => this.handleDelete()} */}
                  {/* > */}
                  {/* Delete User */}
                  {/* </Button> */}
                  {/* </Col> */}
                  {/* <Col md="4"> */}
                  {/* {this.renderGoTo()} */}
                  {/* <Button */}
                  {/* className="app-link account__btn btn-back" */}
                  {/* onClick={() => this.handlePageClick('User')} */}
                  {/* > */}
                  {/* Cancel */}
                  {/* </Button> */}
                  {/* </Col> */}
                  {/* <Col md="4"> */}
                  {/* <Button */}
                  {/* type="submit" */}
                  {/* className="account__btn btn-save" */}
                  {/* > */}
                  {/* Submit */}
                  {/* </Button> */}
                  {/* </Col> */}
                  {/* </Row> */}
                </Container>
              </form>
            </CardBody>
          </Card>
        </Col>
      </React.Fragment>
    );
  }
}

UserForm.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.number
  }),
  handlePageClick: PropTypes.func.isRequired
};

UserForm.defaultProps = {
  user: {}
};

export default UserForm;
