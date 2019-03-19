import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
// import moment from 'moment';
import { Button, Card, CardBody, Col, Container, Row } from 'reactstrap';
import TTable from '../common/TTable';
import DriverService from '../../api/DriverService';
import UserService from '../../api/UserService';
import ProfileService from '../../api/ProfileService';
// import JobService from '../../api/JobService';
// import ProfileService from '../../api/ProfileService';
// import JobMaterialsService from '../../api/JobMaterialsService';

class UserCarrierListPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      users: [],
      goToDashboard: false,
      goToAddUser: false,
      goToUpdateUser: false,
      userId: 0
    };

    this.renderGoTo = this.renderGoTo.bind(this);
    this.handleUserEdit = this.handleUserEdit.bind(this);
  }

  async componentDidMount() {
    await this.fetchUsers();
  }

  async fetchUsers() {
    // let users = await DriverService.getUsers();
    const profile = await ProfileService.getProfile();
    let users = await DriverService.getDriverByCompanyId(profile.companyId);
    users = users.map((user) => {
      const newUser = user;
      // newUser.modifiedOn = moment(user.modifiedOn).format();
      // newUser.createdOn = moment(user.createdOn).format();
      return newUser;
    });
    this.setState({ users });
  }

  handlePageClick(menuItem) {
    if (menuItem) {
      this.setState({ [`goTo${menuItem}`]: true });
    }
  }

  handleUserEdit(id) {
    this.setState({
      goToUpdateUser: true,
      userId: id
    });
  }

  renderGoTo() {
    const { goToDashboard, goToAddUser, goToUpdateUser, userId } = this.state;
    if (goToDashboard) {
      return <Redirect push to="/"/>;
    }
    if (goToAddUser) {
      return <Redirect push to="/users/save"/>;
    }
    if (goToUpdateUser) {
      return <Redirect push to={`/users/save/${userId}`}/>;
    }
    return true;
  }

  render() {
    const { users } = this.state;
    return (
      <Container className="dashboard">
        {this.renderGoTo()}
        <button type="button"
                className="app-link"
                onClick={() => this.handlePageClick('Dashboard')}
        >
          Dashboard
        </button>
        &nbsp;&#62; Users
        <Row>
          <Col md={12}>
            <h3 className="page-title">Carrier Drivers</h3>
          </Col>
        </Row>
        <Row>
          <Col md={12}>
            <Card>
              <CardBody>
                <Button
                  style={{ width: '150px' }}
                  className="btn btn-primary account__btn account__btn--small"
                  onClick={() => this.handlePageClick('AddUser')}
                >
                  Add User 96
                </Button>
                <hr/>
                <TTable
                  columns={[
                    /*
                    {
                      name: 'id',
                      displayName: 'ID'
                    },
                    */
                    {
                      name: 'email',
                      displayName: 'Email'
                    },
                    {
                      name: 'firstName',
                      displayName: 'First Name'
                    },
                    {
                      name: 'lastName',
                      displayName: 'Last Name'
                    },
                    {
                      name: 'mobilePhone',
                      displayName: 'Mobile Phone'
                    }
                  ]}
                  data={users}
                  handleIdClick={this.handleUserEdit}
                />
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }
}

export default UserCarrierListPage;
