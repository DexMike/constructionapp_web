import React, { Component } from 'react';
import {
  Col,
  Container,
  Row,
  TabContent,
  TabPane,
  Nav,
  NavItem,
  NavLink
} from 'reactstrap';
import classnames from 'classnames';
import './Settings.css';

import UserSettings from './UserSettings';
import NotificationsSettings from './NotificationsSettings';
import PermissionsRolesSettings from './PermissionsRolesSettings';

import ProfileService from '../../api/ProfileService';
import UserService from '../../api/UserService';
import CompanyService from '../../api/CompanyService';
import AddressService from '../../api/AddressService';

class SettingsPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loaded: false,
      company: [],
      user: [],
      users: [],
      address: [],
      activeTab: '1',
      title: 'User Profile',
      isAdmin: false
    };

    this.toggle = this.toggle.bind(this);
  }

  async componentDidMount() {
    const profile = await ProfileService.getProfile();
    const user = await UserService.getUserById(profile.userId);
    const company = await CompanyService.getCompanyById(profile.companyId);
    const address = await AddressService.getAddressById(company.addressId);
    const usersResponse = await UserService.getUsersByCompanyId(company.id);
    const users = usersResponse.data;
    let isAdmin = false;
    if (company.adminId === user.id) {
      isAdmin = true;
    }
    this.setState({
      company,
      user,
      users,
      address,
      isAdmin,
      loaded: true
    });
  }

  toggle(tab) {
    const { activeTab } = this.state;
    let { title } = this.state;
    switch (tab) {
      case '1':
        title = 'User Profile';
        break;
      case '2':
        title = 'Notifications';
        break;
      case '3':
        title = 'Roles & Permissions';
        break;
      case '4':
        title = 'Payment Method';
        break;
      default:
        break;
    }
    if (activeTab !== tab) {
      this.setState({
        activeTab: tab,
        title
      });
    }
  }

  renderAdminTabs(activeTab) {
    const { company } = this.state;
    return (
      <Nav tabs>
        <NavItem>
          <NavLink
            className={classnames({ active: activeTab === '1' }, 'tab')}
            onClick={() => { this.toggle('1'); }}
          >
            <div className="navLink">User Profile</div>
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            className={classnames({ active: activeTab === '2' }, 'tab')}
            onClick={() => { this.toggle('2'); }}
          >
            Notifications
          </NavLink>
        </NavItem>
        {
          /*
          <NavItem>
            <NavLink
              className={classnames({ active: activeTab === '3' }, 'tab')}
              onClick={() => { this.toggle('3'); }}
            >
              Permissions
            </NavLink>
          </NavItem>
          */
        }
        {
          company.type === 'Customer' ? (
            <NavItem>
              <NavLink
                className={classnames({ active: activeTab === '4' }, 'tab')}
                onClick={() => { this.toggle('4'); }}
              >
                Payment Method
              </NavLink>
            </NavItem>
          ) : null
        }
      </Nav>
    );
  }

  renderUserTabs(activeTab) {
    return (
      <Nav tabs>
        <NavItem>
          <NavLink
            className={classnames({ active: activeTab === '1' }, 'tab')}
            onClick={() => { this.toggle('1'); }}
          >
            <div className="navLink">User Profile</div>
          </NavLink>
        </NavItem>
      </Nav>
    );
  }

  renderSettingsTabs() {
    const { activeTab, user, users, company, address, isAdmin } = this.state;
    return (
      <div>
        {
          isAdmin ? this.renderAdminTabs(activeTab) : this.renderUserTabs(activeTab)
        }

        <TabContent
          activeTab={activeTab}
          style={{
            backgroundColor: '#FFF',
            marginLeft: 8,
            marginRight: 8,
            paddingLeft: 32,
            paddingRight: 32,
            borderRadius: 5
          }}
        >
          <TabPane tabId="1">
            <UserSettings
              user={user}
              address={address}
              admin={isAdmin}
            />
          </TabPane>
          <TabPane tabId="2">
            <NotificationsSettings
              company={company}
            />
          </TabPane>
          <TabPane tabId="3">
            <PermissionsRolesSettings users={users}/>
          </TabPane>
          <TabPane tabId="4">
            <Row>
              <Col sm="12" style={{margin: 80}}>
                &nbsp;
              </Col>
            </Row>
          </TabPane>
        </TabContent>
      </div>
    );
  }

  render() {
    const { loaded, title } = this.state;
    if (loaded) {
      return (
        <Container className="dashboard">
          <Row>
            <Col md={12}>
              <h3 className="page-title">Settings / {title}</h3>
            </Col>
          </Row>
          <Container>
            <Row>
              <Col md={12}>
                {this.renderSettingsTabs()}
              </Col>
            </Row>
          </Container>
        </Container>
      );
    }
    return (
      <Container className="dashboard">
        Loading...
      </Container>
    );
  }
}

export default SettingsPage;
