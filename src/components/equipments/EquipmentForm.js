import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';
import moment from 'moment';
import {
  Card,
  CardBody,
  Col,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
  Row,
  Button,
  Container
} from 'reactstrap';
import { Select } from '@material-ui/core';
import classnames from 'classnames';
import CompanyService from '../../api/CompanyService';
import LookupsService from '../../api/LookupsService';
import UserService from '../../api/UserService';
import EquipmentService from '../../api/EquipmentService';

// import CompanyForm from '../companies/CompanyForm';

class EquipmentForm extends Component {
  constructor(props) {
    super(props);

    const equipment = {
      name: '',
      type: 0,
      styleId: 0,
      maxCapacity: 0,
      minCapacity: 0,
      minHours: 0,
      maxDistance: 0,
      description: '',
      licensePlate: '',
      vin: '',
      image: '',
      currentAvailability: 0,
      hourRate: 0,
      tonRate: 0,
      rateType: 'Hour',
      companyId: 0,
      defaultDriverId: 0,
      driverEquipmentsId: 0,
      driversId: 0,
      equipmentAddressId: 0,
      modelId: '',
      makeId: '',
      notes: '',
      createdBy: 0,
      createdOn: moment.utc().format(),
      modifiedBy: 0,
      modifiedOn: moment.utc().format(),
      isArchived: 0
    };

    this.state = {
      activeTab: '1',
      companyName: '',
      drivers: [],
      equipmentTypes: [],
      users: [],
      ...equipment
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.toggle = this.toggle.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.equipment) {
      const { equipment } = nextProps;
      Object.keys(equipment)
        .map((key) => {
          if (equipment[key] === null) {
            equipment[key] = '';
          }
          return true;
        });
      this.setState({ ...equipment });
      this.fetchForeignValues();
      this.fetchParentValues();
    }
  }

  async fetchForeignValues() {
    const { equipment } = this.props;
    if (equipment.companyId) {
      const company = await CompanyService.getCompanyById(equipment.companyId);
      this.setState({ companyName: company.legalName });
    }

    const lookups = await LookupsService.getLookups();
    const equipmentTypes = [];
    Object.values(lookups).forEach((itm) => {
      if (itm.key === 'EquipmentType') equipmentTypes.push(itm);
    });
    this.setState({ equipmentTypes });

    if (equipment.createdBy) {
      let createdBy = await UserService.getUserById(equipment.createdBy);
      createdBy = `${createdBy.firstName} ${createdBy.lastName}`;
      this.setState({ createdBy });
    }

    if (equipment.modifiedBy) {
      let modifiedBy = await UserService.getUserById(equipment.modifiedBy);
      modifiedBy = `${modifiedBy.firstName} ${modifiedBy.lastName}`;
      this.setState({ modifiedBy });
    }
  }

  async fetchParentValues() {
    const response = await UserService.getUsers();
    const users = response.data;
    const { companyId } = this.state;
    const drivers = [];
    Object.values(users).forEach((itm) => {
      if (itm.companyId === companyId) {
        drivers.push(itm);
      }
    });
    this.setState({ drivers });
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

  async saveEquipment(e) {
    e.preventDefault();
    const { equipment, handlePageClick } = this.props;
    if (!this.isFormValid()) {
      // TODO display error message
      // console.error('didnt put all the required fields.');
      return;
    }
    const equipmentForm = this.state;
    if (equipment && equipment.id) {
      // then we are updating the record
      equipment.isArchived = equipment.isArchived === 'on' ? 1 : 0;
      equipment.modifiedOn = moment()
        .unix() * 1000;
      await EquipmentService.updateEquipment(equipmentForm);
      handlePageClick('Equipment');
    } else {
      // create
      await EquipmentService.createEquipment(equipmentForm);
      handlePageClick('Equipment');
    }
  }

  isFormValid() {
    const equipment = this.state;
    return !!(
      equipment.companyId
      /*
      && equipment.driversId
      && equipment.equipmentAddressId
      && equipment.modelId
      && equipment.makeId
      */
    );
  }

  async handleDelete() {
    const { equipment } = this.props;
    await EquipmentService.deleteEquipmentById(equipment.id);
    this.handlePageClick('Equipment');
  }

  handleInputChange(e) {
    let { value } = e.target;
    if (e.target.name === 'isArchived') {
      value = e.target.checked ? Number(1) : Number(0);
    }
    this.setState({ [e.target.name]: value });
  }

  renderGoTo() {
    const { goToDashboard, goToEquipment } = this.state;
    if (goToDashboard) {
      return <Redirect push to="/" />;
    }
    if (goToEquipment) {
      return <Redirect push to="/trucks" />;
    }
    return true;
  }

  render() {
    const {
      activeTab, companyName, name, type, equipmentTypes, styleId, maxCapacity, minHours,
      maxDistance, hourRate, tonRate, licensePlate, vin, image, defaultDriverId, rateType,
      driverEquipmentsId, driversId, drivers, equipmentAddressId, modelId, makeId,
      description, notes, createdBy, createdOn, modifiedBy, modifiedOn, users, minCapacity
    } = this.state;
    return (
      <React.Fragment>
        <Col md={12} lg={12}>
          <Card>
            <CardBody>
              <div className="tabs tabs--bordered-top">
                <div className="tabs__wrap">
                  <Nav tabs>
                    <NavItem>
                      <NavLink
                        className={classnames({ active: activeTab === '1' })}
                        onClick={() => {
                          this.toggle('1');
                        }}
                      >
                        Truck
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        className={classnames({ active: activeTab === '2' })}
                        onClick={() => {
                          this.toggle('2');
                        }}
                      >
                        Jobs
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        className={classnames({ active: activeTab === '3' })}
                        onClick={() => {
                          this.toggle('3');
                        }}
                      >
                        Bids
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        className={classnames({ active: activeTab === '4' })}
                        onClick={() => {
                          this.toggle('4');
                        }}
                      >
                        Bookings
                      </NavLink>
                    </NavItem>
                  </Nav>
                  <TabContent activeTab={activeTab}>
                    <TabPane tabId="1">
                      <div className="card__title" />
                      <form className="form" onSubmit={e => this.saveEquipment(e)}>
                        <div className="form__half">
                          <div className="form__form-group">
                            <span className="form__form-group-label">Company ID</span>
                            <div className="form__form-group-field">
                              <input name="companyId" type="text" value={companyName} disabled />
                            </div>
                          </div>
                          <div className="form__form-group">
                            <span className="form__form-group-label">Name</span>
                            <div className="form__form-group-field">
                              <input name="name" type="text" value={name}
                                onChange={this.handleInputChange}
                              />
                            </div>
                          </div>
                          <div className="form__form-group">
                            <span className="form__form-group-label">Type</span>
                            <div className="form__form-group-field">
                              <Select
                                name="type"
                                value={type}
                                onChange={this.handleInputChange}
                              >
                                {
                                  equipmentTypes.map(typeSelect => (
                                    <option key={typeSelect.order} value={typeSelect.order}>
                                      {typeSelect.val1}
                                    </option>
                                  ))
                                }
                              </Select>
                            </div>
                          </div>
                          <div className="form__form-group">
                            <span className="form__form-group-label">StyleID</span>
                            <div className="form__form-group-field">
                              <input name="styleId" type="number" value={styleId}
                                onChange={this.handleInputChange}
                              />
                            </div>
                          </div>
                          <div className="form__form-group">
                            <span className="form__form-group-label">Max Capacity</span>
                            <div className="form__form-group-field">
                              <input name="maxCapacity" type="number" value={maxCapacity}
                                onChange={this.handleInputChange}
                              />
                            </div>
                          </div>
                          <div className="form__form-group">
                            <span className="form__form-group-label">Min Capacity</span>
                            <div className="form__form-group-field">
                              <input name="minCapacity" type="number" value={minCapacity}
                                     onChange={this.handleInputChange}
                              />
                            </div>
                          </div>
                          <div className="form__form-group">
                            <span className="form__form-group-label">Minimum Hours</span>
                            <div className="form__form-group-field">
                              <input name="minHours" type="number" value={minHours}
                                onChange={this.handleInputChange}
                              />
                            </div>
                          </div>
                          <div className="form__form-group">
                            <span className="form__form-group-label">Max Distance</span>
                            <div className="form__form-group-field">
                              <input name="maxDistance" type="number" value={maxDistance}
                                onChange={this.handleInputChange}
                              />
                            </div>
                          </div>
                          <div className="form__form-group">
                            <span className="form__form-group-label">Hourly Rate</span>
                            <div className="form__form-group-field">
                              <input name="hourRate" type="number" value={hourRate}
                                onChange={this.handleInputChange}
                              />
                            </div>
                          </div>
                          <div className="form__form-group">
                            <span className="form__form-group-label">Ton Rate</span>
                            <div className="form__form-group-field">
                              <input name="tonRate" type="number" value={tonRate}
                                onChange={this.handleInputChange}
                              />
                            </div>
                          </div>
                          <div className="form__form-group">
                            <span className="form__form-group-label">Rate Type</span>
                            <div className="form__form-group-field">
                              <input name="rateType" type="text" value={rateType}
                                onChange={this.handleInputChange}
                              />
                            </div>
                          </div>
                          <div className="form__form-group">
                            <span className="form__form-group-label">License Plate</span>
                            <div className="form__form-group-field">
                              <input name="licensePlate" type="text" value={licensePlate}
                                onChange={this.handleInputChange}
                              />
                            </div>
                          </div>
                          <div className="form__form-group">
                            <span className="form__form-group-label">VIN</span>
                            <div className="form__form-group-field">
                              <input name="vin" type="text" value={vin}
                                onChange={this.handleInputChange}
                              />
                            </div>
                          </div>
                          <div className="form__form-group">
                            <span className="form__form-group-label">Image</span>
                            <div className="form__form-group-field">
                              <input name="image" type="text" value={image}
                                onChange={this.handleInputChange}
                              />
                            </div>
                          </div>
                          <div className="form__form-group">
                            <span className="form__form-group-label">Default DriverID</span>
                            <div className="form__form-group-field">
                              <Select
                                name="defaultDriverId"
                                value={defaultDriverId}
                                onChange={this.handleInputChange}
                              >
                                {
                                  drivers.map(driverSelect => (
                                    <option key={driverSelect.id} value={driverSelect.id}>
                                      {`${driverSelect.firstName} ${driverSelect.lastName}`}
                                    </option>
                                  ))
                                }
                              </Select>
                            </div>
                          </div>
                        </div>
                        <div className="form__half">
                          <div className="form__form-group">
                            <span className="form__form-group-label">DriverEquipmentsID</span>
                            <div className="form__form-group-field">
                              <input name="driverEquipmentsId" type="number"
                                value={driverEquipmentsId} // eslint-disable-line camelcase
                                onChange={this.handleInputChange}
                              />
                            </div>
                          </div>
                          <div className="form__form-group">
                            <span className="form__form-group-label">DriversID</span>
                            <div className="form__form-group-field">
                              <Select
                                name="driversId"
                                value={driversId}
                                onChange={this.handleInputChange}
                              >
                                {
                                  drivers.map(driverSelect => (
                                    <option key={driverSelect.id} value={driverSelect.id}>
                                      {`${driverSelect.firstName} ${driverSelect.lastName}`}
                                    </option>
                                  ))
                                }
                              </Select>
                            </div>
                          </div>
                          <div className="form__form-group">
                            <span className="form__form-group-label">Equipment AddressID</span>
                            <div className="form__form-group-field">
                              <input name="equipmentAddressId" type="number"
                                value={equipmentAddressId}
                                onChange={this.handleInputChange}
                              />
                            </div>
                          </div>
                          <div className="form__form-group">
                            <span className="form__form-group-label">ModelID</span>
                            <div className="form__form-group-field">
                              <input name="modelId" type="number" value={modelId}
                                onChange={this.handleInputChange}
                              />
                            </div>
                          </div>
                          <div className="form__form-group">
                            <span className="form__form-group-label">MakeID</span>
                            <div className="form__form-group-field">
                              <input name="makeId" type="number" value={makeId}
                                onChange={this.handleInputChange}
                              />
                            </div>
                          </div>
                          <div className="form__form-group">
                            <span className="form__form-group-label">Description</span>
                            <div className="form__form-group-field">
                              <input name="description" type="text" value={description}
                                onChange={this.handleInputChange}
                              />
                            </div>
                          </div>
                          <div className="form__form-group">
                            <span className="form__form-group-label">Notes</span>
                            <div className="form__form-group-field">
                              <input name="notes" type="text" value={notes}
                                onChange={this.handleInputChange}
                              />
                            </div>
                          </div>
                          <div className="form__form-group">
                            <span className="form__form-group-label">Created By</span>
                            <div className="form__form-group-field">
                              <input name="createdBy" type="text" placeholder=""
                                value={
                                  users.map(
                                    (item, key) => (
                                      users[key].value === createdBy ? users[key].display : null
                                    )
                                  )
                                }
                                onChange={this.handleInputChange}
                                disabled
                              />
                            </div>
                          </div>
                          <div className="form__form-group">
                            <span className="form__form-group-label">Created On</span>
                            <div className="form__form-group-field">
                              <input name="createdOn" type="text"
                                value={moment(createdOn)
                                  .format()} onChange={this.handleInputChange} disabled
                              />
                            </div>
                          </div>
                          <div className="form__form-group">
                            <span className="form__form-group-label">Modified By</span>
                            <div className="form__form-group-field">
                              <input name="modifiedBy" type="text" placeholder=""
                                value={
                                  users.map(
                                    (item, key) => (
                                      users[key].value === modifiedBy ? users[key].display : null
                                    )
                                  )
                                }
                                onChange={this.handleInputChange}
                                disabled
                              />
                            </div>
                          </div>
                          <div className="form__form-group">
                            <span className="form__form-group-label">Modified On</span>
                            <div className="form__form-group-field">
                              <input name="modifiedOn" type="text"
                                value={moment(modifiedOn)
                                  .format()} onChange={this.handleInputChange} disabled
                              />
                            </div>
                          </div>
                        </div>
                        <Container>
                          <Row>
                            <Col md="4">
                              <Button
                                className="account__btn btn-delete"
                                onClick={() => this.handleDelete()}
                              >
                                Delete Equipment
                              </Button>
                            </Col>
                            <Col md="4">
                              {this.renderGoTo()}
                              <Button
                                className="app-link account__btn btn-back"
                                onClick={() => this.handlePageClick('Equipment')}
                              >
                                Cancel
                              </Button>
                            </Col>
                            <Col md="4">
                              <Button
                                type="submit"
                                className="account__btn btn-save"
                              >
                                Submit
                              </Button>
                            </Col>
                          </Row>
                        </Container>
                      </form>
                    </TabPane>
                    <TabPane tabId="2" />
                    <TabPane tabId="3" />
                    <TabPane tabId="4" />
                  </TabContent>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
      </React.Fragment>
    );
  }
}

EquipmentForm.propTypes = {
  equipment: PropTypes.shape({
    id: PropTypes.number
  }),
  handlePageClick: PropTypes.func.isRequired
};

EquipmentForm.defaultProps = {
  equipment: null
};

export default EquipmentForm;
