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
// import UserService from '../../api/UserService';
// import DriverService from '../../api/DriverService';

class AddTruckFormThree extends PureComponent {
  constructor(props) {
    super(props);
    const { company } = this.props;
    this.state = {
      // showPassword: false
      firstName: '',
      lastName: '',
      mobilePhone: '',
      email: '',
      companyId: company.id,
      parentId: 4, // THIS IS A FK
      isBanned: 0,
      preferredLanguage: 'eng',
      userStatus: 'New'
    };
    this.handleInputChange = this.handleInputChange.bind(this);
    // this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleInputChange(e) {
    let { value } = e.target;
    if (e.target.name === 'isArchived') {
      value = e.target.checked ? Number(1) : Number(0);
    }
    this.setState({ [e.target.name]: value });
  }

  async saveUser(e) {
    e.preventDefault();
    e.persist();
    const { onUserFullInfo } = this.props;
    const availability = this.state;
    onUserFullInfo(availability);
    this.handleSubmit('User');
  }

  handleSubmit(menuItem) {
    if (menuItem) {
      this.setState({ [`goTo${menuItem}`]: true });
    }
  }

  render() {
    // const { handleSubmit } = this.props;
    const { firstName, lastName, mobilePhone, email } = this.state;
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
                  <input
                    name="mobilePhone"
                    type="text"
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
                <div className="col-md-12 form__form-group">
                  <ButtonToolbar className="form__button-toolbar wizard__toolbar">
                    <Button color="primary" type="button" disabled className="previous">Back</Button>
                    <Button color="primary" type="submit" className="next">Next</Button>
                  </ButtonToolbar>
                </div>
              </Row>

            </form>
          </CardBody>
        </Card>
      </Col>
    );
  }
}

AddTruckFormThree.propTypes = {
  company: PropTypes.shape({
    name: PropTypes.string,
    id: PropTypes.number
  }),
  // onDriverSave: PropTypes.func.isRequired,
  // truckFullInfo: PropTypes.func.isRequired,
  onUserFullInfo: PropTypes.func.isRequired
};

AddTruckFormThree.defaultProps = {
  company: null
  // truckFullInfo: null
};

export default AddTruckFormThree;
