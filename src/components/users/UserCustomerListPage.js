import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import {
  Button,
  Card,
  CardBody,
  Col,
  Container,
  Row
} from 'reactstrap';
import TTable from '../common/TTable';
import TFormat from '../common/TFormat';

import UserService from '../../api/UserService';

class UserCustomerListPage extends Component {
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
    let users = await UserService.getUsers();
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
      return <Redirect push to="/users/carrier/save"/>;
    }
    if (goToUpdateUser) {
      return <Redirect push to={`/users/carrier/save/${userId}`}/>;
    }
    return true;
  }

  render() {
    let { users } = this.state;

    users = users.map((user) => {
      const newUser = user;
      newUser.newMobilePhone = TFormat.asPhone(user.mobilePhone);
      return newUser;
    });

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
            <h3 className="page-title">Customer Users</h3>
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
                  Add User
                </Button>
                <hr/>
                <TTable
                  columns={[
                    {
                      name: 'id',
                      displayName: 'ID'
                    },
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
                      name: 'newMobilePhone',
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

export default UserCustomerListPage;
