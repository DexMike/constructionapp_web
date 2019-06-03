import React, { Component } from 'react';
import {
  Col,
  Container,
  Row
} from 'reactstrap';
import './Settings.css';


class PermissionsRolesSettings extends Component {
  constructor(props) {
    super(props);

    this.state = {
      permissions: ['Admin', 'Dispatcher', 'Driver']
    };
  }

  async componentDidMount() {
  }

  renderPermissionTable() {
    const { permissions } = this.state;
    const { users } = this.props;
    return (
      <table className="table table-sm">
        <tbody>
          <tr style={{fontWeight: 'bold'}}>
            <td>
              Users
            </td>
            <td>
              Permissions
            </td>
            <td>
              off/on
            </td>
          </tr>
          {
            users.map(user => (
              <tr key={user.id}>
                <td style={{width: 600}}>{user.firstName} {user.lastName}</td>
                <td>{permissions[Math.floor(Math.random() * permissions.length)]} Permission</td>
                <td>
                  <label className="switch" htmlFor={user.id}>
                    <input
                      type="checkbox"
                      id={user.id}
                    />
                    <span className="slider round" />
                  </label>
                </td>
              </tr>
            ))
          }
        </tbody>
      </table>
    );
  }

  render() {
    return (
      <Container>
        <Row className="tab-content-header">
          <Col md={6}>
						<span style={{fontWeight: 'bold', fontSize: 20}}>
              Roles / Permissions
						</span>
          </Col>
        </Row>
        <Row className="pt-2 pb-4">
          <Col md={10}>
            {this.renderPermissionTable()}
          </Col>
        </Row>
      </Container>
    );
  }
}

export default PermissionsRolesSettings;
